// Theme toggle
const toggle = document.getElementById("theme-toggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    toggle.textContent = document.body.classList.contains("light-theme") ? "☀️" : "🌙";
  });
}
