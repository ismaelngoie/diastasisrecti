"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, LockOpen } from "lucide-react";
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

function Line({ text, danger }: { text: string; danger?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={["text-[13px] font-semibold tracking-wide", danger ? "text-red-300" : "text-white/75"].join(" ")}
    >
      {danger ? (
        <span className="inline-flex items-center gap-2">
          <Ban size={16} className="text-red-300" />
          {text}
        </span>
      ) : (
        text
      )}
    </motion.div>
  );
}

export default function BridgeProtocol({ onDone }: { onDone: () => void }) {
  const name = useUserStore((s) => s.name) || "Patient";
  const fingerGap = useUserStore((s) => s.fingerGap);
  const navel = useUserStore((s) => s.navelAssessment);
  const sabotage = useUserStore((s) => s.sabotageExercises);

  const harmful = useMemo(() => {
    const list: string[] = [];
    if ((sabotage || []).includes("crunches")) list.push("Crunches");
    if ((sabotage || []).includes("planks")) list.push("Planks");
    // Always reinforce authority
    list.push("Sit-ups");
    return Array.from(new Set(list));
  }, [sabotage]);

  const lines = useMemo(() => {
    const gapText = fingerGap ? (fingerGap === 4 ? "4+ fingers" : `${fingerGap} fingers`) : "unknown";
    const navelText = navel ? navel : "unreported";
    return [
      `Importing Assessment for ${name}...`,
      `Calibration: ${gapText} separation detected...`,
      `Risk Factor: navel pattern = ${navelText}...`,
      "Filtering 500+ exercises...",
      "REMOVING harmful movements:",
      ...harmful.map((h) => `— ${h}`),
      "Compiling 16-Day Neural Adaptation Phase...",
      "Dr. Vancé’s Protocol Generated."
    ];
  }, [name, fingerGap, navel, harmful]);

  const [idx, setIdx] = useState(0);
  const done = idx >= lines.length - 1;

  useEffect(() => {
    const t = window.setInterval(() => setIdx((p) => Math.min(lines.length - 1, p + 1)), 550);
    return () => window.clearInterval(t);
  }, [lines.length]);

  return (
    <div className="fixed inset-0 z-[200] bg-[color:var(--navy)] clinical-noise flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-10">
          <AICoreView />
        </div>

        <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-6">
          <div className="text-white/55 text-[11px] font-extrabold tracking-[0.22em] uppercase">
            Protocol Generator
          </div>

          <div className="mt-4 flex flex-col gap-2 min-h-[260px]">
            {lines.slice(0, idx + 1).map((t, i) => {
              const isDangerBlock = t.startsWith("REMOVING") || t.startsWith("—");
              const danger = t.startsWith("—") || t.includes("REMOVING");
              return <Line key={i} text={t} danger={danger && isDangerBlock} />;
            })}
          </div>

          <AnimatePresence>
            {done && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 w-full h-12 rounded-full bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_60px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform inline-flex items-center justify-center gap-2"
                onClick={onDone}
              >
                <LockOpen size={18} />
                Unlock My Dashboard
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 text-center text-white/40 text-[11px] font-semibold">
          We prescribe a protocol — we don’t just show videos.
        </div>
      </div>
    </div>
  );
}
