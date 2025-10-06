import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static("public")); // serve frontend files
app.use(express.json());

// Stripe config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Map plans with your Stripe price IDs
const PLANS = {
  free: "price_1SFFMF50pz2SntAR9RG9WteF",   // Free Plan
  pro: "price_1SFFP950pz2SntARpYHyaZEi",   // Pro Plan
  team: "price_1SFFP950pz2SntARpYHyaZEi",  // Team Plan (use diff if exists)
};

// Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLANS[plan],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.DOMAIN}/success.html`,
      cancel_url: `${process.env.DOMAIN}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
