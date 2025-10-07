import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan } = req.body;

    let priceId;
    if (plan === "pro") {
      priceId = process.env.PRO_PRICE_ID;
    } else if (plan === "team") {
      priceId = process.env.TEAM_PRICE_ID;
    } else {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
