import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Debug requests
app.use((req, res, next) => {
  console.log(`➡️ Request: ${req.method} ${req.url}`);
  next();
});

// ✅ Static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ✅ Stripe checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.DOMAIN}/success.html`,
      cancel_url: `${process.env.DOMAIN}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Codexa AI chat route
app.post("/api/chat", async (req, res) => {
  const { prompt, mode } = req.body;

  try {
    if (mode === "image") {
      // Generate image
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "512x512"
      });

      return res.json({ imageUrl: response.data[0].url });
    }

    // Chat or Code mode → use text completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            mode === "code"
              ? "You are Codexa, an AI coding assistant. Always reply with clear code blocks and minimal explanation."
              : "You are Codexa, a helpful AI assistant for coding and general questions."
        },
        { role: "user", content: prompt }
      ]
    });

    const reply = response.choices[0].message.content;

    if (mode === "code") {
      return res.json({ code: reply });
    } else {
      return res.json({ reply });
    }
  } catch (err) {
    console.error("❌ Chat API error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
