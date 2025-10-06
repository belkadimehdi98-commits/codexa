import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helpers for file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---- Stripe Checkout ----
app.get("/create-checkout-session", async (req, res) => {
  try {
    const plan = req.query.plan;
    let priceId;

    if (plan === "pro") priceId = process.env.PRICE_PRO;
    else if (plan === "team") priceId = process.env.PRICE_TEAM;
    else return res.status(400).send("Invalid plan");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });

    res.redirect(303, session.url);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ---- Free Signup Redirect ----
app.get("/signup-free", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup-free.html"));
});

// ---- AI Code Generator ----
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI code generator." },
        { role: "user", content: prompt },
      ],
    });

    const code = completion.choices[0].message.content;
    res.json({ code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate code." });
  }
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
