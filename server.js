import express from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Codexa server is running 🚀");
});

// ✅ Stripe Checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan) return res.status(400).json({ error: "Plan required" });

    const priceId =
      plan === "pro" ? process.env.PRICE_PRO : process.env.PRICE_TEAM;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: "https://codexa.codes/success",
      cancel_url: "https://codexa.codes/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
