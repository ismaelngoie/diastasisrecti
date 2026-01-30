// functions/_stripe.ts

type StripeEnv = {
  STRIPE_SECRET_KEY: string;
};

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
}

export async function stripeRequest<T>(
  env: StripeEnv,
  path: string,
  opts: {
    method?: "GET" | "POST";
    query?: Record<string, string>;
    body?: URLSearchParams;
  } = {}
): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  const url = new URL(`https://api.stripe.com/v1${path}`);

  if (opts.query) {
    Object.entries(opts.query).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  // FIXED: Explicitly convert body to string to ensure params like 'expand' are sent correctly
  const bodyString = opts.body?.toString();

  const res = await fetch(url.toString(), {
    method: opts.method || "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyString, 
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (data as any)?.error?.message ||
      `Stripe error (${res.status}) calling ${path}`;
    // Log the error so you can see it in Cloudflare logs
    console.error(`Stripe Error: ${msg}`, data);
    throw new Error(msg);
  }

  return data as T;
}
