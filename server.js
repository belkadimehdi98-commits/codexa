const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Simple test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Codexa server is running" });
});

// Catch-all to serve index.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Codexa running at http://localhost:${PORT}`);
});
