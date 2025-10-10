// toggle.js
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-btn");

  // Apply saved theme on load
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  toggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggleBtn.textContent = "☀"; // show sun in dark mode
    } else {
      localStorage.setItem("theme", "light");
      toggleBtn.textContent = "☾"; // show moon in light mode
    }
  });

  // set initial button icon
  if (document.body.classList.contains("dark")) {
    toggleBtn.textContent = "☀";
  } else {
    toggleBtn.textContent = "☾";
  }
});
