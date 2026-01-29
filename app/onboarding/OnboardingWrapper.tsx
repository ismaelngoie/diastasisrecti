"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, Sparkles, Stethoscope } from "lucide-react";

import ButterflyBackground from "@/components/ButterflyBackground";
import { Toast } from "@/components/Toast";
import { USER_STORAGE_KEY, useUserStore } from "@/lib/store/useUserStore";

function Logo() {
  // If you later add /public/logo.png it will automatically show.
  return (
    <div className="flex items-center justify-center">
      <img
        src="/logo.png"
        alt="Fix Diastasis"
        className="w-16 h-16 object-contain drop-shadow"
        onError={(e) => {
          // If no logo file exists, show a pretty fallback without crashing.
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="ml-3">
        <div className="text-white font-extrabold text-lg tracking-tight">
          Fix Diastasis
        </div>
        <div className="text-white/55 text-xs font-semibold tracking-wide uppercase">
          Clinical Assessment
        </div>
      </div>
    </div>
  );
}

export default function OnboardingWrapper() {
  const router = useRouter();

  const { isPremium, onboardingStep, setOnboardingStep } = useUserStore();

  const [checkedPremium, setCheckedPremium] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>(() => ({
    show: false,
    msg: ""
  }));

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

  const goNext = () => {
    setOnboardingStep(2);
    setToast({ show: true, msg: "Next screen is not built yet — this proves navigation works ✅" });
  };

  if (!checkedPremium) return null;

  return (
    <main className="min-h-screen clinical-noise relative overflow-hidden">
      <ButterflyBackground />

      <Toast
        show={toast.show}
        message={toast.msg}
        tone="info"
        onClose={() => setToast({ show: false, msg: "" })}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {screen === 1 && (
            <motion.section
              key="welcome"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-between px-6 pt-14 pb-10"
            >
              {/* Top */}
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

                {/* Benefits (Glassmorphism) */}
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

                {/* Trust badge */}
                <div className="mt-6 text-center text-white/55 text-xs font-semibold">
                  Designed for postpartum bodies • Evidence-informed • Gentle progressions
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="w-full max-w-md">
                <button
                  onClick={goNext}
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

                {/* Tiny dev helper (optional): click to simulate premium and see redirect */}
                <button
                  onClick={() => {
                    const raw = localStorage.getItem(USER_STORAGE_KEY);
                    const parsed = raw ? JSON.parse(raw) : { state: {} };
                    const next = {
                      ...parsed,
                      state: { ...(parsed.state || {}), isPremium: true }
                    };
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
                    router.replace("/dashboard");
                  }}
                  className="mt-6 w-full text-center text-white/30 text-[11px] underline decoration-white/15 hover:text-white/45 transition-colors"
                >
                  (Dev) Tap here to simulate Premium redirect
                </button>
              </div>
            </motion.section>
          )}

          {/* Placeholder for step 2 so nothing breaks */}
          {screen === 2 && (
            <motion.section
              key="placeholder"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1 flex items-center justify-center px-6"
            >
              <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-soft text-center">
                <h2 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-lora)" }}>
                  Screen 2 is next.
                </h2>
                <p className="text-white/70 mt-2">
                  You approved the welcome screen → then we build the next one.
                </p>
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="mt-6 w-full h-12 rounded-full bg-white/10 border border-white/15 text-white font-bold active:scale-[0.985] transition-transform"
                >
                  Back to Welcome
                </button>
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
