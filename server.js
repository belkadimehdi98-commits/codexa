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

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// disable buffering for SSE (important on some hosts)
app.use((req, res, next) => {
  res.setHeader("X-Accel-Buffering", "no");
  next();
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Stripe Checkout
app.post("/create-checkout-session", async (req, res) => {
  try {
    const incoming = (req.body?.priceId || "").toString();
    const map = {
      PRICE_PRO: process.env.PRICE_PRO,
      PRICE_TEAM: process.env.PRICE_TEAM,
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
    return res.status(500).json({ error: err.message });
  }
});

// ---------- Streaming AI Chat with Fallback ----------
app.get("/chat-stream", async (req, res) => {
  const prompt = req.query.prompt || "";
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
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!r.ok) throw new Error(await r.text());

    const reader = r.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(line => line.trim() !== "");
      for (const line of lines) {
        if (line.includes("[DONE]")) {
          res.write("event: done\ndata: [DONE]\n\n");
          res.end();
          return;
        }
        if (line.startsWith("data:")) {
          const json = line.replace("data:", "").trim();
          try {
            const data = JSON.parse(json);
            const token = data.choices?.[0]?.delta?.content || "";
            if (token) {
              res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    console.error("Streaming error, falling back:", err.message);

    // 🔁 Fallback: normal (non-streaming) request
    try {
      const r2 = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          stream: false,
        }),
      });

      const data = await r2.json();
      const answer = data.choices?.[0]?.message?.content || "⚠️ No response.";

      res.write(`data: ${JSON.stringify({ token: answer })}\n\n`);
      res.write("event: done\ndata: [DONE]\n\n");
      res.end();
    } catch (fallbackErr) {
      console.error("Fallback also failed:", fallbackErr.message);
      res.write(`data: ${JSON.stringify({ error: "AI request failed." })}\n\n`);
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
