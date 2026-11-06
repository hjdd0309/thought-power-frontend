import { createContext, useContext } from "react";

export const OnboardingContext = createContext(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("OnboardingProvider 안에서 사용해야 해요.");
  return ctx;
}
