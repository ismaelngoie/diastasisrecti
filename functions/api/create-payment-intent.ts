// functions/api/create-payment-intent.ts
import { json, stripeRequest } from "../_stripe";

type Env = {
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID: string;
};

export async function onRequestPost(context: { env: Env }) {
  try {
    const { env } = context;

    if (!env.STRIPE_PRICE_ID) {
      return json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
    }

    // 1) Create customer
    const customer = await stripeRequest<{ id: string }>(env, "/customers", {
      method: "POST",
      body: new URLSearchParams(),
    });

    // 2) Create subscription
    const body = new URLSearchParams();
    body.set("customer", customer.id);
    body.set("items[0][price]", env.STRIPE_PRICE_ID);
    body.set("payment_behavior", "default_incomplete");
    body.set("payment_settings[save_default_payment_method]", "on_subscription");
    
    // FIXED: Use explicit index [0] to ensure Stripe expands it
    body.set("expand[0]", "latest_invoice.payment_intent");

    const sub = await stripeRequest<any>(env, "/subscriptions", {
      method: "POST",
      body,
    });

    // 3) Extract Client Secret
    const clientSecret =
      sub?.latest_invoice?.payment_intent?.client_secret ?? null;

    if (!clientSecret) {
      // DEBUGGING: Log why it failed
      console.error("Stripe Subscription Response:", JSON.stringify(sub, null, 2));

      // Check for Trial Period issue
      if (sub.status === 'trialing') {
         return json({ error: "Price ID has a trial period. No payment is due immediately." }, { status: 400 });
      }

      return json({ error: "Stripe did not return a client secret. Check logs." }, { status: 500 });
    }

    return json({ clientSecret });
  } catch (err: any) {
    console.error("Create Payment Intent Error:", err);
    return json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
