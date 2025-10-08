const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const chatBtn = document.getElementById("chat-btn");

// Add message to chat
function addMessage(content, sender = "ai") {
  const msg = document.createElement("div");
  msg.className = "message " + sender;
  msg.innerHTML = content;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return msg;
}

// Handle user input
async function sendMessage() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  addMessage(prompt, "user");
  userInput.value = "";

  const aiMsg = addMessage("<i>Typing...</i>", "ai");

  try {
    const res = await fetch(`/chat-stream?prompt=${encodeURIComponent(prompt)}`);
    if (!res.ok) throw new Error("Network error");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(l => l.trim());
      for (const line of lines) {
        if (line.includes("[DONE]")) break;
        if (line.startsWith("data:")) {
          try {
            const data = JSON.parse(line.replace("data:", "").trim());
            if (data.token) {
              text += data.token;
              aiMsg.innerHTML = text;
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
            if (data.error) {
              aiMsg.innerHTML = `⚠️ Oops! ${data.error}`;
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    aiMsg.innerHTML = "⚠️ Something went wrong. Please try again.";
  }
}

// Send on button click
chatBtn.addEventListener("click", sendMessage);

// Send on Enter
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
