import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Codexa server is running" });
});

// ✅ Stripe checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan } = req.body;
    let priceId;

    if (plan === "pro") {
      priceId = process.env.PRICE_PRO; // Pro plan
    } else if (plan === "team") {
      priceId = process.env.PRICE_TEAM; // Team plan
    } else {
      return res.status(400).json({ error: "Invalid plan" });
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
    console.error("❌ Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
});

// ✅ Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Codexa running at http://localhost:${PORT}`);
});
