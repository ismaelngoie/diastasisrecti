"use client";

import React from "react";

export default function ProgressRing({
  pct,
  labelTop,
  labelBottom,
  center,
}: {
  pct: number; // 0..100
  labelTop: string;
  labelBottom?: string;
  center?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));

  const r = 44;
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - clamped / 100);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[110px] h-[110px]">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="12"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="rgba(230,84,115,0.95)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 420ms ease" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          {center ? (
            center
          ) : (
            <div className="text-white font-extrabold text-[22px] tabular-nums">
              {clamped}%
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-white font-extrabold text-[16px] leading-tight">
          {labelTop}
        </div>
        {labelBottom ? (
          <div className="text-white/60 text-[12px] font-semibold mt-1 leading-relaxed">
            {labelBottom}
          </div>
        ) : null}
      </div>
    </div>
  );
}
