import Stripe from "stripe";

export async function onRequest(context: any) {
  // CORS Preflight
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (context.request.method === "POST") {
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);

    try {
      const body = await context.request.json().catch(() => ({}));
      const email = body?.email;
      
      if (!email) {
        return new Response("Email required", { 
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }

      // 1. Find Customer
      const customers = await stripe.customers.list({ email: email, limit: 1 });
      
      if (customers.data.length === 0) {
        return new Response(JSON.stringify({ isPremium: false, error: "No account found." }), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      }

      const customer = customers.data[0];

      // 2. Check for Active Subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      });

      // Also check for 'trialing'
      const trialing = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'trialing',
        limit: 1
      });

      const hasActiveSub = subscriptions.data.length > 0 || trialing.data.length > 0;

      return new Response(JSON.stringify({ 
        isPremium: hasActiveSub,
        customerName: customer.name
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }
  }
  
  return new Response("Method Not Allowed", { status: 405 });
}
