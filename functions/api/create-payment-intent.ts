import Stripe from "stripe";

export async function onRequest(context: any) {
  // 1. Handle CORS Preflight (OPTIONS request)
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Only allow POST for the actual logic
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

    // Common Headers for all responses
    const responseHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    if (!secretKey) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
        status: 500,
        headers: responseHeaders,
      });
    }
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_PRICE_ID" }), {
        status: 500,
        headers: responseHeaders,
      });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });

    const body = await context.request.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const name = String(body?.name || "").trim();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    // 1) Reuse or create customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existing.data[0] ||
      (await stripe.customers.create({
        email,
        name: name || undefined,
      }));

    // 2) Prevent duplicate active subscriptions
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

    if (active.data.length > 0 || trialing.data.length > 0) {
      return new Response(
        JSON.stringify({ error: "Subscription already active for this email." }),
        {
          status: 409,
          headers: responseHeaders,
        }
      );
    }

    // 3) Create subscription
    const subscription = await stripe.subscriptions.create(
      {
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: { email },
      },
      {
        idempotencyKey: `sub_create_${email}_${Date.now()}`, // Added timestamp to prevent stale key collisions during testing
      }
    );

    const latestInvoice: any = subscription.latest_invoice;
    const paymentIntent: any = latestInvoice?.payment_intent;
    const clientSecret: string | undefined = paymentIntent?.client_secret;

    if (!clientSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe failed to generate a client secret." }),
        {
          status: 500,
          headers: responseHeaders,
        }
      );
    }

    return new Response(JSON.stringify({ clientSecret }), {
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
