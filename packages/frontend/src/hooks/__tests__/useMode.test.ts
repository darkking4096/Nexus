import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMode } from '../useMode';

describe('useMode Hook', () => {
  describe('Initialization', () => {
    it('should initialize with default mode as manual', () => {
      const { result } = renderHook(() => useMode());

      expect(result.current.mode).toBe('manual');
      expect(result.current.isManual).toBe(true);
      expect(result.current.isAutopilot).toBe(false);
    });

    it('should initialize with provided initial mode', () => {
      const { result } = renderHook(() => useMode('autopilot'));

      expect(result.current.mode).toBe('autopilot');
      expect(result.current.isManual).toBe(false);
      expect(result.current.isAutopilot).toBe(true);
    });
  });

  describe('setMode', () => {
    it('should change mode to manual', () => {
      const { result } = renderHook(() => useMode('autopilot'));

      act(() => {
        result.current.setMode('manual');
      });

      expect(result.current.mode).toBe('manual');
      expect(result.current.isManual).toBe(true);
      expect(result.current.isAutopilot).toBe(false);
    });

    it('should change mode to autopilot', () => {
      const { result } = renderHook(() => useMode('manual'));

      act(() => {
        result.current.setMode('autopilot');
      });

      expect(result.current.mode).toBe('autopilot');
      expect(result.current.isManual).toBe(false);
      expect(result.current.isAutopilot).toBe(true);
    });

    it('should not update if setting to same mode', () => {
      const { result } = renderHook(() => useMode('manual'));

      const initialMode = result.current.mode;

      act(() => {
        result.current.setMode('manual');
      });

      expect(result.current.mode).toBe(initialMode);
    });
  });

  describe('toggleMode', () => {
    it('should toggle from manual to autopilot', () => {
      const { result } = renderHook(() => useMode('manual'));

      expect(result.current.mode).toBe('manual');

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.mode).toBe('autopilot');
      expect(result.current.isManual).toBe(false);
      expect(result.current.isAutopilot).toBe(true);
    });

    it('should toggle from autopilot to manual', () => {
      const { result } = renderHook(() => useMode('autopilot'));

      expect(result.current.mode).toBe('autopilot');

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.mode).toBe('manual');
      expect(result.current.isManual).toBe(true);
      expect(result.current.isAutopilot).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      const { result } = renderHook(() => useMode('manual'));

      // Toggle to autopilot
      act(() => {
        result.current.toggleMode();
      });
      expect(result.current.mode).toBe('autopilot');

      // Toggle back to manual
      act(() => {
        result.current.toggleMode();
      });
      expect(result.current.mode).toBe('manual');

      // Toggle to autopilot again
      act(() => {
        result.current.toggleMode();
      });
      expect(result.current.mode).toBe('autopilot');
    });
  });

  describe('Mode State Consistency', () => {
    it('should maintain consistency between mode and isManual/isAutopilot', () => {
      const { result } = renderHook(() => useMode('manual'));

      expect(result.current.isManual).toBe(true);
      expect(result.current.isAutopilot).toBe(false);

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.isManual).toBe(false);
      expect(result.current.isAutopilot).toBe(true);
    });

    it('should update flags when mode changes via setMode', () => {
      const { result } = renderHook(() => useMode('manual'));

      act(() => {
        result.current.setMode('autopilot');
      });

      expect(result.current.mode).toBe('autopilot');
      expect(result.current.isManual).toBe(false);
      expect(result.current.isAutopilot).toBe(true);
    });
  });

  describe('Function Stability', () => {
    it('should maintain stable references for functions', () => {
      const { result, rerender } = renderHook(() => useMode());

      const setModeRef = result.current.setMode;
      const toggleModeRef = result.current.toggleMode;

      rerender();

      // Functions should be the same references after re-render
      expect(result.current.setMode).toBe(setModeRef);
      expect(result.current.toggleMode).toBe(toggleModeRef);
    });
  });

  describe('Multiple Hooks', () => {
    it('should handle multiple independent hook instances', () => {
      const { result: hook1 } = renderHook(() => useMode('manual'));
      const { result: hook2 } = renderHook(() => useMode('autopilot'));

      expect(hook1.current.mode).toBe('manual');
      expect(hook2.current.mode).toBe('autopilot');

      act(() => {
        hook1.current.toggleMode();
      });

      expect(hook1.current.mode).toBe('autopilot');
      expect(hook2.current.mode).toBe('autopilot'); // hook2 unchanged
    });
  });

  describe('Type Safety', () => {
    it('should only accept valid mode values', () => {
      const { result } = renderHook(() => useMode());

      // Valid modes
      act(() => {
        result.current.setMode('manual');
      });
      expect(result.current.mode).toBe('manual');

      act(() => {
        result.current.setMode('autopilot');
      });
      expect(result.current.mode).toBe('autopilot');
    });
  });

  describe('Return Value Structure', () => {
    it('should return all required properties and methods', () => {
      const { result } = renderHook(() => useMode());

      expect(result.current).toHaveProperty('mode');
      expect(result.current).toHaveProperty('setMode');
      expect(result.current).toHaveProperty('isManual');
      expect(result.current).toHaveProperty('isAutopilot');
      expect(result.current).toHaveProperty('toggleMode');

      expect(typeof result.current.setMode).toBe('function');
      expect(typeof result.current.toggleMode).toBe('function');
      expect(typeof result.current.isManual).toBe('boolean');
      expect(typeof result.current.isAutopilot).toBe('boolean');
      expect(['manual', 'autopilot']).toContain(result.current.mode);
    });
  });
});
