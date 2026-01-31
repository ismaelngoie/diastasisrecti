"use client";

import React from "react";

export default function PreviewRing({
  pct,
  children,
  labelTop,
  labelBottom,
}: {
  pct: number; // 0..100
  children: React.ReactNode;
  labelTop: string;
  labelBottom?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-[200px] h-[200px]">
        <svg viewBox="0 0 140 140" className="w-full h-full">
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="12"
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="rgba(230,84,115,0.95)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90 70 70)"
            style={{
              transition: "stroke-dasharray 700ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="text-white font-extrabold text-[16px] leading-tight">
          {labelTop}
        </div>
        {labelBottom ? (
          <div className="mt-1 text-white/60 text-[12px] font-semibold leading-relaxed">
            {labelBottom}
          </div>
        ) : null}
      </div>
    </div>
  );
}
