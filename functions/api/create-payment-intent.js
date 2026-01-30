import Stripe from "stripe";

export async function onRequestPost(context) {
  const secretKey = context.env.STRIPE_SECRET_KEY;
  const priceId = context.env.STRIPE_PRICE_ID;

  if (!secretKey) {
    return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!priceId) {
    return new Response(JSON.stringify({ error: "Missing STRIPE_PRICE_ID" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(secretKey);

  try {
    const customer = await stripe.customers.create();

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    return new Response(
      JSON.stringify({
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
