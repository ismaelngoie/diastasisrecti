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
  Timer,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
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
import ButterflyBackground from "@/components/ButterflyBackground";
import { Toast } from "@/components/Toast";
import {
  USER_STORAGE_KEY,
  useUserStore,
  useUserData,
  VisualShape,
  FingerGap,
  TissueDepth,
  PostpartumTimeline,
  NavelAssessment,
  Commitment,
} from "@/lib/store/useUserStore";

// ==========================================
// SHARED TYPES
// ==========================================
export type ToastTone = "success" | "info" | "warning" | "danger";
export type ToastAPI = {
  show: (tone: ToastTone, message: string, ms?: number) => void;
  hide: () => void;
};

// ==========================================
// HELPER COMPONENTS
// ==========================================

function Logo() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <img
        src="/logoo.png"
        alt="Fix Diastasis Recti"
        className="w-16 h-16 object-contain drop-shadow mb-3"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="text-white/55 text-xs font-semibold tracking-wide uppercase leading-none mb-2">
        CORE ASSESSMENT
      </div>
      <div className="text-white font-extrabold text-lg tracking-tight leading-none">
        Fix Diastasis Recti
      </div>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (step / total) * 100));
  return (
    <div className="w-full px-6 h-full flex items-center">
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/80 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// --- VISUALS (Defs, ShapeArt, VisualCard) ---
const Defs = ({ p }: { p: string }) => (
  <defs>
    <radialGradient id={`${p}-body-vol`} cx="50%" cy="40%" r="90%">
      <stop offset="0%" stopColor="#334155" stopOpacity="1" />
      <stop offset="40%" stopColor="#1e293b" stopOpacity="1" />
      <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
    </radialGradient>
    <radialGradient id={`${p}-warmth`} cx="50%" cy="50%" r="60%">
      <stop offset="0%" stopColor="#E65473" stopOpacity="0.15" />
      <stop offset="100%" stopColor="#E65473" stopOpacity="0" />
    </radialGradient>
    <linearGradient id={`${p}-skin-sheen`} x1="0" y1="0" x2="1" y2="0.5">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
      <stop offset="50%" stopColor="#fff" stopOpacity="0" />
      <stop offset="100%" stopColor="#fff" stopOpacity="0.05" />
    </linearGradient>
    <radialGradient id={`${p}-navel-shadow`} cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
    </radialGradient>
    <linearGradient id={`${p}-topo`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#78C8FF" stopOpacity="0" />
      <stop offset="50%" stopColor="#78C8FF" stopOpacity="0.4" />
      <stop offset="100%" stopColor="#78C8FF" stopOpacity="0" />
    </linearGradient>
    <filter id={`${p}-glow`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id={`${p}-tissue`} x="0%" y="0%" width="100%" height="100%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.85"
        numOctaves="3"
        result="noise"
      />
      <feColorMatrix
        type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0"
        in="noise"
        result="coloredNoise"
      />
      <feComposite
        operator="in"
        in="coloredNoise"
        in2="SourceGraphic"
        result="composite"
      />
      <feBlend mode="overlay" in="composite" in2="SourceGraphic" />
    </filter>
    <linearGradient id={`${p}-pooch-grad`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
      <stop offset="1" stopColor="rgba(230,84,115,0.4)" />
    </linearGradient>
    <linearGradient id={`${p}-gap-grad`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
      <stop offset="1" stopColor="rgba(120,200,255,0.4)" />
    </linearGradient>
    <linearGradient id={`${p}-cone-grad`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
      <stop offset="1" stopColor="rgba(245,158,11,0.4)" />
    </linearGradient>
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
  const p = `md-${uid.replace(/:/g, "")}`;
  const torsoPath = `M 70 60 C 70 60, 80 50, 100 50 C 120 50, 130 60, 130 60 C 138 75, 132 90, 128 100 C 124 110, 134 130, 142 145 C 146 155, 140 170, 130 180 C 120 190, 80 190, 70 180 C 60 170, 54 155, 58 145 C 66 130, 76 110, 72 100 C 68 90, 62 75, 70 60 Z`;
  const topoLines = [
    "M 74 80 Q 100 95 126 80",
    "M 72 100 Q 100 115 128 100",
    "M 64 130 Q 100 155 136 130",
    "M 70 160 Q 100 175 130 160",
  ];
  const navelX = 100;
  const navelY = 120;
  const callouts = {
    pooch: { x: 100, y: 145, label: "Lower Abdomen", lx: 155, ly: 145 },
    gap: { x: 100, y: 100, label: "Linea Alba", lx: 155, ly: 100 },
    cone: { x: 100, y: 80, label: "Upper Core", lx: 155, ly: 70 },
  };
  const c = id ? callouts[id] : null;

  return (
    <div className="w-full h-full bg-[#1A1A26] relative overflow-hidden">
      <svg
        viewBox="40 40 120 160"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs p={p} />
        <circle
          cx="100"
          cy="50"
          r="120"
          fill={`url(#${p}-warmth)`}
          opacity="0.15"
        />
        <g>
          <path d={torsoPath} fill={`url(#${p}-body-vol)`} />
          <path
            d={torsoPath}
            fill={`url(#${p}-warmth)`}
            style={{ mixBlendMode: "screen" }}
          />
          <path
            d={torsoPath}
            fill="transparent"
            filter={`url(#${p}-tissue)`}
            opacity="0.8"
          />
          <g
            opacity="0.3"
            stroke={`url(#${p}-topo)`}
            strokeWidth="1"
            fill="none"
          >
            {topoLines.map((d, i) => (
              <path key={i} d={d} strokeLinecap="round" />
            ))}
            <path d="M 100 60 Q 98 100 100 120 Q 102 140 100 175" />
          </g>
          <g opacity="0.7">
            <ellipse
              cx={navelX}
              cy={navelY}
              rx="3"
              ry="1.5"
              fill={`url(#${p}-navel-shadow)`}
            />
            <path
              d={`M ${navelX - 2} ${navelY + 0.5} Q ${navelX} ${
                navelY + 2
              } ${navelX + 2} ${navelY + 0.5}`}
              stroke="#fff"
              strokeWidth="0.8"
              opacity="0.5"
              fill="none"
            />
          </g>
          <path
            d={torsoPath}
            stroke="white"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
          />
          <path
            d={torsoPath}
            fill="none"
            stroke={`url(#${p}-skin-sheen)`}
            strokeWidth="2.5"
            opacity="0.6"
            style={{ mixBlendMode: "overlay" }}
          />
        </g>
        {id === "pooch" && (
          <g filter={`url(#${p}-glow)`}>
            <path
              d="M 75 135 Q 100 165 125 135 L 120 155 Q 100 175 80 155 Z"
              fill={`url(#${p}-pooch-grad)`}
              style={{ mixBlendMode: "screen" }}
            />
            <path
              d="M 75 135 Q 100 165 125 135"
              stroke="#E65473"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="1"
            />
            <circle cx="100" cy="150" r="2" fill="#fff" />
            <circle
              cx="100"
              cy="150"
              r="10"
              stroke="#E65473"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              opacity="0.7"
            />
          </g>
        )}
        {id === "gap" && (
          <g filter={`url(#${p}-glow)`}>
            <path
              d="M 96 80 Q 94 100 96 115"
              stroke="#78C8FF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="1"
            />
            <path
              d="M 104 80 Q 106 100 104 115"
              stroke="#78C8FF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="1"
            />
            <rect
              x="98"
              y="80"
              width="4"
              height="35"
              fill={`url(#${p}-gap-grad)`}
              opacity="0.6"
            />
            <path d="M 90 95 L 96 95" stroke="#fff" strokeWidth="1.2" />
            <path d="M 104 95 L 110 95" stroke="#fff" strokeWidth="1.2" />
          </g>
        )}
        {id === "cone" && (
          <g filter={`url(#${p}-glow)`}>
            <path
              d="M 100 120 L 80 70 L 120 70 Z"
              fill={`url(#${p}-cone-grad)`}
              style={{ mixBlendMode: "screen" }}
            />
            <path
              d="M 80 70 L 120 70"
              stroke="#F59E0B"
              strokeWidth="1.5"
              opacity="1"
            />
            <path
              d="M 100 120 L 80 70"
              stroke="#F59E0B"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <path
              d="M 100 120 L 120 70"
              stroke="#F59E0B"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
          </g>
        )}
        {c && showLabels && (
          <g>
            <line
              x1={c.x}
              y1={c.y}
              x2={c.lx - 5}
              y2={c.ly}
              stroke="white"
              strokeWidth="1.2"
              opacity="0.6"
            />
            <circle cx={c.x} cy={c.y} r="2.5" fill="white" />
            <g transform={`translate(${c.lx}, ${c.ly - 7})`}>
              <rect
                width="80"
                height="16"
                rx="4"
                fill="#0f172a"
                fillOpacity="0.8"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="0.8"
              />
              <text
                x="40"
                y="11"
                textAnchor="middle"
                fontSize="9"
                fill="white"
                fontFamily="monospace"
                letterSpacing="0.5"
                fontWeight="bold"
              >
                {c.label.toUpperCase()}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
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
            {selected && (
              <CheckCircle2 size={18} className="text-[color:var(--pink)]" />
            )}
          </div>
          <div className="text-[13px] text-white/60 leading-snug mt-1">
            {subtitle}
          </div>
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
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-white/10 shrink-0 mr-3 mt-auto relative flex items-center justify-center">
          <span className="text-white/80 font-extrabold text-sm select-none">
            M
          </span>
          <img
            src="/CoachMiaAvatar.png"
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
    </motion.div>
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
  const range = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max]
  );
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const ITEM_HEIGHT = 54;

  useEffect(() => {
    if (!scrollerRef.current) return;
    const idx = range.indexOf(value);
    if (idx >= 0) {
      scrollerRef.current.scrollTo({
        top: idx * ITEM_HEIGHT,
        behavior: "auto",
      });
    }
  }, [range, value]);

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
        className="h-full w-full overflow-y-scroll overscroll-contain snap-y snap-mandatory no-scrollbar py-[83px]"
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
            <span className="text-sm ml-2 mt-1 font-semibold text-slate-400/80">
              years
            </span>
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
        <div className="text-white font-extrabold text-[15px] leading-snug">
          {title}
        </div>
        <div className="text-white/60 text-[13px] leading-snug mt-0.5">
          {sub}
        </div>
      </div>
    </div>
  );
}

// --- Steps 5-13 COMPONENTS ---

const step05Options: Array<{
  gap: Exclude<FingerGap, null>;
  title: string;
  sub: string;
  tone: ToastTone;
  toast: string;
}> = [
  {
    gap: 1,
    title: "1 finger width",
    sub: "Within normal range",
    tone: "success",
    toast: "Good. We’ll focus on core control and long-term support.",
  },
  {
    gap: 2,
    title: "2 finger widths",
    sub: "Mild separation",
    tone: "info",
    toast: "Very common — highly treatable in 8 weeks.",
  },
  {
    gap: 3,
    title: "3 finger widths",
    sub: "Moderate separation",
    tone: "warning",
    toast: "Noted. We’ll use a pressure-safe plan (no crunches) to reduce doming.",
  },
  {
    gap: 4,
    title: "4+ finger widths",
    sub: "Wider separation",
    tone: "danger",
    toast: "We’ll start gently and progress slowly to protect the linea alba.",
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
            selected
              ? "border-white/20 bg-white/10"
              : "border-white/10 bg-black/10",
          ].join(" ")}
        >
          <Hand className="text-white" size={22} />
        </div>
        <div className="flex-1">
          <div className="text-white font-extrabold text-[18px] leading-tight">
            {title}
          </div>
          <div className="text-white/60 font-semibold text-[13px] mt-1">
            {sub}
          </div>
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
    <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0 px-6 pt-4 pb-6">
      <div className="mt-2 shrink-0">
        <h1
          className="text-white font-extrabold text-[30px] leading-[1.08]"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Finger-width check.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          Lie on your back with knees bent. Place fingers just above your belly button and gently lift your head.
          How many finger widths fit in the gap?
        </p>
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
        <div className="grid grid-cols-1 gap-4 pb-4">
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
      </div>

      <div className="mt-auto pt-4 shrink-0">
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

const step06Opts: Array<{
  id: Exclude<TissueDepth, null>;
  title: string;
  sub: string;
  icon: React.ReactNode;
}> = [
  {
    id: "firm",
    title: "Firm",
    sub: "Resists pressure when you press in.",
    icon: <Activity className="text-white" size={22} />,
  },
  {
    id: "soft",
    title: "Soft",
    sub: "Fingers sink in easily.",
    icon: <Waves className="text-white" size={22} />,
  },
  {
    id: "pulse",
    title: "Pulse",
    sub: "You feel a heartbeat/pulse under your fingers.",
    icon: <ShieldAlert className="text-white" size={22} />,
  },
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
          <div className="text-white font-extrabold text-[18px] leading-tight">
            {title}
          </div>
          <div className="text-white/60 font-semibold text-[13px] mt-1">
            {sub}
          </div>
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
      toast.show(
        "info",
        "Noted. We’ll prioritize improving linea alba tension and pressure control.",
        4200
      );
    } else {
      setHighRisk(false);
      toast.hide();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0 px-6 pt-4 pb-6">
      <div className="mt-2 shrink-0">
        <h1
          className="text-white font-extrabold text-[30px] leading-[1.08]"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          {name}, depth matters too.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          When you press into the midline gap, what do you feel?
        </p>
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
        <div className="flex flex-col gap-4 pb-4">
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
      </div>

      <div className="mt-auto pt-4 shrink-0">
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

const step07Options = [
  { id: "crunches", label: "Crunches / Sit-ups", redFlag: true },
  { id: "planks", label: "Planks / Push-ups", redFlag: true },
  { id: "running", label: "Running / Jumping", redFlag: false },
  { id: "nothing", label: "None of these", redFlag: false },
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
        "w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300 active:scale-[0.99] min-h-[56px]",
        selected
          ? "border-[color:var(--pink)] bg-white/12 shadow-[0_0_0_5px_rgba(230,84,115,0.10)]"
          : "border-white/12 bg-white/8 hover:border-white/20",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-white font-extrabold text-[15px] truncate">
            {label}
          </div>
          {redFlag && (
            <div className="text-white/55 text-[12px] font-semibold mt-1">
              Often increases abdominal pressure and doming.
            </div>
          )}
        </div>
        {selected ? (
          <CheckCircle2 className="text-[color:var(--pink)]" />
        ) : (
          <div className="w-6 h-6 rounded-full border border-white/15" />
        )}
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

    if (next.includes("crunches") || next.includes("planks")) {
      setFlash(true);
      setTimeout(() => setFlash(false), 220);
      setShowStop(true);
      toast.show(
        "danger",
        "Pause these for now. They often increase intra-abdominal pressure and can worsen doming. We’ll remove them from your plan.",
        5200
      );
    } else {
      toast.hide();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0 px-6 pt-4 pb-6 relative">
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

      <div className="mt-2 shrink-0">
        <h1
          className="text-white font-extrabold text-[30px] leading-[1.08]"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Let’s avoid pressure triggers, {name}.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          Which of these have you done recently? (Select all that apply)
        </p>
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
        <div className="grid grid-cols-1 gap-3 pb-4">
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
      </div>

      <div className="mt-auto pt-4 shrink-0">
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
                  <div className="text-white font-extrabold text-[18px] leading-tight">
                    Pause these movements.
                  </div>
                  <div className="text-white/70 text-[13px] font-semibold mt-1 leading-relaxed">
                    These can increase intra-abdominal pressure and make doming worse.
                    We are marking them as{" "}
                    <span className="text-white font-extrabold">NOT RECOMMENDED</span>{" "}
                    in your plan right now.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowStop(false)}
                className="mt-5 w-full h-12 rounded-full bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_50px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform"
              >
                OK — Use safer options
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const step08Options = [
  {
    id: "backPain",
    label: "Lower back pain",
    icon: <PersonStanding className="text-white" size={20} />,
  },
  {
    id: "incontinence",
    label: "Leakage with cough/sneeze",
    icon: <Droplets className="text-white" size={20} />,
  },
  {
    id: "bloating",
    label: "Abdominal bloating / protrusion",
    icon: <Waves className="text-white" size={20} />,
  },
  {
    id: "pelvicPain",
    label: "Pelvic or hip pain",
    icon: <HeartPulse className="text-white" size={20} />,
  },
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
        "w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300 active:scale-[0.99] min-h-[56px]",
        selected
          ? "border-[color:var(--pink)] bg-white/12 shadow-[0_0_0_5px_rgba(230,84,115,0.10)]"
          : "border-white/12 bg-white/8 hover:border-white/20",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl border border-white/12 bg-white/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 text-white font-extrabold text-[15px]">
          {label}
        </div>
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

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    setSelected(next);
    setSymptoms(next);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0 px-6 pt-4 pb-6">
      <div className="mt-2 shrink-0">
        <h1
          className="text-white font-extrabold text-[30px] leading-[1.08]"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Diastasis recti can affect more than your abdomen.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          Do you notice any of these symptoms?
        </p>
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
        <div className="flex flex-col gap-3 pb-4">
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
      </div>

      <div className="mt-auto pt-4 shrink-0">
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

const step09Options: Array<{ id: Exclude<PostpartumTimeline, null>; label: string }> =
  [
    { id: "pregnant", label: "Currently pregnant" },
    { id: "0-6", label: "0–6 months ago" },
    { id: "6-12", label: "6–12 months ago" },
    { id: "1-3", label: "1–3 years ago" },
    { id: "3+", label: "3+ years ago" },
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
    <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0 px-6 pt-4 pb-6">
      <div className="mt-2 shrink-0">
        <h1
          className="text-white font-extrabold text-[30px] leading-[1.08]"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          When was your most recent pregnancy?
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          This helps us set the safest progression pace.
        </p>
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
        <div className="flex flex-col gap-3 pb-4">
          {step09Options.map((o) => (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              className={[
                "w-full rounded-2xl border px-5 py-4 text-left transition-all duration-300 active:scale-[0.99] min-h-[56px]",
                selected === o.id
                  ? "border-[color:var(--pink)] bg-white/12 shadow-[0_0_0_5px_rgba(230,84,115,0.10)]"
                  : "border-white/12 bg-white/8 hover:border-white/20",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-white font-extrabold text-[15px]">
                  {o.label}
                </div>
                {selected === o.id ? (
                  <CheckCircle2 className="text-[color:var(--pink)]" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-white/15" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 shrink-0">
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

const step10Options: Array<{
  id: Exclude<NavelAssessment, null>;
  label: string;
  note?: string;
}> = [
  { id: "outie", label: "It protrudes (outie)." },
  { id: "flat", label: "It flattens or changes shape when I tense." },
  { id: "no_change", label: "No change." },
  {
    id: "hernia",
    label: "Diagnosed umbilical hernia",
    note: "We’ll keep your plan hernia-safe.",
  },
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
      toast.show(
        "warning",
        "Hernia noted. We will remove high-pressure movements to keep you safe.",
        5200
      );
    } else {
      setHerniaSafe(false);
      toast.hide();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0 px-6 pt-4 pb-6">
      <div className="mt-2 shrink-0">
        <h1
          className="text-white font-extrabold text-[30px] leading-[1.08]"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Any change in your belly button?
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          This can help identify pressure patterns and hernia risk.
        </p>
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
        <div className="flex flex-col gap-3 pb-4">
          {step10Options.map((o) => (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              className={[
                "w-full rounded-2xl border px-5 py-4 text-left transition-all duration-300 active:scale-[0.99] min-h-[56px]",
                selected === o.id
                  ? "border-[color:var(--pink)] bg-white/12 shadow-[0_0_0_5px_rgba(230,84,115,0.10)]"
                  : "border-white/12 bg-white/8 hover:border-white/20",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white font-extrabold text-[15px]">
                    {o.label}
                  </div>
                  {o.note && (
                    <div className="mt-1 text-white/60 text-[12px] font-semibold flex items-center gap-2">
                      <Shield size={14} className="text-white/60" />
                      {o.note}
                    </div>
                  )}
                </div>
                {selected === o.id ? (
                  <CheckCircle2 className="text-[color:var(--pink)] mt-0.5" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-white/15 mt-0.5" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 shrink-0">
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

const step11Options: Array<{
  id: Exclude<Commitment, null>;
  label: string;
  badge?: string;
}> = [
  { id: "5-7", label: "5–7 minutes", badge: "Most common • Clinician recommended" },
  { id: "15", label: "15 minutes" },
  { id: "30", label: "30 minutes" },
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

  useEffect(() => {
    if (!stored) {
      setSelected("5-7");
      setCommitment("5-7");
    }
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
    <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0 px-6 pt-4 pb-6">
      <div className="mt-2 shrink-0">
        <h1
          className="text-white font-extrabold text-[30px] leading-[1.08]"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Healing tissue takes consistency, not intensity.
        </h1>
        <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
          How much time can you do each day?
        </p>
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
        <div className="flex flex-col gap-3 pb-4">
          {step11Options.map((o) => (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              className={[
                "w-full rounded-2xl border px-5 py-4 text-left transition-all duration-300 active:scale-[0.99] min-h-[56px]",
                selected === o.id
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
                  {o.badge && (
                    <div className="mt-1 text-[12px] font-extrabold text-[#33B373]">
                      {o.badge}
                    </div>
                  )}
                </div>
                {selected === o.id ? (
                  <CheckCircle2 className="text-[color:var(--pink)] mt-0.5" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-white/15 mt-0.5" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 shrink-0">
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
      `Reviewing your assessment, ${name}...`,
      "Estimating safe tissue-loading pace...",
      "Checking for pressure-trigger movements...",
    ];
    if ((sabotage || []).includes("crunches"))
      base.push("Removing sit-ups/crunch patterns for now...");
    if ((sabotage || []).includes("planks"))
      base.push("Reducing high-pressure core holds for now...");
    base.push("Building a 12-week pressure-safe plan...");
    base.push("Plan ready.");
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
    <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
      <div className="mb-10">
        <AICoreView />
      </div>
      <div className="max-w-md">
        <div className="text-white/60 text-xs font-extrabold tracking-widest uppercase mb-3">
          Clinical-style analysis
        </div>
        <h1
          className="text-3xl font-extrabold text-white leading-tight"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Building your plan…
        </h1>
        <div className="mt-6 text-[15px] font-semibold text-white/85 leading-relaxed min-h-[56px]">
          <Typewriter text={lines[idx]} />
        </div>
        <div className="mt-8 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[color:var(--pink)] transition-all duration-300"
            style={{
              width: `${Math.min(100, ((idx + 1) / lines.length) * 100)}%`,
            }}
          />
        </div>
        <div className="mt-3 text-[12px] text-white/55 font-semibold">
          Cross-referencing 10,000+ clinical cases for accuracy...
        </div>
      </div>
    </div>
  );
}

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
        <text
          x="14"
          y="140"
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="11"
        >
          Today
        </text>
        <circle cx="180" cy="74" r="6" fill="#F59E0B" stroke="white" strokeWidth="2" />
        <text
          x="180"
          y="56"
          textAnchor="middle"
          fill="rgba(255,255,255,0.85)"
          fontSize="11"
          fontWeight="700"
        >
          ~6 Weeks
        </text>
        <circle cx="326" cy="28" r="7" fill="#33B373" stroke="white" strokeWidth="2" />
        <text
          x="312"
          y="16"
          textAnchor="end"
          fill="#33B373"
          fontSize="12"
          fontWeight="800"
        >
          ~12 Weeks
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
  const gapLabel = fingerGap === 4 ? "4+ finger-width gap" : `${fingerGap ?? "?"} finger-width gap`;

  const insights = useMemo(() => {
    const list: string[] = [];
    list.push(`Based on your age (${age}), we focus on collagen production.`);
    if ((sabotage || []).includes("planks")) list.push("Planks are removed for now to reduce pressure and protect your back.");
    if ((sabotage || []).includes("crunches")) list.push("Crunches/sit-ups are removed for now to reduce doming and pressure.");
    list.push(
      `Your daily commitment: ${
        commitment === "5-7" ? "5–7 minutes" : commitment === "15" ? "15 minutes" : "30 minutes"
      }.`
    );
    return list;
  }, [age, commitment, sabotage]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0 px-6 pt-4 pb-6">
      <div className="mt-2 text-center shrink-0">
        <h1
          className="text-white font-extrabold text-[30px] leading-[1.08]"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          {name}, your diastasis recti plan is ready.
        </h1>
        <p className="text-white/70 mt-3 text-[14px] leading-relaxed">
          This is your predicted closure timeline based on your assessment.
        </p>
      </div>

      <div className="mt-4 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
        <div className="rounded-3xl border border-white/12 bg-white/8 backdrop-blur-xl shadow-soft p-5">
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
      </div>

      <div className="mt-auto pt-4 shrink-0">
        <button
          onClick={onNext}
          className="w-full h-14 rounded-full bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B] text-white font-extrabold text-[17px] shadow-[0_0_30px_rgba(230,84,115,0.45)] active:scale-[0.985] transition-transform"
        >
          Unlock My Diastasis Recti Plan
        </button>
      </div>
    </div>
  );
}

// --- Step 14: Paywall ---

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const REVIEW_IMAGES = ["/review9.png", "/review1.png", "/review5.png", "/review4.png", "/review2.png"];
const REVIEWS = [
  { name: "Sarah W.", text: "I closed my 3-finger gap in 9 weeks. No surgery.", image: "/review9.png" },
  { name: "Michelle T.", text: "The 'coning' stopped after 12 days. Finally safe.", image: "/review1.png" },
  { name: "Chloe N.", text: "My back pain vanished when my core reconnected.", image: "/review5.png" },
  { name: "Olivia G.", text: "Better than my $150 physio visits. Truly.", image: "/review4.png" },
  { name: "Jess P.", text: "I can lift my baby without fear now.", image: "/review2.png" },
];
const DASHBOARD_PATH = "/dashboard?plan=monthly";

const CheckoutForm = ({ onClose, dateString }: { onClose: () => void; dateString: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { setPremium, setJoinDate } = useUserData();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    setMessage(null);

    const returnUrl = `${window.location.origin}${DASHBOARD_PATH}`;
    
    // We use "if_required" so the code continues here if no redirect is needed
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { 
        return_url: returnUrl,
        receipt_email: email 
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Payment failed");
      setIsLoading(false);
      return;
    }

    // FIX FOR PINNING: Subscriptions return 'processing' or 'succeeded'
    if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
      setPremium(true);
      setJoinDate(new Date().toISOString());
      
      const symptoms = useUserData.getState().symptoms || [];
      if (symptoms.includes("incontinence")) {
        useUserData.getState().startDrySeal();
      }
      
      router.push(DASHBOARD_PATH);
      return;
    }

    // Default fallback
    setMessage("Payment processing...");
    setIsLoading(false);
  };

  const getStripeSubtext = () => {
    if (!dateString) return "";
    return `Feel real progress by ${dateString}. If not, one tap full $24.99 refund.`;
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
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
        <h3
          className="text-lg font-extrabold text-white mb-1 leading-tight"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Join 10,243+ women fixing their Diastasis Recti
        </h3>
        <p className="text-sm text-white/50 font-medium">Total due: $24.99 / month</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* LinkAuthenticationElement handles email input inside Stripe Elements */}
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
        {isLoading ? <Loader2 className="animate-spin" /> : "Start My Healing"}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4 text-white/30 text-[11px] font-semibold">
        <p className="text-center text-white/70 text-[12px] font-semibold mt-3 leading-snug px-4 drop-shadow-sm">
          {getStripeSubtext()}
        </p>
      </div>

      <p className="text-center text-white/30 text-[11px] font-semibold mt-3">
        <Lock size={12} />100% secure payment.
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
        
        const symptoms = useUserData.getState().symptoms || [];
        if (symptoms.includes("incontinence")) {
          useUserData.getState().startDrySeal();
        }
        
        router.push("/dashboard");
        return;
      }
      
      setMessage(data.error || "We found your email, but no active subscription was detected.");
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

        <p className="text-white/60 text-sm mb-5 font-medium leading-relaxed">
          Enter the email address you used at checkout. We’ll find your active plan.
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
        </form>
      </div>
    </div>
  );
};

function Step14Paywall() {
  const { name } = useUserData();
  const fingerGap = useUserStore((s) => s.fingerGap);

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
  const safeName = (name || "").trim();

  useEffect(() => {
    setShowContent(true);
    const d = new Date();
    d.setDate(d.getDate() + 84);
    setDateString(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }, []);

  useEffect(() => {
    const reviewTimer = setInterval(() => setCurrentReviewIndex((p) => (p + 1) % REVIEWS.length), 5000);
    return () => clearInterval(reviewTimer);
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
          // No body required - creates anonymous customer
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
    return `See visual results by ${dateString}.`;
  };

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col bg-[#1A1A26] overflow-hidden">
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
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-[#1A1A26]" />
      </div>

      {/* Scrollable Content */}
      <div
        className={`z-10 flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain no-scrollbar pt-safe-top pb-48 px-6 transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Urgent Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[color:var(--pink)]/30 bg-[color:var(--pink)]/10 backdrop-blur-md shadow-lg">
            <Activity size={14} className="text-[color:var(--pink)] animate-pulse" />
            <span className="text-[11px] font-extrabold text-white tracking-widest uppercase">
              Analysis Complete • High Priority
            </span>
          </div>
        </div>

        <h1
          className="text-[36px] font-extrabold text-white text-center mb-4 leading-[1.05] drop-shadow-xl"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          <span className="text-white/90">{safeName ? `${safeName}, ` : ""}Heal your separation.</span>
          <br />
          <span className="text-[color:var(--pink)]">Avoid surgery.</span>
        </h1>

        <p className="text-center text-white/80 text-[16px] font-medium leading-relaxed mb-8 max-w-xs mx-auto">
          Your customized 12-week plan to close your{" "}
          <span className="text-white font-extrabold border-b border-white/30">
            {fingerGap ?? "2+"} finger gap
          </span>{" "}
          and flatten your stomach.
        </p>

        {/* Reviews Section */}
        <div className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[28px] p-5 flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-1.5">
            <span className="text-[20px] font-bold text-white">4.9</span>
            <div className="flex text-yellow-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-white/50 uppercase ml-1 tracking-wide">
              Doctor Approved
            </span>
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
                <p className="text-[11px] font-bold text-white/40 mt-2 uppercase tracking-wide">
                  {displayReview.name}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Guarantee Accordion */}
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
              Yes. If you don&apos;t see results in your gap or symptoms, request a full refund in the app settings. No questions asked.
            </p>
          </div>
        </div>

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
            <span className="cursor-default">Physiotherapist Led</span>
            <span>•</span>
            <span className="cursor-default">Medical Grade</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA Area */}
      <div
        className={`absolute bottom-0 left-0 w-full z-30 px-5 transition-all duration-700 delay-200 ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#1A1A26]/75 via-[#1A1A26]/35 to-transparent" />

        <div className="relative pt-4 pb-[calc(env(safe-area-inset-bottom)+5px)]">
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
                <span className="text-[18px] font-extrabold text-white">
                  Start Fixing My Diastasis Recti
                </span>
                <ArrowRight className="text-white/80" size={20} />
              </>
            )}
          </button>

          <p className="text-center text-white/60 text-[12px] font-semibold mt-3 leading-snug px-4 drop-shadow-sm">
            Less than the cost of one physio visit.
            <br />
            <span className="text-white/40 text-[11px] font-normal">
              {getCtaSubtext()} Cancel anytime.
            </span>
          </p>
        </div>
      </div>

      {showCheckoutModal && clientSecret && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto"
          onClick={() => setShowCheckoutModal(false)}
        >
          <div className="min-h-full flex items-center justify-center p-4">
            <Elements
              options={{ clientSecret, appearance: stripeAppearance }}
              stripe={stripePromise}
            >
              <CheckoutForm
                onClose={() => setShowCheckoutModal(false)}
                dateString={dateString}
              />
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

// Updated Mia copy to be clinical + diastasis-recti specific
const MIA_M1 =
  "Hi! I’m Mia, your core rehab coach. I've helped 10,000+ women close their gap";
const MIA_M2 =
  "Let’s do a quick diastasis recti assessment. First, what name should I use?";

const AGE_PROMPT_ANCHOR = "What is your age?";

function miaAgeQuestion(safeName: string) {
  return `Thanks, ${safeName}. ${AGE_PROMPT_ANCHOR} This helps us set a safe progression pace.`;
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

  const [chat, setChat] = useState<Array<{ from: "mia" | "user"; text: string }>>([]);
  const [miaTyping, setMiaTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const [inputName, setInputName] = useState(name || "");
  const [ageValue, setAgeValue] = useState<number>(storedAge || 30);
  const askedAgeRef = useRef(false);

  const screen = onboardingStep;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
  // double rAF = wait until layout is fully settled (helps with AnimatePresence)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      chatBottomRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  });
};
useEffect(() => {
  if (screen !== 4) return;

  // 1) immediate pin after mount/layout
  scrollToBottom("auto");

  // 2) pin again after the wheel panel finishes its enter animation (y: 14 → 0)
  // your motion transition is 0.24s, so 260ms is safe
  const t = window.setTimeout(() => scrollToBottom("smooth"), 260);

  return () => window.clearTimeout(t);
}, [screen]);

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

  useEffect(() => {
    if (!checkedPremium) return;
    if (isPremium) router.replace("/dashboard");
  }, [checkedPremium, isPremium, router]);

  useEffect(() => {
    if (screen !== 3) return;
    if (chat.length > 0) return;

    setMiaTyping(true);
    const t1 = setTimeout(() => {
      setMiaTyping(false);
      setChat([{ from: "mia", text: MIA_M1 }]);
      scrollToBottom();

      setTimeout(() => {
        setMiaTyping(true);
        setTimeout(() => {
          setMiaTyping(false);
          setChat((prev) => [...prev, { from: "mia", text: MIA_M2 }]);
          scrollToBottom();
        }, 1200);
      }, 600);
    }, 1500);

    return () => clearTimeout(t1);
  }, [screen]);

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

    // Dependency fix: update the guard phrase to match the new copy
    const alreadyAsked = chat.some((m) => m.from === "mia" && m.text.includes(AGE_PROMPT_ANCHOR));
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
    }, 1500);

    return () => clearTimeout(t);
  }, [screen, name, storedAge]);

  useEffect(() => {
    if (screen !== 4) return;
    setAge(ageValue);

    if (ageValue > 40) {
      toastApi.show("info", "We’ll start with lower pressure and slower progressions.", 3200);
      return;
    }
    if (ageValue < 30) {
      toastApi.show("success", "Great — recovery potential is strong with consistency.", 3200);
      return;
    }
    toastApi.hide();
  }, [ageValue, screen, setAge, toastApi]);

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
      window.setTimeout(() => goTo(4), 180);
    }, 1500);
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

  const showButterfliesStrong = screen === 1;
  const showButterfliesSoft = screen >= 2 && screen <= 11;
  const showTopProgress = screen >= 2 && screen <= 11;

  return (
    <main className="fixed inset-0 w-full h-[100dvh] min-h-0 flex flex-col bg-[color:var(--navy)] overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="clinical-noise absolute inset-0 opacity-100 mix-blend-overlay" />
        {showButterfliesStrong && <ButterflyBackground />}
        {showButterfliesSoft && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.22] blur-[0.6px]">
            <ButterflyBackground />
          </div>
        )}
      </div>

      <Toast
        show={toastState.show}
        message={toastState.msg}
        tone={toastState.tone}
        onClose={() => toastApi.hide()}
      />

      {/* Main Content Layer - Flex Column */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col h-full overflow-hidden">
        {/* FIXED HEADER: Progress Bar */}
        {showTopProgress ? (
          <div className="shrink-0 pt-safe-top">
            <div className="h-[60px]">
              <ProgressBar step={Math.min(TOTAL_STEPS, screen)} total={TOTAL_STEPS} />
            </div>
          </div>
        ) : null}

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {/* Screen 1 */}
            {screen === 1 && (
              <motion.section
                key="welcome"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col h-full px-6 pb-6 pt-safe-top"
              >
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar flex flex-col items-center pt-8">
                  <div className="w-full max-w-md flex flex-col items-center">
                    <div className="mb-10">
                      <Logo />
                    </div>

                    <h1
                      className="text-center text-[34px] leading-[1.08] font-extrabold text-white drop-shadow-sm"
                      style={{ fontFamily: "var(--font-lora)" }}
                    >
                      Heal Your Abdominal Separation.
                      <br />
                      Without Surgery.
                    </h1>

                    <p className="text-center text-white/70 mt-4 text-[15px] leading-relaxed max-w-sm">
                      The only clinically adaptive plan designed to close Diastasis Recti gaps of{" "}
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
                          title="Pressure-safe approach"
                          sub="Avoids movements that increase doming and strain."
                        />
                        <Benefit
                          icon={<Sparkles className="text-white" size={22} />}
                          title="Visible Results in 12 Weeks"
                          sub="Short daily sessions with step-by-step progression."
                        />
                      </div>
                    </div>

                    <div className="mt-6 text-center text-white/55 text-xs font-semibold pb-6">
                      Physiotherapist Led • Surgically-Alternative • Medical-Grade Safety
                    </div>
                  </div>
                </div>

                <div className="mt-auto shrink-0 pt-4 w-full max-w-md mx-auto">
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
                className="flex-1 min-h-0 flex flex-col h-full px-6 pb-6"
              >
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar">
                  <div className="w-full max-w-md mx-auto flex flex-col pt-4">
                    <div className="mt-2">
                      <h1
                        className="text-[28px] leading-[1.12] font-extrabold text-white"
                        style={{ fontFamily: "var(--font-lora)" }}
                      >
                        Abdominal pattern check.
                        <br />
                        Which looks most like you?
                      </h1>
                      <p className="text-white/65 mt-3 text-[14px] leading-relaxed">
                        Choose the closest match. This helps us start with the right plan.
                      </p>
                    </div>

                    <div className="mt-7 flex flex-col gap-4 pb-4">
                      <VisualCard
                        id="pooch"
                        title="Lower abdominal bulge"
                        subtitle="Bulge sits lower, often worse by evening."
                        selected={visualShape === "pooch"}
                        onSelect={() => {
                          setVisualShape("pooch");
                          toastApi.hide();
                        }}
                      />
                      <VisualCard
                        id="gap"
                        title="Midline separation"
                        subtitle="A line, trench, or soft gap down the center."
                        selected={visualShape === "gap"}
                        onSelect={() => {
                          setVisualShape("gap");
                          toastApi.hide();
                        }}
                      />
                      <VisualCard
                        id="cone"
                        title="Doming / coning"
                        subtitle="Abdomen rises like a ridge when you sit up."
                        selected={visualShape === "cone"}
                        onSelect={() => {
                          setVisualShape("cone");
                          toastApi.show(
                            "warning",
                            "Doming suggests low core tension. We’ll focus on pressure control first.",
                            5200
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-auto shrink-0 pt-4 w-full max-w-md mx-auto">
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
                className="flex-1 min-h-0 flex flex-col h-full px-5"
              >
                <div className="w-full max-w-md mx-auto flex flex-col h-full min-h-0">
                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar pr-1 flex flex-col justify-start pb-4 pt-4">
                    <div>
                      {chat.map((m, idx) => (
                        <ChatBubble key={idx} from={m.from}>
                          {m.text}
                        </ChatBubble>
                      ))}
                      {miaTyping && <ChatBubble from="mia" typing />}
                      <div ref={chatBottomRef} className="h-1" />
                    </div>
                  </div>

                  <div className="shrink-0 pb-safe-bottom mb-4 pt-2">
                    <AnimatePresence mode="wait">
                      {screen === 3 && (
                        <motion.div
                          key="nameBox"
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 14 }}
                          transition={{ duration: 0.24 }}
                          className="rounded-[28px] border border-white/12 bg-white/8 backdrop-blur-xl shadow-soft p-4"
                        >
                          <div className="text-white/60 text-xs font-semibold mb-2">
                            Your name (for your assessment record)
                          </div>

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

                      {screen === 4 && (
                        <motion.div
                          key="ageBox"
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 14 }}
                          transition={{ duration: 0.24 }}
                          className="bg-white rounded-t-[34px] rounded-b-[24px] shadow-[0_-16px_60px_rgba(0,0,0,0.35)] p-5 pb-6"
                        >
                          <div className="text-center">
                            <div className="text-slate-900 font-extrabold text-[18px]">
                              Select your age
                            </div>
                            <div className="text-slate-500 text-[13px] font-semibold mt-1">
                              This helps us tailor tissue recovery pacing.
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
                </div>
              </motion.section>
            )}

            {/* Screen 5 */}
            {screen === 5 && (
              <motion.section
                key="s5"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col h-full"
              >
                <Step05FingerTest onBack={() => goTo(4)} onNext={() => goTo(6)} toast={toastApi} />
              </motion.section>
            )}

            {/* Screen 6 */}
            {screen === 6 && (
              <motion.section
                key="s6"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col h-full"
              >
                <Step06TissueDepth onBack={() => goTo(5)} onNext={() => goTo(7)} toast={toastApi} />
              </motion.section>
            )}

            {/* Screen 7 */}
            {screen === 7 && (
              <motion.section
                key="s7"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col h-full"
              >
                <Step07SabotageCheck onBack={() => goTo(6)} onNext={() => goTo(8)} toast={toastApi} />
              </motion.section>
            )}

            {/* Screen 8 */}
            {screen === 8 && (
              <motion.section
                key="s8"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col h-full"
              >
                <Step08Symptoms onBack={() => goTo(7)} onNext={() => goTo(9)} toast={toastApi} />
              </motion.section>
            )}

            {/* Screen 9 */}
            {screen === 9 && (
              <motion.section
                key="s9"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col h-full"
              >
                <Step09Timeline onBack={() => goTo(8)} onNext={() => goTo(10)} toast={toastApi} />
              </motion.section>
            )}

            {/* Screen 10 */}
            {screen === 10 && (
              <motion.section
                key="s10"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col h-full"
              >
                <Step10Navel onBack={() => goTo(9)} onNext={() => goTo(11)} toast={toastApi} />
              </motion.section>
            )}

            {/* Screen 11 */}
            {screen === 11 && (
              <motion.section
                key="s11"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col h-full"
              >
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
                className="flex-1 min-h-0 h-full pt-safe-top"
              >
                <Step12Analysis onDone={() => goTo(13)} />
              </motion.section>
            )}

            {/* Screen 13 */}
            {screen === 13 && (
              <motion.section
                key="s13"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col h-full pt-safe-top"
              >
                <Step13PlanReveal onBack={() => goTo(12)} onNext={() => goTo(14)} />
              </motion.section>
            )}

            {/* Screen 14 */}
            {screen === 14 && (
              <motion.section
                key="s14"
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex-1 min-h-0 h-full"
              >
                <Step14Paywall />
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
