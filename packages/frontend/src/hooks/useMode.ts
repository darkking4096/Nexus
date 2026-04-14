import { useState, useCallback } from 'react';

export type Mode = 'manual' | 'autopilot';

export interface UseModeReturn {
  mode: Mode;
  setMode: (newMode: Mode) => void;
  isManual: boolean;
  isAutopilot: boolean;
  toggleMode: () => void;
}

/**
 * Custom hook to manage Manual/Autopilot mode state
 * Provides mode switching logic with only one active mode at a time
 */
export const useMode = (initialMode: Mode = 'manual'): UseModeReturn => {
  const [mode, setModeState] = useState<Mode>(initialMode);

  const setMode = useCallback((newMode: Mode) => {
    if (newMode !== mode) {
      setModeState(newMode);
    }
  }, [mode]);

  const toggleMode = useCallback(() => {
    setModeState((currentMode) => (currentMode === 'manual' ? 'autopilot' : 'manual'));
  }, []);

  return {
    mode,
    setMode,
    isManual: mode === 'manual',
    isAutopilot: mode === 'autopilot',
    toggleMode,
  };
};
