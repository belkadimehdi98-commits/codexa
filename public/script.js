const stripe = Stripe("pk_live_51SEW0g50pz2SntAR9AD7gJop6Ld4LgZVVve4enxE7GkyD8mV4RaAm6tOaovxtWBMMQXfOrPopueiXya0R5nMTSVJ00PJ7m7y3v");

function redirectToCheckout(plan) {
    let priceId = "";
    if (plan === "pro") {
        priceId = "price_1SFFMf50pz2SntAR9RG9WteF";  // Pro Plan
    } else if (plan === "team") {
        priceId = "price_1SFFP950pz2SntARpYHyaZEi";  // Team Plan
    }

    stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        successUrl: "https://codexa.codes/success.html",
        cancelUrl: "https://codexa.codes/cancel.html",
    }).then(function (result) {
        if (result.error) {
            alert(result.error.message);
        }
    });
}
