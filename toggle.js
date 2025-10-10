// toggle.js
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-btn");

  // Force dark as default if no theme is stored
  if (!localStorage.getItem("theme")) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
    toggleBtn.textContent = "☀️"; // sun icon when in dark
  } else if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️";
  } else {
    toggleBtn.textContent = "🌙";
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggleBtn.textContent = "☀️"; // show sun for dark mode
    } else {
      localStorage.setItem("theme", "light");
      toggleBtn.textContent = "🌙"; // show moon for light mode
    }
  });
});
