async function checkout(plan) {
  try {
    const res = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error: " + (data.error || "Checkout failed"));
    }
  } catch (err) {
    console.error("Checkout error", err);
  }
}
