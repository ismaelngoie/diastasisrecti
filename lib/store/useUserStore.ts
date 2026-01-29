import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserState = {
  isPremium: boolean;
  onboardingStep: number;
  setPremium: (val: boolean) => void;
  setOnboardingStep: (step: number) => void;
};

export const USER_STORAGE_KEY = "fixdiastasis_user_data";

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isPremium: false,
      onboardingStep: 1,
      setPremium: (val) => set({ isPremium: val }),
      setOnboardingStep: (step) => set({ onboardingStep: step })
    }),
    {
      name: USER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
