async function createCheckout(priceId) {
  try {
    const res = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
}

document.getElementById("free-btn").addEventListener("click", () => {
  createCheckout("price_FREE_ID"); // Replace with real Stripe price ID
});

document.getElementById("pro-btn").addEventListener("click", () => {
  createCheckout("price_PRO_ID"); // Replace with real Stripe price ID
});

document.getElementById("team-btn").addEventListener("click", () => {
  createCheckout("price_TEAM_ID"); // Replace with real Stripe price ID
});
