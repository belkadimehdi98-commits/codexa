// toggle.js

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-btn");

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    // Optional: save preference
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // Load saved theme on page load
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
});
