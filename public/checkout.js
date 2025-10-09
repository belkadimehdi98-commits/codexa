document.addEventListener("DOMContentLoaded", () => {
  // Free plan: just go to free.html
  const freeBtn = document.getElementById("free-btn");
  if (freeBtn) {
    freeBtn.addEventListener("click", () => {
      window.location.href = "free.html";
    });
  }

  // Pro & Team via Stripe Checkout
  const handleCheckout = async (priceId) => {
    try {
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId })
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Error: " + (data?.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  };

  const proBtn = document.getElementById("pro-btn");
  if (proBtn) {
    proBtn.addEventListener("click", () => {
      handleCheckout("price_PRO_ID");   // TODO: replace with your real Stripe price id
    });
  }

  const teamBtn = document.getElementById("team-btn");
  if (teamBtn) {
    teamBtn.addEventListener("click", () => {
      handleCheckout("price_TEAM_ID");  // TODO: replace with your real Stripe price id
    });
  }
});
