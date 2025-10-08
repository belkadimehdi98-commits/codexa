// DOM elements
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const chatBtn = document.getElementById("chat-btn");
const generateBtn = document.getElementById("generate-btn");
const copyBtn = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-btn");
const exportBtn = document.getElementById("export-btn");
const resetBtn = document.getElementById("reset-btn");

// Store chat history
let chatHistory = [];

// Utility: add message to chat
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-msg" : "ai-msg";
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  chatHistory.push({ sender, text });
}

// Send user input to backend
async function handleChat() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage("user", text);
  userInput.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    addMessage("ai", data.reply || "⚠️ No reply from Codexa AI.");
  } catch (err) {
    addMessage("ai", "❌ Error connecting to server.");
    console.error(err);
  }
}

// Copy chat
function copyChat() {
  const text = chatHistory.map(m => `${m.sender}: ${m.text}`).join("\n");
  navigator.clipboard.writeText(text).then(() => {
    alert("Chat copied to clipboard!");
  });
}

// Download chat
function downloadChat() {
  const text = chatHistory.map(m => `${m.sender}: ${m.text}`).join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "codexa_chat.txt";
  link.click();
}

// Export chat
function exportChat() {
  const blob = new Blob([JSON.stringify(chatHistory, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "codexa_chat.json";
  link.click();
}

// Reset chat
function resetChat() {
  chatBox.innerHTML = "";
  chatHistory = [];
}

// Event listeners
chatBtn.addEventListener("click", handleChat);
generateBtn.addEventListener("click", handleChat);
copyBtn.addEventListener("click", copyChat);
downloadBtn.addEventListener("click", downloadChat);
exportBtn.addEventListener("click", exportChat);
resetBtn.addEventListener("click", resetChat);

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleChat();
});
