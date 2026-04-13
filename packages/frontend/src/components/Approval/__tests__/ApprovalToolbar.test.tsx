import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApprovalToolbar } from '../ApprovalToolbar';

describe('ApprovalToolbar', () => {
  const mockHandlers = {
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the toolbar component', () => {
    render(
      <ApprovalToolbar
        currentStep={0}
        totalSteps={3}
        canGoBack={false}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId('approval-toolbar')).toBeInTheDocument();
  });

  it('displays correct step counter', () => {
    render(
      <ApprovalToolbar
        currentStep={0}
        totalSteps={3}
        canGoBack={false}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('displays correct progress percentage', () => {
    render(
      <ApprovalToolbar
        currentStep={1}
        totalSteps={4}
        canGoBack={true}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    // Step 2 of 4 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays progress bar with correct aria attributes', () => {
    render(
      <ApprovalToolbar
        currentStep={2}
        totalSteps={5}
        canGoBack={true}
        canGoForward={false}
        {...mockHandlers}
      />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays all step indicators', () => {
    render(
      <ApprovalToolbar
        currentStep={1}
        totalSteps={4}
        canGoBack={true}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    // Should display 4 steps
    const stepIndicators = screen.getAllByText(/^Step \d+$/);
    expect(stepIndicators).toHaveLength(4);
  });

  it('marks completed steps with checkmark', () => {
    render(
      <ApprovalToolbar
        currentStep={2}
        totalSteps={4}
        canGoBack={true}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    // Steps 0 and 1 should be completed (marked with ✓)
    // Get all checkmarks in the toolbar
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks.length).toBeGreaterThanOrEqual(2); // At least 2 checkmarks for completed steps
  });

  it('disables previous button when canGoBack is false', () => {
    render(
      <ApprovalToolbar
        currentStep={0}
        totalSteps={3}
        canGoBack={false}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    const previousButton = screen.getByTestId('previous-button');
    expect(previousButton).toBeDisabled();
  });

  it('enables previous button when canGoBack is true', () => {
    render(
      <ApprovalToolbar
        currentStep={1}
        totalSteps={3}
        canGoBack={true}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    const previousButton = screen.getByTestId('previous-button');
    expect(previousButton).not.toBeDisabled();
  });

  it('disables next button when canGoForward is false', () => {
    render(
      <ApprovalToolbar
        currentStep={2}
        totalSteps={3}
        canGoBack={true}
        canGoForward={false}
        {...mockHandlers}
      />
    );

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('enables next button when canGoForward is true', () => {
    render(
      <ApprovalToolbar
        currentStep={0}
        totalSteps={3}
        canGoBack={false}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onPrevious when previous button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ApprovalToolbar
        currentStep={1}
        totalSteps={3}
        canGoBack={true}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    const previousButton = screen.getByTestId('previous-button');
    await user.click(previousButton);

    expect(mockHandlers.onPrevious).toHaveBeenCalledOnce();
  });

  it('calls onNext when next button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ApprovalToolbar
        currentStep={0}
        totalSteps={3}
        canGoBack={false}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    const nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);

    expect(mockHandlers.onNext).toHaveBeenCalledOnce();
  });

  it('displays submit button only on last step', () => {
    const { rerender } = render(
      <ApprovalToolbar
        currentStep={1}
        totalSteps={3}
        canGoBack={true}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();

    rerender(
      <ApprovalToolbar
        currentStep={2}
        totalSteps={3}
        canGoBack={true}
        canGoForward={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('calls onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ApprovalToolbar
        currentStep={2}
        totalSteps={3}
        canGoBack={true}
        canGoForward={false}
        {...mockHandlers}
      />
    );

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    expect(mockHandlers.onSubmit).toHaveBeenCalledOnce();
  });

  it('shows "Submitting..." text when isSubmitting is true', () => {
    render(
      <ApprovalToolbar
        currentStep={2}
        totalSteps={3}
        canGoBack={true}
        canGoForward={false}
        {...mockHandlers}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Submitting...');
    expect(submitButton).toBeDisabled();
  });

  it('disables all buttons when isSubmitting is true', () => {
    render(
      <ApprovalToolbar
        currentStep={1}
        totalSteps={3}
        canGoBack={true}
        canGoForward={true}
        {...mockHandlers}
        isSubmitting={true}
      />
    );

    const previousButton = screen.getByTestId('previous-button');
    const nextButton = screen.getByTestId('next-button');

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('has proper navigation aria-label', () => {
    render(
      <ApprovalToolbar
        currentStep={0}
        totalSteps={3}
        canGoBack={false}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label');
  });

  it('displays keyboard shortcuts help text', () => {
    render(
      <ApprovalToolbar
        currentStep={0}
        totalSteps={3}
        canGoBack={false}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Previous.*Next/)).toBeInTheDocument();
  });

  it('renders as a nav element for semantic HTML', () => {
    render(
      <ApprovalToolbar
        currentStep={0}
        totalSteps={3}
        canGoBack={false}
        canGoForward={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('calculates progress for different step positions', () => {
    const testCases = [
      { current: 0, total: 4, expected: '25%' },
      { current: 1, total: 4, expected: '50%' },
      { current: 2, total: 4, expected: '75%' },
      { current: 3, total: 4, expected: '100%' },
    ];

    testCases.forEach(({ current, total, expected }) => {
      const { unmount } = render(
        <ApprovalToolbar
          currentStep={current}
          totalSteps={total}
          canGoBack={current > 0}
          canGoForward={current < total - 1}
          {...mockHandlers}
        />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });
});
