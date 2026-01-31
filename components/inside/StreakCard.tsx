"use client";

import React from "react";
import { Flame, Trophy, Hash } from "lucide-react";

export default function StreakCard({
  current,
  best,
  total,
}: {
  current: number;
  best: number;
  total: number;
}) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
      <div className="text-white font-extrabold text-[16px]">Streaks</div>
      <div className="text-white/55 text-[12px] font-semibold mt-1">
        Keeps you consistent — one day at a time.
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
            Current
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Flame className="text-[color:var(--pink)]" size={16} />
            <div className="text-white font-extrabold text-[18px] tabular-nums">
              {current}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
            Best
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Trophy className="text-white/70" size={16} />
            <div className="text-white font-extrabold text-[18px] tabular-nums">
              {best}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="text-white/45 text-[10px] font-extrabold tracking-[0.22em] uppercase">
            Total
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Hash className="text-white/70" size={16} />
            <div className="text-white font-extrabold text-[18px] tabular-nums">
              {total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
