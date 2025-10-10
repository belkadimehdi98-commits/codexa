// toggle.js
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-btn");

  // 1. Load saved preference, otherwise default to dark
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.remove("dark");
    toggleBtn.textContent = "🌙";
  } else {
    document.body.classList.add("dark"); // default dark
    toggleBtn.textContent = "☀️";
  }

  // 2. Toggle theme on button click
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggleBtn.textContent = "☀️"; // sun icon for dark mode
    } else {
      localStorage.setItem("theme", "light");
      toggleBtn.textContent = "🌙"; // moon icon for light mode
    }
  });
});
