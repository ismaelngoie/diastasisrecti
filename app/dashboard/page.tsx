"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  CheckCircle2,
  Info,
  X,
  Sparkles,
  Wind,
  BedDouble,
  RotateCw,
  Timer,
  Shield,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";
import SafetyPlayer from "@/components/inside/SafetyPlayer";
import ButterflyBackground from "@/components/ButterflyBackground";

import ProgressRing from "@/components/inside/ProgressRing";
import StreakCard from "@/components/inside/StreakCard";
import ProgressGraph, { type GraphPoint, type GraphRange } from "@/components/inside/ProgressGraph";
import LoopPreviewBubble from "@/components/inside/LoopPreviewBubble";
import DashboardHeader from "@/components/inside/DashboardHeader";

function sanitizeCopy(input?: string) {
  const s = String(input || "");
  if (!s) return "";
  return s
    .replace(/pelvi\.health/gi, "Fix Diastasis")
    .replace(/pelvi health/gi, "Fix Diastasis")
    .replace(/\bpelvi\b/gi, "Core Rehab")
    .replace(/\byoga\b/gi, "")
    .replace(/\bpelvic\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function localDateISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(iso: string, delta: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return localDateISO(d);
}

function dayDiff(a: string, b: string) {
  const aa = new Date(`${a}T00:00:00`).getTime();
  const bb = new Date(`${b}T00:00:00`).getTime();
  return Math.round((bb - aa) / 86400000);
}

function formatLocalDate(isoYYYYMMDD: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoYYYYMMDD)) return "Today";
  const d = new Date(`${isoYYYYMMDD}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "Today";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

// ✅ accept todayISO so streak/graph always align with your prescription date
function computeStreakInfo(dateSet: Set<string>, todayISO: string) {
  const today = todayISO || localDateISO(new Date());

  let current = 0;
  for (let i = 0; i < 3650; i++) {
    const iso = addDays(today, -i);
    if (dateSet.has(iso)) current += 1;
    else break;
  }

  const dates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  let best = 0;
  let run = 0;

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      run = 1;
      best = Math.max(best, run);
      continue;
    }

    const prev = dates[i - 1];
    const cur = dates[i];
    if (dayDiff(prev, cur) === 1) run += 1;
    else run = 1;

    best = Math.max(best, run);
  }

  return { current, best, total: dateSet.size };
}

// ✅ UPDATED: forces today to 100% if streak/completions say done
function buildGraphPoints(range: GraphRange, dateSet: Set<string>, todayProgress01: number, todayISO: string) {
  const today = todayISO || localDateISO(new Date());

  // ✅ If streak/completions say today is done, force progress to 100%
  const forcedTodayProgress01 = dateSet.has(today) ? 1 : Math.max(0, Math.min(1, todayProgress01));

  if (range === "week") {
    const pts: GraphPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const iso = addDays(today, -i);
      const d = new Date(`${iso}T00:00:00`);
      const label = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);

      const done = dateSet.has(iso) ? 1 : iso === today ? forcedTodayProgress01 : 0;

      pts.push({ label, value: done, raw: Math.round(done * 100), isToday: iso === today });
    }
    return { title: "This Week", points: pts };
  }

  if (range === "month") {
    const pts: GraphPoint[] = [];
    for (let block = 3; block >= 0; block--) {
      const end = addDays(today, -(block * 7));
      const start = addDays(end, -6);

      let count = 0;
      for (let i = 0; i < 7; i++) {
        const iso = addDays(start, i);
        if (dateSet.has(iso)) count++;
        else if (iso === today) count += forcedTodayProgress01;
      }

      const label = `${new Date(`${start}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;

      pts.push({ label, value: Math.min(1.2, count / 7), raw: Math.round(count * 10) / 10 });
    }
    return { title: "Last 4 Weeks", points: pts };
  }

  const byMonth = new Map<string, number>();
  for (const iso of dateSet) {
    const key = iso.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) || 0) + 1);
  }

  // ✅ avoid double-counting today if it's already in dateSet
  if (!dateSet.has(today)) {
    const todayKey = today.slice(0, 7);
    byMonth.set(todayKey, (byMonth.get(todayKey) || 0) + forcedTodayProgress01);
  }

  const pts: GraphPoint[] = [];
  const now = new Date(`${today}T00:00:00`);

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });

    const count = byMonth.get(key) || 0;
    const value = Math.min(1.2, count / 20);

    pts.push({ label, value, raw: Math.round(count * 10) / 10 });
  }

  return { title: "This Year", points: pts };
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft",
        "min-[960px]:bg-white/[0.07] min-[960px]:border-white/14",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* -------------------------
   ✅ PREMIUM DAILY HABITS
-------------------------- */

type HabitCard = {
  id: "log_roll" | "exhale_before_lift";
  title: string;
  oneLiner: string;
  why: string;
  how: string;
  mistake: string;
};

type HabitLearnTab = "why" | "how" | "mistake";

function HabitMiniDiagram({ habit }: { habit: HabitCard }) {
  const frames =
    habit.id === "log_roll"
      ? [
          { icon: RotateCw, title: "Roll", sub: "To your side" },
          { icon: BedDouble, title: "Legs off", sub: "Feet down" },
          { icon: ArrowUpRight, title: "Push up", sub: "Using arms" },
        ]
      : [
          { icon: Wind, title: "Exhale", sub: "Before lift" },
          { icon: Shield, title: "Ribs down", sub: "No doming" },
          { icon: ArrowUpRight, title: "Lift", sub: "Smooth effort" },
        ];

  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="text-white/85 font-extrabold text-[12px] tracking-[0.18em] uppercase">How it looks</div>
        <div className="text-white/45 text-[11px] font-semibold">3 steps</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {frames.map((f, idx) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 p-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut", delay: 0.03 * idx }}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-2xl border border-white/10 bg-black/25 flex items-center justify-center">
                  <Icon size={18} className="text-[color:var(--pink)]" />
                </div>
                {idx < 2 && <ArrowRight size={16} className="text-white/25" />}
              </div>

              <div className="mt-3 text-white font-extrabold text-[12px] leading-snug">{f.title}</div>
              <div className="mt-0.5 text-white/55 text-[11px] font-semibold leading-snug">{f.sub}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 text-white/45 text-[11px] font-semibold leading-relaxed">Keep it calm. Low pressure = faster healing.</div>
    </div>
  );
}

function FitnessSegmented({ value, onChange }: { value: HabitLearnTab; onChange: (v: HabitLearnTab) => void }) {
  const items: { id: HabitLearnTab; label: string }[] = [
    { id: "why", label: "Why" },
    { id: "how", label: "10s" },
    { id: "mistake", label: "Avoid" },
  ];

  return (
    <div className="mt-4 rounded-full border border-white/10 bg-white/6 p-1 flex items-center gap-1">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onChange(it.id)}
          className={[
            "relative flex-1 h-9 rounded-full font-extrabold text-[12px]",
            "transition-colors",
            value === it.id ? "text-white" : "text-white/55 hover:text-white/75",
          ].join(" ")}
        >
          {value === it.id && (
            <motion.div
              layoutId="seg"
              className="absolute inset-0 rounded-full bg-black/35 border border-white/10"
              transition={{ duration: 0.22, ease: "easeOut" }}
            />
          )}
          <span className="relative z-[2]">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

function HabitLearnSheet({
  open,
  onClose,
  habit,
  isDone,
  onToggleDone,
}: {
  open: boolean;
  onClose: () => void;
  habit: HabitCard | null;
  isDone: boolean;
  onToggleDone: () => void;
}) {
  const [tab, setTab] = useState<HabitLearnTab>("why");

  // tiny “practice” timer for the HOW tab
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const timerRunning = secondsLeft > 0;

  useEffect(() => {
    if (!open) return;
    setTab("why");
    setSecondsLeft(0);
  }, [open, habit?.id]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  // prevent background scroll while open (premium feel)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const headerIcon = habit?.id === "log_roll" ? BedDouble : Wind;
  const Icon = headerIcon;

  const cues = habit?.id === "log_roll" ? ["No sit-up", "Slow + controlled", "Arms help"] : ["Exhale first", "Ribs down", "No doming"];

  return (
    <AnimatePresence>
      {open && habit && (
        <motion.div
          className="fixed inset-0 z-[170] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden={!open}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${habit.title} coaching`}
            onClick={(e) => e.stopPropagation()}
            className={[
              "w-full sm:max-w-md",
              "rounded-3xl",
              "border border-white/12 bg-[#0F0F17]",
              "shadow-[0_40px_140px_rgba(0,0,0,0.80)]",
              "max-h-[88dvh]",
              "overflow-hidden",
              "flex flex-col",
            ].join(" ")}
            initial={{ y: 28, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            drag="y"
            dragElastic={0.12}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
          >
            {/* Grab handle */}
            <div className="pt-3 flex justify-center shrink-0">
              <div className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            {/* ✅ Scrollable content area so sheet fits on mobile */}
            <div className="px-5 sm:px-6 pt-4 overflow-y-auto min-h-0 flex-1">
              {/* subtle hero glow */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/10 to-black/10 p-4">
                <div className="absolute inset-0 pointer-events-none opacity-60">
                  <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[color:var(--pink)]/10 blur-3xl" />
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/8 blur-3xl" />
                </div>

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-3xl border border-white/10 bg-black/20 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-[color:var(--pink)]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-extrabold text-[16px] truncate">{habit.title}</div>
                        {isDone && (
                          <span className="shrink-0 text-[10px] font-extrabold tracking-[0.18em] uppercase text-[color:var(--pink)]/90">
                            Done
                          </span>
                        )}
                      </div>
                      <div className="text-white/60 text-[12px] font-semibold mt-1 leading-snug">{habit.oneLiner}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/6 hover:bg-white/10 border border-white/10 flex items-center justify-center shrink-0"
                    aria-label="Close"
                  >
                    <X size={18} className="text-white/85" />
                  </button>
                </div>

                {/* Cue chips */}
                <div className="relative mt-3 flex flex-wrap gap-2">
                  {cues.map((c) => (
                    <span
                      key={c}
                      className="px-3 h-8 rounded-full border border-white/10 bg-black/20 text-white/70 text-[11px] font-extrabold inline-flex items-center"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mini diagram */}
              <HabitMiniDiagram habit={habit} />

              {/* Segmented tabs */}
              <FitnessSegmented value={tab} onChange={setTab} />

              {/* Content */}
              <div className="mt-4">
                <AnimatePresence mode="wait" initial={false}>
                  {tab === "why" && (
                    <motion.div
                      key="why"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="rounded-3xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="text-white/85 font-extrabold text-[12px] tracking-[0.18em] uppercase">Why this matters</div>
                      <div className="mt-2 text-white/70 text-[13px] font-semibold leading-relaxed">{habit.why}</div>

                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-white font-extrabold text-[12px]">Coach cue</div>
                        <div className="mt-1 text-white/65 text-[12px] font-semibold leading-relaxed">
                          If you see <span className="text-white font-extrabold">doming</span>, slow down and breathe out. Healing loves low pressure.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "how" && (
                    <motion.div
                      key="how"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="rounded-3xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-white/85 font-extrabold text-[12px] tracking-[0.18em] uppercase">Do it in 10 seconds</div>
                        <div className="text-white/45 text-[11px] font-semibold inline-flex items-center gap-2">
                          <Timer size={14} className="text-white/35" />
                          {timerRunning ? `${secondsLeft}s` : "10s practice"}
                        </div>
                      </div>

                      <div className="mt-2 text-white/70 text-[13px] font-semibold leading-relaxed">{habit.how}</div>

                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-white font-extrabold text-[12px]">Try it now</div>
                        <div className="mt-1 text-white/65 text-[12px] font-semibold leading-relaxed">
                          Hit start, do the habit once, then mark it done. This is how you build a healing day.
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSecondsLeft(10)}
                            className={[
                              "flex-1 h-11 rounded-full border border-white/10",
                              "bg-[color:var(--pink)] text-white font-extrabold",
                              "active:scale-[0.985] transition-transform",
                            ].join(" ")}
                          >
                            Start 10s
                          </button>

                          <button
                            type="button"
                            onClick={() => setSecondsLeft(0)}
                            className="h-11 px-4 rounded-full border border-white/10 bg-white/6 text-white/80 font-extrabold"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "mistake" && (
                    <motion.div
                      key="mistake"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="rounded-3xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="text-white/85 font-extrabold text-[12px] tracking-[0.18em] uppercase">Common mistake</div>
                      <div className="mt-2 text-white/70 text-[13px] font-semibold leading-relaxed">{habit.mistake}</div>

                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-white font-extrabold text-[12px]">Fix it fast</div>
                        <div className="mt-1 text-white/65 text-[12px] font-semibold leading-relaxed">
                          If it happens, no guilt. Just correct your next rep. Consistency beats perfection.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* keep this spacing so content never hugs the footer */}
              <div className="h-4" />
            </div>

            {/* ✅ Bottom actions pinned + safe-area padding so buttons are always visible */}
            <div className="px-5 sm:px-6 pt-3 border-t border-white/10 bg-[#0F0F17] shrink-0 pb-[calc(env(safe-area-inset-bottom)+18px)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleDone}
                  className={[
                    "flex-1 h-12 rounded-full border border-white/10",
                    isDone
                      ? "bg-white/6 text-white/80"
                      : "bg-[color:var(--pink)] text-white shadow-[0_18px_60px_rgba(230,84,115,0.25)]",
                    "font-extrabold active:scale-[0.985] transition-transform",
                  ].join(" ")}
                >
                  {isDone ? "Marked ✅" : "Mark as done"}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 px-5 rounded-full bg-white/6 text-white/80 font-extrabold border border-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type ConfettiPiece = { id: string; x: number; y: number; r: number; s: number; d: number; variant: 0 | 1 | 2 };

function HabitConfetti({ show, pieces }: { show: boolean; pieces: ConfettiPiece[] }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="pointer-events-none absolute inset-0 z-[5]" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {pieces.map((p) => (
            <motion.span
              key={p.id}
              className={[
                "absolute left-1/2 top-[40%]",
                p.variant === 0 ? "w-2.5 h-2.5 rounded-sm bg-[color:var(--pink)]/85" : "",
                p.variant === 1 ? "w-2 h-2 rounded-full bg-white/80" : "",
                p.variant === 2 ? "w-3 h-1.5 rounded-sm bg-[color:var(--pink)]/45 border border-white/15" : "",
              ].join(" ")}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.9 }}
              animate={{ x: p.x, y: p.y, rotate: p.r, opacity: [0, 1, 0], scale: p.s }}
              transition={{ duration: p.d / 1000, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------
   ✅ PAGE
-------------------------- */

export default function DashboardTodayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const autoplayParam = searchParams.get("autoplay");
  const searchParamsString = searchParams.toString();

  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);

  const userName = useUserStore((s: any) => s.profile?.name || s.userName || s.name || s.user?.name || "Friend");
  const userGoal = useUserStore((s: any) => s.profile?.goal || s.userGoal || s.goal || "");

  const completions = useUserStore((s: any) => s.workoutCompletions || []);
  const addWorkoutCompletion = useUserStore((s: any) => s.addWorkoutCompletion);

  const setHabitDone = useUserStore((s: any) => s.setHabitDone);
  const habits = useUserStore((s: any) => s.habitsByDate || {});

  const [showWhy, setShowWhy] = useState(false);
  const [range, setRange] = useState<GraphRange>("week");

  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [pendingStartUrl, setPendingStartUrl] = useState<string | null>(null);
  const [startModalOpen, setStartModalOpen] = useState(false);

  const videos = useMemo(() => (p?.videos ? p.videos : []), [p?.videos]);
  const hasVideos = videos.length > 0;

  // ✅ optimistic completion so graph/ring update instantly at 5s even if store write lags
  const [optimisticDoneISO, setOptimisticDoneISO] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticDoneISO(null);
  }, [p.dateISO]);

  const dateSet = useMemo(() => {
    const s = new Set<string>();
    for (const c of completions || []) s.add(c.dateISO);
    if (optimisticDoneISO) s.add(optimisticDoneISO);
    return s;
  }, [completions, optimisticDoneISO]);

  const isDoneToday = useMemo(() => dateSet.has(p.dateISO), [dateSet, p.dateISO]);

  // live fill while watching (never decreases)
  const [watchPct, setWatchPct] = useState<number>(isDoneToday ? 100 : 0);
  useEffect(() => setWatchPct(isDoneToday ? 100 : 0), [isDoneToday]);

  const headerDate = useMemo(() => formatLocalDate(p.dateISO), [p.dateISO]);

  const phaseNameDisplay = useMemo(() => sanitizeCopy(p.phaseName) || p.phaseName, [p.phaseName]);
  const whyDisplay = useMemo(() => sanitizeCopy(p.why) || p.why, [p.why]);

  const ringPct = isDoneToday ? 100 : watchPct;

  const streak = useMemo(() => computeStreakInfo(dateSet, p.dateISO), [dateSet, p.dateISO]);

  const graph = useMemo(() => buildGraphPoints(range, dateSet, isDoneToday ? 1 : ringPct / 100, p.dateISO), [
    range,
    dateSet,
    ringPct,
    isDoneToday,
    p.dateISO,
  ]);

  // -------------------------
  // ✅ PREMIUM DAILY HABITS
  // -------------------------
  const habitItems = useMemo<HabitCard[]>(
    () => [
      {
        id: "log_roll",
        title: "Log roll out of bed",
        oneLiner: "Protect your gap: no sit-up pressure getting up.",
        why: "Sit-ups spike pressure straight into your midline. Log rolling keeps pressure low so your tissue can heal.",
        how: "Roll to your side → drop your legs off the bed → push up with your arms. Slow and controlled.",
        mistake: "Trying to “quick sit-up” when you’re tired. Even once a day adds unnecessary pressure.",
      },
      {
        id: "exhale_before_lift",
        title: "Exhale before every lift",
        oneLiner: "Pressure spikes slow healing — breathe it out first.",
        why: "Holding your breath turns your belly into a pressure balloon. Exhaling first protects your midline and stops doming.",
        how: "Before you lift: gentle exhale → ribs down → then lift. Keep it calm, not forced.",
        mistake: "Inhaling + bracing hard before the lift. That’s the fastest way to trigger doming.",
      },
    ],
    []
  );

  const dayHabits = habits[p.dateISO] || {};
  const habitsDoneCount = useMemo(() => habitItems.reduce((acc, h) => acc + (dayHabits[h.id] ? 1 : 0), 0), [dayHabits, habitItems]);
  const habitsPct = useMemo(() => Math.round((habitsDoneCount / (habitItems.length || 1)) * 100), [habitsDoneCount, habitItems.length]);
  const allHabitsDone = habitItems.length > 0 && habitsDoneCount >= habitItems.length;

  const [habitsExpanded, setHabitsExpanded] = useState(true);
  const [learnHabit, setLearnHabit] = useState<HabitCard | null>(null);

  const [showHabitCelebrate, setShowHabitCelebrate] = useState(false);
  const [celebratePieces, setCelebratePieces] = useState<ConfettiPiece[]>([]);
  const [showHabitToast, setShowHabitToast] = useState(false);

  const hasCelebratedForDayRef = useRef(false);
  const prevAllDoneRef = useRef(false);

  // reset on day change
  useEffect(() => {
    hasCelebratedForDayRef.current = false;
    prevAllDoneRef.current = false;
    setShowHabitCelebrate(false);
    setShowHabitToast(false);
    setHabitsExpanded(true);
    setLearnHabit(null);
  }, [p.dateISO]);

  // if not done, keep expanded (so it doesn't hide unfinished tasks)
  useEffect(() => {
    if (!allHabitsDone) setHabitsExpanded(true);
  }, [allHabitsDone]);

  const randInt = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1));

  // Celebration on transition to 100%
  useEffect(() => {
    if (!allHabitsDone) {
      prevAllDoneRef.current = false;
      return;
    }
    if (prevAllDoneRef.current) return;
    prevAllDoneRef.current = true;

    if (hasCelebratedForDayRef.current) return;
    hasCelebratedForDayRef.current = true;

    const pieces: ConfettiPiece[] = Array.from({ length: 14 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      x: randInt(-140, 140),
      y: randInt(-220, -120),
      r: randInt(-220, 220),
      s: randInt(90, 115) / 100,
      d: randInt(520, 900),
      variant: (i % 3) as 0 | 1 | 2,
    }));

    setCelebratePieces(pieces);
    setShowHabitCelebrate(true);
    setShowHabitToast(true);

    // collapse for that "clean dashboard" feel
    setHabitsExpanded(false);

    const t1 = window.setTimeout(() => setShowHabitCelebrate(false), 950);
    const t2 = window.setTimeout(() => setShowHabitToast(false), 3400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [allHabitsDone]);

  // Plan tab -> Today click opens start modal
  useEffect(() => {
    if (autoplayParam !== "today") return;
    if (!hasVideos) return;

    setPendingStartUrl(videos[0].url);
    setStartModalOpen(true);

    const next = new URLSearchParams(searchParamsString);
    next.delete("autoplay");
    const qs = next.toString();
    router.replace(qs ? `/dashboard?${qs}` : "/dashboard", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayParam, hasVideos]);

  const requestStart = (url: string) => {
    if (!hasVideos) return;
    if (isDoneToday) {
      setPlayerUrl(url);
      return;
    }
    setPendingStartUrl(url);
    setStartModalOpen(true);
  };

  const startNow = () => {
    if (!pendingStartUrl) return;
    setStartModalOpen(false);
    setPlayerUrl(pendingStartUrl);
    setPendingStartUrl(null);
  };

  const onProgressPct = useCallback(
    (pct: number) => {
      if (isDoneToday) return;
      setWatchPct((prev) => Math.max(prev, Math.round(pct)));
    },
    [isDoneToday]
  );

  const onStartedAfter5s = useCallback(() => {
    if (isDoneToday) return;

    // ✅ instantly “complete” UI even if store write is slow
    setOptimisticDoneISO(p.dateISO);
    setWatchPct(100);

    addWorkoutCompletion?.({
      dateISO: p.dateISO,
      track: "healer",
      dayNumber: p.dayNumber,
      completedAtISO: new Date().toISOString(),
    });
  }, [addWorkoutCompletion, isDoneToday, p.dateISO, p.dayNumber]);

  const topLabel = isDoneToday ? "Today is done ✅" : ringPct > 0 ? "Nice — keep going" : "Tap to start";

  return (
    <main className="w-full max-w-2xl min-[960px]:max-w-6xl mx-auto px-4 sm:px-6 min-[960px]:px-10 py-6 min-[960px]:py-10">
      <div className="absolute inset-0 -z-10 bg-[color:var(--navy)]" />
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.22] blur-[0.6px]">
        <ButterflyBackground />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />

      <div className="flex flex-col gap-5 pb-[calc(env(safe-area-inset-bottom)+96px)]">
        <DashboardHeader userName={userName} userGoal={userGoal} />

        <div className="min-w-0">
          <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">Today • {headerDate}</div>

          <h1 className="mt-2 text-white text-[24px] sm:text-[26px] min-[960px]:text-[32px] leading-[1.1] font-extrabold">
            Day {p.dayNumber}: <span className="text-white/90">{phaseNameDisplay}</span>
          </h1>

          {!hasVideos && (
            <div className="mt-2 text-white/60 text-[12px] font-semibold leading-relaxed">Today’s routine videos aren’t available yet. Please refresh.</div>
          )}
        </div>

        {/* ✅ Desktop: premium "dashboard grid" without changing mobile order */}
        <div className="grid grid-cols-1 min-[960px]:grid-cols-12 gap-5">
          <div className="min-[960px]:col-span-7">
            <Card className="p-5 min-[960px]:p-6">
              <ProgressRing
                pct={ringPct}
                labelTop={topLabel}
                labelBottom="Tap the preview to play — progress updates automatically."
                labelTopRight={
                  <button
                    type="button"
                    onClick={() => setShowWhy((v) => !v)}
                    className="h-9 px-3 rounded-full border border-white/10 bg-white/8 text-white/90 font-extrabold inline-flex items-center gap-2"
                    aria-expanded={showWhy}
                  >
                    Why
                    <ChevronDown className={["transition-transform", showWhy ? "rotate-180" : ""].join(" ")} size={16} />
                  </button>
                }
                center={
                  hasVideos ? (
                    <LoopPreviewBubble
                      src={videos[0].url}
                      onClick={() => requestStart(videos[0].url)}
                      size="ring"
                      ariaLabel="Play today’s routine"
                    />
                  ) : undefined
                }
              />

              <AnimatePresence initial={false}>
                {showWhy && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 text-white/70 text-[13px] font-semibold leading-relaxed">
                      {whyDisplay}
                      <div className="mt-2 text-white/45 text-[11px] font-semibold">If anything feels painful or wrong, stop and switch or rest.</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          <div className="min-[960px]:col-span-5 flex flex-col gap-5">
            <StreakCard current={streak.current} best={streak.best} total={streak.total} />
            <ProgressGraph range={range} title={graph.title} points={graph.points} onRangeChange={setRange} />
          </div>
        </div>

        {/* ✅ Desktop: 2-column content area (mobile stays stacked) */}
        <div className="grid grid-cols-1 min-[960px]:grid-cols-2 gap-5">
          <Card className="p-5 min-[960px]:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-white font-extrabold text-[16px]">Today’s Moves</div>
                <div className="text-white/55 text-[12px] font-semibold mt-1">Your player will run these one after another.</div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {videos.map((v, idx) => {
                const t = sanitizeCopy(v.title) || v.title || `Exercise ${idx + 1}`;
                return (
                  <button
                    type="button"
                    key={`${v.url}-${idx}`}
                    onClick={() => requestStart(v.url)}
                    className={[
                      "w-full text-left rounded-2xl border border-white/10 bg-black/20",
                      "px-4 py-3",
                      "flex items-center gap-3",
                      "active:scale-[0.99] transition-transform",
                    ].join(" ")}
                  >
                    <div className="shrink-0 w-9 h-9 rounded-xl border border-white/10 bg-white/6 flex items-center justify-center">
                      <div className="text-white/85 font-extrabold text-[13px] tabular-nums">{idx + 1}</div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-white/90 text-[13px] font-extrabold truncate">{t}</div>
                      <div className="text-white/45 text-[11px] font-semibold mt-0.5 truncate">
                        Slow + controlled • exhale on effort • stop if pain
                      </div>
                    </div>

                    <div className="shrink-0 text-white/45 text-[11px] font-extrabold tracking-[0.16em] uppercase">Tap</div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* ✅ PREMIUM Daily Habits */}
          <Card className="p-5 min-[960px]:p-6 relative overflow-hidden">
            <HabitConfetti show={showHabitCelebrate} pieces={celebratePieces} />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-white font-extrabold text-[16px]">Daily Habits</div>
                <div className="text-white/55 text-[12px] font-semibold mt-1">Protect your healing between workouts — low pressure all day.</div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">Progress</div>
                <div className="mt-1 text-white font-extrabold text-[14px] tabular-nums">{habitsPct}%</div>
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full bg-[color:var(--pink)] transition-all duration-300" style={{ width: `${habitsPct}%` }} />
            </div>

            {/* ✅ Premium celebration toast */}
            <AnimatePresence>
              {showHabitToast && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.99 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="mt-4 rounded-2xl border border-[color:var(--pink)]/20 bg-[color:var(--pink)]/10 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-[2px] w-9 h-9 rounded-2xl border border-white/10 bg-white/8 flex items-center justify-center shrink-0">
                      <Sparkles size={18} className="text-[color:var(--pink)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-extrabold text-[13px]">You protected your healing today ✅</div>
                      <div className="mt-1 text-white/70 text-[12px] font-semibold leading-snug">Come back tomorrow — Day {p.dayNumber + 1} gets easier.</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ✅ Collapse when completed */}
            <div className="mt-4">
              {allHabitsDone && !habitsExpanded ? (
                <button
                  type="button"
                  onClick={() => setHabitsExpanded(true)}
                  className={[
                    "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4",
                    "flex items-center justify-between gap-3",
                    "active:scale-[0.99] transition-transform",
                  ].join(" ")}
                  aria-label="Daily habits completed. Tap to review."
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl border border-[color:var(--pink)]/30 bg-[color:var(--pink)]/12 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-[color:var(--pink)]" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-white font-extrabold text-[13px] truncate">Completed ✅</div>
                      <div className="text-white/55 text-[11px] font-semibold truncate">Tap to review your protection habits</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-white/60 text-[11px] font-extrabold tracking-[0.16em] uppercase">Review</div>
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">Today’s protection</div>
                  {allHabitsDone && (
                    <button
                      type="button"
                      onClick={() => setHabitsExpanded(false)}
                      className="h-8 px-3 rounded-full border border-white/10 bg-white/6 text-white/75 font-extrabold text-[11px]"
                    >
                      Hide
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Habit list */}
            <AnimatePresence initial={false}>
              {(!allHabitsDone || habitsExpanded) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex flex-col gap-2">
                    {habitItems.map((h) => {
                      const done = !!dayHabits[h.id];

                      const toggle = () => {
                        setHabitDone?.(p.dateISO, h.id, !done);
                      };

                      return (
                        <motion.div
                          key={h.id}
                          role="button"
                          tabIndex={0}
                          onClick={toggle}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggle();
                            }
                          }}
                          whileTap={{ scale: 0.995 }}
                          className={[
                            "group rounded-2xl border border-white/10 bg-black/20 px-4 py-3",
                            "flex items-start gap-3",
                            "cursor-pointer select-none",
                          ].join(" ")}
                          aria-label={`${h.title}. ${done ? "Done." : "Not done."} Tap to toggle.`}
                        >
                          <div
                            className={[
                              "mt-0.5 w-7 h-7 rounded-full border flex items-center justify-center shrink-0",
                              done ? "border-[color:var(--pink)]/40 bg-[color:var(--pink)]/15" : "border-white/15 bg-white/5",
                            ].join(" ")}
                          >
                            <AnimatePresence initial={false} mode="wait">
                              {done ? (
                                <motion.div key="done" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                                  <CheckCircle2 size={16} className="text-[color:var(--pink)]" />
                                </motion.div>
                              ) : (
                                <motion.div key="not" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                                  <div className="w-2 h-2 rounded-full bg-white/20" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-white font-extrabold text-[13px] leading-snug">{h.title}</div>
                            <div className={["mt-1 text-[11px] font-semibold leading-snug", done ? "text-white/45" : "text-white/55"].join(" ")}>
                              {h.oneLiner}
                            </div>
                            <div className="mt-1 text-white/35 text-[10px] font-extrabold tracking-[0.18em] uppercase">{done ? "Done" : "Tap to mark done"}</div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLearnHabit(h);
                            }}
                            className={[
                              "shrink-0 mt-0.5",
                              "h-9 px-3 rounded-full border border-white/10 bg-white/6 hover:bg-white/10",
                              "text-white/75 font-extrabold text-[11px] inline-flex items-center gap-2",
                            ].join(" ")}
                            aria-label={`Learn more about ${h.title}`}
                          >
                            <Info size={16} className="text-white/70" />
                            Learn
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-white/45 text-[11px] font-semibold leading-relaxed">Small habits, big results: protect your midline all day.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>

      {/* Start modal */}
      <AnimatePresence>
        {startModalOpen && !isDoneToday && (
          <motion.div
            className="fixed inset-0 z-[160] bg-black/70 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setStartModalOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/12 bg-[#0F0F17] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.75)]"
              initial={{ y: 14, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ duration: playerUrl ? 0 : 0.25, ease: "easeOut" }}
            >
              <div className="text-white font-extrabold text-[18px]">Before you start</div>

              <div className="mt-2 text-white/75 text-[13px] font-semibold leading-relaxed">
                <span className="text-white font-extrabold">{phaseNameDisplay}.</span> {whyDisplay}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-white font-extrabold text-[13px]">How to get the most from today</div>
                <ul className="mt-2 space-y-2 text-white/70 text-[12px] font-semibold leading-relaxed list-disc pl-4">
                  <li>Follow each move with slow control. Keep ribs down and breathe.</li>
                  <li>If a move is labeled Left/Right, do both sides — treat them as separate moves.</li>
                  <li>If it feels easy and your form stays clean, run the routine one more time.</li>
                  <li>Stop if you feel sharp pain, pulling, or anything that feels “wrong.”</li>
                </ul>
              </div>

              <button
                onClick={startNow}
                className="mt-5 w-full h-12 rounded-full bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_60px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform"
              >
                Start Workout
              </button>

              <button
                onClick={() => setStartModalOpen(false)}
                className="mt-3 w-full h-12 rounded-full bg-white/8 text-white/80 font-extrabold border border-white/10"
              >
                Not now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit Learn Sheet */}
      <HabitLearnSheet
        open={!!learnHabit}
        habit={learnHabit}
        onClose={() => setLearnHabit(null)}
        isDone={learnHabit ? !!dayHabits[learnHabit.id] : false}
        onToggleDone={() => {
          if (!learnHabit) return;
          const currentlyDone = !!dayHabits[learnHabit.id];
          setHabitDone?.(p.dateISO, learnHabit.id, !currentlyDone);
        }}
      />

      {playerUrl && (
        <SafetyPlayer
          initialUrl={playerUrl}
          title="Exercise"
          playlist={videos}
          dateISO={p.dateISO}
          onProgressPct={onProgressPct}
          onStartedAfter5s={onStartedAfter5s}
          onClose={() => setPlayerUrl(null)}
        />
      )}
    </main>
  );
}
