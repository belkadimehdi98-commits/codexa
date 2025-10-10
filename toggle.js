// toggle.js
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-btn");

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    // Save preference
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // Load saved theme, default = dark
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.remove("dark");
  } else {
    document.body.classList.add("dark");
  }
});
