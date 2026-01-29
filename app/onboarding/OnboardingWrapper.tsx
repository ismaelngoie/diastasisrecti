"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, Sparkles, Stethoscope, ChevronLeft, CheckCircle2 } from "lucide-react";

import ButterflyBackground from "@/components/ButterflyBackground";
import { Toast, ToastTone } from "@/components/Toast";
import { USER_STORAGE_KEY, useUserStore, VisualShape } from "@/lib/store/useUserStore";

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

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={[
            "h-2 rounded-full transition-all",
            n === step ? "w-8 bg-white" : "w-2 bg-white/25"
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function ShapeArt({ id }: { id: Exclude<VisualShape, null> }) {
  // Clean, clinical “illustrations” made with simple shapes (no images needed).
  if (id === "pooch") {
    return (
      <svg viewBox="0 0 320 140" className="w-full h-full">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="1" stopColor="rgba(230,84,115,0.18)" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="300" height="120" rx="22" fill="url(#g1)" />
        <path
          d="M70 95c30-40 70-55 120-50 40 4 70 22 85 48"
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M92 98c28-22 58-30 90-26 28 3 50 14 66 28"
          fill="none"
          stroke="rgba(210,235,255,0.55)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (id === "gap") {
    return (
      <svg viewBox="0 0 320 140" className="w-full h-full">
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="1" stopColor="rgba(120,200,255,0.12)" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="300" height="120" rx="22" fill="url(#g2)" />
        <path
          d="M85 40c22-12 46-16 75-14 30 2 55 9 75 24"
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M160 34v84"
          stroke="rgba(230,84,115,0.70)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M160 34v84"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // cone
  return (
    <svg viewBox="0 0 320 140" className="w-full h-full">
      <defs>
        <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="1" stopColor="rgba(245,158,11,0.14)" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="300" height="120" rx="22" fill="url(#g3)" />
      <path
        d="M70 102c36-58 70-78 90-78s54 20 90 78"
        fill="none"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M160 28l0 0"
        stroke="rgba(245,158,11,0.0)"
        strokeWidth="1"
      />
      <path
        d="M140 70c10-16 18-24 20-24s10 8 20 24"
        fill="none"
        stroke="rgba(245,158,11,0.65)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VisualCard({
  id,
  title,
  subtitle,
  selected,
  onSelect
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
          : "border-white/12 hover:border-white/20"
      ].join(" ")}
      style={{ minHeight: 120 }}
    >
      <div className="p-5 flex gap-4 items-center">
        <div
          className={[
            "w-28 h-[72px] rounded-2xl overflow-hidden border",
            selected ? "border-white/20" : "border-white/10"
          ].join(" ")}
        >
          <ShapeArt id={id} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={[
                "text-[16px] font-extrabold leading-snug",
                selected ? "text-white" : "text-white/90"
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

export default function OnboardingWrapper() {
  const router = useRouter();

  const { isPremium, onboardingStep, setOnboardingStep } = useUserStore();
  const visualShape = useUserStore((s) => s.visualShape);
  const setVisualShape = useUserStore((s) => s.setVisualShape);

  const [checkedPremium, setCheckedPremium] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    tone: ToastTone;
  }>({ show: false, msg: "", tone: "info" });

  // 🚀 Instant premium redirect (fast path: localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.isPremium === true) {
          router.replace("/dashboard");
          return;
        }
      }
    } catch {
      // ignore
    } finally {
      setCheckedPremium(true);
    }
  }, [router]);

  // Fallback premium redirect (zustand state)
  useEffect(() => {
    if (!checkedPremium) return;
    if (isPremium) router.replace("/dashboard");
  }, [checkedPremium, isPremium, router]);

  const screen = useMemo(() => onboardingStep, [onboardingStep]);

  // --- Screen 1 actions
  const goToScreen2 = () => setOnboardingStep(2);

  // --- Screen 2 actions
  const onPickShape = (shape: Exclude<VisualShape, null>) => {
    setVisualShape(shape);

    if (shape === "cone") {
      setToast({
        show: true,
        tone: "warning",
        msg: "Note: Coning indicates weak tissue tension. We will fix this."
      });
    } else {
      // Hide warning if they switch away
      setToast({ show: false, tone: "info", msg: "" });
    }
  };

  const goToScreen3 = () => {
    setToast({ show: false, tone: "info", msg: "" });
    setOnboardingStep(3);
  };

  if (!checkedPremium) return null;

  return (
    <main className="min-h-screen clinical-noise relative overflow-hidden">
      <ButterflyBackground />

      <Toast
        show={toast.show}
        message={toast.msg}
        tone={toast.tone}
        onClose={() => setToast({ show: false, msg: "", tone: "info" })}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* top progress */}
        <div className="pt-6 px-6">
          <ProgressDots step={Math.min(3, screen)} />
        </div>

        <AnimatePresence mode="wait">
          {/* ---------------- Screen 1: Welcome ---------------- */}
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
                  onClick={goToScreen2}
                  className={[
                    "w-full h-14 rounded-full font-extrabold text-[17px]",
                    "bg-[color:var(--pink)] text-white shadow-[0_18px_50px_rgba(230,84,115,0.35)]",
                    "active:scale-[0.985] transition-transform",
                    "animate-breathe"
                  ].join(" ")}
                >
                  Start My Assessment
                </button>

                <div className="mt-4 text-center text-white/45 text-xs">
                  We save your answers instantly. If you leave, you can resume.
                </div>
              </div>
            </motion.section>
          )}

          {/* ---------------- Screen 2: Visual Identification ---------------- */}
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
                {/* Back */}
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit"
                >
                  <ChevronLeft size={18} />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                {/* Header */}
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

                {/* Options */}
                <div className="mt-7 flex flex-col gap-4">
                  <VisualCard
                    id="pooch"
                    title="Lower Belly “Pooch”"
                    subtitle="Bulge sits lower, especially by end of day."
                    selected={visualShape === "pooch"}
                    onSelect={() => onPickShape("pooch")}
                  />
                  <VisualCard
                    id="gap"
                    title="Visible Gap / Trench"
                    subtitle="A line or trench down the midline."
                    selected={visualShape === "gap"}
                    onSelect={() => onPickShape("gap")}
                  />
                  <VisualCard
                    id="cone"
                    title="Coning / Doming"
                    subtitle="Belly peaks like a tent when sitting up."
                    selected={visualShape === "cone"}
                    onSelect={() => onPickShape("cone")}
                  />
                </div>

                {/* CTA */}
                <div className="mt-auto pt-8">
                  <button
                    onClick={goToScreen3}
                    disabled={!visualShape}
                    className={[
                      "w-full h-14 rounded-full font-extrabold text-[17px] transition-all",
                      visualShape
                        ? "bg-[color:var(--pink)] text-white shadow-[0_18px_50px_rgba(230,84,115,0.35)] active:scale-[0.985]"
                        : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed"
                    ].join(" ")}
                  >
                    Continue
                  </button>

                  <div className="mt-4 text-center text-white/40 text-xs">
                    Touch targets are big on purpose (easy on mobile).
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ---------------- Screen 3 placeholder ---------------- */}
          {screen === 3 && (
            <motion.section
              key="step3"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1 flex items-center justify-center px-6"
            >
              <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-soft text-center">
                <h2 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-lora)" }}>
                  Screen 3 is next: Coach Mia chat.
                </h2>
                <p className="text-white/70 mt-2">
                  Your visual selection is saved instantly:{" "}
                  <span className="text-white font-semibold">{visualShape ?? "none"}</span>
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="w-full h-12 rounded-full bg-white/10 border border-white/15 text-white font-bold active:scale-[0.985] transition-transform"
                  >
                    Back to Visual Screen
                  </button>

                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="w-full h-12 rounded-full bg-white/5 border border-white/10 text-white/80 font-bold active:scale-[0.985] transition-transform"
                  >
                    Back to Welcome
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Benefit({
  icon,
  title,
  sub
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
