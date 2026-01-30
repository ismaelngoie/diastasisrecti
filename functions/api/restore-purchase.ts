import { json, stripeRequest } from "./_stripe";

type Env = {
  STRIPE_SECRET_KEY: string;
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    const { email } = (await request.json().catch(() => ({}))) as { email?: string };

    if (!email) return json({ isPremium: false, error: "Email required" }, { status: 400 });

    // 1) Find customer by email
    const customers = await stripeRequest<{ data: Array<{ id: string; name?: string | null }> }>(
      env,
      "/customers",
      { method: "GET", query: { email, limit: "1" } }
    );

    if (!customers.data?.length) {
      return json({ isPremium: false, error: "No account found." });
    }

    const customer = customers.data[0];

    // 2) Check active or trialing subscriptions
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
  } catch (err: any) {
    return json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
