"use client";

import React from "react";

export type GraphRange = "week" | "month" | "year";

export type GraphPoint = {
  label: string;
  value: number; // 0..1 (can be up to 1.2)
  raw: number; // for tooltip
  isToday?: boolean;
};

export default function ProgressGraph({
  range,
  title,
  points,
  onRangeChange,
}: {
  range: GraphRange;
  title: string;
  points: GraphPoint[];
  onRangeChange: (r: GraphRange) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-white font-extrabold text-[16px] truncate">{title}</div>
          <div className="text-white/55 text-[12px] font-semibold mt-1">
            Bars fill as your day progresses.
          </div>
        </div>

        <div className="shrink-0 flex gap-2">
          {(["week", "month", "year"] as const).map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={[
                  "px-3 py-2 rounded-2xl border text-[11px] font-extrabold tracking-[0.18em] uppercase",
                  active
                    ? "border-pink-brand/25 bg-pink-brand/10 text-white"
                    : "border-white/10 bg-black/20 text-white/70",
                ].join(" ")}
                type="button"
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ Fixed chart layout:
          - each column is h-full
          - bars live inside a flex-1 "bar area" with a real height
          - percent heights now correctly fill upward
      */}
      <div className="mt-4 h-[140px] rounded-2xl border border-white/10 bg-black/20 px-3 py-3 flex items-stretch gap-2">
        {points.map((p, i) => {
          // ✅ if raw says 100, force a true full-height bar
          const v = p.raw >= 100 ? 1 : p.value;
          const h = Math.max(0.06, Math.min(1.2, v)); // allow slight overfill if you want (1.2)

          return (
            <div key={`${p.label}-${i}`} className="flex-1 h-full flex flex-col items-center">
              {/* bar area */}
              <div className="w-full flex-1 min-h-0 flex items-end">
                <div
                  className={[
                    "w-full rounded-xl border transition-all duration-300",
                    p.isToday
                      ? "border-pink-brand/30 bg-pink-brand/14"
                      : "border-white/10 bg-white/6",
                  ].join(" ")}
                  style={{ height: `${Math.min(1, h) * 100}%` }}
                  title={`${p.label}: ${p.raw}`}
                />
              </div>

              {/* label */}
              <div className="mt-2 text-white/50 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                {p.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
