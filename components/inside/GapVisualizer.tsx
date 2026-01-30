"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { FingerGap, TissueDepth } from "@/lib/store/useUserStore";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function GapVisualizer({
  fingerGap,
  tissueDepth,
}: {
  fingerGap: FingerGap;
  tissueDepth: TissueDepth;
}) {
  const gap = fingerGap ?? 3;
  const depth = tissueDepth ?? "soft";

  const gapPx = useMemo(() => {
    const map = { 1: 8, 2: 18, 3: 28, 4: 40 } as const;
    return map[gap as 1 | 2 | 3 | 4] ?? 28;
  }, [gap]);

  const tone = useMemo(() => {
    const t = clamp((4 - gap) / 3, 0, 1);
    const r = Math.round(230 - 140 * t);
    const g = Math.round(84 + 130 * t);
    const b = Math.round(115 - 70 * t);
    return `rgb(${r},${g},${b})`;
  }, [gap]);

  const depthLabel =
    depth === "firm"
      ? "Good tension"
      : depth === "pulse"
      ? "Unstable / sensitive"
      : "Needs support";

  return (
    <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-white font-extrabold text-[16px]">Midline Visualizer</div>
          <div className="text-white/60 text-[12px] font-semibold mt-1">
            {fingerGap ? (fingerGap === 4 ? "4+ fingers" : `${fingerGap} fingers`) : "Not measured"} • {depthLabel}
          </div>
        </div>
        <div className="text-[11px] font-extrabold tracking-widest uppercase" style={{ color: tone }}>
          Tissue Quality
        </div>
      </div>

      <div className="mt-4 relative h-[170px] rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
        <svg viewBox="0 0 320 170" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="300" height="150" rx="26" fill="url(#skin)" />
        </svg>

        <motion.div
          className="absolute left-1/2 top-1/2 -translate-y-1/2 w-[120px] h-[110px] rounded-2xl border border-white/12 bg-white/10"
          animate={{ x: -(gapPx / 2) - 128 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-y-1/2 w-[120px] h-[110px] rounded-2xl border border-white/12 bg-white/10"
          animate={{ x: gapPx / 2 + 8 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />

        <motion.div
          className="absolute left-1/2 top-[30px] bottom-[30px] rounded-full"
          style={{ background: tone }}
          animate={{ width: gapPx }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>

      <div className="mt-4 text-white/65 text-[12px] font-semibold leading-relaxed">
        As your measurement improves, the midline narrows and the color shifts from red → green.
      </div>
    </div>
  );
}
