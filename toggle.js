// toggle.js
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-btn");

  // Apply saved theme on load
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    if (toggleBtn) toggleBtn.textContent = "☀"; // sun in dark mode
  } else {
    if (toggleBtn) toggleBtn.textContent = "☾"; // moon in light mode
  }

  // Toggle theme on click
  toggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggleBtn.textContent = "☀";
    } else {
      localStorage.setItem("theme", "light");
      toggleBtn.textContent = "☾";
    }
  });
});
