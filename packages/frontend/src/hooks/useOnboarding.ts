import { useState, useEffect } from 'react';

export interface OnboardingData {
  profileData: {
    name: string;
    bio: string;
    profilePicture?: string;
  };
  instagramHandle?: string;
  instagramConnected: boolean;
  currentStep: number;
  isCompleted: boolean;
  completedAt?: string;
}

const INITIAL_STATE: OnboardingData = {
  profileData: { name: '', bio: '', profilePicture: '' },
  instagramHandle: '',
  instagramConnected: false,
  currentStep: 1,
  isCompleted: false,
};

const STORAGE_KEY = 'onboarding_data';

/**
 * Hook to manage onboarding state with localStorage persistence
 * Automatically saves to localStorage on every change
 */
export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [error, setError] = useState<string | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      setError('Failed to save onboarding data');
      console.error('localStorage error:', e);
    }
  }, [data]);

  const updateProfileData = (updates: Partial<OnboardingData['profileData']>) => {
    setData((prev) => ({
      ...prev,
      profileData: { ...prev.profileData, ...updates },
    }));
  };

  const setInstagramConnected = (handle: string, connected: boolean) => {
    setData((prev) => ({
      ...prev,
      instagramHandle: handle,
      instagramConnected: connected,
    }));
  };

  const nextStep = () => {
    setData((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5),
    }));
  };

  const prevStep = () => {
    setData((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const goToStep = (step: number) => {
    setData((prev) => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, 5)),
    }));
  };

  const completeOnboarding = async () => {
    try {
      // Call backend to save profile
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      setData((prev) => ({
        ...prev,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      }));

      // Clear localStorage after successful completion
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      setError('Failed to complete onboarding. Please try again.');
      console.error('Onboarding completion error:', e);
      throw e;
    }
  };

  const reset = () => {
    setData(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  };

  return {
    data,
    error,
    updateProfileData,
    setInstagramConnected,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    reset,
  };
}
