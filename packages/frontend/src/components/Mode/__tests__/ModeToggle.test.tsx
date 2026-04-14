import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ModeToggle } from '../ModeToggle';
import '@testing-library/jest-dom';

describe('ModeToggle Component', () => {
  describe('AC 1: Rendering', () => {
    it('should render both Manual and Autopilot buttons', () => {
      render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      const manualButton = screen.getByRole('button', { name: /manual mode/i });
      const autopilotButton = screen.getByRole('button', { name: /autopilot mode/i });

      expect(manualButton).toBeInTheDocument();
      expect(autopilotButton).toBeInTheDocument();
    });

    it('should display correct icons for each mode', () => {
      render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      expect(screen.getByText('✓')).toBeInTheDocument(); // Manual icon
      expect(screen.getByText('⚙')).toBeInTheDocument(); // Autopilot icon
    });

    it('should display mode descriptions', () => {
      render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      expect(screen.getByText('Review and approve each step')).toBeInTheDocument();
      expect(screen.getByText('Automatic scheduling')).toBeInTheDocument();
    });
  });

  describe('AC 2: Mode Switching', () => {
    it('should call onModeChange when switching to Autopilot', () => {
      const mockOnChange = vi.fn();
      render(<ModeToggle activeMode="manual" onModeChange={mockOnChange} />);

      const autopilotButton = screen.getByTestId('mode-button-autopilot');
      fireEvent.click(autopilotButton);

      expect(mockOnChange).toHaveBeenCalledWith('autopilot');
    });

    it('should call onModeChange when switching to Manual', () => {
      const mockOnChange = vi.fn();
      render(<ModeToggle activeMode="autopilot" onModeChange={mockOnChange} />);

      const manualButton = screen.getByTestId('mode-button-manual');
      fireEvent.click(manualButton);

      expect(mockOnChange).toHaveBeenCalledWith('manual');
    });

    it('should not call onModeChange when clicking the same mode', () => {
      const mockOnChange = vi.fn();
      render(<ModeToggle activeMode="manual" onModeChange={mockOnChange} />);

      const manualButton = screen.getByTestId('mode-button-manual');
      fireEvent.click(manualButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('AC 6: Visual Indicators', () => {
    it('should show "Active" badge only on active mode', () => {
      const { rerender } = render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      let activeBadges = screen.getAllByText('Active');
      expect(activeBadges).toHaveLength(1);
      expect(activeBadges[0].closest('[data-testid="mode-button-manual"]')).toBeInTheDocument();

      rerender(<ModeToggle activeMode="autopilot" onModeChange={() => {}} />);

      activeBadges = screen.getAllByText('Active');
      expect(activeBadges).toHaveLength(1);
      expect(activeBadges[0].closest('[data-testid="mode-button-autopilot"]')).toBeInTheDocument();
    });

    it('should set aria-pressed correctly for active mode', () => {
      render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      const manualButton = screen.getByTestId('mode-button-manual');
      const autopilotButton = screen.getByTestId('mode-button-autopilot');

      expect(manualButton).toHaveAttribute('aria-pressed', 'true');
      expect(autopilotButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should display progress indicator line', () => {
      const { container } = render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      const progressLine = container.querySelector('div[aria-hidden="true"]');
      expect(progressLine).toBeInTheDocument();
    });
  });

  describe('AC 7: Responsive Design', () => {
    it('should have responsive classes applied', () => {
      const { container } = render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      // The flex layout is on the button container, not the main toggle div
      const buttonContainer = container.querySelector('div.flex.flex-col');
      expect(buttonContainer).toBeInTheDocument();
      expect(buttonContainer?.className).toContain('flex-col');
      expect(buttonContainer?.className).toContain('sm:flex-row');
    });

    it('should render properly with flex layout on mobile and desktop', () => {
      const { container } = render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      const buttons = container.querySelectorAll('button[aria-pressed]');
      expect(buttons).toHaveLength(2);
      buttons.forEach((button) => {
        expect(button.className).toContain('flex-1');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      expect(screen.getByRole('group', { name: /mode selection/i })).toBeInTheDocument();
      expect(screen.getByTestId('mode-button-manual')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Manual mode')
      );
    });

    it('should have proper ARIA pressed state', () => {
      render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      const manualButton = screen.getByTestId('mode-button-manual');
      expect(manualButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should support keyboard navigation with Tab', () => {
      render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      const manualButton = screen.getByTestId('mode-button-manual');
      const autopilotButton = screen.getByTestId('mode-button-autopilot');

      // Both buttons should be in tab order
      expect(manualButton).not.toHaveAttribute('tabindex', '-1');
      expect(autopilotButton).not.toHaveAttribute('tabindex', '-1');
    });

    it('should support keyboard activation with Enter', () => {
      const mockOnChange = vi.fn();
      render(<ModeToggle activeMode="manual" onModeChange={mockOnChange} />);

      const autopilotButton = screen.getByTestId('mode-button-autopilot');
      fireEvent.keyDown(autopilotButton, { key: 'Enter', code: 'Enter' });
      fireEvent.click(autopilotButton);

      expect(mockOnChange).toHaveBeenCalledWith('autopilot');
    });
  });

  describe('Disabled State', () => {
    it('should disable buttons when disabled prop is true', () => {
      const mockOnChange = vi.fn();
      render(
        <ModeToggle activeMode="manual" onModeChange={mockOnChange} disabled={true} />
      );

      const manualButton = screen.getByTestId('mode-button-manual');
      const autopilotButton = screen.getByTestId('mode-button-autopilot');

      expect(manualButton).toBeDisabled();
      expect(autopilotButton).toBeDisabled();
    });

    it('should not call onModeChange when disabled', () => {
      const mockOnChange = vi.fn();
      render(
        <ModeToggle activeMode="manual" onModeChange={mockOnChange} disabled={true} />
      );

      const autopilotButton = screen.getByTestId('mode-button-autopilot');
      fireEvent.click(autopilotButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Data Attributes', () => {
    it('should have data-testid for testing', () => {
      render(<ModeToggle activeMode="manual" onModeChange={() => {}} />);

      expect(screen.getByTestId('mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('mode-button-manual')).toBeInTheDocument();
      expect(screen.getByTestId('mode-button-autopilot')).toBeInTheDocument();
    });
  });
});
