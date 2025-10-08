function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");
  const userMsg = document.createElement("div");
  userMsg.classList.add("user-message");
  userMsg.textContent = message;
  chatBox.appendChild(userMsg);

  input.value = "";

  // Simulated AI response
  const botMsg = document.createElement("div");
  botMsg.classList.add("bot-message");
  botMsg.textContent = "Processing...";
  chatBox.appendChild(botMsg);

  setTimeout(() => {
    botMsg.textContent = "Here is your response from Codexa AI 🚀";
  }, 1000);
}

function generateCode() {
  const chatBox = document.getElementById("chat-box");
  const codeBlock = document.createElement("pre");
  codeBlock.textContent = "<!-- Example generated code -->\n<html><body>Hello Codexa</body></html>";
  chatBox.appendChild(codeBlock);
}

function copyCode() {
  navigator.clipboard.writeText(document.getElementById("chat-box").innerText);
  alert("Copied to clipboard!");
}

function downloadCode() {
  const blob = new Blob([document.getElementById("chat-box").innerText], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "codexa_output.txt";
  a.click();
}

function exportChat() {
  downloadCode();
}

function resetChat() {
  document.getElementById("chat-box").innerHTML = "";
}
