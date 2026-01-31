import Stripe from "stripe";

export async function onRequestPost(context: any) {
  try {
    const secretKey = context.env?.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });

    const body = await context.request.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stripe searches by exact email
    const customers = await stripe.customers.list({ email, limit: 10 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ isPremium: false, error: "No account found." }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check any customer for eligible subscription
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 10,
      });

      const eligible = subs.data.find((s) => s.status === "active" || s.status === "trialing");
      if (eligible) {
        return new Response(
          JSON.stringify({
            isPremium: true,
            customerName: customer.name || null,
            subscriptionStatus: eligible.status,
            currentPeriodEnd: eligible.current_period_end,
            cancelAtPeriodEnd: eligible.cancel_at_period_end,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        isPremium: false,
        error: "We found your email, but no active subscription was detected.",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
