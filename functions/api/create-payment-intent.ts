import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!secretKey) {
      return Response.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }
    if (!priceId) {
      return Response.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);

    // 1) Reuse or create customer WITH email (needed for Restore)
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email,
        name: name || undefined,
      }));

    // 2) Prevent duplicate active/trialing subs
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
      return Response.json(
        { error: "Subscription already active for this email." },
        { status: 409 }
      );
    }

    // 3) Create subscription in incomplete state + return first invoice PI client_secret
    const subscription = await stripe.subscriptions.create(
      {
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
        metadata: { email },
      },
      {
        // simple idempotency key (better: pass one from client)
        idempotencyKey: `sub_create_${email}`,
      }
    );

    // For most paid starts, client secret is on latest_invoice.payment_intent
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
    const pi = latestInvoice?.payment_intent as Stripe.PaymentIntent | null;

    const clientSecret = pi?.client_secret;

    if (!clientSecret) {
      return Response.json(
        { error: "Stripe failed to generate a client secret." },
        { status: 500 }
      );
    }

    return Response.json({ clientSecret });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
