"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Play,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";
import SafetyPlayer from "@/components/inside/SafetyPlayer";
import ButterflyBackground from "@/components/ButterflyBackground";

type TrackLabel = { title: string; subtitle: string };

function formatLocalDate(isoYYYYMMDD: string) {
  const d = new Date(`${isoYYYYMMDD}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function trackLabel(track: string): TrackLabel {
  // NOTE: We keep the same track keys to avoid breaking protocolEngine logic.
  switch (track) {
    case "drySeal":
      return {
        title: "Core Stability Session",
        subtitle: "Breathing + deep core control (low pressure)",
      };
    case "release":
      return {
        title: "Core Decompression Session",
        subtitle: "Reduce tension + improve rib/hip mobility",
      };
    default:
      return {
        title: "Midline Repair Session",
        subtitle: "Linea alba support + transverse abdominis re-activation",
      };
  }
}

function pressureBadge(pressureLabel?: string) {
  const label = (pressureLabel || "").toLowerCase();
  if (label.includes("low"))
    return { ring: "ring-white/10", bg: "bg-white/6", text: "text-white/80" };
  if (label.includes("medium"))
    return {
      ring: "ring-[color:var(--pink)]/25",
      bg: "bg-[color:var(--pink)]/10",
      text: "text-white",
    };
  if (label.includes("high"))
    return {
      ring: "ring-red-500/25",
      bg: "bg-red-500/10",
      text: "text-red-100",
    };
  return { ring: "ring-white/10", bg: "bg-white/6", text: "text-white/80" };
}

function shortPressure(label?: string) {
  const l = (label || "").toLowerCase();
  if (l.includes("low")) return "Low";
  if (l.includes("medium")) return "Medium";
  if (l.includes("high")) return "High";
  return label || "—";
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft",
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
    neutral: "border-white/10 bg-white/6 text-white/80",
    pink: "border-[color:var(--pink)]/25 bg-[color:var(--pink)]/10 text-white",
    danger: "border-red-500/25 bg-red-500/10 text-red-100",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
  }[tone];

  return (
    <div
      className={[
        "inline-flex items-center gap-2 px-3 py-2 rounded-full border",
        "text-[11px] font-extrabold tracking-[0.18em] uppercase",
        map,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase truncate">
        {label}
      </div>

      <div className="mt-1 min-w-0 flex items-baseline gap-2">
        <div className="min-w-0 text-white font-extrabold tabular-nums leading-none text-[18px] sm:text-[20px] truncate">
          {value}
        </div>
        {sub ? (
          <div className="shrink-0 text-white/40 text-[11px] font-semibold leading-none">
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  tone = "pink",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "pink" | "success";
}) {
  const cls =
    tone === "success"
      ? "bg-emerald-500/90 shadow-[0_18px_60px_rgba(34,197,94,0.20)]"
      : "bg-[color:var(--pink)] shadow-[0_18px_60px_rgba(230,84,115,0.22)]";

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-full h-14 rounded-full text-white font-extrabold",
        "active:scale-[0.985] transition-transform",
        "inline-flex items-center justify-center gap-2",
        cls,
        disabled ? "cursor-not-allowed opacity-90" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
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
  const pressureTone = useMemo(
    () => pressureBadge(p.pressureLabel),
    [p.pressureLabel]
  );

  const habitItems = useMemo(
    () => [
      { id: "log_roll" as const, text: "Log roll out of bed (avoid a straight sit-up)." },
      { id: "exhale_before_lift" as const, text: "Exhale before lifting (baby, laundry, groceries)." },
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

  const startSession = (videoIndex = 0) => {
    if (p.track === "drySeal") startDrySeal();
    const v = p.videos[videoIndex];
    if (v) {
      setPlayerUrl(v.url);
      setPlayerTitle(v.title);
    }
  };

  const exerciseCountText = useMemo(() => {
    const n = p.videos.length;
    if (n === 1) return "1";
    return String(n);
  }, [p.videos.length]);

  return (
    <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="absolute inset-0 -z-10 bg-[color:var(--navy)]" />
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.22] blur-[0.6px]">
        <ButterflyBackground />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />

      <div className="flex flex-col gap-5 pb-[calc(env(safe-area-inset-bottom)+96px)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
              Today • {headerDate}
            </div>

            <h1
              className="mt-2 text-white text-[28px] sm:text-[32px] leading-[1.05] font-extrabold"
              style={{ fontFamily: "var(--font-lora)" }}
            >
              Day {p.dayNumber}:{" "}
              <span className="text-white/90">{p.phaseName}</span>
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone="pink">
                <Sparkles size={14} className="text-[color:var(--pink)]" />
                {safeName}&apos;s Recovery Lab
              </Pill>

              <div
                className={[
                  "inline-flex items-center gap-2 px-3 py-2 rounded-full ring-1",
                  pressureTone.bg,
                  pressureTone.ring,
                ].join(" ")}
              >
                <span
                  className={[
                    "text-[11px] font-extrabold tracking-[0.14em] uppercase",
                    pressureTone.text,
                  ].join(" ")}
                >
                  {p.pressureLabel}
                </span>
              </div>

              {noCrunch && (
                <Pill tone="danger">
                  <Ban size={14} className="text-red-200" />
                  Avoid Crunches
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

          <button
            onClick={() => startSession(0)}
            className={[
              "shrink-0 h-12 px-4 rounded-2xl",
              "border border-white/10 bg-white/8 backdrop-blur-xl",
              "text-white font-extrabold text-[13px]",
              "active:scale-[0.985] transition-transform",
              "inline-flex items-center gap-2",
            ].join(" ")}
          >
            <div className="w-8 h-8 rounded-xl bg-[color:var(--pink)]/18 border border-[color:var(--pink)]/28 flex items-center justify-center">
              <Play
                className="text-[color:var(--pink)]"
                fill="currentColor"
                size={16}
              />
            </div>
            Play
          </button>
        </div>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-white font-extrabold text-[16px] truncate">
                {label.title}
              </div>
              <div className="text-white/55 text-[12px] font-semibold mt-1">
                {label.subtitle}
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <StatTile label="Minutes" value={String(p.minutes)} sub="min" />
                <StatTile label="Exercises" value={exerciseCountText} sub="moves" />
                <StatTile label="Pressure" value={shortPressure(p.pressureLabel)} />
              </div>
            </div>

            <button
              onClick={() => startSession(0)}
              className={[
                "shrink-0 w-14 h-14 rounded-2xl",
                "bg-[color:var(--pink)]/18 border border-[color:var(--pink)]/28",
                "flex items-center justify-center",
                "active:scale-[0.985] transition-transform",
                "shadow-[0_18px_50px_rgba(230,84,115,0.18)]",
              ].join(" ")}
              aria-label="Play first exercise"
            >
              <Play className="text-[color:var(--pink)]" fill="currentColor" size={20} />
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-white/60 text-[11px] font-extrabold tracking-[0.22em] uppercase">
                Today&apos;s Exercises
              </div>
              <div className="text-white/35 text-[11px] font-semibold">
                Tap any move to play
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {p.videos.map((v, idx) => (
                <button
                  key={`${v.title}-${idx}`}
                  onClick={() => startSession(idx)}
                  className={[
                    "w-full text-left rounded-2xl border border-white/10 bg-black/20",
                    "px-4 py-3",
                    "flex items-center gap-3",
                    "active:scale-[0.99] transition-transform",
                  ].join(" ")}
                >
                  <div className="shrink-0 w-9 h-9 rounded-xl border border-white/10 bg-white/6 flex items-center justify-center">
                    <div className="text-white/85 font-extrabold text-[13px] tabular-nums">
                      {idx + 1}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-white/90 text-[13px] font-extrabold truncate">
                      {v.title}
                    </div>
                    <div className="text-white/45 text-[11px] font-semibold mt-0.5 truncate">
                      Follow on-screen cues • ribs down • exhale on effort
                    </div>
                  </div>

                  <div className="shrink-0 w-10 h-10 rounded-xl border border-white/10 bg-white/6 flex items-center justify-center">
                    <Play className="text-white/75" size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowWhy((v) => !v)}
            className="mt-5 w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 flex items-center justify-between"
          >
            <div className="text-white/85 text-[13px] font-extrabold">
              Why this matters
            </div>
            <ChevronDown
              className={[
                "text-white/60 transition-transform",
                showWhy ? "rotate-180" : "",
              ].join(" ")}
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
                <div className="mt-3 text-white/70 text-[13px] font-semibold leading-relaxed">
                  {p.why}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              <div className="mt-1 text-white font-extrabold text-[14px] tabular-nums">
                {habitsPct}%
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full bg-[color:var(--pink)] transition-all duration-300"
              style={{ width: `${habitsPct}%` }}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {habitItems.map((h) => {
              const done = !!dayHabits[h.id];
              return (
                <label
                  key={h.id}
                  className={[
                    "group flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20",
                    "px-4 py-3",
                    "cursor-pointer",
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
                      "mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0",
                      done
                        ? "border-[color:var(--pink)]/40 bg-[color:var(--pink)]/15"
                        : "border-white/15 bg-white/5",
                    ].join(" ")}
                  >
                    {done ? (
                      <CheckCircle2 size={16} className="text-[color:var(--pink)]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={[
                        "text-[13px] font-semibold leading-relaxed break-words",
                        done ? "text-white/85" : "text-white/75",
                      ].join(" ")}
                    >
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

        {todaysCompletion?.completedAtISO && (
          <div className="text-center text-white/40 text-[11px] font-semibold">
            Completed at{" "}
            {new Date(todaysCompletion.completedAtISO).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[color:var(--navy)]/95 via-[color:var(--navy)]/70 to-transparent" />
        <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => startSession(0)}
              className={[
                "h-14 rounded-full",
                "border border-white/10 bg-white/8 backdrop-blur-xl",
                "text-white font-extrabold",
                "active:scale-[0.985] transition-transform",
                "inline-flex items-center justify-center gap-2",
              ].join(" ")}
            >
              <Play size={18} />
              Play
            </button>

            <PrimaryButton
              tone={isComplete ? "success" : "pink"}
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
            >
              <BadgeCheck size={18} />
              {isComplete ? `Day ${p.dayNumber} Complete ✅` : "Mark Session Complete"}
            </PrimaryButton>
          </div>
        </div>
      </div>

      {playerUrl && (
        <SafetyPlayer
          initialUrl={playerUrl}
          title={playerTitle}
          onClose={() => setPlayerUrl(null)}
        />
      )}
    </main>
  );
}
