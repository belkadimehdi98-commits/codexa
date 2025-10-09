// checkout.js - handles Stripe checkout

async function createCheckout(priceId) {
  try {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId })
    });
    const data = await response.json();

    if (data.url) {
      window.location.href = data.url; // redirect to Stripe checkout
    } else {
      alert("Error: " + (data.error || "Could not start checkout"));
    }
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Something went wrong.");
  }
}

// Free just opens chat
document.getElementById("free-btn").addEventListener("click", () => {
  window.location.href = "chat.html";
});

// Pro checkout
document.getElementById("pro-btn").addEventListener("click", () => {
  createCheckout("price_XXXXXXXXXXXX"); // 🔑 Replace with real Stripe Pro Price ID
});

// Team checkout
document.getElementById("team-btn").addEventListener("click", () => {
  createCheckout("price_YYYYYYYYYYYY"); // 🔑 Replace with real Stripe Team Price ID
});
