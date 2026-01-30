type Env = {
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID?: string;
};

type Action = "create-payment-intent" | "restore-purchase" | "create-portal-session";

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
}

async function stripeRequest<T>(
  env: Env,
  path: string,
  opts: {
    method?: "GET" | "POST";
    query?: Record<string, string>;
    body?: URLSearchParams;
  } = {}
): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");

  const url = new URL(`https://api.stripe.com/v1${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: opts.method || "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: opts.body,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (data?.error?.message as string) ||
      `Stripe error (${res.status}) calling ${path}`;
    throw new Error(msg);
  }

  return data as T;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Optional: handle preflight (safe even if you never hit it)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      action?: Action;
      email?: string;
      returnUrl?: string;
    };

    const action = body.action;

    if (!action) {
      return json({ error: "Missing action" }, { status: 400 });
    }

    // =========================
    // 1) CREATE PAYMENT INTENT (SUBSCRIPTION)
    // =========================
    if (action === "create-payment-intent") {
      if (!env.STRIPE_PRICE_ID) {
        return json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
      }

      // Create customer
      const customer = await stripeRequest<{ id: string }>(env, "/customers", {
        method: "POST",
        body: new URLSearchParams(),
      });

      // Create subscription with default_incomplete
      const form = new URLSearchParams();
      form.set("customer", customer.id);
      form.set("items[0][price]", env.STRIPE_PRICE_ID);
      form.set("payment_behavior", "default_incomplete");
      form.set("payment_settings[save_default_payment_method]", "on_subscription");
      form.append("expand[]", "latest_invoice.payment_intent");

      const sub = await stripeRequest<any>(env, "/subscriptions", {
        method: "POST",
        body: form,
      });

      const clientSecret =
        sub?.latest_invoice?.payment_intent?.client_secret ?? null;

      if (!clientSecret) {
        return json({ error: "Stripe did not return a client secret." }, { status: 500 });
      }

      return json({ clientSecret });
    }

    // =========================
    // 2) RESTORE PURCHASE
    // =========================
    if (action === "restore-purchase") {
      const email = (body.email || "").trim();
      if (!email || !email.includes("@")) {
        return json({ isPremium: false, error: "Valid email required" }, { status: 400 });
      }

      const customers = await stripeRequest<{ data: Array<{ id: string; name?: string | null }> }>(
        env,
        "/customers",
        { method: "GET", query: { email, limit: "1" } }
      );

      if (!customers.data?.length) {
        return json({ isPremium: false, error: "No account found." });
      }

      const customer = customers.data[0];

      const active = await stripeRequest<{ data: any[] }>(env, "/subscriptions", {
        method: "GET",
        query: { customer: customer.id, status: "active", limit: "1" },
      });

      const trialing = await stripeRequest<{ data: any[] }>(env, "/subscriptions", {
        method: "GET",
        query: { customer: customer.id, status: "trialing", limit: "1" },
      });

      const isPremium = (active.data?.length || 0) > 0 || (trialing.data?.length || 0) > 0;

      return json({
        isPremium,
        customerName: customer.name ?? null,
      });
    }

    // =========================
    // 3) CREATE BILLING PORTAL SESSION
    // =========================
    if (action === "create-portal-session") {
      const email = (body.email || "").trim();
      if (!email || !email.includes("@")) {
        return json({ error: "Valid email required" }, { status: 400 });
      }

      const customers = await stripeRequest<{ data: Array<{ id: string }> }>(
        env,
        "/customers",
        { method: "GET", query: { email, limit: "1" } }
      );

      if (!customers.data?.length) {
        return json({ error: "No customer found for this email." }, { status: 404 });
      }

      const customerId = customers.data[0].id;

      const origin = new URL(request.url).origin;
      const returnUrl = (body.returnUrl || "").trim() || `${origin}/dashboard?plan=monthly`;

      const form = new URLSearchParams();
      form.set("customer", customerId);
      form.set("return_url", returnUrl);

      const session = await stripeRequest<{ url: string }>(env, "/billing_portal/sessions", {
        method: "POST",
        body: form,
      });

      return json({ url: session.url });
    }

    return json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
