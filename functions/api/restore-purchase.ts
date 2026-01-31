import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return Response.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);

    const { email } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return Response.json({ error: "Email required" }, { status: 400 });
    }

    // Stripe filters by exact email match
    const customers = await stripe.customers.list({ email: cleanEmail, limit: 10 });

    if (customers.data.length === 0) {
      return Response.json({ isPremium: false, error: "No account found." });
    }

    // Check any customer record for an eligible subscription
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 10,
      });

      const eligible = subs.data.find((s) =>
        ["active", "trialing"].includes(s.status)
        // optionally allow past_due:
        // || s.status === "past_due"
      );

      if (eligible) {
        return Response.json({
          isPremium: true,
          customerName: customer.name || null,
          subscriptionStatus: eligible.status,
          currentPeriodEnd: eligible.current_period_end,
          cancelAtPeriodEnd: eligible.cancel_at_period_end,
        });
      }
    }

    return Response.json({
      isPremium: false,
      error: "We found your email, but no active subscription was detected.",
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
