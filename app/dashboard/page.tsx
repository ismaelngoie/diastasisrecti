"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CheckCircle2, Ban } from "lucide-react";

import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";
import SafetyPlayer from "@/components/inside/SafetyPlayer";
import ButterflyBackground from "@/components/ButterflyBackground";

import ProgressRing from "@/components/inside/ProgressRing";
import StreakCard from "@/components/inside/StreakCard";
import ProgressGraph, { type GraphPoint, type GraphRange } from "@/components/inside/ProgressGraph";
import LoopPreviewBubble from "@/components/inside/LoopPreviewBubble";
import DashboardHeader from "@/components/inside/DashboardHeader";

// --- HELPER FUNCTIONS ---

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

function buildGraphPoints(range: GraphRange, dateSet: Set<string>, todayProgress01: number, todayISO: string) {
  const today = todayISO || localDateISO(new Date());

  if (range === "week") {
    const pts: GraphPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const iso = addDays(today, -i);
      const d = new Date(`${iso}T00:00:00`);
      const label = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);

      const done = dateSet.has(iso) ? 1 : iso === today ? Math.max(0, Math.min(1, todayProgress01)) : 0;

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
        else if (iso === today) count += todayProgress01;
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

  const todayKey = today.slice(0, 7);
  byMonth.set(todayKey, (byMonth.get(todayKey) || 0) + todayProgress01);

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
    <div className={["rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft", className].join(" ")}>
      {children}
    </div>
  );
}

// --- BRIDGE PROTOCOL COMPONENTS (The Clinical Spinner) ---

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

function BridgeLine({ text, danger, success }: { text: string; danger?: boolean; success?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={[
        "text-[14px] font-semibold tracking-wide flex items-center gap-2",
        danger ? "text-red-300" : success ? "text-[#33B373]" : "text-white/80",
      ].join(" ")}
    >
      {danger && <Ban size={16} className="shrink-0" />}
      {success && <CheckCircle2 size={16} className="shrink-0" />}
      {text}
    </motion.div>
  );
}

