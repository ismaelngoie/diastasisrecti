"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Play, CheckCircle2 } from "lucide-react";

import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";
import SafetyPlayer from "@/components/inside/SafetyPlayer";
import ButterflyBackground from "@/components/ButterflyBackground";

import ProgressRing from "@/components/inside/ProgressRing";
import StreakCard from "@/components/inside/StreakCard";
import ProgressGraph, { type GraphPoint, type GraphRange } from "@/components/inside/ProgressGraph";

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

function computeStreakInfo(dateSet: Set<string>) {
  const today = localDateISO(new Date());

  // current streak (ending today)
  let current = 0;
  for (let i = 0; i < 3650; i++) {
    const iso = addDays(today, -i);
    if (dateSet.has(iso)) current += 1;
    else break;
  }

  // best streak (scan sorted)
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

function buildGraphPoints(range: GraphRange, dateSet: Set<string>) {
  const today = localDateISO(new Date());

  if (range === "week") {
    const pts: GraphPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const iso = addDays(today, -i);
      const d = new Date(`${iso}T00:00:00`);
      const label = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
      const done = dateSet.has(iso) ? 1 : 0;
      pts.push({ label, value: done, raw: done, isToday: iso === today });
    }
    return { title: "This Week", points: pts };
  }

  if (range === "month") {
    // last 4 blocks of 7 days
    const pts: GraphPoint[] = [];
    for (let block = 3; block >= 0; block--) {
      const end = addDays(today, -(block * 7));
      const start = addDays(end, -6);

      let count = 0;
      for (let i = 0; i < 7; i++) {
        if (dateSet.has(addDays(start, i))) count++;
      }

      const label = `${new Date(`${start}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;

      pts.push({ label, value: count / 7, raw: count });
    }
    return { title: "Last 4 Weeks", points: pts };
  }

  // year: last 12 months
  const byMonth = new Map<string, number>();
  for (const iso of dateSet) {
    const key = iso.slice(0, 7); // YYYY-MM
    byMonth.set(key, (byMonth.get(key) || 0) + 1);
  }

  const pts: GraphPoint[] = [];
  const now = new Date(`${today}T00:00:00`);

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });

    const count = byMonth.get(key) || 0;
    // normalize by 20 workouts/month for visual (keeps simple)
    const value = Math.min(1.2, count / 20);

    pts.push({ label, value, raw: count });
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

