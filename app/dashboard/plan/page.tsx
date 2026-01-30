"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";

export default function PlanPage() {
  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);

  const checkins = useUserStore((s) => s.checkins);
  const cycleKey = p.cycleKey;

  const day7Done = !!checkins[`${cycleKey}:7`];
  const day14Done = !!checkins[`${cycleKey}:14`];

  const currentDay = p.track === "healer" ? p.dayNumber : 1;

  const lockedAfter7 = currentDay > 7 && !day7Done;
  const lockedAfter14 = currentDay > 14 && !day14Done;

  return (
    <main className="flex flex-col gap-5">
      <div>
        <div className="text-white/55 text-[11px] font-extrabold tracking-[0.22em] uppercase">
          Plan
        </div>
        <h1
          className="mt-2 text-white text-[26px] leading-[1.08] font-extrabold"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          Your Roadmap
        </h1>
        <div className="text-white/60 text-[13px] font-semibold mt-2 leading-relaxed">
          Milestones every 7 days. Re-measure your midline to unlock the next phase safely.
        </div>
      </div>

      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="text-white font-extrabold text-[15px]">
          Phase 1 — Tissue Conditioning (Days 1–16)
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {[...Array(16)].map((_, i) => {
            const day = i + 1;
            const isMilestone = day === 7 || day === 14;

            const locked = (day > 7 && !day7Done) || (day > 14 && !day14Done);
            const isCurrent = day === currentDay;

            return (
              <div
                key={day}
                className={[
                  "rounded-2xl border px-4 py-3 flex items-center justify-between",
                  "bg-black/20 border-white/10",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <div className="text-white font-extrabold text-[13px]">
                    Day {day}{isMilestone ? " — Midline Check-in" : ""}
                  </div>

                  {isMilestone && (
                    <div className="text-white/60 text-[12px] font-semibold mt-1">
                      Re-measure your finger gap + tissue feel to unlock progression.
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {isMilestone ? (
                    (day === 7 ? day7Done : day14Done) ? (
                      <CheckCircle2 className="text-[#33B373]" />
                    ) : (
                      <Link
                        href="/dashboard/gap"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[color:var(--pink)]/18 border border-[color:var(--pink)]/25"
                      >
                        <AlertTriangle size={16} className="text-[color:var(--pink)]" />
                        <span className="text-white text-[11px] font-extrabold">Re-measure</span>
                      </Link>
                    )
                  ) : locked ? (
                    <div className="inline-flex items-center gap-2 text-white/50">
                      <Lock size={16} />
                      <span className="text-[11px] font-extrabold">Locked</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="text-white text-[11px] font-extrabold px-3 py-2 rounded-full bg-white/8 border border-white/10">
                      Today
                    </div>
                  ) : (
                    <div className="text-white/35 text-[11px] font-extrabold">Upcoming</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {(lockedAfter7 || lockedAfter14) && (
          <div className="mt-4 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3">
            <div className="text-yellow-100 font-extrabold text-[13px]">Progress Lock Active</div>
            <div className="text-yellow-100/75 text-[12px] font-semibold mt-1">
              Complete your Midline Check-in to proceed safely.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
