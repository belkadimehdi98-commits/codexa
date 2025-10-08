document.addEventListener("DOMContentLoaded", () => {
  const checkoutPro = document.getElementById("checkout-pro");
  const checkoutTeam = document.getElementById("checkout-team");

  async function redirectToCheckout(priceId) {
    const res = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("⚠️ Payment failed: " + data.error);
    }
  }

  if (checkoutPro) {
    checkoutPro.addEventListener("click", () => {
      redirectToCheckout("price_1SFFMf50pz2SntAR9RG9WteF"); // ✅ Pro price ID
    });
  }

  if (checkoutTeam) {
    checkoutTeam.addEventListener("click", () => {
      redirectToCheckout("price_1SFFP950pz2SntARpYHyaZEi"); // ✅ Team price ID
    });
  }
});
