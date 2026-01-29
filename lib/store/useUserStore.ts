import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const USER_STORAGE_KEY = "fixdiastasis_user_data";

export type VisualShape = "pooch" | "gap" | "cone" | null;
export type FingerGap = 1 | 2 | 3 | 4 | null; // 4 = 4+
export type TissueDepth = "firm" | "soft" | "pulse" | null;
export type PostpartumTimeline = "pregnant" | "0-6" | "6-12" | "1-3" | "3+" | null;
export type NavelAssessment = "outie" | "flat" | "no_change" | "hernia" | null;
export type Commitment = "5-7" | "15" | "30" | null;

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

  sabotageExercises: string[]; // multi
  symptoms: string[]; // multi

  postpartumTimeline: PostpartumTimeline;
  navelAssessment: NavelAssessment;

  commitment: Commitment;

  // flags
  highRisk: boolean; // set if "pulse"
  herniaSafe: boolean; // set if hernia selected

  // setters
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
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
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

      setPremium: (val) => set({ isPremium: val }),
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
      setHerniaSafe: (v) => set({ herniaSafe: v })
    }),
    {
      name: USER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
