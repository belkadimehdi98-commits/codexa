import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(bodyParser.json());
app.use(express.static("public"));

// ---- AI Generator Endpoint ----
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Codexa AI. Generate clean, production-ready HTML/CSS/JS code based strictly on the user's prompt. Output only code, no explanations.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const code = data.choices[0]?.message?.content || "";
    res.json({ code });
  } catch (err) {
    console.error("Error in /generate:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ---- Stripe Checkout ----
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { priceId } = req.body;

    // Map frontend placeholders to real Stripe price IDs
    const priceMap = {
      PRICE_PRO: process.env.PRICE_PRO,
      PRICE_TEAM: process.env.PRICE_TEAM,
    };

    if (!priceMap[priceId]) {
      return res.status(400).json({ error: "Invalid priceId" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceMap[priceId], // Use the real ID from env
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.DOMAIN}/success.html`,
      cancel_url: `${process.env.DOMAIN}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Start Server ----
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
