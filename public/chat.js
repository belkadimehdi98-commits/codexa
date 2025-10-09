let currentMode = "chat"; // default

// Mode buttons toggle
document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
  });
});

// Chat form
const chatForm = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const userText = input.value.trim();
  if (!userText) return;

  // Add user message
  addMessage(userText, "user");
  input.value = "";

  // Add loading indicator
  const loading = addMessage("...", "bot loading");

  try {
    // Send to backend
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userText, mode: currentMode })
    });
    const data = await res.json();

    loading.remove(); // remove loading msg

    if (currentMode === "image" && data.imageUrl) {
      const img = document.createElement("img");
      img.src = data.imageUrl;
      img.alt = "Generated image";
      img.style.maxWidth = "100%";
      const msg = addMessage("", "bot");
      msg.appendChild(img);
    } else if (currentMode === "code" && data.code) {
      addCodeMessage(data.code);
    } else {
      addMessage(data.reply || "Something went wrong.", "bot");
    }

  } catch (err) {
    console.error("Chat error:", err);
    loading.remove();
    addMessage("⚠️ Error talking to Codexa.", "bot");
  }
});

// Add normal text message
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

// Add code block with copy + download
function addCodeMessage(code) {
  const wrapper = document.createElement("div");
  wrapper.className = "message bot";

  const pre = document.createElement("pre");
  pre.className = "code-block";
  pre.textContent = code;

  const actions = document.createElement("div");
  actions.className = "code-actions";

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(code);
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy", 1500);
  };

  const dlBtn = document.createElement("button");
  dlBtn.textContent = "Download";
  dlBtn.onclick = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codexa-code.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  actions.appendChild(copyBtn);
  actions.appendChild(dlBtn);

  wrapper.appendChild(pre);
  wrapper.appendChild(actions);

  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}
