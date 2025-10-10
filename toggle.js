// toggle.js — robust for dynamically-included navbar
(function () {
  const applySaved = () => {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
    }
  };
  const setIcon = (btn) => {
    if (!btn) return;
    btn.textContent = document.body.classList.contains("dark") ? "☀" : "☾";
  };

  // Apply saved theme on load
  document.addEventListener("DOMContentLoaded", () => {
    applySaved();
    setIcon(document.querySelector(".toggle-btn"));
  });

  // Event delegation so it works even if nav loads later
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".toggle-btn");
    if (!btn) return;
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
    setIcon(btn);
  });

  // When includes.js injects nav later, update icon
  const mo = new MutationObserver(() => {
    setIcon(document.querySelector(".toggle-btn"));
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
