import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* Home */
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* Stripe Checkout */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const incoming = (req.body?.priceId || "").toString();
    const map = {
      PRICE_PRO: process.env.PRICE_PRO,
      PRICE_TEAM: process.env.PRICE_TEAM,
    };
    const priceId = incoming.startsWith("price_") ? incoming : map[incoming];
    if (!priceId) return res.status(400).json({ error: "Invalid plan/priceId" });

    const domain = process.env.DOMAIN || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${domain}/success.html`,
      cancel_url: `${domain}/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err?.message || "Checkout failed" });
  }
});

/* Streaming chat (SSE) */
app.get("/chat-stream", async (req, res) => {
  const prompt = (req.query.prompt || "").toString().slice(0, 4000);
  if (!prompt) return res.status(400).send("Prompt required");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
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
        messages: [
          { role: "system", content: "You are Codexa AI. Be concise, helpful, and return single-file HTML/CSS/JS code when asked." },
          { role: "user", content: prompt },
        ],
        stream: true,
        max_tokens: 1500,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      res.write(`data: ${JSON.stringify({ error: errText })}\n\n`);
      res.end();
      return;
    }

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed === "data: [DONE]") {
          res.write("event: done\ndata: [DONE]\n\n");
          res.end();
          return;
        }
        if (trimmed.startsWith("data:")) {
          try {
            const json = JSON.parse(trimmed.slice(5).trim());
            const token = json.choices?.[0]?.delta?.content || "";
            if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
          } catch {/* ignore */}
        }
      }
      buffer = buffer.endsWith("\n") ? "" : buffer.slice(buffer.lastIndexOf("\n") + 1);
    }

    res.write("event: done\ndata: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("SSE error:", err);
    res.write(`data: ${JSON.stringify({ error: "Network error" })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Codexa running on port ${PORT}`);
});
