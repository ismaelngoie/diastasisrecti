import Stripe from "stripe";

export async function onRequestPost(context: any) {
  try {
    const secretKey = context.env?.STRIPE_SECRET_KEY;
    const priceId = context.env?.STRIPE_PRICE_ID;

    if (!secretKey) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_PRICE_ID" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(secretKey, {
      // keep default apiVersion unless you’ve set one; this is safe to include:
      apiVersion: "2023-10-16",
    });

    const body = await context.request.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const name = String(body?.name || "").trim();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1) Reuse or create customer WITH email (required for restore)
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existing.data[0] ||
      (await stripe.customers.create({
        email,
        name: name || undefined,
      }));

    // 2) Prevent duplicate active/trialing subscriptions
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
      return new Response(JSON.stringify({ error: "Subscription already active for this email." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3) Create subscription in incomplete state and expand invoice.payment_intent
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
        // Stripe idempotency; prevents duplicates on retries
        idempotencyKey: `sub_create_${email}`,
      }
    );

    /**
     * IMPORTANT: Stripe types in your installed version may not expose
     * invoice.payment_intent, but it exists at runtime when expanded.
     * We cast to any to satisfy TS and avoid build failure.
     */
    const latestInvoice: any = subscription.latest_invoice;
    const paymentIntent: any = latestInvoice?.payment_intent;
    const clientSecret: string | undefined = paymentIntent?.client_secret;

    if (!clientSecret) {
      return new Response(JSON.stringify({ error: "Stripe failed to generate a client secret." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ clientSecret }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
