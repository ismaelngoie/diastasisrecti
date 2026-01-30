import Stripe from "stripe";

export async function onRequestPost(context) {
  const secretKey = context.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(secretKey);

  try {
    const { email } = await context.request.json();
    if (!email) {
      return new Response(JSON.stringify({ isPremium: false, error: "Email required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ isPremium: false, error: "No account found." }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const customer = customers.data[0];

    const active = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1,
    });

    const trialing = await stripe.subscriptions.list({
      customer: customer.id,
      status: "trialing",
      limit: 1,
    });

    const hasActiveSub = active.data.length > 0 || trialing.data.length > 0;

    return new Response(
      JSON.stringify({
        isPremium: hasActiveSub,
        customerName: customer.name || null,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
