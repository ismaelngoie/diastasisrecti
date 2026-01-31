import Stripe from 'stripe';

export async function onRequestPost(context: any) {
  try {
    // 1. Initialize Stripe
    if (!context.env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), { status: 500 });
    }
     
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);
    const priceId = context.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_PRICE_ID" }), { status: 500 });
    }

    // 2. Create Customer
    const customer = await stripe.customers.create();

    // 3. Create Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // 4. Extract Client Secret
    // @ts-ignore
    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;

    if (!clientSecret) {
      return new Response(JSON.stringify({ error: "Stripe failed to generate a client secret." }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 5. Return BOTH fields (Fixes your error)
    return new Response(JSON.stringify({ 
      clientSecret: clientSecret,
      intentType: "payment" // <--- This was missing!
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Stripe Error:", err.message);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
