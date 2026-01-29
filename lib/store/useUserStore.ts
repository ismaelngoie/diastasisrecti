import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const USER_STORAGE_KEY = "fixdiastasis_user_data";

export type VisualShape = "pooch" | "gap" | "cone" | null;

export type UserState = {
  // access
  isPremium: boolean;

  // onboarding nav
  onboardingStep: number;

  // answers (we’ll keep adding as we build more screens)
  visualShape: VisualShape;
  name: string;

  // setters
  setPremium: (val: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setVisualShape: (shape: VisualShape) => void;
  setName: (name: string) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isPremium: false,
      onboardingStep: 1,

      visualShape: null,
      name: "",

      setPremium: (val) => set({ isPremium: val }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setVisualShape: (shape) => set({ visualShape: shape }),
      setName: (name) => set({ name })
    }),
    {
      name: USER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
