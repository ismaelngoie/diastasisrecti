"use client";

import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";

function HolographicTimeline() {
  return (
    <div className="w-full h-40 relative my-4">
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(230,84,115,0.15)" />
            <stop offset="100%" stopColor="rgba(230,84,115,1)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <path
          d="M 14,118 C 92,132 192,44 326,28"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        <circle cx="14" cy="118" r="5" fill="#ffefef" />
        <text x="14" y="140" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11">
          Today
        </text>

        <circle cx="180" cy="74" r="6" fill="#F59E0B" stroke="white" strokeWidth="2" />
        <text x="180" y="56" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="11" fontWeight="700">
          6 Weeks
        </text>

        <circle cx="326" cy="28" r="7" fill="#33B373" stroke="white" strokeWidth="2" />
        <text x="312" y="16" textAnchor="end" fill="#33B373" fontSize="12" fontWeight="800">
          12 Weeks
        </text>
      </svg>
    </div>
  );
}

export default function Step13PlanReveal({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const name = useUserStore((s) => s.name) || "there";
  const age = useUserStore((s) => s.age);
  const fingerGap = useUserStore((s) => s.fingerGap);
  const commitment = useUserStore((s) => s.commitment);
  const sabotage = useUserStore((s) => s.sabotageExercises);

  const gapLabel = fingerGap === 4 ? "4+ Finger Gap" : `${fingerGap ?? "?"} Finger Gap`;

  const insights = useMemo(() => {
    const list: string[] = [];
    list.push(`Based on your ${age}, we focus on collagen production.`);
    if ((sabotage || []).includes("planks")) list.push("We have removed Planks to protect your back.");
    if ((sabotage || []).includes("crunches")) list.push("Crunches are flagged as dangerous for your tissue tension.");
    list.push(`Your daily commitment: ${commitment === "5-7" ? "5 Minutes" : commitment === "15" ? "15 Minutes" : "30 Minutes"}.`);
    return list;
  }, [age, commitment, sabotage]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1 px-6 pt-8 pb-10">
      <button onClick={onBack} className="text-white/70 hover:text-white font-semibold w-fit">
        ← Back
      </button>

      <div className="mt-6 text-center">
        <h1 className="text-white font-extrabold text-[30px] leading-[1.08]" style={{ fontFamily: "var(--font-lora)" }}>
          {name}, your plan is ready.
        </h1>
        <p className="text-white/70 mt-3 text-[14px] leading-relaxed">
          This is your predicted closure timeline based on your assessment.
        </p>
      </div>

      <div className="mt-4 rounded-3xl border border-white/12 bg-white/8 backdrop-blur-xl shadow-soft p-5">
        <HolographicTimeline />

        <div className="flex items-center justify-between text-[13px] font-extrabold mt-1">
          <span className="text-white/80">{gapLabel}</span>
          <span className="text-white/55">Functional closure by week 6</span>
          <span className="text-[#33B373]">Fully healed</span>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-white font-extrabold text-[16px] mb-3">Your Personal Insights</div>
        <div className="flex flex-col gap-3">
          {insights.map((t, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Sparkles className="text-[color:var(--pink)] shrink-0 mt-0.5" size={18} />
              <div className="text-white/85 text-[13px] font-semibold leading-relaxed">{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={onNext}
          className="w-full h-14 rounded-full bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B] text-white font-extrabold text-[17px] shadow-[0_0_30px_rgba(230,84,115,0.45)] active:scale-[0.985] transition-transform"
        >
          Unlock My Repair Protocol
        </button>
      </div>
    </div>
  );
}
