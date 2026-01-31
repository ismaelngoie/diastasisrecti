"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Lock, Play } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";
import SafetyPlayer from "@/components/inside/SafetyPlayer";
import PreviewRing from "@/components/inside/PreviewRing";
import VideoPreviewCircle from "@/components/inside/VideoPreviewCircle";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft", className].join(" ")}>
      {children}
    </div>
  );
}

export default function PlanPage() {
  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);
  const videos = p.videos || [];
  const hasVideos = videos.length > 0;

  const completions = useUserStore((s) => s.workoutCompletions);
  const addWorkoutCompletion = useUserStore((s) => s.addWorkoutCompletion);

  const isDoneToday = useMemo(() => {
    const set = new Set<string>();
    for (const c of completions || []) set.add(c.dateISO);
    return set.has(p.dateISO);
  }, [completions, p.dateISO]);

  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const heroSrc = hasVideos ? videos[0].url : "";

  const onStartedAfter5s = useCallback(() => {
    if (isDoneToday) return;
    addWorkoutCompletion({
      dateISO: p.dateISO,
      track: "healer",
      dayNumber: p.dayNumber,
      completedAtISO: new Date().toISOString(),
    });
  }, [addWorkoutCompletion, isDoneToday, p.dateISO, p.dayNumber]);

  const requestStart = (url: string) => {
    if (!hasVideos) return;
    setPlayerUrl(url);
  };

  // Minimal placeholder “locked” days UI (you can expand later)
  const lockedDays = Array.from({ length: 15 }).map((_, i) => i + 1);

  return (
    <main className="w-full max-w-md mx-auto px-5 pt-7 pb-[92px]">
      <div className="text-white font-extrabold text-[22px]" style={{ fontFamily: "var(--font-lora)" }}>
        Plan
      </div>
      <div className="mt-1 text-white/60 text-[12px] font-semibold">
        Today is always available. Future days unlock as you progress.
      </div>

      <div className="mt-5">
        <Card className="p-5">
          <PreviewRing
            pct={isDoneToday ? 100 : 0}
            labelTop={isDoneToday ? "Today is complete ✅" : "Today is ready"}
            labelBottom="Tap play to start today’s routine."
          >
            {hasVideos ? (
              <VideoPreviewCircle
                src={heroSrc}
                onClick={() => requestStart(heroSrc)}
                label="Start today's routine"
                loopSeconds={3}
              />
            ) : (
              <div className="w-[164px] h-[164px] rounded-full border border-white/12 bg-white/5" />
            )}
          </PreviewRing>

          <button
            type="button"
            onClick={() => requestStart(heroSrc)}
            disabled={!hasVideos}
            className={[
              "mt-5 w-full h-12 rounded-full bg-[color:var(--pink)] text-white font-extrabold",
              "shadow-[0_18px_60px_rgba(230,84,115,0.22)]",
              "active:scale-[0.985] transition-transform",
              !hasVideos ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Play size={18} />
              Start Today
            </span>
          </button>
        </Card>
      </div>

      <div className="mt-5 space-y-2">
        {lockedDays.map((n) => (
          <div
            key={n}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 flex items-center justify-between"
          >
            <div className="text-white/85 font-extrabold text-[13px]">Day {n + 1}</div>
            <div className="text-white/40 text-[12px] font-semibold inline-flex items-center gap-2">
              <Lock size={14} />
              Locked
            </div>
          </div>
        ))}
      </div>

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
