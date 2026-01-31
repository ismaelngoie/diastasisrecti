import Stripe from "stripe";

export async function onRequest(context: any) {
  // 1. CORS Preflight
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // 2. Only Allow POST
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const secretKey = context.env?.STRIPE_SECRET_KEY;
    const priceId = context.env?.STRIPE_PRICE_ID;

    // Common headers
    const responseHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    if (!secretKey || !priceId) {
      return new Response(JSON.stringify({ error: "Missing Stripe Config" }), {
        status: 500,
        headers: responseHeaders,
      });
    }

    const stripe = new Stripe(secretKey);

    // 3. Create Anonymous Customer
    const customer = await stripe.customers.create();

    // 4. Create Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    // 5. Bulletproof Client Secret Retrieval
    // Sometimes 'expand' doesn't work deep enough or version mismatches occur.
    // We check exactly what we have and fetch what is missing.
    let invoice = subscription.latest_invoice as any;

    // If invoice is just an ID string, fetch the full invoice
    if (typeof invoice === "string") {
      invoice = await stripe.invoices.retrieve(invoice, {
        expand: ["payment_intent"],
      });
    }

    let paymentIntent = invoice?.payment_intent;

    // If payment_intent is still just an ID string, fetch the full intent
    if (typeof paymentIntent === "string") {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntent);
    }

    const clientSecret = paymentIntent?.client_secret;

    if (!clientSecret) {
      throw new Error("Could not retrieve client_secret from new subscription.");
    }

    // 6. Success
    return new Response(JSON.stringify({ clientSecret }), {
      headers: responseHeaders,
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
