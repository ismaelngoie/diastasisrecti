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
