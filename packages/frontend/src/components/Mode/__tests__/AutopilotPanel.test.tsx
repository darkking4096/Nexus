import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AutopilotPanel } from '../AutopilotPanel';
import '@testing-library/jest-dom';

describe('AutopilotPanel Component', () => {
  const defaultConfig = {
    enabled: false,
    days: ['MON', 'WED', 'FRI'],
    times: ['09:00', '17:00'],
  };

  describe('AC 4: Autopilot Panel Display', () => {
    it('should render schedule configuration form', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      expect(screen.getByText(/Autopilot Schedule/i)).toBeInTheDocument();
      expect(screen.getByText(/Configure automatic content publishing/i)).toBeInTheDocument();
    });

    it('should display all days of week buttons', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      daysOfWeek.forEach((day) => {
        // Day buttons show abbreviated form (2 chars)
        const dayButton = screen.getByTestId(`day-toggle-${day}`);
        expect(dayButton).toBeInTheDocument();
      });
    });

    it('should display time input fields', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      // Time inputs are retrieved by test ID
      const timeElements = screen.getAllByTestId(/time-input-/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('should display frequency calculation', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      // 3 days * 2 times = 6x per week
      expect(screen.getByText('6x per week')).toBeInTheDocument();
    });
  });

  describe('AC 5: Autopilot Enable/Disable', () => {
    it('should render enable/disable toggle', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      const toggle = screen.getByTestId('autopilot-toggle');
      expect(toggle).toBeInTheDocument();
    });

    it('should show "Disabled" label when disabled', () => {
      render(<AutopilotPanel config={{ ...defaultConfig, enabled: false }} />);

      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });

    it('should show "Enabled" label when enabled', () => {
      render(<AutopilotPanel config={{ ...defaultConfig, enabled: true }} />);

      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    it('should call onToggleEnabled when toggled', () => {
      const mockToggle = vi.fn();
      render(
        <AutopilotPanel
          config={defaultConfig}
          onToggleEnabled={mockToggle}
        />
      );

      const toggle = screen.getByTestId('autopilot-toggle');
      fireEvent.click(toggle);

      expect(mockToggle).toHaveBeenCalledWith(true);
    });

    it('should display status indicator when enabled', () => {
      render(<AutopilotPanel config={{ ...defaultConfig, enabled: true }} />);

      expect(
        screen.getByText(/Autopilot is active. Content will be published automatically/)
      ).toBeInTheDocument();
    });

    it('should not display status indicator when disabled', () => {
      render(<AutopilotPanel config={{ ...defaultConfig, enabled: false }} />);

      expect(
        screen.queryByText(/Autopilot is active. Content will be published automatically/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Day Selection', () => {
    it('should toggle day selection', () => {
      const mockOnChange = vi.fn();
      const configEnabled = { ...defaultConfig, enabled: true };
      render(
        <AutopilotPanel
          config={configEnabled}
          onConfigChange={mockOnChange}
        />
      );

      // TUE is not selected initially (only MON, WED, FRI are selected)
      const tueButton = screen.getByTestId('day-toggle-TUE');
      expect(tueButton).toHaveAttribute('aria-pressed', 'false');

      // Click to select TUE
      fireEvent.click(tueButton);

      // After clicking, the button should have aria-pressed="true"
      expect(tueButton).toHaveAttribute('aria-pressed', 'true');

      // Verify the callback was called with TUE included
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          days: expect.arrayContaining(['TUE']),
        })
      );
    });

    it('should display selected days with correct styling', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      const wedButton = screen.getByTestId('day-toggle-WED');
      const tueButton = screen.getByTestId('day-toggle-TUE');

      expect(wedButton).toHaveClass('bg-purple-500');
      expect(tueButton).not.toHaveClass('bg-purple-500');
    });

    it('should disable day buttons when Autopilot is disabled', () => {
      render(<AutopilotPanel config={{ ...defaultConfig, enabled: false }} />);

      const dayButtons = screen.getAllByTestId(/day-toggle-/);
      dayButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Time Selection', () => {
    it('should display time input fields with correct values', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      const timeInputs = screen.getAllByTestId(/time-input-/);
      expect(timeInputs[0]).toHaveValue('09:00');
      expect(timeInputs[1]).toHaveValue('17:00');
    });

    it('should update time when changed', () => {
      const mockOnChange = vi.fn();
      render(
        <AutopilotPanel
          config={defaultConfig}
          onConfigChange={mockOnChange}
        />
      );

      const timeInput = screen.getByTestId('time-input-0');
      fireEvent.change(timeInput, { target: { value: '10:00' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should allow adding new time slots', () => {
      const mockOnChange = vi.fn();
      const configEnabled = { ...defaultConfig, enabled: true };
      render(
        <AutopilotPanel
          config={configEnabled}
          onConfigChange={mockOnChange}
        />
      );

      const addButton = screen.getByTestId('add-time-button');
      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should allow removing time slots', () => {
      const mockOnChange = vi.fn();
      const configWith3Times = {
        ...defaultConfig,
        enabled: true,
        times: ['09:00', '12:00', '17:00'],
      };
      render(
        <AutopilotPanel
          config={configWith3Times}
          onConfigChange={mockOnChange}
        />
      );

      const removeButtons = screen.getAllByTestId(/remove-time-/);
      fireEvent.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should disable add time button when max times reached', () => {
      const configWithMaxTimes = {
        ...defaultConfig,
        times: ['08:00', '10:00', '12:00', '14:00', '16:00'],
      };
      render(<AutopilotPanel config={configWithMaxTimes} />);

      const addButton = screen.getByTestId('add-time-button');
      expect(addButton).toBeDisabled();
    });

    it('should hide remove button if only one time slot', () => {
      const configWithOneTime = {
        ...defaultConfig,
        times: ['09:00'],
      };
      render(<AutopilotPanel config={configWithOneTime} />);

      const removeButtons = screen.queryAllByTestId(/remove-time-/);
      expect(removeButtons).toHaveLength(0);
    });

    it('should disable time inputs when Autopilot is disabled', () => {
      render(<AutopilotPanel config={{ ...defaultConfig, enabled: false }} />);

      const timeInputs = screen.getAllByTestId(/time-input-/);
      timeInputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Frequency Calculation', () => {
    it('should calculate frequency correctly', () => {
      const testCases = [
        {
          config: { ...defaultConfig, days: ['MON'], times: ['09:00'] },
          expectedFrequency: '1x per week',
        },
        {
          config: { ...defaultConfig, days: ['MON', 'WED', 'FRI'], times: ['09:00'] },
          expectedFrequency: '3x per week',
        },
        {
          config: { ...defaultConfig, days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], times: ['09:00', '17:00'] },
          expectedFrequency: '14x per week',
        },
        {
          config: { ...defaultConfig, days: [], times: ['09:00'] },
          expectedFrequency: '0x per week',
        },
      ];

      testCases.forEach(({ config, expectedFrequency }) => {
        const { unmount } = render(<AutopilotPanel config={config} />);
        expect(screen.getByText(expectedFrequency)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for toggle', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      const toggle = screen.getByTestId('autopilot-toggle');
      expect(toggle).toHaveAttribute('aria-label', expect.stringContaining('Enable or disable'));
    });

    it('should have proper ARIA labels for day buttons', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      const dayButton = screen.getByTestId('day-toggle-MON');
      expect(dayButton).toHaveAttribute('aria-pressed');
    });

    it('should have proper ARIA labels for time inputs', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      const timeInputs = screen.getAllByTestId(/time-input-/);
      expect(timeInputs[0]).toHaveAttribute('aria-label', expect.stringContaining('Publication time'));
    });

    it('should have fieldset and legend for form sections', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      expect(screen.getByText(/Days of Publication/)).toBeInTheDocument();
      expect(screen.getByText(/Publication Times/)).toBeInTheDocument();
    });

    it('should have proper status role for status indicator', () => {
      render(<AutopilotPanel config={{ ...defaultConfig, enabled: true }} />);

      const statusDiv = screen.getByRole('status');
      expect(statusDiv).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      const toggle = screen.getByTestId('autopilot-toggle');
      const dayButtons = screen.getAllByTestId(/day-toggle-/);
      const addButton = screen.getByTestId('add-time-button');

      expect(toggle).not.toHaveAttribute('tabindex', '-1');
      dayButtons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
      expect(addButton).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Disabled State', () => {
    it('should disable all controls when disabled prop is true', () => {
      render(<AutopilotPanel config={{ ...defaultConfig, enabled: true }} disabled={true} />);

      const toggle = screen.getByTestId('autopilot-toggle');
      const dayButtons = screen.getAllByTestId(/day-toggle-/);
      const timeInputs = screen.getAllByTestId(/time-input-/);
      const addButton = screen.getByTestId('add-time-button');

      expect(toggle).toBeDisabled();
      dayButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
      timeInputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
      expect(addButton).toBeDisabled();
    });
  });

  describe('Data Attributes', () => {
    it('should have data-testid for testing', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      expect(screen.getByTestId('autopilot-panel')).toBeInTheDocument();
      expect(screen.getByTestId('autopilot-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('add-time-button')).toBeInTheDocument();
    });
  });

  describe('Next Publication Time Display', () => {
    it('should display next publication time if provided', () => {
      const configWithNextTime = {
        ...defaultConfig,
        nextPublishTime: '2026-04-15T09:00:00Z',
      };
      render(<AutopilotPanel config={configWithNextTime} />);

      expect(screen.getByText(/Next publish:/i)).toBeInTheDocument();
    });

    it('should not display next publication time if not provided', () => {
      render(<AutopilotPanel config={defaultConfig} />);

      expect(screen.queryByText(/Next publish:/i)).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should handle configuration changes correctly', () => {
      const mockOnChange = vi.fn();
      const configEnabled = {
        ...defaultConfig,
        enabled: true,
      };
      render(
        <AutopilotPanel
          config={configEnabled}
          onConfigChange={mockOnChange}
        />
      );

      // Initial frequency should be 6x per week (3 days * 2 times)
      expect(screen.getByText('6x per week')).toBeInTheDocument();

      // Toggle a day (TUE is not in default config which has MON, WED, FRI)
      const tueButton = screen.getByTestId('day-toggle-TUE');
      fireEvent.click(tueButton);

      // Verify callback was called
      expect(mockOnChange).toHaveBeenCalled();

      // After toggling TUE, it should be included in the last call
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
      expect(lastCall[0].days).toContain('TUE');
    });

    it('should handle enable/disable and configuration changes together', () => {
      const mockOnToggle = vi.fn();
      const mockOnChange = vi.fn();
      render(
        <AutopilotPanel
          config={defaultConfig}
          onToggleEnabled={mockOnToggle}
          onConfigChange={mockOnChange}
        />
      );

      const toggle = screen.getByTestId('autopilot-toggle');
      fireEvent.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledWith(true);
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});
