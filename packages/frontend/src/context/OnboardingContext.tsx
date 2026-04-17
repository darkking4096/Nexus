import React, { createContext, useContext } from 'react';
import { useOnboarding, OnboardingData } from '../hooks/useOnboarding';

interface OnboardingContextType {
  data: OnboardingData;
  error: string | null;
  updateProfileData: (updates: Partial<OnboardingData['profileData']>) => void;
  setInstagramConnected: (handle: string, connected: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => Promise<void>;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export interface OnboardingProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for Onboarding context
 * Wraps components that need access to onboarding state
 */
export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const onboarding = useOnboarding();

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * Hook to access onboarding context
 * Must be used within OnboardingProvider
 */
export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
}
