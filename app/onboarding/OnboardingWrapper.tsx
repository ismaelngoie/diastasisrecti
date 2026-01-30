"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  Hand,
  Activity,
  ShieldAlert,
  Waves,
  AlertTriangle,
  PersonStanding,
  Droplets,
  HeartPulse,
  Circle,
  Shield,
  ShieldCheck, // Added this missing import
  Timer,
  Star,
  ChevronDown,
  ChevronUp,
  Brain,
  X,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { loadStripe, StripePaymentElementOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// --- External Component & Store Imports ---
// Assuming these files exist in your project based on the provided code
import ButterflyBackground from "@/components/ButterflyBackground";
import { Toast } from "@/components/Toast";
import {
  USER_STORAGE_KEY,
  useUserStore,
  useUserData, // Used in Step 14
  VisualShape,
  FingerGap,
  TissueDepth,
  PostpartumTimeline,
  NavelAssessment,
  Commitment,
} from "@/lib/store/useUserStore";

// ==========================================
// SHARED TYPES (Originally from Step 5)
// ==========================================
export type ToastTone = "success" | "info" | "warning" | "danger";
export type ToastAPI = {
  show: (tone: ToastTone, message: string, ms?: number) => void;
  hide: () => void;
};

// ==========================================
// STEP 05: FINGER TEST
// ==========================================

const step05Options: Array<{
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
    toast: "Great news. We focus on maintenance and strengthening.",
  },
  {
    gap: 2,
    title: "2 Fingers",
    sub: "Mild",
    tone: "info",
    toast: "Very common. Highly treatable in 8 weeks.",
  },
  {
    gap: 3,
    title: "3 Fingers",
    sub: "Moderate",
    tone: "warning",
    toast: "Significant separation detected. 'No-Crunch' protocol activated.",
  },
  {
    gap: 4,
    title: "4+ Fingers",
    sub: "Severe",
    tone: "danger",
    toast: "Warning: Deep separation. High caution advised. We are modifying your plan.",
  },
];

