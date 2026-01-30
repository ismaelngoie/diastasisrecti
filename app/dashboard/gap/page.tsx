"use client";

import React, { useMemo, useState } from "react";
import GapVisualizer from "@/components/inside/GapVisualizer";
import { FingerGap, TissueDepth, useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";

function todayISO() {
  // YYYY-MM-DD in local time (safe for “today” display & grouping)
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeGap(v: number): FingerGap {
  if (v <= 1) return 1;
  if (v === 2) return 2;
  if (v === 3) return 3;
  return 4; // treat 4 as "4+"
}

export default function GapLabPage() {
  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);

  const fingerGap = useUserStore((s) => s.fingerGap);
  const tissueDepth = useUserStore((s) => s.tissueDepth);

  const setFingerGap = useUserStore((s) => s.setFingerGap);
  const setTissueDepth = useUserStore((s) => s.setTissueDepth);
  const addMeasurement = useUserStore((s) => s.addMeasurement);
  const setCheckinDone = useUserStore((s) => s.setCheckinDone);

  const history = useUserStore((s) => s.measurementHistory);

  // local form state (so user can preview before saving)
  const [gap, setGap] = useState<FingerGap>(fingerGap ?? 3);
  const [depth, setDepth] = useState<TissueDepth>(tissueDepth ?? "soft");

  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const save = () => {
    if (isSaving) return;

    // Basic guard (types ensure these are valid, but keep it defensive)
    if (!gap || !depth) return;

    setIsSaving(true);
    setJustSaved(false);

    try {
      const dateISO = todayISO();

      setFingerGap(gap);
      setTissueDepth(depth);
      addMeasurement({ dateISO, fingerGap: gap, tissueDepth: depth });

      // Only mark milestone if protocol engine provides the fields
      const cycleKey = p?.cycleKey;
      const milestoneDay = (p as any)?.checkinMilestoneDay;

      if (cycleKey && typeof milestoneDay === "number" && milestoneDay > 0) {
        setCheckinDone(cycleKey, milestoneDay, true);
      }

      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1800);
    } finally {
      setIsSaving(false);
    }
  };

  const recent = useMemo(() => {
    const list = Array.isArray(history) ? history : [];
    return list.slice().reverse().slice(0, 10);
  }, [history]);

  return (
    <main className="flex flex-col gap-5">
      <div>
        <div className="text-white/55 text-[11px] font-extrabold tracking-[0.22em] uppercase">
          Midline Check-in
        </div>

        <h1
          className="mt-2 text-white text-[26px] leading-[1.08] font-extrabold"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Track your midline
        </h1>

        <div className="text-white/60 text-[13px] font-semibold mt-2 leading-relaxed">
          Enter your finger gap + tissue feel. We unlock progress checkpoints every 7 days.
        </div>
      </div>

      {/* ✅ Show the current selected values (not stale store values) */}
      <GapVisualizer fingerGap={gap} tissueDepth={depth} />

      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="text-white font-extrabold text-[16px]">New Check-in</div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="min-w-0">
            <span className="sr-only">Finger gap</span>
            <select
              value={gap}
              onChange={(e) => setGap(normalizeGap(Number(e.target.value)))}
              className="w-full h-12 rounded-2xl bg-black/25 border border-white/10 text-white font-semibold px-3"
            >
              <option value={1}>1 finger</option>
              <option value={2}>2 fingers</option>
              <option value={3}>3 fingers</option>
              <option value={4}>4+ fingers</option>
            </select>
          </label>

          <label className="min-w-0">
            <span className="sr-only">Tissue feel</span>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as TissueDepth)}
              className="w-full h-12 rounded-2xl bg-black/25 border border-white/10 text-white font-semibold px-3"
            >
              <option value="firm">Firm</option>
              <option value="soft">Soft</option>
              <option value="pulse">Pulse</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className={[
            "mt-4 w-full h-12 rounded-full bg-[color:var(--pink)] text-white font-extrabold",
            "shadow-[0_18px_60px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform",
            isSaving ? "opacity-90 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {isSaving ? "Saving..." : "Save Check-in & Unlock"}
        </button>

        <div className="mt-3 text-white/45 text-[11px] font-semibold">
          Your Plan locks every 7 days until you re-measure.
          {justSaved ? (
            <span className="ml-2 text-white/70 font-extrabold">Saved ✅</span>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="text-white font-extrabold text-[16px]">History</div>

        <div className="mt-3 flex flex-col gap-2">
          {recent.map((h, idx) => (
            <div
              key={`${h.dateISO}-${h.fingerGap}-${h.tissueDepth}-${idx}`}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <div className="text-white font-extrabold text-[13px]">
                {h.dateISO}:{" "}
                {h.fingerGap === 4 ? "4+ fingers" : `${h.fingerGap} fingers`}
              </div>
              <div className="text-white/60 text-[12px] font-semibold mt-1">
                Tissue feel: {h.tissueDepth}
              </div>
            </div>
          ))}

          {recent.length === 0 && (
            <div className="text-white/50 text-[12px] font-semibold">
              No check-ins yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
