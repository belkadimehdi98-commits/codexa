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
    fetch(`partials/${partial}.html`)
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
document.addEventListener("scroll", () => {
  let scrollPos = window.scrollY + 100; 
  document.querySelectorAll(".nav-links a").forEach(link => {
    let section = document.querySelector(link.getAttribute("href"));
    if (section && section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
