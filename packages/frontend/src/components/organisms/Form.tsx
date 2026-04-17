import React from 'react';
import { Button } from '../atoms/Button';
import { cn } from '../../utils/cn';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  submitLoading?: boolean;
  submitDisabled?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  layout?: 'vertical' | 'horizontal';
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    {
      onSubmit,
      submitLabel = 'Submit',
      submitLoading = false,
      submitDisabled = false,
      cancelLabel,
      onCancel,
      layout = 'vertical',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={cn(
          layout === 'vertical' ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6',
          className
        )}
        {...props}
      >
        <div className={layout === 'vertical' ? '' : 'md:col-span-full'}>{children}</div>

        <div className={cn('flex gap-3', layout === 'vertical' ? '' : 'md:col-span-full')}>
          <Button
            type="submit"
            variant="primary"
            loading={submitLoading}
            disabled={submitDisabled || submitLoading}
            className="flex-1"
          >
            {submitLabel}
          </Button>

          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
              {cancelLabel || 'Cancel'}
            </Button>
          )}
        </div>
      </form>
    );
  }
);

Form.displayName = 'Form';
