import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const message: string = body?.message || "";
  const context = body?.context || {};

  // If you already have a Gemini route, paste it here.
  // This stub returns a “clinic-style” response without medical diagnosis claims.
  const reply =
    `Got it. Based on your profile (gap: ${context.fingerGap ?? "?"}, depth: ${context.tissueDepth ?? "?"}, symptoms: ${(context.symptoms || []).join(", ") || "none"}), ` +
    `tell me: did you feel **pressure downward**, **midline coning**, or **sharp pain**? ` +
    `If pressure/coning: reduce intensity, exhale on effort, and switch to Pelvic Release today.`;

  return NextResponse.json({ reply });
}
