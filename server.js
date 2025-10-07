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
    const stripePriceId = incoming.startsWith("price_") ? incoming : map[incoming];
    if (!stripePriceId) return res.status(400).json({ error: "Invalid plan/priceId" });

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
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "Stripe checkout failed" });
  }
});

// AI Generation (flexible)
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant for Codexa. You generate websites, code, or explanations. Be natural, helpful, and flexible like ChatGPT.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
      }),
    });

    const data = await r.json();
    if (data?.error) return res.status(500).json({ error: data.error.message });
    const code = data?.choices?.[0]?.message?.content || "";
    return res.json({ code });
  } catch (err) {
    console.error("AI generation error:", err);
    return res.status(500).json({ error: "Failed to generate code" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
