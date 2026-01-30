"use client";

import React, { useEffect, useMemo, useState } from "react";

type Particle = {
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

function ParticleSvg() {
  // Minimal “clinical particle” (soft circle + tiny cross highlight)
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="18" fill="currentColor" opacity="0.65" />
      <path
        d="M32 22v20M22 32h20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export default function ButterflyBackground() {
  const [items, setItems] = useState<Particle[]>([]);

  const keyframesCss = useMemo(() => {
    return `
      @keyframes floatUpClean {
        0%   { transform: translateY(115vh) translateX(0px) rotate(0deg) scale(0.95); opacity: 0; }
        10%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { transform: translateY(-20vh) translateX(var(--drift)) rotate(14deg) scale(1.05); opacity: 0; }
      }
    `;
  }, []);

  useEffect(() => {
    const count = 18;
    const arr: Particle[] = Array.from({ length: count }).map((_, i) => {
      const duration = 18 + Math.random() * 20; // 18-38s
      const drift = (Math.random() - 0.5) * 110; // -55..55px
      return {
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 30,
        duration,
        delay: -(Math.random() * duration),
        drift,
        rotation: (Math.random() - 0.5) * 30,
        opacity: 0.10 + Math.random() * 0.18,
        isBehind: Math.random() > 0.55,
      };
    });
    setItems(arr);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <style>{keyframesCss}</style>

      {items.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: 0,
            opacity: p.opacity,
            zIndex: p.isBehind ? 0 : 20,
            transform: `rotate(${p.rotation}deg)`,
            animation: `floatUpClean ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            ["--drift" as any]: `${p.drift}px`,
            // clinical tint
            color: "rgba(200, 235, 255, 0.95)",
          }}
        >
          <ParticleSvg />
        </div>
      ))}
    </div>
  );
}
