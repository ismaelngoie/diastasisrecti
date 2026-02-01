"use client";

import React, { useMemo } from "react";

export default function ProgressRing({
  pct,
  labelTop,
  labelBottom,
  labelTopRight,
  center,
}: {
  pct: number; // 0..100
  labelTop: string;
  labelBottom?: string;
  labelTopRight?: React.ReactNode;
  center?: React.ReactNode;
}) {
  const clamped = useMemo(() => Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0)), [pct]);

  const size = 228;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-white font-extrabold text-[15px] leading-tight break-words">
            {labelTop}
          </div>
          {labelBottom ? (
            <div className="mt-1 text-white/55 text-[12px] font-semibold leading-snug break-words">
              {labelBottom}
            </div>
          ) : null}
        </div>

        {labelTopRight ? <div className="shrink-0">{labelTopRight}</div> : null}
      </div>

      <div className="mt-4 w-full flex justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="absolute inset-0 pointer-events-none">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={stroke}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="rgba(230,84,115,0.95)"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${dash} ${c - dash}`}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray 300ms ease" }}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            {center ? (
              center
            ) : (
              <div className="text-white font-extrabold text-[18px] tabular-nums">
                {Math.round(clamped)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
