"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, Sparkles, Stethoscope, ChevronLeft, CheckCircle2 } from "lucide-react";

import ButterflyBackground from "@/components/ButterflyBackground";
import { Toast, ToastTone } from "@/components/Toast";
import { USER_STORAGE_KEY, useUserStore, VisualShape } from "@/lib/store/useUserStore";

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

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
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
              // hide image, leave the "M" fallback visible
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

  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    tone: ToastTone;
  }>({ show: false, msg: "", tone: "info" });

  // Chat (shared between Screen 3 and 4)
  const [chat, setChat] = useState<Array<{ from: "mia" | "user"; text: string }>>([]);
  const [miaTyping, setMiaTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Screen 3 local
  const [inputName, setInputName] = useState(name || "");

  // Screen 4 local (wheel)
  const [ageValue, setAgeValue] = useState<number>(storedAge || 30);

  // prevent duplicating the age-question on re-renders
  const askedAgeRef = useRef(false);

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

  const scrollToBottom = () => {
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  // ✅ Screen 3 init: if chat is empty, seed with Mia messages (and show typing for M2)
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

  // ✅ Screen 4: ensure chat is hydrated (important if user refreshes on step 4)
  useEffect(() => {
    if (screen !== 4) return;

    setAgeValue(storedAge || 30);

    // If chat is empty (refresh), rebuild a coherent history
    if (chat.length === 0) {
      const seeded: Array<{ from: "mia" | "user"; text: string }> = [
        { from: "mia", text: MIA_M1 },
        { from: "mia", text: MIA_M2 }
      ];
      if ((name || "").trim().length >= 2) seeded.push({ from: "user", text: name.trim() });
      setChat(seeded);
      scrollToBottom();
    }

    // Add Mia age question (once)
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

  // ✅ Age toast logic (Screen 4 only)
  useEffect(() => {
    if (screen !== 4) return;

    // persist immediately while scrolling (medical-grade: no “Next” needed)
    setAge(ageValue);

    if (ageValue > 40) {
      setToast({
        show: true,
        tone: "info", // blue feel
        msg: "We will focus on gentle tissue stimulation for you."
      });
      return;
    }

    if (ageValue < 30) {
      setToast({
        show: true,
        tone: "success", // green feel
        msg: "Your recovery potential is high!"
      });
      return;
    }

    setToast({ show: false, tone: "info", msg: "" });
  }, [ageValue, screen, setAge]);

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
      setToast({ show: false, tone: "info", msg: "" });
    }
  };

  const goToScreen3 = () => {
    setToast({ show: false, tone: "info", msg: "" });
    askedAgeRef.current = false;
    setOnboardingStep(3);
  };

  // --- Screen 3 actions
  const submitName = () => {
    const cleaned = inputName.trim();
    if (cleaned.length < 2) return;

    setName(cleaned);
    setChat((prev) => [...prev, { from: "user", text: cleaned }]);
    scrollToBottom();

    setTimeout(() => {
      setOnboardingStep(4);
    }, 450);
  };

  // --- Screen 4 actions
  const submitAge = () => {
    // already persisted continuously, but save again just in case
    setAge(ageValue);

    // add user reply to chat if it isn’t already there
    const already = chat.some((m) => m.from === "user" && m.text === String(ageValue));
    if (!already) {
      setChat((prev) => [...prev, { from: "user", text: String(ageValue) }]);
      scrollToBottom();
    }

    setToast({ show: false, tone: "info", msg: "" });

    setTimeout(() => {
      setOnboardingStep(5);
    }, 450);
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
        <div className="pt-6 px-6">
          <ProgressDots step={Math.min(5, screen)} />
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
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit"
                >
                  <ChevronLeft size={18} />
                  <span className="text-sm font-semibold">Back</span>
                </button>

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

          {/* ---------------- Screen 3: Chat (Name) ---------------- */}
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
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit"
                >
                  <ChevronLeft size={18} />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                <div className="flex-1 min-h-0 mt-5 overflow-y-auto no-scrollbar pr-1">
                  {chat.map((m, idx) => (
                    <ChatBubble key={idx} from={m.from}>
                      {m.text}
                    </ChatBubble>
                  ))}
                  {miaTyping && <ChatBubble from="mia" typing />}
                  <div ref={chatBottomRef} className="h-2" />
                </div>

                <div className="mt-4 rounded-[28px] border border-white/12 bg-white/8 backdrop-blur-xl shadow-soft p-4">
                  <div className="text-white/60 text-xs font-semibold mb-2">
                    Your name (for your medical file)
                  </div>

                  <input
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitName();
                    }}
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

          {/* ---------------- Screen 4: Chat (Age Wheel) ---------------- */}
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
                <button
                  onClick={() => setOnboardingStep(3)}
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit"
                >
                  <ChevronLeft size={18} />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                {/* chat history */}
                <div className="flex-1 min-h-0 mt-5 overflow-y-auto no-scrollbar pr-1">
                  {chat.map((m, idx) => (
                    <ChatBubble key={idx} from={m.from}>
                      {m.text}
                    </ChatBubble>
                  ))}
                  {miaTyping && <ChatBubble from="mia" typing />}
                  <div ref={chatBottomRef} className="h-2" />
                </div>

                {/* bottom clinical sheet */}
                <div className="mt-4 bg-white rounded-t-[34px] shadow-[0_-16px_60px_rgba(0,0,0,0.35)] p-5 pb-6">
                  <div className="text-center">
                    <div className="text-slate-900 font-extrabold text-[18px]">Select your age</div>
                    <div className="text-slate-500 text-[13px] font-semibold mt-1">
                      This helps Mia tailor tissue recovery pacing.
                    </div>
                  </div>

                  <WheelPicker
                    min={18}
                    max={70}
                    value={ageValue}
                    onChange={(v) => setAgeValue(v)}
                  />

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

          {/* ---------------- Screen 5: Placeholder (Finger Test next) ---------------- */}
          {screen === 5 && (
            <motion.section
              key="step5"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="flex-1 flex items-center justify-center px-6"
            >
              <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-soft text-center">
                <h2 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-lora)" }}>
                  Screen 5 is next: The Finger Test.
                </h2>
                <p className="text-white/70 mt-2">
                  Saved age: <span className="text-white font-semibold">{storedAge}</span>
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="w-full h-12 rounded-full bg-white/10 border border-white/15 text-white font-bold active:scale-[0.985] transition-transform"
                  >
                    Back to Age
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
