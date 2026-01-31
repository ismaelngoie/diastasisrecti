"use client";

import React, { useMemo } from "react";

type ProgressRingProps = {
  pct: number; // 0..100
  labelTop: React.ReactNode;
  labelBottom?: React.ReactNode;
  center?: React.ReactNode;

  // ✅ NEW: lets Dashboard put "Why" next to "Tap to start"
  labelTopRight?: React.ReactNode;

  className?: string;
};

export default function ProgressRing({
  pct,
  labelTop,
  labelBottom,
  center,
  labelTopRight,
  className = "",
}: ProgressRingProps) {
  const clamped = useMemo(() => Math.max(0, Math.min(100, Number(pct) || 0)), [pct]);

  const size = 168;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;
  const gap = c - dash;

  return (
    <div className={["w-full", className].join(" ")}>
      {/* Top row (label + optional right pill) */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-white font-extrabold text-[14px]">{labelTop}</div>
        {labelTopRight ? <div className="shrink-0">{labelTopRight}</div> : null}
      </div>

      {/* Ring */}
      <div className="mt-3 flex items-center justify-center">
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
            {/* track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={stroke}
              fill="transparent"
            />

            {/* progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="rgba(230,84,115,0.95)"
              strokeWidth={stroke}
              fill="transparent"
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeDasharray={`${dash} ${gap}`}
              style={{ transition: "stroke-dasharray 260ms ease-out" }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {center ? (
              center
            ) : (
              <div className="text-center">
                <div className="text-white font-extrabold text-[22px] tabular-nums">
                  {Math.round(clamped)}%
                </div>
                <div className="text-white/45 text-[11px] font-semibold">Progress</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom helper text */}
      {labelBottom ? (
        <div className="mt-3 text-white/55 text-[12px] font-semibold leading-relaxed">
          {labelBottom}
        </div>
      ) : null}
    </div>
  );
}
