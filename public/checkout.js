document.addEventListener("DOMContentLoaded", () => {
  // ✅ Redirect Free button to free.html
  document.getElementById("free-btn").addEventListener("click", () => {
    window.location.href = "free.html";
  });

  // ✅ Stripe checkout logic for Pro & Team
  const handleCheckout = async (priceId) => {
    try {
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // redirect to Stripe checkout
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  };

  document.getElementById("pro-btn").addEventListener("click", () => {
    handleCheckout("price_PRO_ID"); // replace with your real Stripe price
  });

  document.getElementById("team-btn").addEventListener("click", () => {
    handleCheckout("price_TEAM_ID"); // replace with your real Stripe price
  });
});
