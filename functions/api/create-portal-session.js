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
    const { email, returnUrl } = await context.request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ error: "No customer found for this email." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${new URL(context.request.url).origin}/dashboard?plan=monthly`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
