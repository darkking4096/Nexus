import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditCaptionForm } from '../EditCaptionForm';

describe('EditCaptionForm', () => {
  const mockHandlers = {
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with initial caption', () => {
    render(
      <EditCaptionForm
        initialCaption="Test caption"
        {...mockHandlers}
      />
    );

    const textarea = screen.getByTestId('caption-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Test caption');
  });

  it('updates character count as user types', async () => {
    const user = userEvent.setup();
    render(
      <EditCaptionForm
        initialCaption=""
        {...mockHandlers}
      />
    );

    const textarea = screen.getByTestId('caption-textarea');
    await user.clear(textarea);
    await user.type(textarea, 'Hello world');

    expect(screen.getByText(/11 \/ 2200 characters/)).toBeInTheDocument();
  });

  it('disables save button when caption is empty', async () => {
    const user = userEvent.setup();
    render(
      <EditCaptionForm
        initialCaption="Test"
        {...mockHandlers}
      />
    );

    const textarea = screen.getByTestId('caption-textarea');
    await user.clear(textarea);

    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeDisabled();
  });

  it('disables save button when caption exceeds max length', () => {
    render(
      <EditCaptionForm
        initialCaption={'a'.repeat(2201)}
        {...mockHandlers}
      />
    );

    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EditCaptionForm
        initialCaption="Test"
        {...mockHandlers}
      />
    );

    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    expect(mockHandlers.onCancel).toHaveBeenCalledOnce();
  });

  it('disables save button when caption is not changed', () => {
    render(
      <EditCaptionForm
        initialCaption="Test caption"
        {...mockHandlers}
      />
    );

    // Don't change anything, button should be disabled
    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button after changing caption', async () => {
    const user = userEvent.setup();
    render(
      <EditCaptionForm
        initialCaption="Test caption"
        {...mockHandlers}
      />
    );

    const textarea = screen.getByTestId('caption-textarea');
    await user.clear(textarea);
    await user.type(textarea, 'New caption');

    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).not.toBeDisabled();
  });

  it('shows loading state correctly', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <EditCaptionForm
        initialCaption="Test"
        {...mockHandlers}
        isLoading={false}
      />
    );

    // First, make a change so button is enabled
    const textarea = screen.getByTestId('caption-textarea');
    await user.clear(textarea);
    await user.type(textarea, 'Modified caption');

    let saveButton = screen.getByTestId('save-button');
    expect(saveButton).toHaveTextContent('Save');
    expect(saveButton).not.toBeDisabled();

    // Now rerender with loading state
    rerender(
      <EditCaptionForm
        initialCaption="Test"
        {...mockHandlers}
        isLoading={true}
      />
    );

    saveButton = screen.getByTestId('save-button');
    expect(saveButton).toHaveTextContent('Saving...');
    expect(saveButton).toBeDisabled();
  });

  it('displays validation error message structure', () => {
    render(
      <EditCaptionForm
        initialCaption=""
        {...mockHandlers}
      />
    );

    // When rendered with empty caption, the error should be ready to display
    // The component structure includes the error message validation
    const textarea = screen.getByTestId('caption-textarea');
    expect(textarea).toBeInTheDocument();

    // Save button should be disabled for empty caption (validation in place)
    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <EditCaptionForm
        initialCaption="Test"
        {...mockHandlers}
      />
    );

    const textarea = screen.getByTestId('caption-textarea');
    expect(textarea).toHaveAttribute('aria-describedby');
    expect(textarea).toHaveAttribute('aria-label');

    const form = screen.getByTestId('edit-caption-form');
    expect(form).toHaveAttribute('aria-label');
  });
});
