// ===== Theme handling =====
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
(function initTheme(){
  const saved = localStorage.getItem("codexa_theme");
  if (saved) root.setAttribute("data-theme", saved);
  else {
    // auto by system
    root.setAttribute("data-theme", "auto");
  }
  updateThemeIcon();
})();
themeToggle?.addEventListener("click", ()=>{
  const cur = root.getAttribute("data-theme") || "auto";
  const next = cur === "light" ? "dark" : cur === "dark" ? "auto" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem("codexa_theme", next);
  updateThemeIcon();
});
function updateThemeIcon(){
  const mode = root.getAttribute("data-theme");
  themeToggle.textContent = mode === "light" ? "☀️" : mode === "dark" ? "🌙" : "🌓";
}

// ===== Elements =====
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const exportBtn = document.getElementById("exportBtn");
const resetBtn = document.getElementById("resetBtn");

const onboarding = document.getElementById("onboarding");
const obClose = document.getElementById("obClose");
const dontShowAgain = document.getElementById("dontShowAgain");

const LS_KEY = "codexa_chat_history_v2";
const OB_KEY = "codexa_onboarding_hidden";

// ===== Onboarding =====
(function initOnboarding(){
  const hide = localStorage.getItem(OB_KEY) === "1";
  if (!hide) onboarding.classList.remove("hidden");
})();
obClose?.addEventListener("click", ()=>{
  if (dontShowAgain.checked) localStorage.setItem(OB_KEY,"1");
  onboarding.classList.add("hidden");
});

// ===== History load/save =====
loadHistory();
function saveHistory(){
  const payload = [...document.querySelectorAll(".msg")].map(el=>({
    me: el.classList.contains("me"),
    html: el.querySelector(".bubble") ? el.querySelector(".bubble").innerHTML : el.innerHTML
  }));
  localStorage.setItem(LS_KEY, JSON.stringify(payload.slice(-50)));
}
function loadHistory(){
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return;
  try{
    const arr = JSON.parse(raw);
    chat.innerHTML = "";
    arr.forEach(it=>{
      if (it.me) addUserBubble(it.html, true);
      else addAIBubble(it.html, true);
    });
    scrollBottom();
  }catch{}
}

// ===== Render helpers =====
function scrollBottom(){ chat.scrollTop = chat.scrollHeight; }

function addUserBubble(text, asHTML=false){
  const wrap = document.createElement("div");
  wrap.className = "msg me";
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = "You";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble[asHTML?"innerHTML":"textContent"] = text;
  wrap.append(meta, bubble); chat.appendChild(wrap); scrollBottom(); return bubble;
}
function addAIBubble(text, asHTML=false){
  const wrap = document.createElement("div");
  wrap.className = "msg ai";
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = "💡 Codexa AI";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble[asHTML?"innerHTML":"textContent"] = text;
  wrap.append(meta, bubble); chat.appendChild(wrap); scrollBottom(); return bubble;
}
function addTyping(){
  const wrap = document.createElement("div");
  wrap.className = "msg ai";
  const meta = document.createElement("div"); meta.className="meta"; meta.textContent="💡 Codexa AI";
  const bubble = document.createElement("div"); bubble.className="bubble";
  bubble.innerHTML = `<span class="typing">typing…</span>`;
  wrap.append(meta, bubble); chat.appendChild(wrap); scrollBottom(); return {wrap, bubble};
}

