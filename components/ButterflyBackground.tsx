"use client";

import React, { useEffect, useMemo, useState } from "react";

type Butterfly = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
  opacity: number;
  isBehind: boolean;
};

function ButterflySvg() {
  // Simple butterfly-like mark (no external image needed)
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <path
        d="M32 33c-4-8-14-16-22-14C4 21 3 28 7 34c4 6 14 7 20 3-1 6-7 16-4 20 3 4 10 0 13-8 3 8 10 12 13 8 3-4-3-14-4-20 6 4 16 3 20-3 4-6 3-13-3-15-8-2-18 6-22 14Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M32 22c2 4 2 9 0 14"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ButterflyBackground() {
  const [items, setItems] = useState<Butterfly[]>([]);

  const keyframesCss = useMemo(() => {
    return `
      @keyframes floatUpClean {
        0%   { transform: translateY(115vh) translateX(0px) rotate(0deg) scale(0.95); opacity: 0; }
        10%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { transform: translateY(-20vh) translateX(var(--drift)) rotate(18deg) scale(1.05); opacity: 0; }
      }
    `;
  }, []);

  useEffect(() => {
    const count = 22;
    const arr: Butterfly[] = Array.from({ length: count }).map((_, i) => {
      const duration = 16 + Math.random() * 18; // 16-34s
      const drift = (Math.random() - 0.5) * 120; // -60..60px
      return {
        id: i,
        left: Math.random() * 100,
        size: 18 + Math.random() * 34,
        duration,
        delay: -(Math.random() * duration),
        drift,
        rotation: (Math.random() - 0.5) * 50,
        opacity: 0.18 + Math.random() * 0.25,
        isBehind: Math.random() > 0.55
      };
    });
    setItems(arr);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <style>{keyframesCss}</style>

      {items.map((b) => (
        <div
          key={b.id}
          className="absolute"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            top: 0,
            opacity: b.opacity,
            zIndex: b.isBehind ? 0 : 20,
            transform: `rotate(${b.rotation}deg)`,
            animation: `floatUpClean ${b.duration}s linear infinite`,
            animationDelay: `${b.delay}s`,
            ["--drift" as any]: `${b.drift}px`,
            // Clinical tint: cool white/blue (less playful)
            color: "rgba(210, 235, 255, 0.95)"
          }}
        >
          <ButterflySvg />
        </div>
      ))}
    </div>
  );
}
