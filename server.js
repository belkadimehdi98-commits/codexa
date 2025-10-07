const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");
const archiver = require("archiver");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());
app.use(express.static("public")); // serve static files

// ===== STRIPE CHECKOUT =====
app.post("/create-checkout-session", async (req, res) => {
  let priceId;

  if (req.body.plan === "pro") {
    priceId = process.env.PRICE_PRO;
  } else if (req.body.plan === "team") {
    priceId = process.env.PRICE_TEAM;
  } else {
    return res.status(400).json({ error: "Invalid plan selected" });
  }

  try {
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

// ===== AI GENERATOR =====
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Generate a simple, production-ready HTML/CSS/JS site for: ${prompt}`,
        },
      ],
    });

    const code = aiResponse.choices[0].message.content;

    // Create ZIP
    res.attachment("codexa_project.zip");
    const archive = archiver("zip");
    archive.pipe(res);

    archive.append(code, { name: "index.html" });
    archive.finalize();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
