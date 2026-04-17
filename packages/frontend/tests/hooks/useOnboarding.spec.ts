import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '../../src/hooks/useOnboarding';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.data.currentStep).toBe(1);
    expect(result.current.data.profileData.name).toBe('');
    expect(result.current.data.instagramConnected).toBe(false);
    expect(result.current.data.isCompleted).toBe(false);
  });

  it('should load data from localStorage', () => {
    const savedData = {
      profileData: { name: 'John', bio: 'Developer', profilePicture: '' },
      instagramHandle: 'john_doe',
      instagramConnected: true,
      currentStep: 3,
      isCompleted: false,
    };

    localStorage.setItem('onboarding_data', JSON.stringify(savedData));

    const { result } = renderHook(() => useOnboarding());

    expect(result.current.data.profileData.name).toBe('John');
    expect(result.current.data.currentStep).toBe(3);
    expect(result.current.data.instagramConnected).toBe(true);
  });

  it('should update profile data', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.updateProfileData({ name: 'Jane' });
    });

    expect(result.current.data.profileData.name).toBe('Jane');
  });

  it('should navigate between steps', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.data.currentStep).toBe(2);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.data.currentStep).toBe(3);

    act(() => {
      result.current.prevStep();
    });
    expect(result.current.data.currentStep).toBe(2);
  });

  it('should not go below step 1 or above step 5', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.prevStep();
    });
    expect(result.current.data.currentStep).toBe(1);

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.nextStep();
      }
    });
    expect(result.current.data.currentStep).toBe(5);
  });

  it('should jump to specific step', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.goToStep(4);
    });
    expect(result.current.data.currentStep).toBe(4);
  });

  it('should set Instagram connection', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.setInstagramConnected('john_doe', true);
    });

    expect(result.current.data.instagramConnected).toBe(true);
    expect(result.current.data.instagramHandle).toBe('john_doe');
  });

  it('should reset onboarding state', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.updateProfileData({ name: 'Jane' });
      result.current.nextStep();
    });

    expect(result.current.data.profileData.name).toBe('Jane');
    expect(result.current.data.currentStep).toBe(2);

    act(() => {
      result.current.reset();
    });

    expect(result.current.data.profileData.name).toBe('');
    expect(result.current.data.currentStep).toBe(1);
  });

  it('should save to localStorage on update', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.updateProfileData({ name: 'Alice' });
    });

    const saved = localStorage.getItem('onboarding_data');
    expect(saved).toBeDefined();

    if (saved) {
      const data = JSON.parse(saved);
      expect(data.profileData.name).toBe('Alice');
    }
  });
});
