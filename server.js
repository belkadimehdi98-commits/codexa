const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const Stripe = require("stripe");
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(express.static("public"));

// Stripe setup
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// OpenAI setup
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// Store usage by IP (simple rate limiting for free trials)
const freeUsage = {};
const MAX_FREE_TRIALS = 2;

// -------------------- ROUTES -------------------- //

// Generate AI code
app.post("/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt || "Create a simple HTML page";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Track free usage per IP
    if (!freeUsage[ip]) freeUsage[ip] = 0;

    if (freeUsage[ip] >= MAX_FREE_TRIALS) {
      return res.status(403).json({
        error: "Free trial limit reached. Please upgrade your plan.",
        upgrade: true,
      });
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // lightweight, can upgrade to gpt-4o
      messages: [
        { role: "system", content: "You are a code generator assistant. Always return clean and functional HTML/CSS/JS code." },
        { role: "user", content: prompt },
      ],
    });

    const code = completion.choices[0].message.content;

    // Count this generation
    freeUsage[ip]++;

    res.json({ code });
  } catch (err) {
    console.error("❌ Error generating code:", err.message);
    res.status(500).json({ error: "Failed to generate code" });
  }
});

// Create Stripe checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "Price ID missing" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.DOMAIN}/success.html`,
      cancel_url: `${process.env.DOMAIN}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err.message);
    res.status(500).json({ error: "Stripe session failed" });
  }
});

// -------------------- START SERVER -------------------- //
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
