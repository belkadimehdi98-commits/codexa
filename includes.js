// includes.js
document.addEventListener("DOMContentLoaded", () => {
  const includeElements = document.querySelectorAll("[data-include]");
  let remaining = includeElements.length;

  includeElements.forEach(el => {
    const file = el.getAttribute("data-include");

    fetch(file)
      .then(response => {
        if (!response.ok) throw new Error(`Could not load ${file}: ${response.statusText}`);
        return response.text();
      })
      .then(data => {
        el.innerHTML = data;
        remaining--;

        // Fire event when all partials are loaded
        if (remaining === 0) {
          document.dispatchEvent(new Event("includesLoaded"));
        }
      })
      .catch(err => {
        console.error("Include error:", err);
        el.innerHTML = `<p style="color:red;font-size:14px;">Error loading ${file}</p>`;
      });
  });
});
