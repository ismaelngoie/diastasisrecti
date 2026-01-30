"use client";
import CoachMia from "@/components/inside/CoachMia";

export default function CoachPage() {
  return (
    <main>
      <div className="text-white/55 text-[11px] font-extrabold tracking-[0.22em] uppercase">
        Coach
      </div>
      <h1 className="mt-2 text-white text-[26px] leading-[1.08] font-extrabold" style={{ fontFamily: "var(--font-lora)" }}>
        Your AI Specialist
      </h1>

      <div className="mt-5">
        <CoachMia />
      </div>
    </main>
  );
}
