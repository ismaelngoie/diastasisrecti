"use client";

import React, { useEffect, useMemo, useState } from "react";

function actionPhraseFromGoal(userGoal: string) {
  const goal = (userGoal || "").toLowerCase();

  if (goal.includes("intimacy") || goal.includes("sexual")) return "improving intimacy";
  if (goal.includes("leaks") || goal.includes("bladder")) return "improving bladder control";
  if (goal.includes("postpartum") || goal.includes("recover")) return "supporting postpartum recovery";
  if (goal.includes("pregnancy") || goal.includes("prepare")) return "preparing for pregnancy";
  if (goal.includes("pain") || goal.includes("discomfort")) return "easing discomfort";
  if (goal.includes("strength") || goal.includes("stability")) return "building core stability";
  if (goal.includes("diastasis") || goal.includes("dr")) return "healing diastasis";
  return "improving core health";
}

function baseCountForHour(hour: number) {
  // same spirit as your Swift code — time-of-day realism
  if (hour >= 6 && hour <= 9) return rand(150, 220); // morning peak
  if (hour >= 18 && hour <= 21) return rand(150, 220); // evening peak
  if (hour >= 10 && hour <= 17) return rand(80, 120); // work hours
  return rand(15, 40); // night
}

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export default function CommunityPulse({
  userGoal,
  className = "",
}: {
  userGoal: string;
  className?: string;
}) {
  const actionPhrase = useMemo(() => actionPhraseFromGoal(userGoal), [userGoal]);
  const [activeMemberCount, setActiveMemberCount] = useState<number>(0);

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
  }, [actionPhrase]);

  if (activeMemberCount <= 5) return null;

  return (
    <div className={["flex items-center gap-2 mt-1", className].join(" ")}>
      {/* Live dot */}
      <div className="relative w-[14px] h-[14px] shrink-0">
        <div className="absolute inset-0 rounded-full bg-green-500/30 animate-[pulseDot_1.5s_ease-out_infinite]" />
        <div className="absolute left-1/2 top-1/2 w-[8px] h-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500" />
      </div>

      <div className="text-white/55 text-[12px] font-semibold truncate">
        Live: <span className="text-white/70 tabular-nums">{activeMemberCount}</span> members{" "}
        {actionPhrase} right now
      </div>

      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 0.9; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
