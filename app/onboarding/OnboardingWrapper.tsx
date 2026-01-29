"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, Sparkles, Stethoscope, ChevronLeft, CheckCircle2 } from "lucide-react";

import ButterflyBackground from "@/components/ButterflyBackground";
import { Toast } from "@/components/Toast";
import { USER_STORAGE_KEY, useUserStore, VisualShape } from "@/lib/store/useUserStore";

import Step05FingerTest, { ToastAPI, ToastTone } from "@/components/onboarding/steps/Step05FingerTest";
import Step06TissueDepth from "@/components/onboarding/steps/Step06TissueDepth";
import Step07SabotageCheck from "@/components/onboarding/steps/Step07SabotageCheck";
import Step08Symptoms from "@/components/onboarding/steps/Step08Symptoms";
import Step09Timeline from "@/components/onboarding/steps/Step09Timeline";
import Step10Navel from "@/components/onboarding/steps/Step10Navel";
import Step11Commitment from "@/components/onboarding/steps/Step11Commitment";
import Step12Analysis from "@/components/onboarding/steps/Step12Analysis";
import Step13PlanReveal from "@/components/onboarding/steps/Step13PlanReveal";
import Step14Paywall from "@/components/onboarding/steps/Step14Paywall";

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

function ProgressBar({ step }: { step: number }) {
  const pct = Math.max(0, Math.min(100, (step / TOTAL_STEPS) * 100));
  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between text-white/55 text-xs font-extrabold">
        <span>Step {step} of {TOTAL_STEPS}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-white/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ShapeArt({ id }: { id: Exclude<VisualShape, null> }) {
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
            <div className={["text-[16px] font-extrabold leading-snug", selected ? "text-white" : "text-white/90"].join(" ")}>
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
  typing
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
            : "bg-white/10 border border-white/12 text-white rounded-2xl rounded-bl-none"
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
  onChange
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
                : "scale-90 text-slate-400 text-2xl"
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
    tone: "info"
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
      }
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
          router.replace("/dashboard");
          return;
        }
      }
    } catch {}
    setCheckedPremium(true);
  }, [router]);

  // Premium redirect (store)
  useEffect(() => {
    if (!checkedPremium) return;
    if (isPremium) router.replace("/dashboard");
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

  // Screen 4 hydration + ask age
  useEffect(() => {
    if (screen !== 4) return;
    setAgeValue(storedAge || 30);

    if (chat.length === 0) {
      const seeded: Array<{ from: "mia" | "user"; text: string }> = [
        { from: "mia", text: MIA_M1 },
        { from: "mia", text: MIA_M2 }
      ];
      if ((name || "").trim().length >= 2) seeded.push({ from: "user", text: name.trim() });
      setChat(seeded);
      scrollToBottom();
    }

    if (askedAgeRef.current) return;

    const q = miaAgeQuestion((name || "there").trim() || "there");
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

  const submitName = () => {
    const cleaned = inputName.trim();
    if (cleaned.length < 2) return;

    setName(cleaned);
    setChat((prev) => [...prev, { from: "user", text: cleaned }]);
    scrollToBottom();

    setTimeout(() => goTo(4), 450);
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

  return (
    <main className="min-h-screen clinical-noise relative overflow-hidden bg-[color:var(--navy)]">
      <ButterflyBackground />

      <Toast
        show={toastState.show}
        message={toastState.msg}
        tone={toastState.tone}
        onClose={() => toastApi.hide()}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <ProgressBar step={Math.min(TOTAL_STEPS, screen)} />

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
                    "animate-breathe"
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
                <button
                  onClick={() => goTo(1)}
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit"
                >
                  <ChevronLeft size={18} />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                <div className="mt-6">
                  <h1 className="text-[28px] leading-[1.12] font-extrabold text-white" style={{ fontFamily: "var(--font-lora)" }}>
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
                        : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed"
                    ].join(" ")}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* Screen 3 */}
          {screen === 3 && (
            <motion.section
              key="chat-name"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1 flex flex-col px-5 pt-6 pb-6"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
            >
              <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1">
                <button onClick={() => goTo(2)} className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit">
                  <ChevronLeft size={18} />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                <div className="flex-1 min-h-0 mt-5 overflow-y-auto no-scrollbar pr-1">
                  {chat.map((m, idx) => (
                    <ChatBubble key={idx} from={m.from}>{m.text}</ChatBubble>
                  ))}
                  {miaTyping && <ChatBubble from="mia" typing />}
                  <div ref={chatBottomRef} className="h-2" />
                </div>

                <div className="mt-4 rounded-[28px] border border-white/12 bg-white/8 backdrop-blur-xl shadow-soft p-4">
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
                      "focus:outline-none focus:border-[color:var(--pink)]"
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
                        : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed"
                    ].join(" ")}
                    style={{ height: 52 }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* Screen 4 */}
          {screen === 4 && (
            <motion.section
              key="chat-age"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1 flex flex-col px-5 pt-6"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="w-full max-w-md mx-auto flex flex-col min-h-0 flex-1">
                <button onClick={() => goTo(3)} className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit">
                  <ChevronLeft size={18} />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                <div className="flex-1 min-h-0 mt-5 overflow-y-auto no-scrollbar pr-1">
                  {chat.map((m, idx) => (
                    <ChatBubble key={idx} from={m.from}>{m.text}</ChatBubble>
                  ))}
                  {miaTyping && <ChatBubble from="mia" typing />}
                  <div ref={chatBottomRef} className="h-2" />
                </div>

                <div className="mt-4 bg-white rounded-t-[34px] shadow-[0_-16px_60px_rgba(0,0,0,0.35)] p-5 pb-6">
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
                </div>
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
