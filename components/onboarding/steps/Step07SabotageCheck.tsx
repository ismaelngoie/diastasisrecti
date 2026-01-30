"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import type { ToastAPI } from "./Step05FingerTest";
import { AnimatePresence, motion } from "framer-motion";

const OPTIONS = [
  { id: "crunches", label: "Crunches / Sit-ups", redFlag: true },
  { id: "planks", label: "Planks / Push-ups", redFlag: true },
  { id: "running", label: "Running / Jumping", redFlag: false },
  { id: "nothing", label: "Nothing yet", redFlag: false }
] as const;

function Chip({
  selected,
  onClick,
  label,
  redFlag
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  redFlag?: boolean;
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
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-white font-extrabold text-[15px] truncate">{label}</div>
          {redFlag && <div className="text-white/55 text-[12px] font-semibold mt-1">Often worsens pressure + bulging.</div>}
        </div>
        {selected ? <CheckCircle2 className="text-[color:var(--pink)]" /> : <div className="w-6 h-6 rounded-full border border-white/15" />}
      </div>
    </button>
  );
}

export default function Step07SabotageCheck({
  onNext,
  onBack,
  toast
}: {
  onNext: () => void;
  onBack: () => void;
  toast: ToastAPI;
}) {
  const name = useUserStore((s) => s.name) || "there";
  const stored = useUserStore((s) => s.sabotageExercises);
  const setSabotage = useUserStore((s) => s.setSabotageExercises);

  const [selected, setSelected] = useState<string[]>(stored || []);
  const [flash, setFlash] = useState(false);
  const [showStop, setShowStop] = useState(false);

  const canContinue = useMemo(() => selected.length > 0, [selected]);

  const toggle = (id: string) => {
    let next = [...selected];

    if (id === "nothing") {
      next = next.includes("nothing") ? [] : ["nothing"];
    } else {
      next = next.filter((x) => x !== "nothing");
      next = next.includes(id) ? next.filter((x) => x !== id) : [...next, id];
    }

    setSelected(next);
    setSabotage(next);

    const redFlagPicked = next.includes("crunches") || next.includes("planks");
    if (redFlagPicked) {
      setFlash(true);
      setTimeout(() => setFlash(false), 220);
      setShowStop(true);
      toast.show(
        "danger",
        "STOP. These moves can push outward and widen the gap. We’re flagging them as BANNED in your plan.",
        5200
      );
    } else {
      toast.hide();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1 px-6 pt-8 pb-10 relative">
      <AnimatePresence>
        {flash && (
          <motion.div
            className="absolute inset-0 z-40 bg-red-500/25 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
        )}
      </AnimatePresence>

      {/* Back button removed (prop kept for compatibility) */}

      <div className="mt-6">
        <h1 className="text-white font-extrabold text-[30px] leading-[1.08]" style={{ fontFamily: "var(--font-lora)" }}>
          We need to stop the damage, {name}.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          Which of these exercises have you tried recently? (Select all that apply)
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3">
        {OPTIONS.map((o) => (
          <Chip
            key={o.id}
            selected={selected.includes(o.id)}
            onClick={() => toggle(o.id)}
            label={o.label}
            redFlag={o.redFlag}
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

      <AnimatePresence>
        {showStop && (
          <motion.div
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStop(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/12 bg-[#0F0F17] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
              initial={{ y: 16, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-red-300" size={22} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-extrabold text-[18px] leading-tight">STOP.</div>
                  <div className="text-white/70 text-[13px] font-semibold mt-1 leading-relaxed">
                    These exercises can push your organs outward and widen the gap. We are flagging them as{" "}
                    <span className="text-white font-extrabold">BANNED</span> in your plan.
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white font-extrabold text-[14px]">
                  <Ban size={16} className="text-[color:var(--pink)]" />
                  Why this matters
                </div>
                <div className="text-white/70 text-[12px] font-semibold mt-2 leading-relaxed">
                  Fixing diastasis is about pressure control + tissue tension — not “harder ab work.” We’ll guide you safely.
                </div>
              </div>

              <button
                onClick={() => setShowStop(false)}
                className="mt-5 w-full h-12 rounded-full bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_50px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform"
              >
                OK — Protect My Core
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