export default function DashboardTodayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // preserve your existing "plan=monthly" param cleanup
  const planParam = searchParams.get("plan");
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (!planParam) return;
    const t = window.setTimeout(() => {
      const next = new URLSearchParams(searchParamsString);
      next.delete("plan");
      const qs = next.toString();
      router.replace(qs ? `/dashboard?${qs}` : "/dashboard", { scroll: false });
    }, 5000);
    return () => window.clearTimeout(t);
  }, [router, planParam, searchParamsString]);

  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);

  const completions = useUserStore((s) => s.workoutCompletions);
  const addWorkoutCompletion = useUserStore((s) => s.addWorkoutCompletion);

  const setHabitDone = useUserStore((s) => s.setHabitDone);
  const habits = useUserStore((s) => s.habitsByDate);

  const [showWhy, setShowWhy] = useState(false);
  const [range, setRange] = useState<GraphRange>("week");

  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [pendingStartUrl, setPendingStartUrl] = useState<string | null>(null);
  const [startModalOpen, setStartModalOpen] = useState(false);

  const videos = useMemo(() => (p?.videos ? p.videos : []), [p?.videos]);
  const hasVideos = videos.length > 0;

  const dateSet = useMemo(() => {
    const s = new Set<string>();
    for (const c of completions || []) s.add(c.dateISO);
    return s;
  }, [completions]);

  const isDoneToday = useMemo(() => dateSet.has(p.dateISO), [dateSet, p.dateISO]);
  const headerDate = useMemo(() => formatLocalDate(p.dateISO), [p.dateISO]);

  const phaseNameDisplay = useMemo(() => sanitizeCopy(p.phaseName) || p.phaseName, [p.phaseName]);
  const whyDisplay = useMemo(() => sanitizeCopy(p.why) || p.why, [p.why]);

  const ringPct = isDoneToday ? 100 : 0;

  const streak = useMemo(() => computeStreakInfo(dateSet), [dateSet]);

  const graph = useMemo(() => buildGraphPoints(range, dateSet), [range, dateSet]);

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

  const onStartedAfter5s = useCallback(() => {
    if (isDoneToday) return;

    addWorkoutCompletion({
      dateISO: p.dateISO,
      track: "healer",
      dayNumber: p.dayNumber,
      completedAtISO: new Date().toISOString(),
    });
  }, [addWorkoutCompletion, isDoneToday, p.dateISO, p.dayNumber]);

  return (
    <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="absolute inset-0 -z-10 bg-[color:var(--navy)]" />
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.22] blur-[0.6px]">
        <ButterflyBackground />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />

      <div className="flex flex-col gap-5 pb-[calc(env(safe-area-inset-bottom)+96px)]">
        <div className="min-w-0">
          <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
            Today • {headerDate}
          </div>

          <h1
            className="mt-2 text-white text-[28px] sm:text-[32px] leading-[1.05] font-extrabold"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Day {p.dayNumber}: <span className="text-white/90">{phaseNameDisplay}</span>
          </h1>

          {!hasVideos && (
            <div className="mt-3 text-white/60 text-[12px] font-semibold leading-relaxed">
              Today’s routine videos aren’t available yet. Please refresh.
            </div>
          )}
        </div>

        <Card className="p-5">
          <ProgressRing
            pct={ringPct}
            labelTop={isDoneToday ? "Today is counted ✅" : "Start today’s routine"}
            labelBottom="Counts automatically after 5 seconds of playback."
          />

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => (hasVideos ? requestStart(videos[0].url) : null)}
              disabled={!hasVideos}
              className={[
                "flex-1 h-14 rounded-full",
                "bg-[color:var(--pink)] shadow-[0_18px_60px_rgba(230,84,115,0.22)]",
                "text-white font-extrabold",
                "active:scale-[0.985] transition-transform",
                "inline-flex items-center justify-center gap-2",
                !hasVideos ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {isDoneToday ? <CheckCircle2 size={18} /> : <Play size={18} />}
              {isDoneToday ? "Completed" : "Start Routine"}
            </button>

            <button
              type="button"
              onClick={() => setShowWhy((v) => !v)}
              className="h-14 px-4 rounded-full border border-white/10 bg-white/8 text-white font-extrabold"
            >
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

        <ProgressGraph
          range={range}
          title={graph.title}
          points={graph.points}
          onRangeChange={setRange}
        />

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-white font-extrabold text-[16px]">Today’s Moves</div>
              <div className="text-white/55 text-[12px] font-semibold mt-1">
                Only today’s routine is available.
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {videos.map((v, idx) => {
              const title = sanitizeCopy(v.title) || v.title || `Exercise ${idx + 1}`;
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
                    <div className="text-white/90 text-[13px] font-extrabold truncate">{title}</div>
                    <div className="text-white/45 text-[11px] font-semibold mt-0.5 truncate">
                      Ribs down • exhale on effort • stop if you feel pain
                    </div>
                  </div>

                  <div className="shrink-0 w-10 h-10 rounded-xl border border-white/10 bg-white/6 flex items-center justify-center">
                    <Play className="text-white/75" size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-white font-extrabold text-[16px]">Daily Habits</div>
              <div className="text-white/55 text-[12px] font-semibold mt-1">
                Small rules that protect your midline while it heals.
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
                Progress
              </div>
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
                    onChange={(e) => setHabitDone(p.dateISO, h.id, e.target.checked)}
                    className="sr-only"
                    aria-label={h.text}
                  />

                  <div
                    className={[
                      "mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0",
                      done
                        ? "border-[color:var(--pink)]/40 bg-[color:var(--pink)]/15"
                        : "border-white/15 bg-white/5",
                    ].join(" ")}
                  >
                    {done ? <CheckCircle2 size={16} className="text-[color:var(--pink)]" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={["text-[13px] font-semibold leading-relaxed break-words", done ? "text-white/85" : "text-white/75"].join(" ")}>
                      {h.text}
                    </div>
                    <div className="mt-1 text-white/35 text-[11px] font-semibold">
                      {done ? "Done" : "Tap to mark as done"}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Start message modal (shows BEFORE starting, only if not counted yet) */}
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
              <div className="text-white font-extrabold text-[18px]">Today’s focus</div>
              <div className="text-white/75 text-[13px] font-semibold mt-2 leading-relaxed">
                <span className="text-white font-extrabold">{phaseNameDisplay}.</span>{" "}
                {whyDisplay}
              </div>

              <div className="mt-3 text-white/45 text-[11px] font-semibold leading-relaxed">
                Your streak counts after 5 seconds of playback.
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
          onStartedAfter5s={onStartedAfter5s}
          onClose={() => setPlayerUrl(null)}
        />
      )}
    </main>
  );
}
