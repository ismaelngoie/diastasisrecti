"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUserStore } from "@/lib/store/useUserStore";

function AICoreView() {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <div className="absolute w-[86px] h-[86px] border-[3px] border-[color:var(--pink)]/80 rounded-full animate-spin [animation-duration:8s] border-t-transparent border-l-transparent" />
      <div className="absolute w-[120px] h-[120px] border-[2px] border-[color:var(--pink)]/60 rounded-full animate-spin [animation-duration:12s] [animation-direction:reverse] border-b-transparent border-r-transparent" />
      <div className="absolute w-[154px] h-[154px] border-[1px] border-[color:var(--pink)]/40 rounded-full animate-spin [animation-duration:15s] border-t-transparent" />
      <div className="absolute w-10 h-10 bg-[color:var(--pink)]/45 rounded-full blur-md animate-pulse" />
      <div className="absolute w-6 h-6 bg-[color:var(--pink)] rounded-full shadow-[0_0_20px_rgba(230,84,115,0.8)]" />
    </div>
  );
}

function Typewriter({ text }: { text: string }) {
  const [out, setOut] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setOut("");
    if (timerRef.current) window.clearInterval(timerRef.current);

    let i = 0;
    timerRef.current = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 28);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [text]);

  return (
    <span>
      {out}
      <span className="animate-pulse text-[color:var(--pink)]">|</span>
    </span>
  );
}

export default function Step12Analysis({ onDone }: { onDone: () => void }) {
  const name = useUserStore((s) => s.name) || "there";
  const sabotage = useUserStore((s) => s.sabotageExercises);

  const lines = useMemo(() => {
    const base = [
      `Analyzing Linea Alba density for ${name}...`,
      "Calculating Gap Closure trajectory...",
      "Identifying harmful exercises in current routine..."
    ];
    const hasCrunches = (sabotage || []).includes("crunches");
    if (hasCrunches) base.push("Flagging 'Crunches' as dangerous...");
    base.push("Building 12-Week 'No-Crunch' Protocol...");
    base.push("Calibration Complete.");
    return base;
  }, [name, sabotage]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const totalMs = 7000;
    const stepMs = Math.floor(totalMs / Math.max(1, lines.length));

    const t = window.setInterval(() => {
      setIdx((p) => Math.min(lines.length - 1, p + 1));
    }, stepMs);

    const done = window.setTimeout(() => {
      window.clearInterval(t);
      onDone();
    }, totalMs);

    return () => {
      window.clearInterval(t);
      window.clearTimeout(done);
    };
  }, [lines.length, onDone]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div className="mb-10">
        <AICoreView />
      </div>

      <div className="max-w-md">
        <div className="text-white/60 text-xs font-extrabold tracking-widest uppercase mb-3">
          Clinical Analysis
        </div>

        <h1 className="text-3xl font-extrabold text-white leading-tight" style={{ fontFamily: "var(--font-lora)" }}>
          Building your repair plan…
        </h1>

        <div className="mt-6 text-[15px] font-semibold text-white/85 leading-relaxed min-h-[56px]">
          <Typewriter text={lines[idx]} />
        </div>

        <div className="mt-8 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[color:var(--pink)] transition-all duration-300"
            style={{ width: `${Math.min(100, ((idx + 1) / lines.length) * 100)}%` }}
          />
        </div>

        <div className="mt-3 text-[12px] text-white/55 font-semibold">
          Calibration running • This takes ~7 seconds
        </div>
      </div>
    </div>
  );
}
