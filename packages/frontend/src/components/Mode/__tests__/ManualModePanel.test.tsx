import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ManualModePanel } from '../ManualModePanel';
import '@testing-library/jest-dom';

describe('ManualModePanel Component', () => {
  describe('AC 3: Manual Mode Panel Display', () => {
    it('should render approval workflow with all steps', () => {
      render(<ManualModePanel currentStep="research" />);

      const expectedSteps = ['Research', 'Analysis', 'Caption', 'Visual', 'Publish'];
      expectedSteps.forEach((step) => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('should display step descriptions', () => {
      render(<ManualModePanel currentStep="research" />);

      expect(screen.getByText('Gather content inspiration and references')).toBeInTheDocument();
      expect(screen.getByText('Analyze trends and audience insights')).toBeInTheDocument();
      expect(screen.getByText('Generate and review caption')).toBeInTheDocument();
      expect(screen.getByText('Create and design visual content')).toBeInTheDocument();
      expect(screen.getByText('Review and approve for publishing')).toBeInTheDocument();
    });

    it('should display workflow icons', () => {
      render(<ManualModePanel currentStep="research" />);

      expect(screen.getByText('🔍')).toBeInTheDocument(); // Research
      expect(screen.getByText('📊')).toBeInTheDocument(); // Analysis
      expect(screen.getByText('✏️')).toBeInTheDocument(); // Caption
      expect(screen.getByText('🎨')).toBeInTheDocument(); // Visual
      expect(screen.getByText('📤')).toBeInTheDocument(); // Publish
    });
  });

  describe('AC 3: Current Step Tracking', () => {
    it('should highlight current step', () => {
      render(<ManualModePanel currentStep="analysis" />);

      const analysisStep = screen.getByTestId('workflow-step-analysis');
      expect(analysisStep).toHaveClass('bg-blue-50', 'border-blue-500');
    });

    it('should show pending status for future steps', () => {
      render(<ManualModePanel currentStep="caption" />);

      const publishStatus = screen.getByTestId('workflow-step-publish').querySelector('[role="status"]');
      expect(publishStatus).toHaveTextContent('Pending');
    });

    it('should show approved status for completed steps', () => {
      render(<ManualModePanel currentStep="caption" />);

      const researchStatus = screen.getByTestId('workflow-step-research').querySelector('[role="status"]');
      expect(researchStatus).toHaveTextContent('✓ Approved');
    });

    it('should display progress bar with correct percentage', () => {
      const { rerender } = render(<ManualModePanel currentStep="research" />);

      let progressText = screen.getByText('20%');
      expect(progressText).toBeInTheDocument();

      rerender(<ManualModePanel currentStep="caption" />);

      progressText = screen.getByText('60%');
      expect(progressText).toBeInTheDocument();
    });

    it('should display step counter', () => {
      render(<ManualModePanel currentStep="analysis" />);

      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    });
  });

  describe('Step Actions', () => {
    it('should show action buttons only for current step', () => {
      render(<ManualModePanel currentStep="research" />);

      const researchActions = screen.getByTestId('workflow-step-research').querySelector('[role="group"]');
      expect(researchActions).toBeInTheDocument();

      const analysisStep = screen.getByTestId('workflow-step-analysis');
      expect(analysisStep.querySelector('[role="group"]')).not.toBeInTheDocument();
    });

    it('should call onStepAction with approve action', () => {
      const mockOnAction = vi.fn();
      render(<ManualModePanel currentStep="research" onStepAction={mockOnAction} />);

      const approveButton = screen.getByTestId('action-approve-research');
      fireEvent.click(approveButton);

      expect(mockOnAction).toHaveBeenCalledWith('research', 'approve');
    });

    it('should call onStepAction with edit action', () => {
      const mockOnAction = vi.fn();
      render(<ManualModePanel currentStep="research" onStepAction={mockOnAction} />);

      const editButton = screen.getByTestId('action-edit-research');
      fireEvent.click(editButton);

      expect(mockOnAction).toHaveBeenCalledWith('research', 'edit');
    });

    it('should call onStepAction with reject action', () => {
      const mockOnAction = vi.fn();
      render(<ManualModePanel currentStep="research" onStepAction={mockOnAction} />);

      const rejectButton = screen.getByTestId('action-reject-research');
      fireEvent.click(rejectButton);

      expect(mockOnAction).toHaveBeenCalledWith('research', 'reject');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ManualModePanel currentStep="research" />);

      expect(screen.getByRole('group', { name: /Actions for Research step/i })).toBeInTheDocument();
    });

    it('should have aria-current on current step', () => {
      render(<ManualModePanel currentStep="analysis" />);

      const analysisStep = screen.getByTestId('workflow-step-analysis');
      expect(analysisStep).toHaveAttribute('aria-current', 'step');
    });

    it('should have proper progress bar ARIA attributes', () => {
      render(<ManualModePanel currentStep="caption" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '3');
      expect(progressBar).toHaveAttribute('aria-valuemin', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '5');
    });

    it('should have proper status role for step status indicators', () => {
      render(<ManualModePanel currentStep="research" />);

      const statusElements = screen.getAllByRole('status');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      render(<ManualModePanel currentStep="research" />);

      const approveButton = screen.getByTestId('action-approve-research');
      const editButton = screen.getByTestId('action-edit-research');
      const rejectButton = screen.getByTestId('action-reject-research');

      expect(approveButton).not.toHaveAttribute('tabindex', '-1');
      expect(editButton).not.toHaveAttribute('tabindex', '-1');
      expect(rejectButton).not.toHaveAttribute('tabindex', '-1');
    });

    it('should support keyboard activation with Enter key', () => {
      const mockOnAction = vi.fn();
      render(<ManualModePanel currentStep="research" onStepAction={mockOnAction} />);

      const approveButton = screen.getByTestId('action-approve-research');
      fireEvent.keyDown(approveButton, { key: 'Enter', code: 'Enter' });
      fireEvent.click(approveButton);

      expect(mockOnAction).toHaveBeenCalledWith('research', 'approve');
    });
  });

  describe('Disabled State', () => {
    it('should not show action buttons when disabled', () => {
      render(<ManualModePanel currentStep="research" disabled={true} />);

      const researchStep = screen.getByTestId('workflow-step-research');
      expect(researchStep.querySelector('[role="group"]')).not.toBeInTheDocument();
    });

    it('should not call action callbacks when disabled', () => {
      const mockOnAction = vi.fn();
      render(<ManualModePanel currentStep="research" onStepAction={mockOnAction} disabled={true} />);

      const actionButtons = screen.queryAllByTestId(/action-/);
      expect(actionButtons).toHaveLength(0);
    });
  });

  describe('Data Attributes', () => {
    it('should have data-testid for testing', () => {
      render(<ManualModePanel currentStep="research" />);

      expect(screen.getByTestId('manual-mode-panel')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-step-research')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-step-analysis')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-step-caption')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-step-visual')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-step-publish')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should handle multiple step transitions', () => {
      const mockOnAction = vi.fn();
      const { rerender } = render(
        <ManualModePanel currentStep="research" onStepAction={mockOnAction} />
      );

      // Approve research
      fireEvent.click(screen.getByTestId('action-approve-research'));
      expect(mockOnAction).toHaveBeenCalledWith('research', 'approve');

      // Move to analysis
      rerender(<ManualModePanel currentStep="analysis" onStepAction={mockOnAction} />);
      expect(screen.getByTestId('workflow-step-research')).toHaveClass('bg-green-50');
      expect(screen.getByTestId('workflow-step-analysis')).toHaveClass('bg-blue-50');

      // Approve analysis
      fireEvent.click(screen.getByTestId('action-approve-analysis'));
      expect(mockOnAction).toHaveBeenCalledWith('analysis', 'approve');
    });

    it('should display correct progress through workflow', () => {
      const steps: Array<'research' | 'analysis' | 'caption' | 'visual' | 'publish'> = [
        'research',
        'analysis',
        'caption',
        'visual',
        'publish',
      ];

      steps.forEach((step, index) => {
        const { unmount } = render(<ManualModePanel currentStep={step} />);

        const expectedPercentage = ((index + 1) / steps.length) * 100;
        expect(screen.getByText(`${Math.round(expectedPercentage)}%`)).toBeInTheDocument();
        expect(screen.getByText(`Step ${index + 1} of 5`)).toBeInTheDocument();

        unmount();
      });
    });
  });
});
