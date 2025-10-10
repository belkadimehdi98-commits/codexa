// toggle.js
function initToggle() {
  const toggleBtn = document.querySelector(".toggle-btn");
  if (!toggleBtn) return;

  // Apply saved theme
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀";
  } else {
    toggleBtn.textContent = "🌙";
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggleBtn.textContent = "☀";
    } else {
      localStorage.setItem("theme", "light");
      toggleBtn.textContent = "🌙";
    }
  });
}

// Run once DOM ready
document.addEventListener("DOMContentLoaded", initToggle);

// Run again after includes.js finishes
document.addEventListener("includesLoaded", initToggle);
