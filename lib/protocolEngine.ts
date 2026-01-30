import type { Commitment, TrackId, UserState } from "@/lib/store/useUserStore";
import {
  healer16DayLoop,
  drySealChallenge7Day,
  pelvicPainRelease7Day,
  pelvicReleaseVideos,
  toVideoItems
} from "@/lib/videoCatalog";

function startOfDayISO(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

function daysBetween(aISO: string, b: Date) {
  const a = new Date(aISO);
  const bb = new Date(b);
  a.setHours(0, 0, 0, 0);
  bb.setHours(0, 0, 0, 0);
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
  dayNumber: number; // 1..16 or 1..7 for challenge
  phaseName: string;
  why: string;
  minutes: number;
  pressureLabel: "Low Pressure" | "Moderate" | "High";
  videos: { url: string; title: string }[];
  cycleKey: string; // used for check-ins gating
  requiresCheckinToProceed: boolean;
  checkinMilestoneDay: 7 | 14;
};

const PHASES_16: Array<{ phase: string; why: string; pressure: Prescription["pressureLabel"] }> = [
  { phase: "Neuromuscular Awakening", why: "We wake up the deep core (TA) and re-sync breath + pelvic floor.", pressure: "Low Pressure" },
  { phase: "Pressure Control", why: "You’ll learn to reduce outward pressure so the midline can heal.", pressure: "Low Pressure" },
  { phase: "Rib Stack + Core Canister", why: "We stack ribs over pelvis to stop coning and improve tension.", pressure: "Low Pressure" },
  { phase: "Tissue Tension Primer", why: "We introduce slightly more load while protecting the linea alba.", pressure: "Moderate" },
  { phase: "Glute + Pelvis Stability", why: "Stable hips reduce strain on your midline and back.", pressure: "Moderate" },
  { phase: "Breath-Driven Strength", why: "Exhale on effort to keep your core safe under movement.", pressure: "Moderate" },
  { phase: "Clinical Check-in Prep", why: "We stabilize patterns before re-measurement.", pressure: "Low Pressure" },
  { phase: "Integration Day", why: "We combine breath + deep core + movement.", pressure: "Moderate" },
  { phase: "Load Tolerance", why: "We expand what your tissue can tolerate safely.", pressure: "Moderate" },
  { phase: "Anti-Coning Control", why: "We reinforce control so the belly stays flat under effort.", pressure: "Moderate" },
  { phase: "Posture + Canister Strength", why: "Better posture reduces daily strain and helps closure.", pressure: "Moderate" },
  { phase: "Progressive Challenge", why: "We progress gradually without spikes in pressure.", pressure: "High" },
  { phase: "Functional Lifting Prep", why: "We train safe mechanics for real life (baby, groceries).", pressure: "Moderate" },
  { phase: "Clinical Check-in Prep", why: "We prep your tissue for the next measurement.", pressure: "Low Pressure" },
  { phase: "Reinforcement", why: "We lock in the new pattern with consistency.", pressure: "Moderate" },
  { phase: "Cycle Completion", why: "We complete the loop and solidify the adaptation.", pressure: "Moderate" }
];

function inferTrack(user: UserState): TrackId {
  const hasLeaks = (user.symptoms || []).includes("incontinence");
  const hasPain = (user.symptoms || []).includes("pelvicPain");

  // Track priority: Dry Seal challenge first, then Release, else Healer
  // (Dry Seal is a “challenge overlay” per your iOS logic)
  if (hasLeaks) return "drySeal";
  if (hasPain) return "release";
  return "healer";
}

export function getTodaysPrescription(user: UserState): Prescription {
  const today = new Date();
  const dateISO = startOfDayISO(today);
  const minutes = minutesFromCommitment(user.commitment);

  const join = user.joinDate || new Date().toISOString();
  const daysSinceJoin = daysBetween(join, today);

  // 16-day cycle math
  const cycleIndex = Math.floor(daysSinceJoin / 16);
  const cycleStart = new Date(join);
  cycleStart.setHours(0, 0, 0, 0);
  cycleStart.setDate(cycleStart.getDate() + cycleIndex * 16);
  const cycleKey = startOfDayISO(cycleStart);

  const dayIndex16 = daysSinceJoin % 16; // 0..15
  const dayNumber16 = dayIndex16 + 1;

  // check-ins at day 7 and day 14 (gating)
  const requiresCheckinToProceed = dayNumber16 > 7;
  const checkinMilestoneDay: 7 | 14 = dayNumber16 > 14 ? 14 : 7;

  // challenge logic (7-day)
  const track = inferTrack(user);

  // If leaks: run 7-day dry seal challenge until completed; then return to healer loop
  const hasLeaks = (user.symptoms || []).includes("incontinence");
  const drySealComplete = hasLeaks && Object.keys(user.drySealCompletedDays || {}).filter((k) => user.drySealCompletedDays[Number(k)]).length >= 7;

  if (track === "drySeal" && hasLeaks && !drySealComplete) {
    const startedAt = user.drySealStartedAtISO || user.joinDate || new Date().toISOString();
    const challengeDayIndex = Math.min(6, daysBetween(startedAt, today)); // 0..6
    const dayNumber = challengeDayIndex + 1;

    const urls = drySealChallenge7Day[challengeDayIndex] || [];
    return {
      dateISO,
      track: "drySeal",
      dayNumber,
      phaseName: `Dry Seal — Day ${dayNumber}`,
      why: "We’re retraining pelvic floor timing to stop leaks during sneezing, lifting, and impact.",
      minutes,
      pressureLabel: "Low Pressure",
      videos: toVideoItems(urls),
      cycleKey,
      requiresCheckinToProceed: false,
      checkinMilestoneDay: 7
    };
  }

  // If pelvic pain: use pelvicPainRelease7Day if provided; else fallback to pelvicReleaseVideos pool
  if (track === "release") {
    const releaseDayIndex = Math.min(6, dayIndex16); // keep it stable
    const urls = pelvicPainRelease7Day[releaseDayIndex]?.length
      ? pelvicPainRelease7Day[releaseDayIndex]
      : pelvicReleaseVideos.slice(0, 3); // fallback “safe swap set”

    return {
      dateISO,
      track: "release",
      dayNumber: releaseDayIndex + 1,
      phaseName: `Pelvic Release — Day ${releaseDayIndex + 1}`,
      why: "We reduce guarding and improve hip + pelvic mobility before loading strength.",
      minutes,
      pressureLabel: "Low Pressure",
      videos: toVideoItems(urls),
      cycleKey,
      requiresCheckinToProceed: false,
      checkinMilestoneDay: 7
    };
  }

  // Default: Healer 16-day loop
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
    checkinMilestoneDay
  };
}
