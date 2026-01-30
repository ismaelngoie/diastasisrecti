"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Circle, Droplets, HeartPulse, PersonStanding, Waves } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import type { ToastAPI } from "./Step05FingerTest";

const OPTIONS = [
  { id: "backPain", label: "Lower Back Pain", icon: <PersonStanding className="text-white" size={20} /> },
  { id: "incontinence", label: "Leaking when sneezing", icon: <Droplets className="text-white" size={20} /> },
  { id: "bloating", label: "Bloating / “Looking Pregnant”", icon: <Waves className="text-white" size={20} /> },
  { id: "pelvicPain", label: "Pelvic Pain", icon: <HeartPulse className="text-white" size={20} /> }
];

function Row({
  selected,
  onClick,
  label,
  icon
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300 active:scale-[0.99]",
        "min-h-[56px]",
        selected
          ? "border-[color:var(--pink)] bg-white/12 shadow-[0_0_0_5px_rgba(230,84,115,0.10)]"
          : "border-white/12 bg-white/8 hover:border-white/20"
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl border border-white/12 bg-white/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 text-white font-extrabold text-[15px]">{label}</div>
        {selected ? (
          <CheckCircle2 className="text-[color:var(--pink)]" />
        ) : (
          <Circle className="text-white/20" />
        )}
      </div>
    </button>
  );
}

export default function Step08Symptoms({
  onNext,
  onBack,
  toast
}: {
  onNext: () => void;
  onBack: () => void;
  toast: ToastAPI;
}) {
  const stored = useUserStore((s) => s.symptoms);
  const setSymptoms = useUserStore((s) => s.setSymptoms);

  const [selected, setSelected] = useState<string[]>(stored || []);

  const canContinue = useMemo(() => true, []);

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    setSelected(next);
    setSymptoms(next);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1 px-6 pt-8 pb-10">
      {/* Back button removed (prop kept for compatibility) */}

      <div className="mt-6">
        <h1 className="text-white font-extrabold text-[30px] leading-[1.08]" style={{ fontFamily: "var(--font-lora)" }}>
          Diastasis rarely comes alone.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          Do you experience any of these secondary symptoms?
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        {OPTIONS.map((o) => (
          <Row
            key={o.id}
            selected={selected.includes(o.id)}
            onClick={() => toggle(o.id)}
            label={o.label}
            icon={o.icon}
          />
        ))}
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={() => {
            toast.hide();
            onNext();
          }}
          className="w-full h-14 rounded-full bg-[color:var(--pink)] text-white font-extrabold text-[17px] shadow-[0_18px_50px_rgba(230,84,115,0.35)] active:scale-[0.985] transition-transform"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
