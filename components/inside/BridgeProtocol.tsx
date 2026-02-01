"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Ban, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";

/**
 * ✅ Million-dollar upgrades (no extra dependencies):
 * - Cinematic background: aurora gradients + vignette + subtle scan/noise
 * - Premium "AI Core" orb with glow, rings, shimmer
 * - Typewriter-ish progressive reveal with smarter cadence
 * - Clear hierarchy: headline + subcopy + “building plan” terminal
 * - Safer / calmer palette and better spacing on all screens
 * - Button enters like a “reward” moment
 */

function PremiumBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#07070C]">
      {/* Aurora */}
      <div className="absolute -top-[20%] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[color:var(--pink)]/18 blur-[90px]" />
      <div className="absolute top-[10%] left-[8%] h-[360px] w-[360px] rounded-full bg-white/8 blur-[110px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[color:var(--pink)]/10 blur-[110px]" />

      {/* Soft grid */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage:
            "radial-gradient(circle at 50% 25%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 32%, rgba(0,0,0,0.05) 70%)",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.06),rgba(0,0,0,0.9)_62%)]" />

      {/* Subtle noise (CSS-only) */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.45%22/></svg>')",
            backgroundSize: "120px 120px",
          }}
        />
      </div>
    </div>
  );
}

function AICoreView({ compact }: { compact?: boolean }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={[
        "relative flex items-center justify-center",
        compact ? "w-40 h-40" : "w-44 h-44",
      ].join(" ")}
      aria-hidden="true"
    >
      {/* Outer halo */}
      <div className="absolute inset-0 rounded-full bg-[color:var(--pink)]/10 blur-2xl" />

      {/* Rings */}
      <div
        className={[
          "absolute rounded-full border border-[color:var(--pink)]/55",
          "w-[92px] h-[92px]",
          reduce ? "" : "animate-spin [animation-duration:9s]",
          "border-t-transparent border-l-transparent",
        ].join(" ")}
      />
      <div
        className={[
          "absolute rounded-full border border-[color:var(--pink)]/40",
          "w-[128px] h-[128px]",
          reduce ? "" : "animate-spin [animation-duration:13s] [animation-direction:reverse]",
          "border-b-transparent border-r-transparent",
        ].join(" ")}
      />
      <div
        className={[
          "absolute rounded-full border border-[color:var(--pink)]/25",
          "w-[164px] h-[164px]",
          reduce ? "" : "animate-spin [animation-duration:17s]",
          "border-t-transparent",
        ].join(" ")}
      />

      {/* Core orb */}
      <div className="absolute w-14 h-14 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.55),rgba(230,84,115,0.55)_35%,rgba(230,84,115,0.18)_70%,rgba(0,0,0,0)_100%)] blur-[0.2px]" />
      <div className="absolute w-10 h-10 rounded-full bg-[color:var(--pink)] shadow-[0_0_28px_rgba(230,84,115,0.70)]" />

      {/* Shimmer sweep */}
      {!reduce && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute -left-1/2 top-0 h-full w-1/2 bg-white/10 blur-xl rotate-12 animate-[sweep_2.4s_ease-in-out_infinite]" />
          <style>{`
            @keyframes sweep {
              0% { transform: translateX(-40%) rotate(12deg); opacity: 0; }
              30% { opacity: .55; }
              60% { opacity: .25; }
              100% { transform: translateX(220%) rotate(12deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

function Line({
  text,
  variant,
}: {
  text: string;
  variant?: "danger" | "success" | "neutral";
}) {
  const danger = variant === "danger";
  const success = variant === "success";

  return (
    <motion.div
      initial={{ opacity: 0, x: -6, filter: "blur(3px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={[
        "text-[13.5px] sm:text-[14px] font-semibold tracking-wide flex items-start gap-2",
        danger ? "text-red-200" : success ? "text-[#35C17D]" : "text-white/78",
      ].join(" ")}
    >
      <div className="pt-[2px] shrink-0">
        {danger && <Ban size={16} className="shrink-0" />}
        {success && <CheckCircle2 size={16} className="shrink-0" />}
        {!danger && !success && <div className="w-2 h-2 rounded-full bg-white/18 mt-[6px]" />}
      </div>

      <div className="min-w-0">
        <span className="break-words">{text}</span>
      </div>
    </motion.div>
  );
}

function pillText(name: string, fingerGap?: number | null) {
  const gapText =
    fingerGap ? (fingerGap === 4 ? "4+ finger gap" : `${fingerGap} finger gap`) : "midline gap";
  return `${name} • ${gapText}`;
}

export default function BridgeProtocol({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();

  const name = useUserStore((s: any) => s.name) || "Patient";
  const fingerGap = useUserStore((s: any) => s.fingerGap);
  const sabotage = useUserStore((s: any) => s.sabotageExercises);

  const harmful = useMemo(() => {
    const list: string[] = [];
    if ((sabotage || []).includes("crunches")) list.push("Crunches");
    if ((sabotage || []).includes("planks")) list.push("Planks");
    list.push("Sit-ups");
    return Array.from(new Set(list));
  }, [sabotage]);

  const lines = useMemo(() => {
    const gapText = fingerGap ? (fingerGap === 4 ? "4+ finger" : `${fingerGap} finger`) : "midline";
    return [
      { t: `Analyzing core + midline profile for ${name}…`, v: "neutral" as const },
      { t: `Detected a ${gapText} separation (diastasis recti).`, v: "neutral" as const },
      { t: `Calibrating safe pressure limits…`, v: "neutral" as const },
      { t: `Selecting Phase 1 movements optimized for control…`, v: "neutral" as const },
      { t: `Blocking high-pressure moves for now:`, v: "danger" as const },
      ...harmful.map((h) => ({ t: `— ${h}`, v: "danger" as const })),
      { t: `Generating your sessions + cues…`, v: "neutral" as const },
      { t: `Plan ready.`, v: "success" as const },
    ];
  }, [name, fingerGap, harmful]);

  const [idx, setIdx] = useState(0);
  const done = idx >= lines.length - 1;

  // Smarter pacing: speed up early, slow slightly on the “danger” block, then finish.
  useEffect(() => {
    let timer: number | null = null;

    const step = () => {
      setIdx((p) => {
        const next = Math.min(lines.length - 1, p + 1);
        return next;
      });
    };

    const current = lines[Math.min(idx, lines.length - 1)];
    const isDanger = current?.v === "danger";
    const isFinal = current?.v === "success";

    const base = 520;
    const delay = isFinal ? 999999 : isDanger ? 720 : base;

    timer = window.setTimeout(step, reduce ? 380 : delay);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, lines, reduce]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5 sm:px-6">
      <PremiumBackdrop />

      <div className="w-full max-w-md">
        {/* Top “brand” / status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center shadow-soft">
              <Sparkles size={18} className="text-[color:var(--pink)]" />
            </div>
            <div className="leading-tight">
              <div className="text-white font-extrabold tracking-tight">Fix Diastasis</div>
              <div className="text-white/45 text-[11px] font-semibold">Personalized rehab plan</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-white/55 text-[11px] font-semibold">
            <ShieldCheck size={16} className="text-white/55" />
            Safe-pressure protocol
          </div>
        </motion.div>

        {/* Core + card */}
        <div className="flex items-center justify-center mb-8">
          <AICoreView />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-[34px] border border-white/12 bg-white/6 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.55)] overflow-hidden"
        >
          {/* Header strip */}
          <div className="px-7 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[color:var(--pink)] text-[11px] font-black tracking-[0.24em] uppercase">
                  Building your plan
                </div>
                <div className="mt-2 text-white text-[20px] font-extrabold tracking-tight leading-snug">
                  {done ? "Your first session is ready." : "Give me a second…"}
                </div>
                <div className="mt-1 text-white/55 text-[12px] font-semibold">
                  Tailored to your measurement and pressure tolerance.
                </div>
              </div>

              <div className="shrink-0">
                <div className="px-3 py-2 rounded-2xl border border-white/10 bg-black/20 text-white/75 text-[11px] font-extrabold tracking-[0.14em] uppercase">
                  {pillText(name, fingerGap)}
                </div>
              </div>
            </div>
          </div>

          {/* Terminal-like output */}
          <div className="px-7 py-6">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white/55 text-[10px] font-extrabold tracking-[0.22em] uppercase">
                  Rehab engine
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#35C17D] shadow-[0_0_14px_rgba(53,193,125,0.55)]" />
                  <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
                    Live
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-h-[250px]">
                {lines.slice(0, idx + 1).map((x, i) => (
                  <Line
                    key={i}
                    text={x.t}
                    variant={x.v === "danger" ? "danger" : x.v === "success" ? "success" : "neutral"}
                  />
                ))}
              </div>

              {/* Progress meter */}
              <div className="mt-5">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[color:var(--pink)] transition-all duration-300"
                    style={{ width: `${Math.round(((idx + 1) / lines.length) * 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-white/45 text-[11px] font-semibold">
                  <span>{done ? "Complete" : "Processing…"}</span>
                  <span className="tabular-nums">{Math.round(((idx + 1) / lines.length) * 100)}%</span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="mt-6"
                >
                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    className="w-full h-14 rounded-full bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B] text-white font-extrabold text-[17px] shadow-[0_16px_50px_rgba(230,84,115,0.42)] inline-flex items-center justify-center gap-3"
                    onClick={onDone}
                  >
                    Start My Core Rehab Plan
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/20 border border-white/10">
                      <Sparkles size={16} />
                    </span>
                  </motion.button>

                  <div className="mt-4 text-center px-2">
                    <p className="text-white/55 text-[12px] font-semibold leading-relaxed">
                      {name}, your recovery starts now — slow control, clean breathing, steady progress.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer trust line */}
        <div className="mt-6 text-center px-4">
          <p className="text-white/35 text-[11px] font-semibold leading-relaxed">
            This program is not medical advice. Stop if anything feels sharp, painful, or wrong.
          </p>
        </div>
      </div>
    </div>
  );
}
