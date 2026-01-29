"use client";

import React, { useMemo, useState } from "react";
import { Activity, ShieldAlert, Waves } from "lucide-react";
import { TissueDepth, useUserStore } from "@/lib/store/useUserStore";
import type { ToastAPI } from "./Step05FingerTest";

const opts: Array<{
  id: Exclude<TissueDepth, null>;
  title: string;
  sub: string;
  icon: React.ReactNode;
}> = [
  { id: "firm", title: "Firm", sub: "Like hitting a trampoline.", icon: <Activity className="text-white" size={22} /> },
  { id: "soft", title: "Soft", sub: "Like sinking into a marshmallow.", icon: <Waves className="text-white" size={22} /> },
  { id: "pulse", title: "Pulse", sub: "I can feel my pulse.", icon: <ShieldAlert className="text-white" size={22} /> }
];

function Card({
  selected,
  onClick,
  title,
  sub,
  icon
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-3xl border p-5 text-left transition-all duration-300 active:scale-[0.99]",
        "min-h-[100px]",
        selected
          ? "border-[color:var(--pink)] bg-white/12 shadow-[0_0_0_6px_rgba(230,84,115,0.12),0_30px_80px_rgba(0,0,0,0.35)]"
          : "border-white/12 bg-white/8 hover:border-white/20"
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl border border-white/12 bg-white/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-white font-extrabold text-[18px] leading-tight">{title}</div>
          <div className="text-white/60 font-semibold text-[13px] mt-1">{sub}</div>
        </div>
      </div>
    </button>
  );
}

export default function Step06TissueDepth({
  onNext,
  onBack,
  toast
}: {
  onNext: () => void;
  onBack: () => void;
  toast: ToastAPI;
}) {
  const name = useUserStore((s) => s.name) || "there";
  const tissueDepth = useUserStore((s) => s.tissueDepth);
  const setTissueDepth = useUserStore((s) => s.setTissueDepth);
  const setHighRisk = useUserStore((s) => s.setHighRisk);

  const [selected, setSelected] = useState<TissueDepth>(tissueDepth);

  const canContinue = useMemo(() => selected !== null, [selected]);

  const pick = (id: Exclude<TissueDepth, null>) => {
    setSelected(id);
    setTissueDepth(id);

    if (id === "pulse") {
      setHighRisk(true);
      toast.show("info", "Noted. We will focus on thickening the Linea Alba.", 4200);
    } else {
      setHighRisk(false);
      toast.hide();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1 px-6 pt-8 pb-10">
      <button onClick={onBack} className="text-white/70 hover:text-white font-semibold w-fit">
        ← Back
      </button>

      <div className="mt-6">
        <h1 className="text-white font-extrabold text-[30px] leading-[1.08]" style={{ fontFamily: "var(--font-lora)" }}>
          {name}, it’s not just about width.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          How deep do your fingers sink into the gap?
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        {opts.map((o) => (
          <Card
            key={o.id}
            selected={selected === o.id}
            onClick={() => pick(o.id)}
            title={o.title}
            sub={o.sub}
            icon={o.icon}
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
