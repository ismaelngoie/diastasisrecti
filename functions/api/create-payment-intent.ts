import Stripe from 'stripe';

export async function onRequestPost(context: any) {
  try {
    if (!context.env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), { status: 500 });
    }

    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);
    const body = await context.request.json().catch(() => ({}));

    // === JOB 1: UPDATE CUSTOMER EMAIL (Called when user clicks "Start My Healing") ===
    if (body.customerId && body.email) {
      // This ensures the Stripe Customer has the email saved for Restore to work later
      await stripe.customers.update(body.customerId, { email: body.email });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // === JOB 2: CREATE NEW SESSION (Called when Paywall loads) ===
    const priceId = context.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_PRICE_ID" }), { status: 500 });
    }

    // Create a blank customer first
    const customer = await stripe.customers.create();

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // @ts-ignore
    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;

    if (!clientSecret) {
      throw new Error("Stripe failed to generate a client secret.");
    }

    // Return the Secret AND the Customer ID (so we can update email later)
    return new Response(JSON.stringify({ 
      clientSecret: clientSecret,
      customerId: customer.id 
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
