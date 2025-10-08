import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// AI streaming route
app.get("/chat-stream", async (req, res) => {
  const prompt = req.query.prompt || "";
  if (!prompt) return res.status(400).send("Prompt required");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      res.write(`data: ${JSON.stringify({ error: errText })}\n\n`);
      res.end();
      return;
    }

    const reader = r.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(l => l.trim() !== "");
      for (const line of lines) {
        if (line.includes("[DONE]")) {
          res.write("event: done\ndata: [DONE]\n\n");
          res.end();
          return;
        }
        if (line.startsWith("data:")) {
          try {
            const data = JSON.parse(line.replace("data:", "").trim());
            const token = data.choices?.[0]?.delta?.content || "";
            if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
          } catch {}
        }
      }
    }
  } catch (err) {
    console.error("Streaming error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Codexa server running on port ${PORT}`);
});
