// lib/protocolEngine.ts
import type { Commitment, TrackId, UserState } from "@/lib/store/useUserStore";
import { healer16DayLoop, toVideoItems } from "@/lib/videoCatalog";

function localDateISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseAnyDateToLocalStart(input: string | Date) {
  if (input instanceof Date) {
    const x = new Date(input);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  const s = String(input);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    // Treat as local day
    const d = new Date(`${s}T00:00:00`);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const d = new Date(s);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(aISOorFullISO: string, b: Date) {
  const a = parseAnyDateToLocalStart(aISOorFullISO);
  const bb = parseAnyDateToLocalStart(b);
  return Math.max(0, Math.floor((bb.getTime() - a.getTime()) / 86400000));
}

export function minutesFromCommitment(c: Commitment) {
  if (c === "15") return 15;
  if (c === "30") return 30;
  return 5;
}

export type Prescription = {
  dateISO: string;
  track: TrackId;
  dayNumber: number; // 1..16
  phaseName: string;
  why: string;
  minutes: number;
  pressureLabel: "Low Pressure" | "Moderate" | "High";
  videos: { url: string; title: string }[];
  cycleKey: string;
  requiresCheckinToProceed: boolean;
  checkinMilestoneDay: 7 | 14;
};

const PHASES_16: Array<{
  phase: string;
  why: string;
  pressure: Prescription["pressureLabel"];
}> = [
  {
    phase: "Deep Core Wake-Up",
    why: "We re-sync breath + deep core so you can reduce doming and control pressure through the midline.",
    pressure: "Low Pressure",
  },
  {
    phase: "Pressure Control",
    why: "You’ll practice moving without pushing outward—this protects the midline while it adapts.",
    pressure: "Low Pressure",
  },
  {
    phase: "Rib Stack + Canister Control",
    why: "We stack ribs over pelvis to keep your core canister stable during movement.",
    pressure: "Low Pressure",
  },
  {
    phase: "Tissue Tension Primer",
    why: "We introduce slightly more load while keeping form and pressure controlled.",
    pressure: "Moderate",
  },
  {
    phase: "Hip + Pelvis Stability",
    why: "Stable hips reduce strain on your midline and back during daily life.",
    pressure: "Moderate",
  },
  {
    phase: "Breath-Driven Strength",
    why: "Exhale on effort to keep your midline safe under movement.",
    pressure: "Moderate",
  },
  {
    phase: "Checkpoint Prep",
    why: "We reinforce the basics before your next check-in.",
    pressure: "Low Pressure",
  },
  {
    phase: "Integration Day",
    why: "We combine breath + core control + movement in one session.",
    pressure: "Moderate",
  },
  {
    phase: "Load Tolerance",
    why: "We expand what your tissue can tolerate safely—no spikes in pressure.",
    pressure: "Moderate",
  },
  {
    phase: "Anti-Doming Control",
    why: "We reinforce control so your abdomen stays supported under effort.",
    pressure: "Moderate",
  },
  {
    phase: "Posture + Daily Mechanics",
    why: "Better alignment reduces daily strain and supports healing patterns.",
    pressure: "Moderate",
  },
  {
    phase: "Progressive Challenge",
    why: "We progress gradually while keeping the midline protected.",
    pressure: "High",
  },
  {
    phase: "Functional Lifting Prep",
    why: "We train safer mechanics for real life (car seat, groceries, stairs).",
    pressure: "Moderate",
  },
  {
    phase: "Checkpoint Prep",
    why: "We prep your tissue and patterning for the next measurement.",
    pressure: "Low Pressure",
  },
  {
    phase: "Reinforcement",
    why: "Consistency locks in your new pattern—this is where results stack up.",
    pressure: "Moderate",
  },
  {
    phase: "Cycle Completion",
    why: "We finish the loop and reinforce the adaptation. Next day restarts Day 1.",
    pressure: "Moderate",
  },
];

export function getTodaysPrescription(user: UserState): Prescription {
  const today = new Date();
  const dateISO = localDateISO(today);
  const minutes = minutesFromCommitment(user.commitment);

  const join = user.joinDate || new Date().toISOString();
  const daysSinceJoin = daysBetween(join, today);

  const cycleIndex = Math.floor(daysSinceJoin / 16);

  const joinStart = parseAnyDateToLocalStart(join);
  const cycleStart = new Date(joinStart);
  cycleStart.setDate(cycleStart.getDate() + cycleIndex * 16);

  const cycleKey = localDateISO(cycleStart);

  const dayIndex16 = daysSinceJoin % 16; // 0..15
  const dayNumber16 = dayIndex16 + 1;

  // Check-ins at day 7 and 14 (UI uses these to lock Plan)
  const requiresCheckinToProceed = dayNumber16 > 7;
  const checkinMilestoneDay: 7 | 14 = dayNumber16 > 14 ? 14 : 7;

  const urls = healer16DayLoop[dayIndex16] || [];
  const meta = PHASES_16[dayIndex16] || PHASES_16[0];

  return {
    dateISO,
    track: "healer",
    dayNumber: dayNumber16,
    phaseName: meta.phase,
    why: meta.why,
    minutes,
    pressureLabel: meta.pressure,
    videos: toVideoItems(urls),
    cycleKey,
    requiresCheckinToProceed,
    checkinMilestoneDay,
  };
}
