import Stripe from 'stripe';

export async function onRequestPost(context: any) {
  try {
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);
    const { email } = await context.request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Find ALL customers with this email (not just the first one)
    const customers = await stripe.customers.list({ 
      email: email, 
      limit: 100 // Safety net for duplicate accounts
    });

    if (customers.data.length === 0) {
      // CODE 404: Explicitly tell frontend "User not found"
      return new Response(JSON.stringify({ 
        isPremium: false, 
        message: "We could not find any account with that email." 
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Check ALL matching customers for an active subscription
    let hasActiveSub = false;
    let validCustomerName = "";

    for (const customer of customers.data) {
      // Check for 'active' or 'trialing' subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all', // Get all, then filter
      });

      const activeSub = subscriptions.data.find(sub => 
        sub.status === 'active' || sub.status === 'trialing'
      );

      if (activeSub) {
        hasActiveSub = true;
        validCustomerName = customer.name || "";
        break; // Found one! We are done.
      }
    }

    if (hasActiveSub) {
      return new Response(JSON.stringify({ 
        isPremium: true, 
        customerName: validCustomerName 
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ 
        isPremium: false, 
        message: "Account found, but no active subscription detected." 
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
