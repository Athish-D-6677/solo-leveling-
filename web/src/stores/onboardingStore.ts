import { create } from 'zustand'

interface OnboardingState {
  step: number
  totalSteps: number
  nextStep: () => void
  prevStep: () => void
  resetSteps: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  totalSteps: 5,
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, s.totalSteps - 1) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  resetSteps: () => set({ step: 0 }),
}))
