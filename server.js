import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import Stripe from "stripe";
import OpenAI from "openai";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(express.static("public")); // serves index.html + assets from /public

// ✅ Health check
app.get("/api/ping", (req, res) => res.json({ ok: true, version: "1.0" }));

// ✅ Stripe checkout sessions
app.post("/api/checkout", async (req, res) => {
  try {
    const { priceId } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://codexa.codes?success=true",
      cancel_url: "https://codexa.codes?canceled=true",
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ OpenAI generate endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const prompt = (req.body?.prompt || "").trim();
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a coding assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
    });

    const text = completion.choices?.[0]?.message?.content || "";
    res.json({ output: text });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Codexa server running at http://localhost:${PORT}`);
});
