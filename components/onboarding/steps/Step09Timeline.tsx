"use client";

import React, { useMemo, useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { PostpartumTimeline, useUserStore } from "@/lib/store/useUserStore";
import type { ToastAPI } from "./Step05FingerTest";

const OPTIONS: Array<{ id: Exclude<PostpartumTimeline, null>; label: string }> = [
  { id: "pregnant", label: "Currently Pregnant" },
  { id: "0-6", label: "0–6 Months ago" },
  { id: "6-12", label: "6–12 Months ago" },
  { id: "1-3", label: "1–3 Years ago" },
  { id: "3+", label: "3+ Years ago" }
];

export default function Step09Timeline({
  onNext,
  onBack,
  toast
}: {
  onNext: () => void;
  onBack: () => void;
  toast: ToastAPI;
}) {
  const stored = useUserStore((s) => s.postpartumTimeline);
  const setPostpartum = useUserStore((s) => s.setPostpartumTimeline);

  const [selected, setSelected] = useState<PostpartumTimeline>(stored);

  useEffect(() => {
    setSelected(stored);
  }, [stored]);

  const canContinue = useMemo(() => selected !== null, [selected]);

  const pick = (id: Exclude<PostpartumTimeline, null>) => {
    setSelected(id);
    setPostpartum(id);

    if (id === "3+") {
      toast.show("success", "It is never too late. We have fixed gaps 10 years postpartum.", 5200);
    } else {
      toast.hide();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1 px-6 pt-8 pb-10">
      {/* Back button removed (prop kept for compatibility) */}

      <div className="mt-6">
        <h1 className="text-white font-extrabold text-[30px] leading-[1.08]" style={{ fontFamily: "var(--font-lora)" }}>
          When was your last pregnancy?
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          This helps us choose the safest tissue-loading pace.
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
              <div className="flex items-center justify-between gap-3">
                <div className="text-white font-extrabold text-[15px]">{o.label}</div>
                {is ? <CheckCircle2 className="text-[color:var(--pink)]" /> : <div className="w-6 h-6 rounded-full border border-white/15" />}
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
