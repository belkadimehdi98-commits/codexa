document.getElementById("checkout-pro").addEventListener("click", async () => {
  const res = await fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId: "price_pro_plan_id_here" }) // replace
  });
  const data = await res.json();
  window.location.href = data.url;
});

document.getElementById("checkout-team").addEventListener("click", async () => {
  const res = await fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId: "price_team_plan_id_here" }) // replace
  });
  const data = await res.json();
  window.location.href = data.url;
});
