const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const generateBtn = document.getElementById("generate-btn");

async function sendMessage(generate = false) {
  const message = userInput.value.trim();
  if (!message) return;

  // user message
  const userMsg = document.createElement("div");
  userMsg.className = "message user-message";
  userMsg.textContent = message;
  chatBox.appendChild(userMsg);
  userInput.value = "";

  // ai container
  const aiMsg = document.createElement("div");
  aiMsg.className = "message ai-message";
  aiMsg.innerHTML = `<strong>💡 Codexa AI</strong><br><span class="typing">typing...</span>`;
  chatBox.appendChild(aiMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // streaming fetch
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message, generate })
    });

    if (!response.body) {
      aiMsg.innerHTML = "<strong>💡 Codexa AI</strong><br>Error: no response body";
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";

    aiMsg.innerHTML = `<strong>💡 Codexa AI</strong><br><span class="streaming"></span>`;
    const streamSpan = aiMsg.querySelector(".streaming");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      streamSpan.textContent = text; // update progressively
      chatBox.scrollTop = chatBox.scrollHeight;
    }

  } catch (err) {
    aiMsg.innerHTML = `<strong>💡 Codexa AI</strong><br>Error: ${err.message}`;
  }
}

// send button
sendBtn.addEventListener("click", () => sendMessage(false));
generateBtn.addEventListener("click", () => sendMessage(true));

// enter key
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(false);
  }
});
