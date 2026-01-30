"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Ban } from "lucide-react";
import {
  pelvicYogaVideos,
  pelvicPilateVideos,
  pelvicStrengthVideos,
  pelvicReleaseVideos,
  extractExerciseName,
} from "@/lib/videoCatalog";

const CATS = [
  { id: "yoga", label: "Mobility & Stretching", urls: pelvicYogaVideos },
  { id: "pilates", label: "Core Control (Pilates)", urls: pelvicPilateVideos },
  { id: "strength", label: "Strength & Endurance", urls: pelvicStrengthVideos },
  { id: "release", label: "Decompression & Recovery", urls: pelvicReleaseVideos },
] as const;

type CatId = (typeof CATS)[number]["id"];

const PAGE_SIZE = 24;

function safeExerciseName(url: string) {
  try {
    const name = extractExerciseName(url);
    return (name || "").trim() || "Exercise";
  } catch {
    return "Exercise";
  }
}

export default function LibraryPage() {
  const [cat, setCat] = useState<CatId>("yoga");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // O(1) category lookup + stable fallback
  const catMap = useMemo(() => {
    const m = new Map<CatId, (typeof CATS)[number]>();
    for (const c of CATS) m.set(c.id, c);
    return m;
  }, []);

  const active = useMemo(() => {
    return catMap.get(cat) ?? CATS[0];
  }, [cat, catMap]);

  // Reset pagination when switching categories
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [cat]);

  // Sanitize URLs
  const urls = useMemo(() => {
    const list = Array.isArray(active.urls) ? active.urls : [];
    return list.map((x) => String(x).trim()).filter(Boolean);
  }, [active.urls]);

  const shown = useMemo(() => urls.slice(0, visibleCount), [urls, visibleCount]);
  const canShowMore = urls.length > shown.length;

  return (
    <main className="flex flex-col gap-5">
      <div>
        <div className="text-white/55 text-[11px] font-extrabold tracking-[0.22em] uppercase">
          Library
        </div>

        <h1
          className="mt-2 text-white text-[26px] leading-[1.08] font-extrabold"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Exercise Library
        </h1>

        <div className="text-white/60 text-[13px] font-semibold mt-2 leading-relaxed">
          Low-pressure options designed to support diastasis recti healing.
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATS.map((c) => {
          const isActive = c.id === cat;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              aria-pressed={isActive}
              className={[
                "px-4 py-2 rounded-full border font-extrabold text-[12px] whitespace-nowrap",
                "active:scale-[0.99] transition-transform",
                isActive
                  ? "border-[color:var(--pink)] bg-[color:var(--pink)]/15 text-white"
                  : "border-white/10 bg-white/6 text-white/70",
              ].join(" ")}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="text-white font-extrabold text-[16px]">{active.label}</div>

        <div className="mt-3 flex flex-col gap-2">
          {shown.map((u) => (
            <div
              key={u}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <div className="text-white/85 text-[13px] font-extrabold">
                {safeExerciseName(u)}
              </div>
              <div className="text-white/45 text-[11px] font-semibold mt-1">
                Low pressure • controlled breathing • stop if coning
              </div>
            </div>
          ))}

          {urls.length === 0 && (
            <div className="text-white/50 text-[12px] font-semibold">
              Add video URLs in{" "}
              <span className="text-white font-extrabold">videoCatalog.ts</span>{" "}
              to populate this list.
            </div>
          )}
        </div>

        {canShowMore && (
          <button
            type="button"
            aria-label="Show more exercises"
            onClick={() => setVisibleCount((n) => Math.min(urls.length, n + PAGE_SIZE))}
            className={[
              "mt-4 w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3",
              "text-white/85 text-[13px] font-extrabold",
              "active:scale-[0.99] transition-transform",
            ].join(" ")}
          >
            Show more ({shown.length}/{urls.length})
          </button>
        )}
      </div>

      {/* Avoid list */}
      <div className="rounded-3xl border border-red-500/18 bg-red-500/10 backdrop-blur-xl shadow-soft p-5">
        <div className="flex items-center gap-2 text-red-100 font-extrabold text-[16px]">
          <Ban className="text-red-200" size={18} />
          High-Pressure Moves to Avoid
        </div>

        <div className="mt-2 text-red-100/75 text-[13px] font-semibold leading-relaxed">
          These often increase intra-abdominal pressure and can worsen coning.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          {["Crunches / Sit-ups", "Heavy Planks", "Aggressive Ab Twists"].map((x) => (
            <div
              key={x}
              className="rounded-2xl border border-red-500/20 bg-black/20 px-4 py-3 flex items-center justify-between"
            >
              <div className="text-red-100 font-extrabold text-[13px]">{x}</div>
              <div className="text-red-200 font-extrabold text-[14px]" aria-hidden="true">
                ✕
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
