const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4"; // set OPENAI_MODEL in Render if you like

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(bodyParser.json());
app.use(express.static("public"));

/* ---------- STRIPE CHECKOUT ---------- */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const plan = req.body.plan;
    const priceId =
      plan === "pro"  ? process.env.PRICE_PRO  :
      plan === "team" ? process.env.PRICE_TEAM :
      null;

    if (!priceId) return res.status(400).json({ error: "Invalid plan selected" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.DOMAIN}/success.html`,
      cancel_url: `${process.env.DOMAIN}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- PURE GPT CHAT (no restrictions) ---------- */
app.post("/chat", async (req, res) => {
  try {
    const { messages = [] } = req.body; // [{role:"user"|"assistant"|"system", content:"..."}]

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content || "";
    res.json({ message: reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- SITE BUILDER (returns code text) ---------- */
app.post("/generate", async (req, res) => {
  try {
    const { prompt = "" } = req.body;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful AI that writes clean, production-ready HTML/CSS/JS when asked. If the user wants a website, return a single complete HTML file (with <style> and <script> if needed). If they ask something else, just answer normally." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const code = completion.choices?.[0]?.message?.content || "";
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- ROOT ---------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
