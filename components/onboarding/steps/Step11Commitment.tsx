"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Timer } from "lucide-react";
import { Commitment, useUserStore } from "@/lib/store/useUserStore";
import type { ToastAPI } from "./Step05FingerTest";

const OPTIONS: Array<{ id: Exclude<Commitment, null>; label: string; badge?: string }> = [
  { id: "5-7", label: "5–7 Minutes", badge: "Most Successful • Physio Recommended" },
  { id: "15", label: "15 Minutes" },
  { id: "30", label: "30 Minutes" }
];

export default function Step11Commitment({
  onNext,
  onBack,
  toast
}: {
  onNext: () => void;
  onBack: () => void;
  toast: ToastAPI;
}) {
  const stored = useUserStore((s) => s.commitment);
  const setCommitment = useUserStore((s) => s.setCommitment);

  const [selected, setSelected] = useState<Commitment>(stored);

  // Auto-highlight 5–7 min if nothing is set
  useEffect(() => {
    if (!stored) {
      setSelected("5-7");
      setCommitment("5-7");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stored) setSelected(stored);
  }, [stored]);

  const canContinue = useMemo(() => selected !== null, [selected]);

  const pick = (id: Exclude<Commitment, null>) => {
    setSelected(id);
    setCommitment(id);
    toast.hide();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1 px-6 pt-8 pb-10">
      {/* Back button removed (prop kept for compatibility) */}

      <div className="mt-6">
        <h1 className="text-white font-extrabold text-[30px] leading-[1.08]" style={{ fontFamily: "var(--font-lora)" }}>
          Healing tissue takes consistency, not intensity.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          How much time can you dedicate daily?
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        {OPTIONS.map((o) => {
          const is = selected === o.id;
          return (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              className={[
                "w-full rounded-2xl border px-5 py-4 text-left transition-all duration-300 active:scale-[0.99]",
                "min-h-[56px]",
                is
                  ? "border-[color:var(--pink)] bg-white/12 shadow-[0_0_0_5px_rgba(230,84,115,0.10)]"
                  : "border-white/12 bg-white/8 hover:border-white/20"
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white font-extrabold text-[15px] flex items-center gap-2">
                    <Timer size={16} className="text-white/70" />
                    {o.label}
                  </div>
                  {o.badge && <div className="mt-1 text-[12px] font-extrabold text-[#33B373]">{o.badge}</div>}
                </div>

                {is ? (
                  <CheckCircle2 className="text-[color:var(--pink)] mt-0.5" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-white/15 mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <button
          disabled={!canContinue}
          onClick={() => {
            toast.hide();
            onNext();
          }}
          className={[
            "w-full h-14 rounded-full font-extrabold text-[17px] transition-all",
            canContinue
              ? "bg-[color:var(--pink)] text-white shadow-[0_18px_50px_rgba(230,84,115,0.35)] active:scale-[0.985]"
              : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed"
          ].join(" ")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
