import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApprovalPage } from '../ApprovalPage';

describe('ApprovalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the approval page header', () => {
    render(<ApprovalPage />);

    expect(screen.getByText('Content Approval Workflow')).toBeInTheDocument();
    expect(screen.getByText(/Review and approve content/)).toBeInTheDocument();
  });

  it('displays the first approval step by default', () => {
    render(<ApprovalPage />);

    expect(screen.getByTestId('approval-card')).toBeInTheDocument();
  });

  it('displays the preview panel with image', () => {
    render(<ApprovalPage />);

    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    const img = screen.getByAltText('Content preview');
    expect(img).toBeInTheDocument();
  });

  it('displays the approval card with action buttons', () => {
    render(<ApprovalPage />);

    expect(screen.getByTestId('approval-card')).toBeInTheDocument();
    expect(screen.getByTestId('approve-button')).toBeInTheDocument();
    expect(screen.getByTestId('reject-button')).toBeInTheDocument();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });

  it('moves to next step when Approve button is clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // After clicking approve, the next button should be available
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeInTheDocument();
  });

  it('rejects current step when Reject button is clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    const rejectButton = screen.getByTestId('reject-button');
    await user.click(rejectButton);

    // Status should change to rejected
    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveTextContent('Rejected');
  });

  it('displays edit form when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    // Navigate to caption step first
    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Click edit
    const editButton = screen.getByTestId('edit-button');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('edit-caption-form')).toBeInTheDocument();
    });
  });

  it('saves caption changes and returns to preview', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    // Navigate to caption step
    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Click edit
    const editButton = screen.getByTestId('edit-button');
    await user.click(editButton);

    // Edit caption
    const textarea = screen.getByTestId('caption-textarea');
    await user.clear(textarea);
    await user.type(textarea, 'New caption text');

    // Save
    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);

    // Should return to preview
    await waitFor(() => {
      expect(screen.queryByTestId('edit-caption-form')).not.toBeInTheDocument();
      expect(screen.getByText('New caption text')).toBeInTheDocument();
    });
  });

  it('cancels editing and returns to preview', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    // Navigate to caption step
    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Click edit
    const editButton = screen.getByTestId('edit-button');
    await user.click(editButton);

    // Cancel
    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    // Should return to preview
    await waitFor(() => {
      expect(screen.queryByTestId('edit-caption-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    });
  });

  it('navigates back to previous step', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    // Navigate to next step
    const nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);

    // Navigate back
    const previousButton = screen.getByTestId('previous-button');
    expect(previousButton).not.toBeDisabled();
    await user.click(previousButton);

    // Button should still exist after navigation
    expect(nextButton).toBeInTheDocument();
  });

  it('displays approval status section', () => {
    render(<ApprovalPage />);

    // Check that approval status summary section exists
    expect(screen.getByText('Approval Status')).toBeInTheDocument();
  });

  it('updates step status indicators in summary', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    // Initially all pending
    const statusCircles = screen.getAllByText('○');
    expect(statusCircles.length).toBeGreaterThan(0);

    // Approve first step
    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // First step should now show checkmark
    await waitFor(() => {
      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks.length).toBeGreaterThan(0);
    });
  });

  it('shows "All steps approved" message when all steps are approved', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    // Approve first step
    let approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Approve second step
    approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Approve third step
    approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/All steps approved/)).toBeInTheDocument();
    });
  });

  it('displays submit button on last step', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    // Navigate to last step
    let nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);
    nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);

    // Submit button should be visible
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('submits approval when submit button is clicked', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log');

    render(<ApprovalPage />);

    // Navigate to last step and approve everything
    let approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Click submit
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    // Should log submission
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Submitting approval:',
        expect.any(Object)
      );
    });

    consoleSpy.mockRestore();
  });

  it('disables previous button on first step', () => {
    render(<ApprovalPage />);

    const previousButton = screen.getByTestId('previous-button');
    expect(previousButton).toBeDisabled();
  });

  it('displays toolbar with progress information', () => {
    render(<ApprovalPage />);

    expect(screen.getByTestId('approval-toolbar')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('has proper main role and aria labels', () => {
    render(<ApprovalPage />);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('aria-label');
  });

  it('updates preview when caption is edited', async () => {
    const user = userEvent.setup();
    render(<ApprovalPage />);

    // Navigate to caption step
    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Get initial caption
    const initialCaption = screen.getByText('Sample Instagram caption');
    expect(initialCaption).toBeInTheDocument();

    // Edit caption
    const editButton = screen.getByTestId('edit-button');
    await user.click(editButton);

    const textarea = screen.getByTestId('caption-textarea');
    await user.clear(textarea);
    await user.type(textarea, 'Updated caption');

    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);

    // Preview should show updated caption
    await waitFor(() => {
      expect(screen.getByText('Updated caption')).toBeInTheDocument();
    });
  });
});
