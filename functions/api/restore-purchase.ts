import Stripe from 'stripe';

export async function onRequestPost(context: any) {
  try {
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);
    const { email } = await context.request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Find Customer by Email
    const customers = await stripe.customers.list({ 
      email: email, 
      limit: 1 
    });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ isPremium: false, error: "No account found." }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const customer = customers.data[0];

    // 2. Check for Active Subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });

    // Optional: Check for Trialing if you ever add trials
    const trialing = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'trialing',
      limit: 1
    });

    const isPremium = subscriptions.data.length > 0 || trialing.data.length > 0;

    return new Response(JSON.stringify({ 
      isPremium,
      customerName: customer.name // Returns the name to personalize the app
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
