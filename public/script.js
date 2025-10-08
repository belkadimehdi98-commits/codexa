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
  chatBox.scrollTop = chatBox.scrollHeight; // auto scroll
  chatHistory.push({ sender, text });
}

// Mock AI reply (replace later with OpenAI API call)
function aiReply(userText) {
  return `🤖 Codexa AI: I received your request — "${userText}"`;
}

// Handle chat
function handleChat() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage("user", text);
  userInput.value = "";

  // AI response
  const reply = aiReply(text);
  setTimeout(() => addMessage("ai", reply), 600);
}

// Copy chat to clipboard
function copyChat() {
  const text = chatHistory.map(m => `${m.sender}: ${m.text}`).join("\n");
  navigator.clipboard.writeText(text).then(() => {
    alert("Chat copied to clipboard!");
  });
}

// Download chat as .txt
function downloadChat() {
  const text = chatHistory.map(m => `${m.sender}: ${m.text}`).join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "codexa_chat.txt";
  link.click();
}

// Export chat as JSON
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

// Enter key support
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleChat();
});
