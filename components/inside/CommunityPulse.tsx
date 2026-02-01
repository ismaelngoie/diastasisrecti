"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

function baseCountForHour(hour: number) {
  // time-of-day realism
  if (hour >= 6 && hour <= 9) return rand(150, 220); // morning peak
  if (hour >= 18 && hour <= 21) return rand(150, 220); // evening peak
  if (hour >= 10 && hour <= 17) return rand(80, 120); // work hours
  return rand(15, 40); // night
}

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export default function CommunityPulse({
  // keep prop for compatibility (even if you stop passing it later)
  userGoal,
  className = "",
}: {
  userGoal: string;
  className?: string;
}) {
  const phrase = "moms fixing their tummy";

  const [activeMemberCount, setActiveMemberCount] = useState<number>(0);

  // marquee detection
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);

  const text = useMemo(() => {
    return `Live: ${activeMemberCount} ${phrase} right now`;
  }, [activeMemberCount, phrase]);

  useEffect(() => {
    const updateLogic = () => {
      const hour = new Date().getHours();
      const base = baseCountForHour(hour);

      setActiveMemberCount((prev) => {
        if (prev > 0) {
          const variance = rand(-3, 5);
          return Math.max(5, prev + variance);
        }
        return base;
      });
    };

    updateLogic();
    const id = window.setInterval(updateLogic, 7000);
    return () => window.clearInterval(id);
  }, [userGoal]); // keep dependency to avoid lint noise if prop changes in caller

  useEffect(() => {
    const el = viewportRef.current;
    const measure = measureRef.current;
    if (!el || !measure) return;

    const recompute = () => {
      const vw = el.clientWidth || 0;
      const tw = Math.ceil(measure.getBoundingClientRect().width || 0);
      setShouldMarquee(tw > vw + 2);
    };

    recompute();

    // handle resize / orientation changes
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => recompute());
      ro.observe(el);
    } else {
      window.addEventListener("resize", recompute);
      window.addEventListener("orientationchange", recompute);
    }

    return () => {
      if (ro) ro.disconnect();
      else {
        window.removeEventListener("resize", recompute);
        window.removeEventListener("orientationchange", recompute);
      }
    };
  }, [text]);

  if (activeMemberCount <= 5) return null;

  return (
    <div className={["flex items-center gap-2 mt-1 w-full min-w-0", className].join(" ")}>
      {/* Live dot */}
      <div className="relative w-[14px] h-[14px] shrink-0">
        <div className="absolute inset-0 rounded-full bg-green-500/30 animate-[pulseDot_1.5s_ease-out_infinite]" />
        <div className="absolute left-1/2 top-1/2 w-[8px] h-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500" />
      </div>

      {/* viewport */}
      <div ref={viewportRef} className="min-w-0 flex-1 overflow-hidden">
        {/* hidden measurer (single-line always) */}
        <span
          ref={measureRef}
          className="absolute -z-10 opacity-0 pointer-events-none whitespace-nowrap text-[12px] font-semibold"
        >
          {text}
        </span>

        {!shouldMarquee ? (
          <div className="whitespace-nowrap text-white/55 text-[12px] font-semibold">
            Live:{" "}
            <span className="text-white/70 tabular-nums">{activeMemberCount}</span>{" "}
            {phrase} right now
          </div>
        ) : (
          <div className="relative">
            <div className="flex w-max whitespace-nowrap animate-[marquee_10s_linear_infinite]">
              <div className="text-white/55 text-[12px] font-semibold">
                Live:{" "}
                <span className="text-white/70 tabular-nums">{activeMemberCount}</span>{" "}
                {phrase} right now
              </div>

              {/* gap + duplicate for seamless loop */}
              <div className="w-10" aria-hidden="true" />
              <div className="text-white/55 text-[12px] font-semibold" aria-hidden="true">
                Live:{" "}
                <span className="text-white/70 tabular-nums">{activeMemberCount}</span>{" "}
                {phrase} right now
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 0.9; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
