"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Play, BadgeCheck, Ban, CheckCircle2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";
import SafetyPlayer from "@/components/inside/SafetyPlayer";

type TrackLabel = {
  title: string;
  subtitle: string;
};

function formatLocalDate(isoYYYYMMDD: string) {
  const d = new Date(`${isoYYYYMMDD}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function trackLabel(track: string): TrackLabel {
  switch (track) {
    case "drySeal":
      return { title: "Dry Seal Session", subtitle: "Pelvic floor + leakage support" };
    case "release":
      return { title: "Pelvic Release Session", subtitle: "Down-train tension + restore control" };
    default:
      return { title: "Core Repair Session", subtitle: "Midline tension + deep core reconnection" };
  }
}

function pressureBadge(pressureLabel?: string) {
  const label = (pressureLabel || "").toLowerCase();
  if (label.includes("low")) return { ring: "ring-white/10", bg: "bg-white/5", text: "text-white/80" };
  if (label.includes("medium")) return { ring: "ring-[color:var(--pink)]/25", bg: "bg-[color:var(--pink)]/10", text: "text-white" };
  if (label.includes("high")) return { ring: "ring-red-500/25", bg: "bg-red-500/10", text: "text-red-100" };
  return { ring: "ring-white/10", bg: "bg-white/5", text: "text-white/80" };
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-3xl bg-white/5",
        "ring-1 ring-white/10",
        "shadow-[0_20px_60px_rgba(0,0,0,0.25)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "pink" | "danger" | "success";
}) {
  const map = {
    neutral: "ring-white/10 bg-white/5 text-white/80",
    pink: "ring-[color:var(--pink)]/25 bg-[color:var(--pink)]/10 text-white",
    danger: "ring-red-500/25 bg-red-500/10 text-red-100",
    success: "ring-emerald-500/25 bg-emerald-500/10 text-emerald-100",
  }[tone];

  return (
    <div
      className={[
        "inline-flex items-center gap-2 px-3 py-2 rounded-full",
        "ring-1",
        "text-[11px] font-extrabold tracking-[0.18em] uppercase",
        map,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5">
      <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">{label}</div>
      <div className="mt-0.5 text-white text-[16px] font-extrabold">{value}</div>
    </div>
  );
}

function isoAddDays(isoYYYYMMDD: string, days: number) {
  const d = new Date(`${isoYYYYMMDD}T00:00:00`);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DashboardTodayPage() {
  const user = useUserStore();
  const [showWhy, setShowWhy] = useState(false);

  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [playerTitle, setPlayerTitle] = useState<string>("");

  const setHabitDone = useUserStore((s) => s.setHabitDone);
  const habits = useUserStore((s) => s.habitsByDate);
  const addWorkoutCompletion = useUserStore((s) => s.addWorkoutCompletion);
  const startDrySeal = useUserStore((s) => s.startDrySeal);
  const setDrySealDayDone = useUserStore((s) => s.setDrySealDayDone);

  // completions
  const completions = useUserStore((s) => s.workoutCompletions);

  const p = useMemo(() => getTodaysPrescription(user), [user]);

  const todaysCompletion = useMemo(() => {
    return (completions || []).find((c) => c.dateISO === p.dateISO) || null;
  }, [completions, p.dateISO]);

  const isComplete = !!todaysCompletion;

  const noCrunch = (user.fingerGap || 0) > 2;
  const dayHabits = habits[p.dateISO] || {};
  const safeName = (user.name || "there").trim() || "there";
  const headerDate = useMemo(() => formatLocalDate(p.dateISO), [p.dateISO]);

  const label = useMemo(() => trackLabel(p.track), [p.track]);
  const pressureTone = useMemo(() => pressureBadge(p.pressureLabel), [p.pressureLabel]);

  const habitItems = useMemo(
    () => [
      { id: "log_roll" as const, text: "Log roll out of bed (don’t sit up straight)." },
      { id: "exhale_before_lift" as const, text: "Exhale before picking up the baby." },
    ],
    []
  );

  const habitsDoneCount = useMemo(() => {
    return habitItems.reduce((acc, h) => acc + (dayHabits[h.id] ? 1 : 0), 0);
  }, [dayHabits, habitItems]);

  const habitsPct = useMemo(() => {
    const total = habitItems.length || 1;
    return Math.round((habitsDoneCount / total) * 100);
  }, [habitsDoneCount, habitItems.length]);

  // progress snapshot (7-day adherence + streak)
  const progress = useMemo(() => {
    const list = completions || [];
    const hasCompletion = (dateISO: string) => list.some((c) => c.dateISO === dateISO);

    const last7 = Array.from({ length: 7 }, (_, i) => isoAddDays(p.dateISO, -i));
    const last7Done = last7.filter((d) => hasCompletion(d)).length;

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = isoAddDays(p.dateISO, -i);
      if (!hasCompletion(d)) break;
      streak += 1;
    }

    return {
      last7Done,
      streak,
      totalDone: list.length,
      weeklyPct: Math.round((last7Done / 7) * 100),
    };
  }, [completions, p.dateISO]);

  const coachNote = useMemo(() => {
    const symptoms = user.symptoms || [];
    const hasLeak = symptoms.includes("incontinence");
    const hasBack = symptoms.includes("backPain");
    const pressure = (p.pressureLabel || "").toLowerCase();

    const lines: string[] = [];
    if (p.track === "drySeal") {
      lines.push("Today is a Dry Seal day: go slow and follow the timing cues exactly.");
      if (hasLeak) lines.push("Focus on control, not squeezing harder. Smooth exhale + lift is the goal.");
    } else if (p.track === "release") {
      lines.push("Today is about down-training tension so your core can reconnect without bracing.");
    } else {
      lines.push("Today builds midline tension safely — the goal is deep reconnection, not intensity.");
    }

    if (pressure.includes("high")) lines.push("Keep pressure low: exhale first, then move. If coning appears, stop and reset.");
    if (noCrunch) lines.push("No-crunch rules stay active — avoid sit-ups, hard planks, or any outward bulge.");
    if (hasBack) lines.push("If you feel back strain, reduce range and slow the tempo. Quality over reps.");

    return lines.join(" ");
  }, [noCrunch, p.pressureLabel, p.track, user.symptoms]);

  const startSession = (videoIndex = 0) => {
    if (p.track === "drySeal") startDrySeal();
    const v = p.videos[videoIndex];
    if (v) {
      setPlayerUrl(v.url);
      setPlayerTitle(v.title);
    }
  };

  return (
    <>
      <main className="w-full min-h-[100dvh] px-4 sm:px-8 lg:px-10 py-6 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-5 lg:gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
                  Today • {headerDate}
                </div>

                <h1
                  className="mt-2 text-white text-[28px] sm:text-[32px] leading-[1.05] font-extrabold"
                  style={{ fontFamily: "var(--font-lora)" }}
                >
                  Day {p.dayNumber}: {p.phaseName}
                </h1>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone="pink">
                    <Sparkles size={14} className="text-[color:var(--pink)]" />
                    {safeName}&apos;s Protocol
                  </Pill>

                  <div
                    className={[
                      "inline-flex items-center gap-2 px-3 py-2 rounded-full ring-1",
                      pressureTone.bg,
                      pressureTone.ring,
                    ].join(" ")}
                  >
                    <span className={["text-[11px] font-extrabold tracking-[0.14em] uppercase", pressureTone.text].join(" ")}>
                      {p.pressureLabel}
                    </span>
                  </div>

                  {noCrunch && (
                    <Pill tone="danger">
                      <Ban size={14} className="text-red-200" />
                      No-Crunch Active
                    </Pill>
                  )}

                  {isComplete && (
                    <Pill tone="success">
                      <CheckCircle2 size={14} className="text-emerald-200" />
                      Completed
                    </Pill>
                  )}
                </div>
              </div>

              {/* Primary action (premium) */}
              <button
                onClick={() => startSession(0)}
                className={[
                  "shrink-0 h-12 px-5 rounded-2xl",
                  "bg-gradient-to-r from-[color:var(--pink)] to-[#C23A5B]",
                  "text-white font-extrabold text-[13px]",
                  "shadow-[0_16px_50px_rgba(230,84,115,0.25)]",
                  "active:scale-[0.985] transition-transform",
                  "inline-flex items-center gap-2",
                ].join(" ")}
              >
                <Play className="text-white" fill="currentColor" size={16} />
                Start
              </button>
            </div>

            {/* Two-column on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-5 lg:gap-6">
              {/* LEFT: primary session experience */}
              <div className="flex flex-col gap-5 lg:gap-6">
                {/* Coach Mia Note */}
                <Card className="p-4 sm:p-5">
                  <div className="text-white/60 text-[10px] font-extrabold tracking-[0.22em] uppercase">Coach Mia Note</div>
                  <div className="mt-2 text-white text-[14px] font-semibold leading-relaxed">{coachNote}</div>
                </Card>

                {/* Primary Session Card */}
                <Card className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-white font-extrabold text-[16px] truncate">{label.title}</div>
                      <div className="text-white/55 text-[12px] font-semibold mt-1">{label.subtitle}</div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <Metric label="Minutes" value={`${p.minutes}`} />
                        <Metric label="Exercises" value={`${p.videos.length}`} />
                        <Metric label="Pressure" value={`${p.pressureLabel}`} />
                      </div>
                    </div>

                    <button
                      onClick={() => startSession(0)}
                      className={[
                        "shrink-0 w-14 h-14 rounded-2xl",
                        "bg-[color:var(--pink)]/18 ring-1 ring-[color:var(--pink)]/28",
                        "flex items-center justify-center",
                        "active:scale-[0.985] transition-transform",
                        "shadow-[0_18px_50px_rgba(230,84,115,0.18)]",
                      ].join(" ")}
                      aria-label="Play first exercise"
                    >
                      <Play className="text-[color:var(--pink)]" fill="currentColor" size={20} />
                    </button>
                  </div>

                  {/* Exercise List */}
                  <div className="mt-5">
                    <div className="text-white/60 text-[11px] font-extrabold tracking-[0.22em] uppercase">
                      Today&apos;s Exercises
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      {p.videos.map((v, idx) => (
                        <button
                          key={`${v.title}-${idx}`}
                          onClick={() => startSession(idx)}
                          className={[
                            "w-full text-left rounded-2xl bg-black/20 ring-1 ring-white/10",
                            "px-4 py-3",
                            "flex items-center justify-between gap-3",
                            "active:scale-[0.99] transition-transform",
                          ].join(" ")}
                        >
                          <div className="min-w-0">
                            <div className="text-white/90 text-[13px] font-extrabold truncate">
                              {idx + 1}. {v.title}
                            </div>
                            <div className="text-white/45 text-[11px] font-semibold mt-0.5 truncate">
                              Tap to play safely • follow the cues on screen
                            </div>
                          </div>

                          <div className="shrink-0 w-10 h-10 rounded-xl ring-1 ring-white/10 bg-white/5 flex items-center justify-center">
                            <Play className="text-white/75" size={16} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Why this matters */}
                  <button
                    onClick={() => setShowWhy((v) => !v)}
                    className="mt-5 w-full rounded-2xl ring-1 ring-white/10 bg-white/5 px-4 py-3 flex items-center justify-between"
                  >
                    <div className="text-white/85 text-[13px] font-extrabold">Why this matters</div>
                    <ChevronDown
                      className={["text-white/60 transition-transform", showWhy ? "rotate-180" : ""].join(" ")}
                      size={18}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {showWhy && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 text-white/70 text-[13px] font-semibold leading-relaxed">{p.why}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>

              {/* RIGHT: glanceable progress + habits + completion */}
              <div className="flex flex-col gap-5 lg:gap-6">
                {/* Progress Snapshot */}
                <Card className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-white font-extrabold text-[16px]">Progress Snapshot</div>
                      <div className="text-white/55 text-[12px] font-semibold mt-1">
                        Keep it consistent — results come from streaks.
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
                        Last 7 Days
                      </div>
                      <div className="mt-1 text-white font-extrabold text-[14px]">{progress.last7Done}/7</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Metric label="Streak" value={`${progress.streak}d`} />
                    <Metric label="Weekly" value={`${progress.weeklyPct}%`} />
                    <Metric label="Total" value={`${progress.totalDone}`} />
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full bg-[color:var(--pink)] transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, progress.weeklyPct))}%` }}
                    />
                  </div>

                  <div className="mt-3 text-white/45 text-[11px] font-semibold">
                    Aim for 5+ days/week for the fastest tissue response.
                  </div>
                </Card>

                {/* Daily Habits */}
                <Card className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-white font-extrabold text-[16px]">Daily Habits</div>
                      <div className="text-white/55 text-[12px] font-semibold mt-1">
                        Small rules that protect your healing midline.
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
                        Progress
                      </div>
                      <div className="mt-1 text-white font-extrabold text-[14px]">{habitsPct}%</div>
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
                          className={[
                            "group flex items-start gap-3 rounded-2xl",
                            "bg-black/20 ring-1 ring-white/10",
                            "px-4 py-3 cursor-pointer",
                          ].join(" ")}
                        >
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={(e) => setHabitDone(p.dateISO, h.id, e.target.checked)}
                            className="sr-only"
                          />

                          <div
                            className={[
                              "mt-0.5 w-6 h-6 rounded-full ring-1 flex items-center justify-center shrink-0",
                              done ? "ring-[color:var(--pink)]/40 bg-[color:var(--pink)]/15" : "ring-white/15 bg-white/5",
                            ].join(" ")}
                          >
                            {done ? <CheckCircle2 size={16} className="text-[color:var(--pink)]" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                          </div>

                          <div className="flex-1">
                            <div className={["text-[13px] font-semibold leading-relaxed", done ? "text-white/85" : "text-white/75"].join(" ")}>
                              {h.text}
                            </div>
                            <div className="mt-1 text-white/35 text-[11px] font-semibold">
                              {done ? "Done • great protective habit" : "Tap to mark as done"}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </Card>

                {/* Completion CTA */}
                <div className="pt-1">
                  <button
                    disabled={isComplete}
                    onClick={() => {
                      if (isComplete) return;

                      addWorkoutCompletion({
                        dateISO: p.dateISO,
                        track: p.track,
                        dayNumber: p.dayNumber,
                        completedAtISO: new Date().toISOString(),
                      });

                      if (p.track === "drySeal") {
                        setDrySealDayDone(p.dayNumber, true);
                      }
                    }}
                    className={[
                      "w-full h-14 rounded-full text-white font-extrabold",
                      "shadow-[0_18px_60px_rgba(230,84,115,0.22)]",
                      "active:scale-[0.985] transition-transform",
                      "inline-flex items-center justify-center gap-2",
                      isComplete
                        ? "bg-emerald-500/90 text-white shadow-[0_18px_60px_rgba(34,197,94,0.20)] cursor-not-allowed opacity-95"
                        : "bg-[color:var(--pink)]",
                    ].join(" ")}
                  >
                    <BadgeCheck size={18} />
                    {isComplete ? `Day ${p.dayNumber} Complete ✅` : "Mark Today Complete"}
                  </button>

                  {todaysCompletion?.completedAtISO && (
                    <div className="mt-3 text-center text-white/40 text-[11px] font-semibold">
                      Completed at{" "}
                      {new Date(todaysCompletion.completedAtISO).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Player Modal */}
      {playerUrl && <SafetyPlayer initialUrl={playerUrl} title={playerTitle} onClose={() => setPlayerUrl(null)} />}
    </>
  );
}
