import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const USER_STORAGE_KEY = "fixdiastasis_user_data";

export type VisualShape = "pooch" | "gap" | "cone" | null;
export type FingerGap = 1 | 2 | 3 | 4 | null; // 4 = 4+
export type TissueDepth = "firm" | "soft" | "pulse" | null;
export type PostpartumTimeline = "pregnant" | "0-6" | "6-12" | "1-3" | "3+" | null;
export type NavelAssessment = "outie" | "flat" | "no_change" | "hernia" | null;
export type Commitment = "5-7" | "15" | "30" | null;

export type TrackId = "healer" | "drySeal" | "release";

export type HabitId = "log_roll" | "exhale_before_lift";

export type MeasurementEntry = {
  dateISO: string; // YYYY-MM-DD
  fingerGap: Exclude<FingerGap, null>;
  tissueDepth: Exclude<TissueDepth, null>;
};

export type PainLogEntry = {
  ts: string; // full ISO
  dateISO: string;
  currentVideoUrl: string;
  swappedToUrl: string;
  note?: string;
};

export type WorkoutCompletion = {
  dateISO: string;
  track: TrackId;
  dayNumber: number; // 1..16 or 1..7 for challenges
  completedAtISO: string;
};

export type UserState = {
  // access
  isPremium: boolean;
  joinDate: string | null;

  // onboarding nav
  onboardingStep: number;

  // answers
  visualShape: VisualShape;
  name: string;
  age: number;
  fingerGap: FingerGap;
  tissueDepth: TissueDepth;
  sabotageExercises: string[];
  symptoms: string[];
  postpartumTimeline: PostpartumTimeline;
  navelAssessment: NavelAssessment;
  commitment: Commitment;

  // flags
  highRisk: boolean;
  herniaSafe: boolean;

  // inside-app state
  hasSeenBridge: boolean;

  // daily habits by date
  habitsByDate: Record<string, Partial<Record<HabitId, boolean>>>;

  // measurements + check-ins
  measurementHistory: MeasurementEntry[];
  checkins: Record<string, boolean>; // key = `${cycleKey}:${milestoneDay}` e.g. "2026-01-01:7"

  // challenges (7-day)
  drySealStartedAtISO: string | null; // when challenge began
  drySealCompletedDays: Record<number, boolean>; // 1..7

  // logs
  painLogs: PainLogEntry[];
  workoutCompletions: WorkoutCompletion[];

  // setters (existing)
  setPremium: (val: boolean) => void;
  setJoinDate: (iso: string | null) => void;
  setOnboardingStep: (step: number) => void;

  setVisualShape: (shape: VisualShape) => void;
  setName: (name: string) => void;
  setAge: (age: number) => void;
  setFingerGap: (gap: FingerGap) => void;
  setTissueDepth: (depth: TissueDepth) => void;
  setSabotageExercises: (arr: string[]) => void;
  setSymptoms: (arr: string[]) => void;
  setPostpartumTimeline: (v: PostpartumTimeline) => void;
  setNavelAssessment: (v: NavelAssessment) => void;
  setCommitment: (v: Commitment) => void;
  setHighRisk: (v: boolean) => void;
  setHerniaSafe: (v: boolean) => void;

  // inside setters
  setHasSeenBridge: (v: boolean) => void;

  setHabitDone: (dateISO: string, habit: HabitId, done: boolean) => void;

  addMeasurement: (entry: MeasurementEntry) => void;
  setCheckinDone: (cycleKey: string, milestoneDay: number, done: boolean) => void;

  startDrySeal: () => void;
  setDrySealDayDone: (day: number, done: boolean) => void;

  addPainLog: (entry: PainLogEntry) => void;
  addWorkoutCompletion: (entry: WorkoutCompletion) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      joinDate: null,

      onboardingStep: 1,

      visualShape: null,

      name: "",
      age: 30,

      fingerGap: null,
      tissueDepth: null,

      sabotageExercises: [],
      symptoms: [],

      postpartumTimeline: null,
      navelAssessment: null,

      commitment: "5-7",

      highRisk: false,
      herniaSafe: false,

      // inside
      hasSeenBridge: false,
      habitsByDate: {},
      measurementHistory: [],
      checkins: {},

      drySealStartedAtISO: null,
      drySealCompletedDays: {},

      painLogs: [],
      workoutCompletions: [],

      // existing setters
      setPremium: (val) => {
        // when unlocking premium, also reset bridge so they see the Protocol Generator
        set({ isPremium: val, hasSeenBridge: val ? false : get().hasSeenBridge });
      },
      setJoinDate: (iso) => set({ joinDate: iso }),

      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setVisualShape: (shape) => set({ visualShape: shape }),
      setName: (name) => set({ name }),
      setAge: (age) => set({ age }),
      setFingerGap: (gap) => set({ fingerGap: gap }),
      setTissueDepth: (depth) => set({ tissueDepth: depth }),
      setSabotageExercises: (arr) => set({ sabotageExercises: arr }),
      setSymptoms: (arr) => set({ symptoms: arr }),
      setPostpartumTimeline: (v) => set({ postpartumTimeline: v }),
      setNavelAssessment: (v) => set({ navelAssessment: v }),
      setCommitment: (v) => set({ commitment: v }),
      setHighRisk: (v) => set({ highRisk: v }),
      setHerniaSafe: (v) => set({ herniaSafe: v }),

      // inside setters
      setHasSeenBridge: (v) => set({ hasSeenBridge: v }),

      setHabitDone: (dateISO, habit, done) =>
        set((s) => ({
          habitsByDate: {
            ...s.habitsByDate,
            [dateISO]: { ...(s.habitsByDate[dateISO] || {}), [habit]: done }
          }
        })),

      addMeasurement: (entry) =>
        set((s) => ({
          measurementHistory: [
            // replace same-day entry if exists
            ...s.measurementHistory.filter((x) => x.dateISO !== entry.dateISO),
            entry
          ].sort((a, b) => a.dateISO.localeCompare(b.dateISO))
        })),

      setCheckinDone: (cycleKey, milestoneDay, done) =>
        set((s) => ({
          checkins: { ...s.checkins, [`${cycleKey}:${milestoneDay}`]: done }
        })),

      startDrySeal: () => {
        const iso = new Date().toISOString();
        if (!get().drySealStartedAtISO) set({ drySealStartedAtISO: iso });
      },

      setDrySealDayDone: (day, done) =>
        set((s) => ({
          drySealCompletedDays: { ...s.drySealCompletedDays, [day]: done }
        })),

      addPainLog: (entry) => set((s) => ({ painLogs: [entry, ...s.painLogs].slice(0, 200) })),

      addWorkoutCompletion: (entry) =>
        set((s) => ({
          workoutCompletions: [
            // de-dupe by date
            ...s.workoutCompletions.filter((x) => x.dateISO !== entry.dateISO),
            entry
          ].sort((a, b) => a.dateISO.localeCompare(b.dateISO))
        }))
    }),
    {
      name: USER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
