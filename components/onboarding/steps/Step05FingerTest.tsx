"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Hand } from "lucide-react";
import { FingerGap, useUserStore } from "@/lib/store/useUserStore";

export type ToastTone = "success" | "info" | "warning" | "danger";
export type ToastAPI = {
  show: (tone: ToastTone, message: string, ms?: number) => void;
  hide: () => void;
};

const options: Array<{
  gap: Exclude<FingerGap, null>;
  title: string;
  sub: string;
  tone: ToastTone;
  toast: string;
}> = [
  {
    gap: 1,
    title: "1 Finger",
    sub: "Normal",
    tone: "success",
    toast: "Great news. We focus on maintenance and strengthening."
  },
  {
    gap: 2,
    title: "2 Fingers",
    sub: "Mild",
    tone: "info",
    toast: "Very common. Highly treatable in 8 weeks."
  },
  {
    gap: 3,
    title: "3 Fingers",
    sub: "Moderate",
    tone: "warning",
    toast: "Significant separation detected. 'No-Crunch' protocol activated."
  },
  {
    gap: 4,
    title: "4+ Fingers",
    sub: "Severe",
    tone: "danger",
    toast: "Warning: Deep separation. High caution advised. We are modifying your plan."
  }
];

function Card({
  selected,
  onClick,
  title,
  sub
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-3xl border p-5 text-left transition-all duration-300 active:scale-[0.99]",
        "min-h-[110px]",
        selected
          ? "border-[color:var(--pink)] bg-white/12 shadow-[0_0_0_6px_rgba(230,84,115,0.12),0_30px_80px_rgba(0,0,0,0.35)]"
          : "border-white/12 bg-white/8 hover:border-white/20"
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0",
            selected ? "border-white/20 bg-white/10" : "border-white/10 bg-black/10"
          ].join(" ")}
        >
          <Hand className="text-white" size={22} />
        </div>

        <div className="flex-1">
          <div className="text-white font-extrabold text-[18px] leading-tight">{title}</div>
          <div className="text-white/60 font-semibold text-[13px] mt-1">{sub}</div>
        </div>
      </div>
    </button>
  );
}

export default function Step05FingerTest({
  onNext,
  onBack,
  toast
}: {
  onNext: () => void;
  onBack: () => void;
  toast: ToastAPI;
}) {
  const fingerGap = useUserStore((s) => s.fingerGap);
  const setFingerGap = useUserStore((s) => s.setFingerGap);

  const [selected, setSelected] = useState<FingerGap>(fingerGap);

  // keep state in sync if store updates externally
  useEffect(() => {
    setSelected(fingerGap);
  }, [fingerGap]);

  const canContinue = useMemo(() => selected !== null, [selected]);

  const pick = (gap: Exclude<FingerGap, null>) => {
    setSelected(gap);
    setFingerGap(gap);

    const o = options.find((x) => x.gap === gap)!;
    toast.show(o.tone, o.toast, 4200);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1 px-6 pt-8 pb-10">
      {/* Back button removed (prop kept for compatibility) */}

      <div className="mt-6">
        <h1 className="text-white font-extrabold text-[30px] leading-[1.08]" style={{ fontFamily: "var(--font-lora)" }}>
          The Finger Test.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          Lie on your back, knees up, lift your head. How many fingers fit in the gap above your belly button?
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4">
        {options.map((o) => (
          <Card
            key={o.gap}
            selected={selected === o.gap}
            onClick={() => pick(o.gap)}
            title={o.title}
            sub={o.sub}
          />
        ))}
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
