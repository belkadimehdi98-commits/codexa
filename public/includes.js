document.addEventListener("DOMContentLoaded", () => {
  const partials = [
    "nav",
    "hero",
    "features",
    "pricing",
    "chat-box",
    "tutorial-box",
    "footer"
  ];

  partials.forEach(partial => {
    fetch(`/partials${partial}.html`) // matches your filenames: partialsnav.html etc.
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${partial}`);
        return res.text();
      })
      .then(html => {
        document.getElementById(partial).innerHTML = html;
      })
      .catch(err => console.error(err));
  });
});
