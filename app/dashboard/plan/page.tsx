"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Lock, Play } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";
import LoopPreviewBubble from "@/components/inside/LoopPreviewBubble";

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

export default function PlanPage() {
  const router = useRouter();
  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);

  const videos = p.videos || [];
  const canPreview = videos.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
          Plan
        </div>
        <div className="mt-2 text-white text-[26px] leading-[1.05] font-extrabold" style={{ fontFamily: "var(--font-lora)" }}>
          Your routine
        </div>
        <div className="mt-2 text-white/60 text-[12px] font-semibold">
          Today is always available.
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-4">
          {canPreview ? (
            <LoopPreviewBubble
              src={videos[0].url}
              size="card"
              onClick={() => router.push("/dashboard?autoplay=today")}
              ariaLabel="Play today’s routine"
            />
          ) : (
            <div className="w-[140px] h-[140px] rounded-full border border-white/12 bg-black/30" />
          )}

          <div className="min-w-0 flex-1">
            <div className="text-white font-extrabold text-[16px]">Today</div>
            <div className="text-white/60 text-[12px] font-semibold mt-1 leading-relaxed">
              Play the routine and your player will run through all moves.
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard?autoplay=today")}
              className="mt-4 h-12 px-5 rounded-full bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_60px_rgba(230,84,115,0.22)] inline-flex items-center gap-2 active:scale-[0.985] transition-transform"
            >
              <Play size={18} />
              Start Today
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-white font-extrabold text-[16px]">Upcoming days</div>
        <div className="text-white/55 text-[12px] font-semibold mt-1">
          You’ll unlock more as you continue.
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }).map((_, i) => {
            const day = i + 1;
            const isToday = day === p.dayNumber;
            return (
              <button
                key={day}
                type="button"
                onClick={() => (isToday ? router.push("/dashboard?autoplay=today") : null)}
                className={[
                  "h-14 rounded-2xl border flex items-center justify-center gap-2 font-extrabold",
                  isToday
                    ? "border-[color:var(--pink)]/30 bg-[color:var(--pink)]/10 text-white"
                    : "border-white/10 bg-black/20 text-white/55",
                ].join(" ")}
              >
                <span className="tabular-nums">{day}</span>
                {isToday ? <Play size={16} /> : <Lock size={16} />}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
