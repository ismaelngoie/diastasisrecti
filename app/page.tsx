"use client";
import OnboardingWrapper from "./onboarding/OnboardingWrapper";

export default function Home() {
  // Pass full height to wrapper
  return (
    <main className="w-full h-full flex flex-col">
      <OnboardingWrapper />
    </main>
  );
}