// Simple markdown/code fence handling; safe-escape and add copy/download
function escapeHTML(s){return s.replace(/[&<>]/g,c=>({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c]))}
function codeBlock(lang, codeRaw){
  const code = escapeHTML(codeRaw);
  const id = "c"+Math.random().toString(36).slice(2);
  const ext = lang && /html/i.test(lang) ? ".html" : lang && /css/i.test(lang) ? ".css" :
              lang && /js|javascript/i.test(lang) ? ".js" : ".txt";
  const filename = (lang || "code")+ext;
  return `
    <div class="codewrap">
      <div class="code-toolbar">
        <button class="codebtn" onclick="copyCode('${id}')">Copy</button>
        <button class="codebtn" onclick="downloadCode('${id}','${filename}')">Download</button>
      </div>
      <pre id="${id}"><code>${code}</code></pre>
    </div>`;
}
function renderMarkdown(text){
  // support ```lang\n...``` fences and normal text
  const parts = text.split(/```/);
  if (parts.length === 1) return `<div>${escapeHTML(text).replace(/\n/g,"<br>")}</div>`;
  let html = "";
  for (let i=0;i<parts.length;i++){
    if (i % 2 === 0) {
      html += `<div>${escapeHTML(parts[i]).replace(/\n/g,"<br>")}</div>`;
    } else {
      const firstNL = parts[i].indexOf("\n");
      const lang = firstNL > -1 ? parts[i].slice(0, firstNL).trim() : "";
      const code = firstNL > -1 ? parts[i].slice(firstNL+1) : parts[i];
      html += codeBlock(lang, code);
    }
  }
  return html;
}

// expose copy/download
window.copyCode = async function(id){
  try{
    const el = document.getElementById(id);
    await navigator.clipboard.writeText(el.innerText);
  }catch{}
}
window.downloadCode = function(id, filename){
  const el = document.getElementById(id);
  const blob = new Blob([el.innerText], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {href:url, download:filename});
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// ===== Chat flow =====
async function streamChat(prompt){
  const typing = addTyping();
  const bubble = addAIBubble("", false);
  let buffer = "";
  let gotAny = false;

  // Open SSE
  const src = new EventSource(`/chat-stream?prompt=${encodeURIComponent(prompt)}`);

  src.onmessage = (evt)=>{
    // Fallback responses (non-stream) will arrive as one big "data: {...}" as well
    try{
      const obj = JSON.parse(evt.data);
      if (obj.token){
        if (!gotAny) { typing.wrap.remove(); gotAny = true; }
        buffer += obj.token;
        bubble.innerHTML = renderMarkdown(buffer);
        scrollBottom();
        saveHistory();
      }
      if (obj.error && !gotAny){
        typing.wrap.remove();
        bubble.textContent = "⚠️ Something went wrong. Please try again.";
        saveHistory();
      }
    }catch{}
  };

  src.addEventListener("done", ()=>{
    if (!gotAny) typing.wrap.remove();
    src.close();
    saveHistory();
  });

  src.onerror = ()=>{
    // Connection dropped: show graceful message if nothing arrived
    src.close();
    if (!gotAny){
      typing.wrap.remove();
      bubble.innerHTML = `<div>⚠️ Streaming unavailable, showing full response instead.</div>`;
      // Auto fallback fetch (non-stream) to still get an answer
      fallbackOnce(prompt, bubble);
    }
  };
}

async function fallbackOnce(prompt, bubbleEl){
  try{
    const r = await fetch("/chat-stream?prompt="+encodeURIComponent(prompt));
    // We reuse same endpoint: server sends non-stream as a single event.
    const text = await r.text();
    const line = (text.split("\n").find(l=>l.startsWith("data:")) || "").replace("data:","").trim();
    if (line){
      const obj = JSON.parse(line);
      if (obj.token){
        bubbleEl.innerHTML = renderMarkdown(obj.token + "\n\n_(⚡ instant reply due to connection)_");
        scrollBottom(); saveHistory(); return;
      }
    }
    bubbleEl.textContent = "⚠️ Could not retrieve a response. Please try again.";
  }catch{
    bubbleEl.textContent = "⚠️ Could not retrieve a response. Please try again.";
  }
}

function send(){
  const val = input.value.trim();
  if (!val) return;
  addUserBubble(val);
  input.value = "";
  streamChat(val);
}

// Send events
sendBtn?.addEventListener("click", send);
input?.addEventListener("keydown", (e)=>{
  if (e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    send();
  }
});

// Export / Reset
exportBtn?.addEventListener("click", ()=>{
  const text = [...document.querySelectorAll(".msg")].map(el=>{
    const who = el.classList.contains("me") ? "You" : "Codexa";
    return `${who}: ${el.innerText}`;
  }).join("\n\n");
  const blob = new Blob([text], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {href:url, download:"codexa-chat.txt"});
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});
resetBtn?.addEventListener("click", ()=>{
  localStorage.removeItem(LS_KEY);
  chat.innerHTML = `
    <div class="msg ai">
      <div class="meta">💡 Codexa AI</div>
      <div class="bubble">New session started. Tell me what you want to build.</div>
    </div>`;
});