function Step05Card({
  selected,
  onClick,
  title,
  sub,
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
          : "border-white/12 bg-white/8 hover:border-white/20",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0",
            selected ? "border-white/20 bg-white/10" : "border-white/10 bg-black/10",
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

function Step05FingerTest({
  onNext,
  onBack,
  toast,
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

    const o = step05Options.find((x) => x.gap === gap)!;
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
        {step05Options.map((o) => (
          <Step05Card
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
              : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed",
          ].join(" ")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ==========================================
// STEP 06: TISSUE DEPTH
// ==========================================

const step06Opts: Array<{
  id: Exclude<TissueDepth, null>;
  title: string;
  sub: string;
  icon: React.ReactNode;
}> = [
  { id: "firm", title: "Firm", sub: "Like hitting a trampoline.", icon: <Activity className="text-white" size={22} /> },
  { id: "soft", title: "Soft", sub: "Like sinking into a marshmallow.", icon: <Waves className="text-white" size={22} /> },
  { id: "pulse", title: "Pulse", sub: "I can feel my pulse.", icon: <ShieldAlert className="text-white" size={22} /> },
];

function Step06Card({
  selected,
  onClick,
  title,
  sub,
  icon,
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
          : "border-white/12 bg-white/8 hover:border-white/20",
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

function Step06TissueDepth({
  onNext,
  onBack,
  toast,
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

  useEffect(() => {
    setSelected(tissueDepth);
  }, [tissueDepth]);

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
      {/* Back button removed (prop kept for compatibility) */}

      <div className="mt-6">
        <h1 className="text-white font-extrabold text-[30px] leading-[1.08]" style={{ fontFamily: "var(--font-lora)" }}>
          {name}, it’s not just about width.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          How deep do your fingers sink into the gap?
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        {step06Opts.map((o) => (
          <Step06Card
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
              : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed",
          ].join(" ")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ==========================================
// STEP 07: SABOTAGE CHECK
// ==========================================

const step07Options = [
  { id: "crunches", label: "Crunches / Sit-ups", redFlag: true },
  { id: "planks", label: "Planks / Push-ups", redFlag: true },
  { id: "running", label: "Running / Jumping", redFlag: false },
  { id: "nothing", label: "Nothing yet", redFlag: false },
] as const;

function Step07Chip({
  selected,
  onClick,
  label,
  redFlag,
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
          : "border-white/12 bg-white/8 hover:border-white/20",
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

function Step07SabotageCheck({
  onNext,
  onBack,
  toast,
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
        {step07Options.map((o) => (
          <Step07Chip
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
              : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed",
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

// ==========================================
// STEP 08: SYMPTOMS
// ==========================================

const step08Options = [
  { id: "backPain", label: "Lower Back Pain", icon: <PersonStanding className="text-white" size={20} /> },
  { id: "incontinence", label: "Leaking when sneezing", icon: <Droplets className="text-white" size={20} /> },
  { id: "bloating", label: "Bloating / “Looking Pregnant”", icon: <Waves className="text-white" size={20} /> },
  { id: "pelvicPain", label: "Pelvic Pain", icon: <HeartPulse className="text-white" size={20} /> },
];

function Step08Row({
  selected,
  onClick,
  label,
  icon,
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
          : "border-white/12 bg-white/8 hover:border-white/20",
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

function Step08Symptoms({
  onNext,
  onBack,
  toast,
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
        {step08Options.map((o) => (
          <Step08Row
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

// ==========================================
// STEP 09: TIMELINE
// ==========================================

const step09Options: Array<{ id: Exclude<PostpartumTimeline, null>; label: string }> = [
  { id: "pregnant", label: "Currently Pregnant" },
  { id: "0-6", label: "0–6 Months ago" },
  { id: "6-12", label: "6–12 Months ago" },
  { id: "1-3", label: "1–3 Years ago" },
  { id: "3+", label: "3+ Years ago" },
];

function Step09Timeline({
  onNext,
  onBack,
  toast,
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
        {step09Options.map((o) => {
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
                  : "border-white/12 bg-white/8 hover:border-white/20",
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
              : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed",
          ].join(" ")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ==========================================
// STEP 10: NAVEL
// ==========================================

const step10Options: Array<{ id: Exclude<NavelAssessment, null>; label: string; note?: string }> = [
  { id: "outie", label: "It pokes out (Outie)." },
  { id: "flat", label: "It disappeared / stretches flat." },
  { id: "no_change", label: "No change." },
  { id: "hernia", label: "I have a diagnosed Umbilical Hernia.", note: "We’ll keep your plan hernia-safe." },
];

function Step10Navel({
  onNext,
  onBack,
  toast,
}: {
  onNext: () => void;
  onBack: () => void;
  toast: ToastAPI;
}) {
  const stored = useUserStore((s) => s.navelAssessment);
  const setNavel = useUserStore((s) => s.setNavelAssessment);
  const setHerniaSafe = useUserStore((s) => s.setHerniaSafe);

  const [selected, setSelected] = useState<NavelAssessment>(stored);

  useEffect(() => {
    setSelected(stored);
  }, [stored]);

  const canContinue = useMemo(() => selected !== null, [selected]);

  const pick = (id: Exclude<NavelAssessment, null>) => {
    setSelected(id);
    setNavel(id);

    if (id === "hernia") {
      setHerniaSafe(true);
      toast.show("warning", "Hernia noted. We will remove high-pressure movements to keep you safe.", 5200);
    } else {
      setHerniaSafe(false);
      toast.hide();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1 px-6 pt-8 pb-10">
      {/* Back button removed (prop kept for compatibility) */}

      <div className="mt-6">
        <h1 className="text-white font-extrabold text-[30px] leading-[1.08]" style={{ fontFamily: "var(--font-lora)" }}>
          Has the shape of your belly button changed?
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          This helps us rule out pressure-sensitive patterns.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        {step10Options.map((o) => {
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
                  : "border-white/12 bg-white/8 hover:border-white/20",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white font-extrabold text-[15px]">{o.label}</div>
                  {o.note && (
                    <div className="mt-1 text-white/60 text-[12px] font-semibold flex items-center gap-2">
                      <Shield size={14} className="text-white/60" />
                      {o.note}
                    </div>
                  )}
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
              : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed",
          ].join(" ")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ==========================================
// STEP 11: COMMITMENT
// ==========================================

const step11Options: Array<{ id: Exclude<Commitment, null>; label: string; badge?: string }> = [
  { id: "5-7", label: "5–7 Minutes", badge: "Most Successful • Physio Recommended" },
  { id: "15", label: "15 Minutes" },
  { id: "30", label: "30 Minutes" },
];

function Step11Commitment({
  onNext,
  onBack,
  toast,
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
        {step11Options.map((o) => {
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
                  : "border-white/12 bg-white/8 hover:border-white/20",
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
              : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed",
          ].join(" ")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ==========================================
// STEP 12: ANALYSIS
// ==========================================

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

function Typewriter({ text }: { text: string }) {
  const [out, setOut] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setOut("");
    if (timerRef.current) window.clearInterval(timerRef.current);

    let i = 0;
    timerRef.current = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 28);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [text]);

  return (
    <span>
      {out}
      <span className="animate-pulse text-[color:var(--pink)]">|</span>
    </span>
  );
}

function Step12Analysis({ onDone }: { onDone: () => void }) {
  const name = useUserStore((s) => s.name) || "there";
  const sabotage = useUserStore((s) => s.sabotageExercises);

  const lines = useMemo(() => {
    const base = [
      `Analyzing Linea Alba density for ${name}...`,
      "Calculating Gap Closure trajectory...",
      "Identifying harmful exercises in current routine...",
    ];
    const hasCrunches = (sabotage || []).includes("crunches");
    if (hasCrunches) base.push("Flagging 'Crunches' as dangerous...");
    base.push("Building 12-Week 'No-Crunch' Protocol...");
    base.push("Calibration Complete.");
    return base;
  }, [name, sabotage]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const totalMs = 7000;
    const stepMs = Math.floor(totalMs / Math.max(1, lines.length));

    const t = window.setInterval(() => {
      setIdx((p) => Math.min(lines.length - 1, p + 1));
    }, stepMs);

    const done = window.setTimeout(() => {
      window.clearInterval(t);
      onDone();
    }, totalMs);

    return () => {
      window.clearInterval(t);
      window.clearTimeout(done);
    };
  }, [lines.length, onDone]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div className="mb-10">
        <AICoreView />
      </div>

      <div className="max-w-md">
        <div className="text-white/60 text-xs font-extrabold tracking-widest uppercase mb-3">
          Clinical Analysis
        </div>

        <h1 className="text-3xl font-extrabold text-white leading-tight" style={{ fontFamily: "var(--font-lora)" }}>
          Building your repair plan…
        </h1>

        <div className="mt-6 text-[15px] font-semibold text-white/85 leading-relaxed min-h-[56px]">
          <Typewriter text={lines[idx]} />
        </div>

        <div className="mt-8 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[color:var(--pink)] transition-all duration-300"
            style={{ width: `${Math.min(100, ((idx + 1) / lines.length) * 100)}%` }}
          />
        </div>

        <div className="mt-3 text-[12px] text-white/55 font-semibold">
          Calibration running • This takes ~7 seconds
        </div>
      </div>
    </div>
  );
}

// ==========================================
// STEP 13: PLAN REVEAL
// ==========================================

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
          strokeLinejoin="round"
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

function Step13PlanReveal({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
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
    list.push(
      `Your daily commitment: ${
        commitment === "5-7" ? "5 Minutes" : commitment === "15" ? "15 Minutes" : "30 Minutes"
      }.`
    );
    return list;
  }, [age, commitment, sabotage]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1 px-6 pt-8 pb-10">
      {/* Back button removed (prop kept for compatibility) */}

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

// ==========================================
// STEP 14: PAYWALL
// ==========================================

// --- STRIPE SETUP ---
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const REVIEW_IMAGES = ["/review9.png", "/review1.png", "/review5.png", "/review4.png", "/review2.png"];

const MEDICAL_FEATURES = [
  {
    icon: <Brain size={24} className="text-white" />,
    title: "AI-Driven Protocol",
    desc: "Adapts to your gap width daily.",
  },
  {
    icon: <ShieldCheck size={24} className="text-white" />,
    title: "Diastasis Safe",
    desc: "Zero crunches. Zero bulging.",
  },
  {
    icon: <Stethoscope size={24} className="text-white" />,
    title: "Physio Approved",
    desc: "Clinical logic, home comfort.",
  },
  {
    icon: <Activity size={24} className="text-white" />,
    title: "Tissue Tracking",
    desc: "Visual trackers for gap closure.",
  },
];

const REVIEWS = [
  { name: "Sarah W.", text: "I closed my 3-finger gap in 9 weeks. No surgery.", image: "/review9.png" },
  { name: "Michelle T.", text: "The 'coning' stopped after 12 days. Finally safe.", image: "/review1.png" },
  { name: "Chloe N.", text: "My back pain vanished when my core reconnected.", image: "/review5.png" },
  { name: "Olivia G.", text: "Better than my $150 physio visits. Truly.", image: "/review4.png" },
  { name: "Jess P.", text: "I can lift my baby without fear now.", image: "/review2.png" },
];

const DASHBOARD_PATH = "/dashboard?plan=monthly";

const CheckoutForm = ({ onClose }: { onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const { setPremium, setJoinDate, setName } = useUserData();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const returnUrl = `${window.location.origin}${DASHBOARD_PATH}`;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        receipt_email: email,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Payment failed");
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      setPremium(true);
      setJoinDate(new Date().toISOString());

      // ✅ AUTO-START DRY SEAL IF USER HAS LEAKS
      const symptoms = useUserData.getState().symptoms || [];
      if (symptoms.includes("incontinence")) {
        useUserData.getState().startDrySeal();
      }

      router.push(DASHBOARD_PATH);
      return;
    }

    setMessage("An unexpected error occurred.");
    setIsLoading(false);
  };

  // ✅ Correct PaymentElement typing
  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    fields: {
      billingDetails: {
        phone: "never",
      },
    },
  };

  return (
    <form
      onClick={(e) => e.stopPropagation()}
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-[#1A1A26] p-6 rounded-[32px] border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-10 fade-in duration-500 relative my-auto mx-4"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10"
      >
        <X size={20} className="text-white/70" />
      </button>

      <div className="mb-6">
        <h3 className="text-xl font-extrabold text-white mb-1" style={{ fontFamily: "var(--font-lora)" }}>
          Secure Checkout
        </h3>
        <p className="text-sm text-white/50 font-medium">Total due: $24.99 / month</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-white">
          <LinkAuthenticationElement
            id="link-authentication-element"
            onChange={(e: any) => setEmail(e.value.email)}
          />
        </div>

        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>

      {message && (
        <div className="text-red-300 text-sm mt-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20 font-semibold">
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="mt-6 w-full h-14 rounded-full bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B] text-white font-extrabold text-[17px] shadow-[0_10px_40px_rgba(230,84,115,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : "Unlock My Protocol ($24.99)"}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4 text-white/30 text-[11px] font-semibold">
        <Lock size={12} />
        256-bit SSL Secure Payment
      </div>

      {/* Pelvi-style reassurance */}
      <p className="text-center text-white/30 text-[11px] font-semibold mt-3">
        100% secure payment via Stripe
      </p>
    </form>
  );
};

const RestoreModal = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const { setPremium, setJoinDate, setName } = useUserData();

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.includes("@")) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/restore-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.isPremium) {
        setPremium(true);
        setJoinDate(new Date().toISOString());
        if (data.customerName) setName(data.customerName);

        // ✅ AUTO-START DRY SEAL IF USER HAS LEAKS
        const symptoms = useUserData.getState().symptoms || [];
        if (symptoms.includes("incontinence")) {
          useUserData.getState().startDrySeal();
        }

        router.push(DASHBOARD_PATH);
        return;
      }

      setMessage("We found your email, but no active subscription was detected.");
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setMessage("Unable to verify purchase. Please check your internet connection.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#1A1A26] border border-white/10 rounded-[32px] p-6 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-extrabold text-white" style={{ fontFamily: "var(--font-lora)" }}>
            Restore Purchase
          </h3>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* Pelvi-style explanation */}
        <p className="text-white/60 text-sm mb-5 font-medium leading-relaxed">
          Enter the email address you used at checkout. We’ll find your active plan and unlock your dashboard.
        </p>

        <form onSubmit={handleRestoreSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[color:var(--pink)] transition-colors font-semibold"
              autoFocus
            />
          </div>

          {message && (
            <div className="text-red-300 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 font-semibold">
              {message}
            </div>
          )}

          <button
            disabled={isLoading}
            className="w-full h-12 rounded-2xl font-extrabold text-white shadow-[0_10px_30px_rgba(230,84,115,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Find My Plan"}
          </button>

          <p className="text-center text-white/30 text-[11px] font-semibold">
            If your subscription is active, your access restores instantly.
          </p>
        </form>
      </div>
    </div>
  );
};

function Step14Paywall() {
  const { name } = useUserData();

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [userCount, setUserCount] = useState(10150);
  const [showContent, setShowContent] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  const [clientSecret, setClientSecret] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [dateString, setDateString] = useState("");

  const displayReview = useMemo(() => REVIEWS[currentReviewIndex], [currentReviewIndex]);

  useEffect(() => {
    setShowContent(true);

    // 12 weeks from now
    const d = new Date();
    d.setDate(d.getDate() + 84);
    setDateString(
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  useEffect(() => {
    const featureTimer = setInterval(
      () => setActiveFeatureIndex((p) => (p + 1) % MEDICAL_FEATURES.length),
      3000
    );
    const reviewTimer = setInterval(() => setCurrentReviewIndex((p) => (p + 1) % REVIEWS.length), 5000);
    return () => {
      clearInterval(featureTimer);
      clearInterval(reviewTimer);
    };
  }, []);

  useEffect(() => {
    if (!showContent) return;
    let start = 10150;
    const timer = setInterval(() => {
      start += 2;
      if (start >= 10243) {
        setUserCount(10243);
        clearInterval(timer);
      } else setUserCount(start);
    }, 50);
    return () => clearInterval(timer);
  }, [showContent]);

  // Preload review images so REVIEW_IMAGES isn't dead weight
  useEffect(() => {
    if (typeof window === "undefined") return;
    REVIEW_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleStartPlan = async () => {
    setIsButtonLoading(true);

    if (!clientSecret) {
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Server error (${res.status}): ${txt}`);
        }

        const data = await res.json();
        if (!data?.clientSecret) throw new Error("No clientSecret returned from server.");

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error("Stripe init error:", err);
        alert(`Could not initialize payment: ${err?.message || "Unknown error"}`);
        setIsButtonLoading(false);
        return;
      }
    }

    setIsButtonLoading(false);
    setShowCheckoutModal(true);
  };

  const stripeAppearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#E65473",
      colorBackground: "#1A1A26",
      colorText: "#ffffff",
      colorDanger: "#df1b41",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "16px",
    },
  };

  const getCtaSubtext = () => {
    if (!dateString) return "";
    return `Feel real progress by ${dateString}. If not, one tap full $24.99 refund.`;
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#1A1A26] overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-60" : "opacity-0"
          }`}
        >
          <source src="/paywall_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A26]/30 via-transparent to-[#1A1A26]" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Scrollable Content */}
      <div
        className={`z-10 flex-1 flex flex-col overflow-y-auto no-scrollbar pt-14 pb-40 px-6 transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-md shadow-lg">
            <Lock size={14} className="text-white/90" />
            <span className="text-[11px] font-extrabold text-white tracking-widest uppercase">
              Clinical Protocol Locked
            </span>
          </div>
        </div>

        <h1
          className="text-[34px] font-extrabold text-white text-center mb-4 leading-[1.1] drop-shadow-xl"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          <span className="text-white/90">{name}, your repair</span>
          <br />
          <span className="text-[color:var(--pink)]">protocol is ready.</span>
        </h1>

        <p className="text-center text-white/70 text-[15px] font-medium leading-relaxed mb-8 max-w-xs mx-auto">
          Join <span className="text-white font-bold">{userCount.toLocaleString()}+ women</span> who closed their gap
          without surgery.
        </p>

        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
            <motion.div
              className="h-full bg-[color:var(--pink)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-[color:var(--pink)] to-[#C23A5B] flex items-center justify-center shadow-lg shadow-pink-500/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeatureIndex}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {MEDICAL_FEATURES[activeFeatureIndex].icon}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeatureIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <h3 className="text-lg font-bold text-white mb-1">{MEDICAL_FEATURES[activeFeatureIndex].title}</h3>
                <p className="text-white/60 text-sm font-medium">{MEDICAL_FEATURES[activeFeatureIndex].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[28px] p-5 flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-1.5">
            <span className="text-[20px] font-bold text-white">4.9</span>
            <div className="flex text-yellow-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-white/50 uppercase ml-1 tracking-wide">Doctor Approved</span>
          </div>

          <div className="relative w-full h-[100px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReviewIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute w-full flex flex-col items-center"
              >
                <img
                  src={displayReview.image}
                  alt={displayReview.name}
                  className="w-12 h-12 rounded-full border-2 border-white/20 object-cover shadow-md mb-3"
                />
                <p className="text-[15px] italic text-white text-center font-medium leading-snug px-4">
                  "{displayReview.text}"
                </p>
                <p className="text-[11px] font-bold text-white/40 mt-2 uppercase tracking-wide">{displayReview.name}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          onClick={() => setIsFaqOpen(!isFaqOpen)}
          className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm cursor-pointer active:scale-[0.99] transition-transform mb-6"
        >
          <div className="flex items-center justify-center gap-2 text-white/80">
            <span className="text-[13px] font-bold">100% Money-Back Guarantee?</span>
            {isFaqOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isFaqOpen ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-[13px] text-white/50 text-center leading-relaxed px-2">
              Yes. If you don&apos;t see results in your gap or symptoms, request a full refund in the app settings. No
              questions asked.
            </p>
          </div>
        </div>

        {/* Pelvi-style footer links (brand + labels) */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center items-center gap-3 text-[11px] font-semibold text-white/55">
            <button
              onClick={() => setShowRestoreModal(true)}
              className="underline decoration-white/25 hover:text-white transition-colors"
              style={{ textDecorationThickness: "2px" }}
            >
              Restore Purchase
            </button>
            <span>•</span>
            <span className="cursor-default">Physiotherapist</span>
            <span>•</span>
            <span className="cursor-default">Doctor Approved</span>
          </div>
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <div
        className={`absolute bottom-0 left-0 w-full z-30 px-5 pb-8 pt-8 bg-gradient-to-t from-[#1A1A26] via-[#1A1A26]/95 to-transparent transition-all duration-700 delay-200 ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <button
          onClick={handleStartPlan}
          disabled={isButtonLoading}
          className="w-full h-[60px] rounded-full shadow-[0_0_40px_rgba(225,29,72,0.4)] flex items-center justify-center gap-3 animate-breathe active:scale-[0.98] transition-transform relative overflow-hidden group bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B]"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          {isButtonLoading ? (
            <Loader2 className="animate-spin text-white" />
          ) : (
            <>
              <span className="text-[18px] font-extrabold text-white">Unlock My Repair Protocol</span>
              <ChevronDown className="-rotate-90 text-white/80" size={20} />
            </>
          )}
        </button>

        {/* Replace bottom price/cancel text with Pelvi-style subtext */}
        <p className="text-center text-white/70 text-[12px] font-semibold mt-3 leading-snug px-4 drop-shadow-sm">
          {getCtaSubtext()}
        </p>
      </div>

      {/* Stripe Modal */}
      {showCheckoutModal && clientSecret && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto"
          onClick={() => setShowCheckoutModal(false)}
        >
          <div className="min-h-full flex items-center justify-center p-4">
            <Elements options={{ clientSecret, appearance: stripeAppearance }} stripe={stripePromise}>
              <CheckoutForm onClose={() => setShowCheckoutModal(false)} />
            </Elements>
          </div>
        </div>
      )}

      {showRestoreModal && <RestoreModal onClose={() => setShowRestoreModal(false)} />}
    </div>
  );
}

// ==========================================
// MAIN ONBOARDING WRAPPER
// ==========================================

const TOTAL_STEPS = 14;

const MIA_M1 =
  "Hi! I'm Coach Mia, your Core Specialist. I've helped 10,000+ women close their gap.";
const MIA_M2 = "To start your medical file, what should I call you?";

function miaAgeQuestion(safeName: string) {
  return `Lovely to meet you, ${safeName}. Age helps me determine your collagen elasticity levels. How young are you?`;
}

function Logo() {
  return (
    <div className="flex items-center justify-center">
      <img
        src="/logo.png"
        alt="Fix Diastasis"
        className="w-16 h-16 object-contain drop-shadow"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="ml-3">
        <div className="text-white font-extrabold text-lg tracking-tight">Fix Diastasis</div>
        <div className="text-white/55 text-xs font-semibold tracking-wide uppercase">
          Clinical Assessment
        </div>
      </div>
    </div>
  );
}

/**
 * Progress bar ONLY (no "Step X of 14" text).
 * Render it only on screens 2–11.
 */
function ProgressBar({ step }: { step: number }) {
  const pct = Math.max(0, Math.min(100, (step / TOTAL_STEPS) * 100));
  return (
    <div className="px-6 pt-6">
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-white/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// --- HIGH-END 3D DEFINITIONS (Glow, Texture, Hologram) ---
const Defs = ({ p }: { p: string }) => (
  <defs>
    {/* Background */}
    <radialGradient id={`${p}-bg`} cx="35%" cy="20%" r="85%">
      <stop offset="0%" stopColor="#1b1a2a" stopOpacity="1" />
      <stop offset="55%" stopColor="#0f1020" stopOpacity="1" />
      <stop offset="100%" stopColor="#070814" stopOpacity="1" />
    </radialGradient>

    {/* Subtle tech dots pattern */}
    <pattern id={`${p}-dots`} width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="0.8" fill="#fff" opacity="0.06" />
    </pattern>

    {/* Bodysuit / figure material */}
    <linearGradient id={`${p}-figure`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
      <stop offset="35%" stopColor="#c9ccff" stopOpacity="0.08" />
      <stop offset="70%" stopColor="#ffffff" stopOpacity="0.05" />
      <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
    </linearGradient>

    {/* Rim light */}
    <linearGradient id={`${p}-rim`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
      <stop offset="55%" stopColor="#ffffff" stopOpacity="0.18" />
      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.10" />
    </linearGradient>

    {/* Sheen band */}
    <linearGradient id={`${p}-sheen`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="28%" stopColor="#ffffff" stopOpacity="0.10" />
      <stop offset="42%" stopColor="#ffffff" stopOpacity="0.22" />
      <stop offset="58%" stopColor="#ffffff" stopOpacity="0.08" />
      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
    </linearGradient>

    {/* Ambient occlusion */}
    <radialGradient id={`${p}-ao`} cx="50%" cy="55%" r="75%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0" />
      <stop offset="70%" stopColor="#000000" stopOpacity="0.10" />
      <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
    </radialGradient>

    {/* Highlight pink (The "Hot" Zone) */}
    <radialGradient id={`${p}-hot`} cx="40%" cy="35%" r="70%">
      <stop offset="0%" stopColor="#ff9bb0" stopOpacity="0.65" />
      <stop offset="45%" stopColor="#e65473" stopOpacity="0.25" />
      <stop offset="100%" stopColor="#e65473" stopOpacity="0" />
    </radialGradient>

    {/* Specular highlight */}
    <radialGradient id={`${p}-spec`} cx="35%" cy="30%" r="40%">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
      <stop offset="55%" stopColor="#ffffff" stopOpacity="0.08" />
      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
    </radialGradient>

    {/* Gap depth (The Trench) */}
    <linearGradient id={`${p}-gap`} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
      <stop offset="45%" stopColor="#070814" stopOpacity="0.92" />
      <stop offset="55%" stopColor="#070814" stopOpacity="0.92" />
      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.10" />
    </linearGradient>

    {/* Laser stroke */}
    <linearGradient id={`${p}-laser`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
      <stop offset="35%" stopColor="#ff7e9a" stopOpacity="0.85" />
      <stop offset="70%" stopColor="#e65473" stopOpacity="0.95" />
      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.20" />
    </linearGradient>

    {/* Premium bloom filter */}
    <filter id={`${p}-bloom`} x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b1" />
      <feColorMatrix
        in="b1"
        type="matrix"
        values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 0.65 0"
        result="b2"
      />
      <feMerge>
        <feMergeNode in="b2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    {/* Soft shadow */}
    <filter id={`${p}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#000000" floodOpacity="0.35" />
    </filter>

    {/* Inner shadow */}
    <filter id={`${p}-inner`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
      <feOffset dx="0" dy="2" result="off" />
      <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner" />
      <feColorMatrix
        in="inner"
        type="matrix"
        values="
          0 0 0 0 0
          0 0 0 0 0
          0 0 0 0 0
          0 0 0 0.55 0"
        result="shade"
      />
      <feComposite in="shade" in2="SourceGraphic" operator="over" />
    </filter>

    {/* Micro grain texture */}
    <filter id={`${p}-grain`} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
      <feColorMatrix
        in="n"
        type="matrix"
        values="
          0 0 0 0 1
          0 0 0 0 1
          0 0 0 0 1
          0 0 0 0.06 0"
        result="g"
      />
      <feBlend in="SourceGraphic" in2="g" mode="overlay" />
    </filter>
  </defs>
);

function ShapeArt({
  id,
  showLabels = true,
}: {
  id: Exclude<VisualShape, null>;
  showLabels?: boolean;
}) {
  const uid = React.useId();
  const p = `s-${uid.replace(/:/g, "")}`; // Ensure ID is safe for SVG

  // A recognizable female torso silhouette (clothed bodysuit feel; non-explicit)
  const figurePath =
    "M72 56 Q100 38 128 56 Q140 68 134 84 Q125 104 128 126 Q133 158 112 176 Q100 186 88 176 Q67 158 72 126 Q75 104 66 84 Q60 68 72 56 Z";

  const neckPath = "M92 50 Q100 56 108 50 L108 60 Q100 66 92 60 Z";

  // Callout anchor points
  const callouts = {
    pooch: { x: 128, y: 138, label: "Lower belly", lx: 150, ly: 130 },
    gap: { x: 100, y: 112, label: "Midline / separation", lx: 148, ly: 102 },
    cone: { x: 100, y: 90, label: "Upper abdomen", lx: 148, ly: 78 },
  } as const;

  const c = callouts[id];

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" shapeRendering="geometricPrecision">
      <Defs p={p} />

      {/* Premium card-like background */}
      <rect x="10" y="10" width="180" height="180" rx="26" fill={`url(#${p}-bg)`} />
      <rect x="10" y="10" width="180" height="180" rx="26" fill={`url(#${p}-dots)`} />
      <rect x="10" y="10" width="180" height="180" rx="26" fill="#000" opacity="0.18" />

      {/* Figure clip */}
      <defs>
        <clipPath id={`${p}-clip`}>
          <path d={figurePath} />
        </clipPath>
      </defs>

      {/* Woman figure */}
      <g filter={`url(#${p}-shadow)`}>
        {/* Head */}
        <circle cx="100" cy="34" r="14" fill={`url(#${p}-figure)`} stroke={`url(#${p}-rim)`} strokeWidth="1.4" />
        {/* Neck */}
        <path d={neckPath} fill={`url(#${p}-figure)`} stroke={`url(#${p}-rim)`} strokeWidth="1.2" />

        {/* Torso */}
        <path
          d={figurePath}
          fill={`url(#${p}-figure)`}
          stroke={`url(#${p}-rim)`}
          strokeWidth="1.6"
          strokeLinejoin="round"
          opacity="0.98"
        />

        {/* Inner depth + AO + sheen */}
        <path d={figurePath} fill="transparent" filter={`url(#${p}-inner)`} />
        <path
          d={figurePath}
          fill={`url(#${p}-ao)`}
          opacity="0.95"
          style={{ mixBlendMode: "multiply" as any }}
        />
        <path
          d={figurePath}
          fill={`url(#${p}-sheen)`}
          opacity="0.9"
          style={{ mixBlendMode: "screen" as any }}
        />

        {/* Grain only on torso */}
        <g clipPath={`url(#${p}-clip)`} filter={`url(#${p}-grain)`} opacity="0.9">
          <rect x="0" y="0" width="200" height="200" fill="transparent" />
        </g>

        {/* Subtle “bodysuit seams” */}
        <path d="M80 74 Q100 88 120 74" stroke="#fff" opacity="0.14" strokeWidth="1.2" />
        <path d="M86 156 Q100 166 114 156" stroke="#fff" opacity="0.12" strokeWidth="1.2" />
      </g>

      {/* Focus overlays (Clipped to body) */}
      <g clipPath={`url(#${p}-clip)`}>
        {/* --- POOCH --- */}
        {id === "pooch" && (
          <>
            <ellipse cx="100" cy="142" rx="30" ry="20" fill="#000" opacity="0.22" style={{ mixBlendMode: "multiply" as any }} />
            <path
              d="M74 132 C 82 120, 118 120, 126 132 C 134 146, 118 162, 100 162 C 82 162, 66 146, 74 132 Z"
              fill={`url(#${p}-hot)`}
              filter={`url(#${p}-bloom)`}
            />
            <path
              d="M82 136 C 90 128, 110 128, 120 136 C 112 146, 92 148, 82 136 Z"
              fill={`url(#${p}-spec)`}
              opacity="0.95"
              style={{ mixBlendMode: "screen" as any }}
            />
            <path d="M78 132 Q100 144 122 132" stroke="#fff" strokeWidth="1.8" opacity="0.75" strokeLinecap="round" />
          </>
        )}

        {/* --- GAP --- */}
        {id === "gap" && (
          <>
            <path
              d="M95 74 Q95 112 95 150 L105 150 Q105 112 105 74 Z"
              fill={`url(#${p}-gap)`}
              filter={`url(#${p}-inner)`}
            />
            <path d="M95 74 Q92 112 95 150" stroke="#fff" opacity="0.35" strokeWidth="1.4" />
            <path d="M105 74 Q108 112 105 150" stroke="#fff" opacity="0.35" strokeWidth="1.4" />

            <g filter={`url(#${p}-bloom)`} opacity="0.95">
              <path d="M68 104 L88 104" stroke="#fff" strokeWidth="1" strokeDasharray="3 4" opacity="0.35" />
              <path d="M88 104 L112 104" stroke={`url(#${p}-laser)`} strokeWidth="1.8" />
              <path d="M112 104 L132 104" stroke="#fff" strokeWidth="1" strokeDasharray="3 4" opacity="0.35" />

              <path d="M68 120 L88 120" stroke="#fff" strokeWidth="1" strokeDasharray="3 4" opacity="0.35" />
              <path d="M88 120 L112 120" stroke={`url(#${p}-laser)`} strokeWidth="1.8" />
              <path d="M112 120 L132 120" stroke="#fff" strokeWidth="1" strokeDasharray="3 4" opacity="0.35" />
            </g>

            <path d="M88 101 L93 104 L88 107" fill="#fff" opacity="0.85" />
            <path d="M112 101 L107 104 L112 107" fill="#fff" opacity="0.85" />
          </>
        )}

        {/* --- CONE --- */}
        {id === "cone" && (
          <>
            <path
              d="M84 132 L100 76 L116 132"
              fill={`url(#${p}-hot)`}
              opacity="0.8"
              filter={`url(#${p}-bloom)`}
            />
            <path
              d="M100 76 L100 132"
              stroke="#e65473"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter={`url(#${p}-bloom)`}
            />
            <path d="M100 92 L76 98" stroke="#fff" strokeWidth="1" opacity="0.16" />
            <path d="M100 110 L74 116" stroke="#fff" strokeWidth="1" opacity="0.22" />
            <path d="M100 92 L124 98" stroke="#fff" strokeWidth="1" opacity="0.16" />
            <path d="M100 110 L126 116" stroke="#fff" strokeWidth="1" opacity="0.22" />
          </>
        )}
      </g>

      {/* Callout label */}
      {showLabels && (
        <g opacity="0.95">
          <path
            d={`M${c.x} ${c.y} L${c.lx - 8} ${c.ly}`}
            stroke="#fff"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <circle cx={c.x} cy={c.y} r="2.2" fill="#fff" opacity="0.85" />
          <rect x={c.lx - 4} y={c.ly - 10} width="44" height="16" rx="8" fill="#000" opacity="0.35" />
          <text x={c.lx + 2} y={c.ly + 2} fontSize="8.5" fill="#fff" opacity="0.9" fontFamily="ui-sans-serif, system-ui">
            {c.label}
          </text>
        </g>
      )}
    </svg>
  );
}

function VisualCard({
  id,
  title,
  subtitle,
  selected,
  onSelect,
}: {
  id: Exclude<VisualShape, null>;
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        "w-full text-left rounded-3xl border transition-all duration-300",
        "bg-white/8 backdrop-blur-xl shadow-soft",
        "active:scale-[0.99]",
        selected
          ? "border-[rgba(230,84,115,0.75)] shadow-[0_0_0_6px_rgba(230,84,115,0.12),0_28px_70px_rgba(0,0,0,0.35)]"
          : "border-white/12 hover:border-white/20",
      ].join(" ")}
      style={{ minHeight: 120 }}
    >
      <div className="p-5 flex gap-4 items-center">
        <div
          className={[
            "w-28 h-[72px] rounded-2xl overflow-hidden border",
            selected ? "border-white/20" : "border-white/10",
          ].join(" ")}
        >
          <ShapeArt id={id} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={[
                "text-[16px] font-extrabold leading-snug",
                selected ? "text-white" : "text-white/90",
              ].join(" ")}
            >
              {title}
            </div>
            {selected && <CheckCircle2 size={18} className="text-[color:var(--pink)]" />}
          </div>
          <div className="text-[13px] text-white/60 leading-snug mt-1">{subtitle}</div>
        </div>
      </div>
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
    </div>
  );
}

function ChatBubble({
  from,
  children,
  typing,
}: {
  from: "mia" | "user";
  children?: React.ReactNode;
  typing?: boolean;
}) {
  const isUser = from === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/15 bg-white/10 shrink-0 mr-3 mt-auto relative flex items-center justify-center">
          <span className="text-white/80 font-extrabold text-sm select-none">M</span>
          <img
            src="/coachMiaAvatar.png"
            alt="Mia"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div
        className={[
          "max-w-[86%] px-5 py-3.5 text-[15px] leading-relaxed font-semibold",
          "shadow-soft",
          isUser
            ? "bg-[color:var(--pink)] text-white rounded-2xl rounded-br-none"
            : "bg-white/10 border border-white/12 text-white rounded-2xl rounded-bl-none",
        ].join(" ")}
      >
        {typing ? <TypingIndicator /> : children}
      </div>
    </div>
  );
}

function WheelPicker({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const range = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const ITEM_HEIGHT = 54;

  useEffect(() => {
    if (!scrollerRef.current) return;
    const idx = range.indexOf(value);
    if (idx >= 0) scrollerRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (!scrollerRef.current) return;
    const scrollY = scrollerRef.current.scrollTop;
    const centerIndex = Math.round(scrollY / ITEM_HEIGHT);
    const newValue = range[centerIndex];
    if (newValue !== undefined && newValue !== value) onChange(newValue);
  };

  return (
    <div className="relative h-[220px] w-full max-w-[340px] mx-auto overflow-hidden mt-1">
      <div className="absolute top-1/2 left-0 w-full h-[54px] -translate-y-1/2 border-t-2 border-b-2 border-[color:var(--pink)]/10 bg-[color:var(--pink)]/5 pointer-events-none z-10" />

      <div className="absolute top-0 left-0 w-full h-[80px] bg-gradient-to-b from-white via-white/90 to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-t from-white via-white/90 to-transparent z-20 pointer-events-none" />

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[83px]"
      >
        {range.map((num) => (
          <div
            key={num}
            className={[
              "h-[54px] flex items-center justify-center snap-center transition-all duration-200",
              num === value
                ? "scale-110 font-extrabold text-[color:var(--pink)] text-3xl"
                : "scale-90 text-slate-400 text-2xl",
            ].join(" ")}
          >
            {num}
            <span className="text-sm ml-2 mt-1 font-semibold text-slate-400/80">years</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Benefit({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-white font-extrabold text-[15px] leading-snug">{title}</div>
        <div className="text-white/60 text-[13px] leading-snug mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

export default function OnboardingWrapper() {
  const router = useRouter();

  const { isPremium, onboardingStep, setOnboardingStep } = useUserStore();

  const visualShape = useUserStore((s) => s.visualShape);
  const setVisualShape = useUserStore((s) => s.setVisualShape);

  const name = useUserStore((s) => s.name);
  const setName = useUserStore((s) => s.setName);

  const storedAge = useUserStore((s) => s.age);
  const setAge = useUserStore((s) => s.setAge);

  const [checkedPremium, setCheckedPremium] = useState(false);

  const [toastState, setToastState] = useState<{ show: boolean; msg: string; tone: ToastTone }>({
    show: false,
    msg: "",
    tone: "info",
  });

  const toastTimeoutRef = useRef<number | null>(null);

  const toastApi: ToastAPI = useMemo(
    () => ({
      show: (tone, message, ms = 3200) => {
        if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
        setToastState({ show: true, tone, msg: message });
        toastTimeoutRef.current = window.setTimeout(() => {
          setToastState((p) => ({ ...p, show: false }));
        }, ms);
      },
      hide: () => {
        if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
        setToastState((p) => ({ ...p, show: false }));
      },
    }),
    []
  );

  // Chat state (Screens 3–4)
  const [chat, setChat] = useState<Array<{ from: "mia" | "user"; text: string }>>([]);
  const [miaTyping, setMiaTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const [inputName, setInputName] = useState(name || "");
  const [ageValue, setAgeValue] = useState<number>(storedAge || 30);
  const askedAgeRef = useRef(false);

  const screen = onboardingStep;

  const scrollToBottom = () => {
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  // Premium redirect (fast storage path)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.isPremium === true) {
          router.replace("/dashboard?plan=monthly");
          return;
        }
      }
    } catch {}
    setCheckedPremium(true);
  }, [router]);

  // Premium redirect (store)
  useEffect(() => {
    if (!checkedPremium) return;
    if (isPremium) router.replace("/dashboard?plan=monthly");
  }, [checkedPremium, isPremium, router]);

  // Screen 3 init
  useEffect(() => {
    if (screen !== 3) return;
    if (chat.length > 0) return;

    setMiaTyping(false);
    setChat([{ from: "mia", text: MIA_M1 }]);
    scrollToBottom();

    setMiaTyping(true);
    const t = setTimeout(() => {
      setMiaTyping(false);
      setChat((prev) => [...prev, { from: "mia", text: MIA_M2 }]);
      scrollToBottom();
    }, 800);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Screen 4 hydration + ask age (only if not already asked)
  useEffect(() => {
    if (screen !== 4) return;
    setAgeValue(storedAge || 30);

    if (chat.length === 0) {
      const seeded: Array<{ from: "mia" | "user"; text: string }> = [
        { from: "mia", text: MIA_M1 },
        { from: "mia", text: MIA_M2 },
      ];
      if ((name || "").trim().length >= 2) seeded.push({ from: "user", text: name.trim() });
      setChat(seeded);
      scrollToBottom();
    }

    if (askedAgeRef.current) return;

    const safeName = (name || "there").trim() || "there";
    const q = miaAgeQuestion(safeName);
    const alreadyAsked = chat.some((m) => m.from === "mia" && m.text.includes("How young are you?"));
    if (alreadyAsked) {
      askedAgeRef.current = true;
      return;
    }

    askedAgeRef.current = true;
    setMiaTyping(true);
    const t = setTimeout(() => {
      setMiaTyping(false);
      setChat((prev) => [...prev, { from: "mia", text: q }]);
      scrollToBottom();
    }, 650);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, name, storedAge]);

  // Age toast logic (screen 4)
  useEffect(() => {
    if (screen !== 4) return;
    setAge(ageValue);

    if (ageValue > 40) {
      toastApi.show("info", "We will focus on gentle tissue stimulation for you.", 3200);
      return;
    }
    if (ageValue < 30) {
      toastApi.show("success", "Your recovery potential is high!", 3200);
      return;
    }

    toastApi.hide();
  }, [ageValue, screen, setAge, toastApi]);

  // Screen actions
  const goTo = (n: number) => {
    toastApi.hide();
    setOnboardingStep(Math.max(1, Math.min(TOTAL_STEPS, n)));
  };

  /**
   * Makes name → age feel like ONE continuous chat:
   * - user submits name
   * - Mia "types"
   * - Mia asks age
   * - age picker appears (screen 4) WITHOUT changing the whole chat screen
   */
  const submitName = () => {
    const cleaned = inputName.trim();
    if (cleaned.length < 2) return;

    setName(cleaned);

    // add user's message
    setChat((prev) => [...prev, { from: "user", text: cleaned }]);
    scrollToBottom();

    // Mia types then asks age
    const q = miaAgeQuestion(cleaned);
    askedAgeRef.current = true;
    setMiaTyping(true);

    window.setTimeout(() => {
      setMiaTyping(false);
      setChat((prev) => {
        const exists = prev.some((m) => m.from === "mia" && m.text === q);
        return exists ? prev : [...prev, { from: "mia", text: q }];
      });
      scrollToBottom();

      // move to screen 4 to show age picker (same chat screen; no "new page" feeling)
      window.setTimeout(() => goTo(4), 180);
    }, 650);
  };

  const submitAge = () => {
    setAge(ageValue);
    const already = chat.some((m) => m.from === "user" && m.text === String(ageValue));
    if (!already) {
      setChat((prev) => [...prev, { from: "user", text: String(ageValue) }]);
      scrollToBottom();
    }
    toastApi.hide();
    setTimeout(() => goTo(5), 450);
  };

  if (!checkedPremium) return null;

  // Butterfly rules:
  // - Screen 1: normal butterflies
  // - Screens 2–11: butterflies dimmed behind content
  // - Screens 12–14: no butterflies
  const showButterfliesStrong = screen === 1;
  const showButterfliesSoft = screen >= 2 && screen <= 11;

  const showTopProgress = screen >= 2 && screen <= 11;

  return (
    <main className="min-h-screen clinical-noise relative overflow-hidden bg-[color:var(--navy)]">
      {showButterfliesStrong && <ButterflyBackground />}
      {showButterfliesSoft && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.22] blur-[0.6px]">
          <ButterflyBackground />
        </div>
      )}

      <Toast
        show={toastState.show}
        message={toastState.msg}
        tone={toastState.tone}
        onClose={() => toastApi.hide()}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {showTopProgress && <ProgressBar step={Math.min(TOTAL_STEPS, screen)} />}

        <AnimatePresence mode="wait">
          {/* Screen 1 */}
          {screen === 1 && (
            <motion.section
              key="welcome"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-between px-6 pt-10 pb-10"
            >
              <div className="w-full max-w-md flex flex-col items-center">
                <div className="mb-10">
                  <Logo />
                </div>

                <h1
                  className="text-center text-[34px] leading-[1.08] font-extrabold text-white drop-shadow-sm"
                  style={{ fontFamily: "var(--font-lora)" }}
                >
                  Heal Your Core Separation.
                  <br />
                  Without Surgery.
                </h1>

                <p className="text-center text-white/70 mt-4 text-[15px] leading-relaxed max-w-sm">
                  The only AI-driven protocol designed to close Diastasis Recti gaps of{" "}
                  <span className="text-white font-semibold">2+ fingers</span>.
                </p>

                <div className="w-full mt-10 rounded-3xl border border-white/15 bg-white/8 backdrop-blur-xl shadow-soft p-5">
                  <div className="flex flex-col gap-4">
                    <Benefit
                      icon={<Stethoscope className="text-white" size={22} />}
                      title="Medical-Grade Assessment"
                      sub="Clinical logic + immediate personalized flags."
                    />
                    <Benefit
                      icon={<Ban className="text-white" size={22} />}
                      title="No Crunches. No Surgery."
                      sub="We avoid moves that worsen pressure and bulging."
                    />
                    <Benefit
                      icon={<Sparkles className="text-white" size={22} />}
                      title="Visible Results in 12 Weeks"
                      sub="A real protocol, not a generic quiz."
                    />
                  </div>
                </div>

                <div className="mt-6 text-center text-white/55 text-xs font-semibold">
                  Designed for postpartum bodies • Evidence-informed • Gentle progressions
                </div>
              </div>

              <div className="w-full max-w-md">
                <button
                  onClick={() => goTo(2)}
                  className={[
                    "w-full h-14 rounded-full font-extrabold text-[17px]",
                    "bg-[color:var(--pink)] text-white shadow-[0_18px_50px_rgba(230,84,115,0.35)]",
                    "active:scale-[0.985] transition-transform",
                    "animate-breathe",
                  ].join(" ")}
                >
                  Start My Assessment
                </button>
              </div>
            </motion.section>
          )}

          {/* Screen 2 */}
          {screen === 2 && (
            <motion.section
              key="visual"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1 flex flex-col px-6 pt-8 pb-10"
            >
              <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1">
                {/* Back button removed */}

                <div className="mt-6">
                  <h1
                    className="text-[28px] leading-[1.12] font-extrabold text-white"
                    style={{ fontFamily: "var(--font-lora)" }}
                  >
                    Let’s analyze your core.
                    <br />
                    Which shape resembles yours the most?
                  </h1>
                  <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
                    Pick the closest match. This helps us start with the right protocol.
                  </p>
                </div>

                <div className="mt-7 flex flex-col gap-4">
                  <VisualCard
                    id="pooch"
                    title="Lower Belly “Pooch”"
                    subtitle="Bulge sits lower, especially by end of day."
                    selected={visualShape === "pooch"}
                    onSelect={() => {
                      setVisualShape("pooch");
                      toastApi.hide();
                    }}
                  />
                  <VisualCard
                    id="gap"
                    title="Visible Gap / Trench"
                    subtitle="A line or trench down the midline."
                    selected={visualShape === "gap"}
                    onSelect={() => {
                      setVisualShape("gap");
                      toastApi.hide();
                    }}
                  />
                  <VisualCard
                    id="cone"
                    title="Coning / Doming"
                    subtitle="Belly peaks like a tent when sitting up."
                    selected={visualShape === "cone"}
                    onSelect={() => {
                      setVisualShape("cone");
                      toastApi.show("warning", "Note: Coning indicates weak tissue tension. We will fix this.", 5200);
                    }}
                  />
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={() => goTo(3)}
                    disabled={!visualShape}
                    className={[
                      "w-full h-14 rounded-full font-extrabold text-[17px] transition-all",
                      visualShape
                        ? "bg-[color:var(--pink)] text-white shadow-[0_18px_50px_rgba(230,84,115,0.35)] active:scale-[0.985]"
                        : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed",
                    ].join(" ")}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* Screens 3–4 (ONE continuous chat screen) */}
          {(screen === 3 || screen === 4) && (
            <motion.section
              key="chat"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1 flex flex-col px-5 pt-6"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1">
                {/* Back button removed */}

                <div className="flex-1 min-h-0 mt-5 overflow-y-auto no-scrollbar pr-1">
                  {chat.map((m, idx) => (
                    <ChatBubble key={idx} from={m.from}>
                      {m.text}
                    </ChatBubble>
                  ))}
                  {miaTyping && <ChatBubble from="mia" typing />}
                  <div ref={chatBottomRef} className="h-2" />
                </div>

                <AnimatePresence mode="wait">
                  {/* Name input (screen 3) */}
                  {screen === 3 && (
                    <motion.div
                      key="nameBox"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 14 }}
                      transition={{ duration: 0.24 }}
                      className="mt-4 rounded-[28px] border border-white/12 bg-white/8 backdrop-blur-xl shadow-soft p-4"
                      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
                    >
                      <div className="text-white/60 text-xs font-semibold mb-2">Your name (for your medical file)</div>

                      <input
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitName()}
                        placeholder="Type your name..."
                        className={[
                          "w-full h-14 rounded-2xl px-4",
                          "bg-black/20 border border-white/10",
                          "text-white text-[18px] font-extrabold",
                          "placeholder:text-white/30",
                          "focus:outline-none focus:border-[color:var(--pink)]",
                        ].join(" ")}
                        autoFocus
                      />

                      <button
                        onClick={submitName}
                        disabled={inputName.trim().length < 2}
                        className={[
                          "mt-3 w-full rounded-full font-extrabold text-[16px] transition-all",
                          inputName.trim().length >= 2
                            ? "bg-[color:var(--pink)] text-white shadow-[0_18px_50px_rgba(230,84,115,0.35)] active:scale-[0.985]"
                            : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed",
                        ].join(" ")}
                        style={{ height: 52 }}
                      >
                        Continue
                      </button>
                    </motion.div>
                  )}

                  {/* Age picker (screen 4) */}
                  {screen === 4 && (
                    <motion.div
                      key="ageBox"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 14 }}
                      transition={{ duration: 0.24 }}
                      className="mt-4 bg-white rounded-t-[34px] shadow-[0_-16px_60px_rgba(0,0,0,0.35)] p-5 pb-6"
                      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 18px)" }}
                    >
                      <div className="text-center">
                        <div className="text-slate-900 font-extrabold text-[18px]">Select your age</div>
                        <div className="text-slate-500 text-[13px] font-semibold mt-1">
                          This helps Mia tailor tissue recovery pacing.
                        </div>
                      </div>

                      <WheelPicker min={18} max={70} value={ageValue} onChange={setAgeValue} />

                      <button
                        onClick={submitAge}
                        className="mt-4 w-full h-14 rounded-full bg-[color:var(--pink)] text-white font-extrabold text-[17px] shadow-[0_18px_50px_rgba(230,84,115,0.30)] active:scale-[0.985] transition-transform"
                      >
                        Next
                      </button>

                      <div className="mt-3 text-center text-slate-400 text-[11px] font-semibold">
                        Saved instantly • You can leave and resume anytime
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}

          {/* Screen 5 */}
          {screen === 5 && (
            <motion.section key="s5" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.38, ease: "easeOut" }} className="flex-1">
              <Step05FingerTest onBack={() => goTo(4)} onNext={() => goTo(6)} toast={toastApi} />
            </motion.section>
          )}

          {/* Screen 6 */}
          {screen === 6 && (
            <motion.section key="s6" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.38, ease: "easeOut" }} className="flex-1">
              <Step06TissueDepth onBack={() => goTo(5)} onNext={() => goTo(7)} toast={toastApi} />
            </motion.section>
          )}

          {/* Screen 7 */}
          {screen === 7 && (
            <motion.section key="s7" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.38, ease: "easeOut" }} className="flex-1">
              <Step07SabotageCheck onBack={() => goTo(6)} onNext={() => goTo(8)} toast={toastApi} />
            </motion.section>
          )}

          {/* Screen 8 */}
          {screen === 8 && (
            <motion.section key="s8" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.38, ease: "easeOut" }} className="flex-1">
              <Step08Symptoms onBack={() => goTo(7)} onNext={() => goTo(9)} toast={toastApi} />
            </motion.section>
          )}

          {/* Screen 9 */}
          {screen === 9 && (
            <motion.section key="s9" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.38, ease: "easeOut" }} className="flex-1">
              <Step09Timeline onBack={() => goTo(8)} onNext={() => goTo(10)} toast={toastApi} />
            </motion.section>
          )}

          {/* Screen 10 */}
          {screen === 10 && (
            <motion.section key="s10" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.38, ease: "easeOut" }} className="flex-1">
              <Step10Navel onBack={() => goTo(9)} onNext={() => goTo(11)} toast={toastApi} />
            </motion.section>
          )}

          {/* Screen 11 */}
          {screen === 11 && (
            <motion.section key="s11" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.38, ease: "easeOut" }} className="flex-1">
              <Step11Commitment onBack={() => goTo(10)} onNext={() => goTo(12)} toast={toastApi} />
            </motion.section>
          )}

          {/* Screen 12 */}
          {screen === 12 && (
            <motion.section
              key="s12"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1"
            >
              <Step12Analysis onDone={() => goTo(13)} />
            </motion.section>
          )}

          {/* Screen 13 */}
          {screen === 13 && (
            <motion.section key="s13" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.38, ease: "easeOut" }} className="flex-1">
              <Step13PlanReveal onBack={() => goTo(12)} onNext={() => goTo(14)} />
            </motion.section>
          )}

          {/* Screen 14 */}
          {screen === 14 && (
            <motion.section key="s14" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.38, ease: "easeOut" }} className="flex-1">
              <Step14Paywall />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