function BridgeProtocol({ onDone }: { onDone: () => void }) {
  const name = useUserStore((s) => s.name) || "Patient";
  const fingerGap = useUserStore((s) => s.fingerGap);
  const sabotage = useUserStore((s) => s.sabotageExercises);

  const harmful = useMemo(() => {
    const list: string[] = [];
    if ((sabotage || []).includes("crunches")) list.push("Crunches");
    if ((sabotage || []).includes("planks")) list.push("Planks");
    if (list.length === 0) list.push("Sit-ups");
    return Array.from(new Set(list));
  }, [sabotage]);

  const lines = useMemo(() => {
    const gapText = fingerGap ? (fingerGap === 4 ? "4+ finger" : `${fingerGap} finger`) : "midline";
    return [
      `Reviewing midline profile for ${name}...`,
      `Focusing on a ${gapText} separation (diastasis recti)...`,
      `Setting safe pressure limits...`,
      `Building your core rehab plan...`,
      `Avoiding high-pressure moves:`,
      ...harmful.map((h) => `— ${h}`),
      `Preparing your Phase 1 sessions...`,
      `Plan ready.`,
    ];
  }, [name, fingerGap, harmful]);

  const [idx, setIdx] = useState(0);
  const done = idx >= lines.length - 1;

  useEffect(() => {
    const t = window.setInterval(() => {
      setIdx((p) => Math.min(lines.length - 1, p + 1));
    }, 650);
    return () => window.clearInterval(t);
  }, [lines.length]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#0A0A0F] clinical-noise flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-12">
          <AICoreView />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-7">
          <div className="text-[color:var(--pink)] text-[11px] font-black tracking-[0.25em] uppercase mb-5">
            Personal Rehab Plan
          </div>

          <div className="flex flex-col gap-3 min-h-[280px]">
            {lines.slice(0, idx + 1).map((t, i) => {
              const isDanger = t.startsWith("Avoiding") || t.startsWith("—");
              const isFinal = t.includes("Plan ready");
              return <BridgeLine key={i} text={t} danger={isDanger} success={isFinal} />;
            })}
          </div>

          <AnimatePresence>
            {done && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 w-full h-14 rounded-full bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B] text-white font-extrabold text-[17px] shadow-[0_15px_40px_rgba(230,84,115,0.4)] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-3"
                onClick={onDone}
              >
                Start My Core Rehab Plan
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 text-center px-4">
          <p className="text-white/40 text-[12px] font-medium leading-relaxed">
            {name}, your recovery starts now. Let’s get to work.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD PAGE ---

export default function DashboardTodayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Used for autoplay logic below
  const autoplayParam = searchParams.get("autoplay");
  const searchParamsString = searchParams.toString();

  // State for the Bridge Protocol (The Clinical Spinner)
  const [showBridge, setShowBridge] = useState(false);

  // --- 1. THE "PELVI" METHOD: Reliable Conversion + URL Cleanup ---
  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      // Check if we just arrived from payment
      if (params.get("plan") === "monthly") {
        
        // A. Show the Clinical Spinner
        setShowBridge(true);

        // B. MANUALLY FIRE THE CONVERSION EVENT (IMMEDIATE)
        // @ts-ignore
        if (window.gtag) {
          // @ts-ignore
          window.gtag("event", "conversion", {
            send_to: "AW-17911323675",
            value: 24.99,
            currency: "USD",
            transaction_id: Date.now(), // Unique ID prevents dups
          });
          console.log("✅ Google Ads Conversion Fired");
        }

        // C. DELAY URL CLEANUP (10 Seconds)
        // This keeps ?plan=monthly visible so simple URL matching works too
        setTimeout(() => {
          const cleanUrl = window.location.pathname;
          window.history.replaceState(null, "", cleanUrl);
        }, 10000);
      }
    }
  }, []);

  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);

  // ✅ best-effort name + goal from store (safe even if your store fields differ)
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
    // when day changes, reset optimism
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

  const graph = useMemo(
    () => buildGraphPoints(range, dateSet, isDoneToday ? 1 : ringPct / 100, p.dateISO),
    [range, dateSet, ringPct, isDoneToday, p.dateISO]
  );

  const habitItems = useMemo(
    () => [
      { id: "log_roll" as const, text: "Log roll out of bed (avoid a straight sit-up)." },
      { id: "exhale_before_lift" as const, text: "Exhale before lifting (car seat, groceries, laundry)." },
    ],
    []
  );

  const dayHabits = habits[p.dateISO] || {};
  const habitsDoneCount = useMemo(
    () => habitItems.reduce((acc, h) => acc + (dayHabits[h.id] ? 1 : 0), 0),
    [dayHabits, habitItems]
  );
  const habitsPct = useMemo(() => Math.round((habitsDoneCount / (habitItems.length || 1)) * 100), [habitsDoneCount, habitItems.length]);

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

  // --- RENDER ---

  // If Bridge Protocol is active (user just paid), show ONLY that.
  if (showBridge) {
    return <BridgeProtocol onDone={() => setShowBridge(false)} />;
  }

  return (
    <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="absolute inset-0 -z-10 bg-[color:var(--navy)]" />
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.22] blur-[0.6px]">
        <ButterflyBackground />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />

      <div className="flex flex-col gap-5 pb-[calc(env(safe-area-inset-bottom)+96px)]">
        {/* ✅ Swift-like header */}
        <DashboardHeader userName={userName} userGoal={userGoal} />

        {/* Day / Phase */}
        <div className="min-w-0">
          <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">Today • {headerDate}</div>

          <h1 className="mt-2 text-white text-[24px] sm:text-[26px] leading-[1.1] font-extrabold">
            Day {p.dayNumber}: <span className="text-white/90">{phaseNameDisplay}</span>
          </h1>

          {!hasVideos && (
            <div className="mt-2 text-white/60 text-[12px] font-semibold leading-relaxed">
              Today’s routine videos aren’t available yet. Please refresh.
            </div>
          )}
        </div>

        {/* ✅ Progress card (start by tapping video bubble) */}
        <Card className="p-5">
          <ProgressRing
            pct={ringPct}
            labelTop={topLabel}
            labelBottom="Tap the preview video to play. Your progress updates automatically."
            // ✅ NEW: place Why next to labelTop
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
                <LoopPreviewBubble src={videos[0].url} onClick={() => requestStart(videos[0].url)} size="ring" ariaLabel="Play today’s routine" />
              ) : undefined
            }
          />

          {/* ✅ kept your old Why button code (but hidden so we “don’t remove a thing”) */}
          <div className="mt-4 flex justify-end hidden">
            <button
              type="button"
              onClick={() => setShowWhy((v) => !v)}
              className="h-12 px-4 rounded-full border border-white/10 bg-white/8 text-white font-extrabold inline-flex items-center gap-2"
              aria-expanded={showWhy}
            >
              Why
              <ChevronDown className={["transition-transform", showWhy ? "rotate-180" : ""].join(" ")} size={18} />
            </button>
          </div>

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
                  <div className="mt-2 text-white/45 text-[11px] font-semibold">
                    If anything feels painful or wrong, stop and switch or rest.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <StreakCard current={streak.current} best={streak.best} total={streak.total} />

        <ProgressGraph range={range} title={graph.title} points={graph.points} onRangeChange={setRange} />

        {/* Moves list */}
        <Card className="p-5">
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

        {/* Habits */}
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-white font-extrabold text-[16px]">Daily Habits</div>
              <div className="text-white/55 text-[12px] font-semibold mt-1">
                Small rules that protect your midline while it adapts.
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">Progress</div>
              <div className="mt-1 text-white font-extrabold text-[14px] tabular-nums">{habitsPct}%</div>
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full bg-[color:var(--pink)] transition-all duration-300" style={{ width: `${habitsPct}%` }} />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {habitItems.map((h) => {
              const done = !!dayHabits[h.id];
              return (
                <label
                  key={h.id}
                  className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) => setHabitDone?.(p.dateISO, h.id, e.target.checked)}
                    className="sr-only"
                    aria-label={h.text}
                  />

                  <div
                    className={[
                      "mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0",
                      done ? "border-[color:var(--pink)]/40 bg-[color:var(--pink)]/15" : "border-white/15 bg-white/5",
                    ].join(" ")}
                  >
                    {done ? <CheckCircle2 size={16} className="text-[color:var(--pink)]" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={["text-[13px] font-semibold leading-relaxed break-words", done ? "text-white/85" : "text-white/75"].join(" ")}>
                      {h.text}
                    </div>
                    <div className="mt-1 text-white/35 text-[11px] font-semibold">{done ? "Done" : "Tap to mark as done"}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Start message modal */}
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
              transition={{ duration: 0.25, ease: "easeOut" }}
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
