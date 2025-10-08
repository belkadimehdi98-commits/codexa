// Stripe setup
const stripe = Stripe("pk_live_51SEW0g50pz2SntAR9AD7gJop6Ld4LgZVVve4enxE7GkyD8mV4RaAm6tOaovxtWBMMQXfOrPopueiXya0R5nMTSVJ00PJ7m7y3v");

// Helper function to create checkout session
async function createCheckout(priceId) {
  try {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId })
    });

    const session = await response.json();

    if (session.id) {
      stripe.redirectToCheckout({ sessionId: session.id });
    } else {
      alert("Error creating checkout session.");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Something went wrong. Try again.");
  }
}

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
  const proBtn = document.getElementById("checkout-pro");
  const teamBtn = document.getElementById("checkout-team");

  if (proBtn) proBtn.addEventListener("click", () => createCheckout("price_1SFFMf50pz2SntAR9RG9WteF"));
  if (teamBtn) teamBtn.addEventListener("click", () => createCheckout("price_1SFFP950pz2SntARpYHyaZEi"));
});
