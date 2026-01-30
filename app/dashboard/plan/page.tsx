"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";

const DAYS_IN_PHASE = 16;
const MILESTONES = [7, 14] as const;

export default function PlanPage() {
  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);

  // ✅ Safely read checkins (don’t assume store shape is always initialized)
  const checkins = useUserStore(
    (s) => (s.checkins ?? {}) as Record<string, boolean | undefined>
  );

  // ✅ Guard against missing cycleKey
  const cycleKey = useMemo(() => {
    const raw = (p as any)?.cycleKey;
    return raw ? String(raw) : "cycle";
  }, [p]);

  const checkinKey = (day: number) => `${cycleKey}:${day}`;

  const day7Done = !!checkins[checkinKey(7)];
  const day14Done = !!checkins[checkinKey(14)];

  // ✅ Fix current day logic: use dayNumber safely
  const rawDayNumber =
    typeof (p as any)?.dayNumber === "number" && Number.isFinite((p as any).dayNumber)
      ? ((p as any).dayNumber as number)
      : 1;

  // Clamp for display within Phase 1 list, but keep raw for lock rules
  const currentDay = Math.min(DAYS_IN_PHASE, Math.max(1, rawDayNumber));

  // ✅ Lock warning banner logic uses raw day (if user is past milestone and didn’t check in)
  const lockedAfter7 = rawDayNumber > 7 && !day7Done;
  const lockedAfter14 = rawDayNumber > 14 && !day14Done;

  const days = useMemo(
    () => Array.from({ length: DAYS_IN_PHASE }, (_, i) => i + 1),
    []
  );

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
          {days.map((day) => {
            const isMilestone = MILESTONES.includes(day as any);

            // Locked rule:
            // - Days 8+ locked until day 7 check-in done
            // - Days 15+ locked until day 14 check-in done
            const locked = (day > 7 && !day7Done) || (day > 14 && !day14Done);

            const isToday = day === currentDay;
            const isPast = day < currentDay;

            const milestoneDone = day === 7 ? day7Done : day === 14 ? day14Done : false;

            // Day 14 check-in should not be actionable unless Day 7 check-in is done
            const milestoneActionAllowed =
              day === 7 ? true : day === 14 ? day7Done : false;

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
                    Day {day}
                    {isMilestone ? " — Midline Check-in" : ""}
                  </div>

                  {isMilestone && (
                    <div className="text-white/60 text-[12px] font-semibold mt-1">
                      Re-measure your finger gap + tissue feel to unlock progression.
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {/* ✅ Milestone state */}
                  {isMilestone ? (
                    milestoneDone ? (
                      <div className="inline-flex items-center gap-2 text-white/70">
                        <CheckCircle2 size={18} className="text-[#33B373]" />
                        <span className="text-[11px] font-extrabold">Completed</span>
                      </div>
                    ) : milestoneActionAllowed ? (
                      <Link
                        href="/dashboard/gap"
                        aria-label={`Re-measure for day ${day} check-in`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[color:var(--pink)]/18 border border-[color:var(--pink)]/25"
                      >
                        <AlertTriangle
                          size={16}
                          className="text-[color:var(--pink)]"
                        />
                        <span className="text-white text-[11px] font-extrabold">
                          Re-measure
                        </span>
                      </Link>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-white/50">
                        <Lock size={16} />
                        <span className="text-[11px] font-extrabold">Locked</span>
                      </div>
                    )
                  ) : locked ? (
                    /* ✅ Locked state */
                    <div className="inline-flex items-center gap-2 text-white/50">
                      <Lock size={16} />
                      <span className="text-[11px] font-extrabold">Locked</span>
                    </div>
                  ) : isToday ? (
                    /* ✅ Today state */
                    <div className="text-white text-[11px] font-extrabold px-3 py-2 rounded-full bg-white/8 border border-white/10">
                      Today
                    </div>
                  ) : isPast ? (
                    /* ✅ Past state (not necessarily “done”, but no longer upcoming) */
                    <div className="text-white/55 text-[11px] font-extrabold">
                      Past
                    </div>
                  ) : (
                    /* ✅ Upcoming state */
                    <div className="text-white/35 text-[11px] font-extrabold">
                      Upcoming
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {(lockedAfter7 || lockedAfter14) && (
          <div className="mt-4 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3">
            <div className="text-yellow-100 font-extrabold text-[13px]">
              Progress Lock Active
            </div>
            <div className="text-yellow-100/75 text-[12px] font-semibold mt-1">
              Complete your Midline Check-in to proceed safely.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
