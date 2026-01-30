"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Play, BadgeCheck, Ban } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";
import SafetyPlayer from "@/components/inside/SafetyPlayer";

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

  const p = useMemo(() => getTodaysPrescription(user), [user]);

  const noCrunch = (user.fingerGap || 0) > 2;

  const dayHabits = habits[p.dateISO] || {};
  const openFirst = p.videos[0];

  return (
    <main className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-white/55 text-[11px] font-extrabold tracking-[0.22em] uppercase">
            Today’s Prescription
          </div>
          <h1 className="mt-2 text-white text-[26px] leading-[1.08] font-extrabold" style={{ fontFamily: "var(--font-lora)" }}>
            Day {p.dayNumber}: {p.phaseName}
          </h1>
        </div>

        {noCrunch && (
          <div className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full border border-red-500/25 bg-red-500/10">
            <Ban size={16} className="text-red-200" />
            <span className="text-red-100 text-[11px] font-extrabold tracking-wide uppercase">
              No-Crunch Protocol Active
            </span>
          </div>
        )}
      </div>

      {/* Daily Card */}
      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-white font-extrabold text-[16px] truncate">
              {p.track === "drySeal" ? "Dry Seal Session" : p.track === "release" ? "Pelvic Release Session" : "Core Repair Session"}
            </div>

            <div className="text-white/60 text-[12px] font-semibold mt-1">
              {p.minutes} Minutes • {p.pressureLabel} • {p.videos.length} Exercises
            </div>
          </div>

          <button
            onClick={() => {
              if (p.track === "drySeal") startDrySeal();
              if (openFirst) {
                setPlayerUrl(openFirst.url);
                setPlayerTitle(openFirst.title);
              }
            }}
            className="shrink-0 w-12 h-12 rounded-2xl bg-[color:var(--pink)]/18 border border-[color:var(--pink)]/28 flex items-center justify-center active:scale-[0.985] transition-transform"
          >
            <Play className="text-[color:var(--pink)]" fill="currentColor" size={18} />
          </button>
        </div>

        <button
          onClick={() => setShowWhy((v) => !v)}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 flex items-center justify-between"
        >
          <div className="text-white/80 text-[13px] font-extrabold">Why this matters</div>
          <ChevronDown className={["text-white/60 transition-transform", showWhy ? "rotate-180" : ""].join(" ")} size={18} />
        </button>
        {showWhy && (
          <div className="mt-3 text-white/70 text-[13px] font-semibold leading-relaxed">
            {p.why}
          </div>
        )}
      </div>

      {/* Daily Habits */}
      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="text-white font-extrabold text-[16px]">Daily Habits</div>
        <div className="text-white/55 text-[12px] font-semibold mt-1">
          Non-exercise prescriptions that protect your healing midline.
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {[
            { id: "log_roll" as const, text: "Log Roll out of bed (Don’t sit up straight)." },
            { id: "exhale_before_lift" as const, text: "Exhale before picking up the baby." }
          ].map((h) => {
            const done = !!dayHabits[h.id];
            return (
              <label
                key={h.id}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={done}
                  onChange={(e) => setHabitDone(p.dateISO, h.id, e.target.checked)}
                  className="mt-1"
                />
                <div className="text-white/80 text-[13px] font-semibold leading-relaxed">{h.text}</div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Completion */}
      <button
        onClick={() => {
          addWorkoutCompletion({
            dateISO: p.dateISO,
            track: p.track,
            dayNumber: p.dayNumber,
            completedAtISO: new Date().toISOString()
          });

          // if dry seal challenge, mark day as done
          if (p.track === "drySeal") {
            setDrySealDayDone(p.dayNumber, true);
          }
        }}
        className="w-full h-14 rounded-full bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_60px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform inline-flex items-center justify-center gap-2"
      >
        <BadgeCheck size={18} />
        Mark Today Complete
      </button>

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
