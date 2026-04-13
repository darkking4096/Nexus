import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApprovalCard } from '../ApprovalCard';

describe('ApprovalCard', () => {
  const mockHandlers = {
    onApprove: vi.fn(),
    onReject: vi.fn(),
    onEdit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct title and step', () => {
    render(
      <ApprovalCard
        step="caption"
        title="Add Caption"
        content="Test caption content"
        status="pending"
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Add Caption')).toBeInTheDocument();
    expect(screen.getByText('Step: caption')).toBeInTheDocument();
  });

  it('displays the correct status badge', () => {
    render(
      <ApprovalCard
        step="caption"
        title="Test"
        content="Test content"
        status="approved"
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays content correctly', () => {
    const testContent = 'This is test content';
    render(
      <ApprovalCard
        step="caption"
        title="Test"
        content={testContent}
        status="pending"
        {...mockHandlers}
      />
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('calls onApprove when Approve button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ApprovalCard
        step="caption"
        title="Test"
        content="Test content"
        status="pending"
        {...mockHandlers}
      />
    );

    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    expect(mockHandlers.onApprove).toHaveBeenCalledOnce();
  });

  it('calls onReject when Reject button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ApprovalCard
        step="caption"
        title="Test"
        content="Test content"
        status="pending"
        {...mockHandlers}
      />
    );

    const rejectButton = screen.getByTestId('reject-button');
    await user.click(rejectButton);

    expect(mockHandlers.onReject).toHaveBeenCalledOnce();
  });

  it('calls onEdit when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ApprovalCard
        step="caption"
        title="Test"
        content="Test content"
        status="pending"
        {...mockHandlers}
      />
    );

    const editButton = screen.getByTestId('edit-button');
    await user.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledOnce();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ApprovalCard
        step="caption"
        title="Test Title"
        content="Test content"
        status="pending"
        {...mockHandlers}
      />
    );

    const card = screen.getByTestId('approval-card');
    expect(card).toHaveAttribute('aria-label');
    expect(card.getAttribute('aria-label')).toContain('Test Title');

    const statusBadge = screen.getByRole('status');
    expect(statusBadge).toHaveAttribute('aria-live', 'polite');
  });

  it('displays correct status for different statuses', () => {
    const statuses: Array<'pending' | 'approved' | 'rejected'> = [
      'pending',
      'approved',
      'rejected',
    ];

    statuses.forEach((status) => {
      const { unmount } = render(
        <ApprovalCard
          step="caption"
          title="Test"
          content="Test content"
          status={status}
          {...mockHandlers}
        />
      );

      const statusText = {
        pending: 'Pending Review',
        approved: 'Approved',
        rejected: 'Rejected',
      }[status];

      expect(screen.getByText(statusText)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders as an article element for semantic HTML', () => {
    const { container } = render(
      <ApprovalCard
        step="caption"
        title="Test"
        content="Test content"
        status="pending"
        {...mockHandlers}
      />
    );

    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
  });
});
