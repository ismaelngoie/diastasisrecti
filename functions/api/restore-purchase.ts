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
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }

      // 1. Find Customer by Email
      const customers = await stripe.customers.list({ email: email, limit: 1 });

      if (customers.data.length === 0) {
        return new Response(
          JSON.stringify({ isPremium: false, error: "No account found." }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // 2. Check for Active/Trialing Subscriptions
      // We check ALL customers found (rare edge case) or just the first one.
      // Typically checking the first one is enough, but robust logic iterates.
      let hasActiveSub = false;
      let customerName = null;

      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: "all",
          limit: 10,
        });

        const eligible = subs.data.find(
          (s) => s.status === "active" || s.status === "trialing"
        );

        if (eligible) {
          hasActiveSub = true;
          customerName = customer.name;
          break; // Found one, stop looking
        }
      }

      return new Response(
        JSON.stringify({
          isPremium: hasActiveSub,
          customerName: customerName,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
