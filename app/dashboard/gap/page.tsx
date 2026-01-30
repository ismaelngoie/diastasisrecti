"use client";

import React, { useMemo, useState } from "react";
import GapVisualizer from "@/components/inside/GapVisualizer";
import { FingerGap, TissueDepth, useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";

export default function GapLabPage() {
  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);

  const fingerGap = useUserStore((s) => s.fingerGap);
  const tissueDepth = useUserStore((s) => s.tissueDepth);

  const setFingerGap = useUserStore((s) => s.setFingerGap);
  const setTissueDepth = useUserStore((s) => s.setTissueDepth);
  const addMeasurement = useUserStore((s) => s.addMeasurement);
  const setCheckinDone = useUserStore((s) => s.setCheckinDone);

  const [gap, setGap] = useState<FingerGap>(fingerGap ?? 3);
  const [depth, setDepth] = useState<TissueDepth>(tissueDepth ?? "soft");

  const history = useUserStore((s) => s.measurementHistory);

  const save = () => {
    if (!gap || !depth) return;
    const dateISO = new Date().toISOString().slice(0, 10);

    setFingerGap(gap);
    setTissueDepth(depth);
    addMeasurement({ dateISO, fingerGap: gap, tissueDepth: depth });

    // mark milestone check-in done (7 or 14 depending on where they are)
    setCheckinDone(p.cycleKey, p.checkinMilestoneDay, true);
  };

  return (
    <main className="flex flex-col gap-5">
      <div>
        <div className="text-white/55 text-[11px] font-extrabold tracking-[0.22em] uppercase">
          Gap Lab
        </div>
        <h1 className="mt-2 text-white text-[26px] leading-[1.08] font-extrabold" style={{ fontFamily: "var(--font-lora)" }}>
          Make healing visible
        </h1>
        <div className="text-white/60 text-[13px] font-semibold mt-2 leading-relaxed">
          Enter your finger gap + depth. We’ll unlock progress checkpoints.
        </div>
      </div>

      <GapVisualizer fingerGap={fingerGap} tissueDepth={tissueDepth} />

      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="text-white font-extrabold text-[16px]">New Measurement</div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <select
            value={gap ?? 3}
            onChange={(e) => setGap(Number(e.target.value) as FingerGap)}
            className="h-12 rounded-2xl bg-black/25 border border-white/10 text-white font-semibold px-3"
          >
            <option value={1}>1 finger</option>
            <option value={2}>2 fingers</option>
            <option value={3}>3 fingers</option>
            <option value={4}>4+ fingers</option>
          </select>

          <select
            value={depth ?? "soft"}
            onChange={(e) => setDepth(e.target.value as TissueDepth)}
            className="h-12 rounded-2xl bg-black/25 border border-white/10 text-white font-semibold px-3"
          >
            <option value="firm">Firm</option>
            <option value="soft">Soft</option>
            <option value="pulse">Pulse</option>
          </select>
        </div>

        <button
          onClick={save}
          className="mt-4 w-full h-12 rounded-full bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_60px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform"
        >
          Save Check-in & Unlock
        </button>

        <div className="mt-3 text-white/45 text-[11px] font-semibold">
          Your Plan locks every 7 days until you re-measure.
        </div>
      </div>

      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="text-white font-extrabold text-[16px]">History</div>
        <div className="mt-3 flex flex-col gap-2">
          {history.slice().reverse().slice(0, 10).map((h) => (
            <div key={h.dateISO} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-white font-extrabold text-[13px]">
                {h.dateISO}: {h.fingerGap === 4 ? "4+ fingers" : `${h.fingerGap} fingers`}
              </div>
              <div className="text-white/60 text-[12px] font-semibold mt-1">Depth: {h.tissueDepth}</div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-white/50 text-[12px] font-semibold">No check-ins yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}
