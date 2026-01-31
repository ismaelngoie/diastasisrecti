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

  // Handle Logic
  if (context.request.method === "POST") {
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);
    
    try {
      // 1. Create a Customer (Anonymous, exactly as requested)
      const customer = await stripe.customers.create();

      // 2. Create the Subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: context.env.STRIPE_PRICE_ID,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // 3. Return the Client Secret
      // We cast to 'any' because TypeScript definitions might be strict about expansion
      const latestInvoice: any = subscription.latest_invoice;
      const clientSecret = latestInvoice.payment_intent.client_secret;

      return new Response(JSON.stringify({ clientSecret }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
      });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
