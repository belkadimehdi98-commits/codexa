// server.js
import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// --- Stripe ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- paths / static ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- STRIPE CHECKOUT ----------
app.post("/create-checkout-session", async (req, res) => {
  try {
    const incoming = (req.body?.priceId || "").toString();

    const map = {
      PRICE_PRO: process.env.PRICE_PRO,
      PRICE_TEAM: process.env.PRICE_TEAM,
      PRO: process.env.PRICE_PRO,
      TEAM: process.env.PRICE_TEAM,
    };

    const stripePriceId = incoming.startsWith("price_")
      ? incoming
      : map[incoming];

    if (!stripePriceId) {
      return res.status(400).json({ error: "Invalid plan/priceId" });
    }

    const domain = process.env.DOMAIN || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${domain}/success.html`,
      cancel_url: `${domain}/cancel.html`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({
      error:
        err?.raw?.message ||
        err?.message ||
        "Failed to create checkout session",
    });
  }
});

// ---------- STREAMING CHAT (SSE) ----------
app.get("/chat-stream", async (req, res) => {
  const prompt = (req.query.prompt || "").toString().trim();
  if (!prompt) {
    res.status(400).send("Prompt required");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
          {
            role: "system",
            content:
              "You are Codexa AI. Be concise, helpful, and professional. When providing code, use fenced code blocks with a language label. Avoid mentioning GPT or OpenAI.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      res.write(`data: ${JSON.stringify({ error: txt })}\n\n`);
      res.end();
      return;
    }

    const reader = r.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";

    const flushLines = (chunk) => {
      buffer += chunk;
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;
        const json = line.replace(/^data:\s*/, "");
        if (json === "[DONE]") {
          res.write("event: done\ndata: [DONE]\n\n");
          res.end();
          return;
        }
        try {
          const obj = JSON.parse(json);
          const token = obj?.choices?.[0]?.delta?.content || "";
          if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
        } catch {
          // ignore partials
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      flushLines(decoder.decode(value, { stream: true }));
    }

    res.write("event: done\ndata: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Streaming error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
