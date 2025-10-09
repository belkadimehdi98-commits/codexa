// Handle Stripe checkout
async function handleCheckout(priceId) {
  try {
    const res = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();
    if (data.url) {
      // Redirect user to Stripe Checkout
      window.location.href = data.url;
    } else {
      alert("Payment setup failed. Please try again.");
    }
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Something went wrong. Please try again later.");
  }
}

// ✅ Free Plan → redirect to confirmation page
const freeBtn = document.getElementById("free-btn");
if (freeBtn) {
  freeBtn.addEventListener("click", () => {
    window.location.href = "free.html";
  });
}

// ✅ Pro Plan → Stripe Checkout
const proBtn = document.getElementById("pro-btn");
if (proBtn) {
  proBtn.addEventListener("click", () => {
    handleCheckout("price_1SFFMf50pz2SntAR9RG9WteF"); // Your real Pro price ID
  });
}

// ✅ Team Plan → Stripe Checkout
const teamBtn = document.getElementById("team-btn");
if (teamBtn) {
  teamBtn.addEventListener("click", () => {
    handleCheckout("price_1SFFP950pz2SntARpYHyaZEi"); // Your real Team price ID
  });
}
