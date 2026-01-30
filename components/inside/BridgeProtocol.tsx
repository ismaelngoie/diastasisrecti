"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";

function AICoreView() {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <div className="absolute w-[86px] h-[86px] border-[3px] border-[color:var(--pink)]/80 rounded-full animate-spin [animation-duration:8s] border-t-transparent border-l-transparent" />
      <div className="absolute w-[120px] h-[120px] border-[2px] border-[color:var(--pink)]/60 rounded-full animate-spin [animation-duration:12s] [animation-direction:reverse] border-b-transparent border-r-transparent" />
      <div className="absolute w-[154px] h-[154px] border-[1px] border-[color:var(--pink)]/40 rounded-full animate-spin [animation-duration:15s] border-t-transparent" />
      <div className="absolute w-10 h-10 bg-[color:var(--pink)]/45 rounded-full blur-md animate-pulse" />
      <div className="absolute w-6 h-6 bg-[color:var(--pink)] rounded-full shadow-[0_0_20px_rgba(230,84,115,0.8)]" />
    </div>
  );
}

function Line({ text, danger, success }: { text: string; danger?: boolean; success?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={[
        "text-[14px] font-semibold tracking-wide flex items-center gap-2",
        danger ? "text-red-300" : success ? "text-[#33B373]" : "text-white/80",
      ].join(" ")}
    >
      {danger && <Ban size={16} className="shrink-0" />}
      {success && <CheckCircle2 size={16} className="shrink-0" />}
      {text}
    </motion.div>
  );
}

export default function BridgeProtocol({ onDone }: { onDone: () => void }) {
  const name = useUserStore((s) => s.name) || "Patient";
  const fingerGap = useUserStore((s) => s.fingerGap);
  const sabotage = useUserStore((s) => s.sabotageExercises);

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
      `Reviewing midline profile for ${name}...`,
      `Focusing on a ${gapText} separation (diastasis recti)...`,
      `Setting safe pressure limits...`,
      `Building your core rehab plan...`,
      `Avoiding high-pressure moves:`,
      ...harmful.map((h) => `— ${h}`),
      `Preparing your Phase 1 sessions...`,
      `Plan ready.`,
    ];
  }, [name, fingerGap, harmful]);

  const [idx, setIdx] = useState(0);
  const done = idx >= lines.length - 1;

  useEffect(() => {
    const t = window.setInterval(() => {
      setIdx((p) => Math.min(lines.length - 1, p + 1));
    }, 650);
    return () => window.clearInterval(t);
  }, [lines.length]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#0A0A0F] clinical-noise flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-12">
          <AICoreView />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-7">
          <div className="text-[color:var(--pink)] text-[11px] font-black tracking-[0.25em] uppercase mb-5">
            Personal Rehab Plan
          </div>

          <div className="flex flex-col gap-3 min-h-[280px]">
            {lines.slice(0, idx + 1).map((t, i) => {
              const isDanger = t.startsWith("Avoiding") || t.startsWith("—");
              const isFinal = t.includes("Plan ready");
              return <Line key={i} text={t} danger={isDanger} success={isFinal} />;
            })}
          </div>

          <AnimatePresence>
            {done && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 w-full h-14 rounded-full bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B] text-white font-extrabold text-[17px] shadow-[0_15px_40px_rgba(230,84,115,0.4)] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-3"
                onClick={onDone}
              >
                Start My Core Rehab Plan
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 text-center px-4">
          <p className="text-white/40 text-[12px] font-medium leading-relaxed">
            {name}, your recovery starts now. Let’s get to work.
          </p>
        </div>
      </div>
    </div>
  );
}
