import dotenv from "dotenv";
dotenv.config();

// server.js
// Node.js 18+
// Make sure "type": "module" is in package.json

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import OpenAI from 'openai';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(express.static('public')); // serves index.html

// OpenAI client using .env key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Debug log to confirm key is loaded
console.log("Loaded OpenAI key:", process.env.OPENAI_API_KEY ? "✅ Found" : "❌ Missing");

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// Generate code endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const prompt = (req.body?.prompt || '').trim();
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    // Ask OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful coding assistant. Always reply with ready-to-paste code wrapped in triple backticks and a language tag (e.g. ```html ... ```).'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.2
    });

    const text = completion.choices[0].message.content || '';
    res.json({ output: text });
  } catch (err) {
    console.error('❌ Error in /api/generate:', err.response?.data || err.message || err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
