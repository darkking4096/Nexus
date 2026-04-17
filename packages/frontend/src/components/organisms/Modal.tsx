import React from 'react';
import { cn } from '../../utils/cn';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      footer,
      closeOnEscape = true,
      closeOnBackdropClick = true,
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (closeOnEscape && e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity duration-fast',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={closeOnBackdropClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="relative flex items-center justify-center h-full p-4">
          <div
            ref={ref}
            className={cn(
              'bg-background-secondary rounded-lg shadow-xl w-full animate-fade-in',
              sizeClasses[size],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            {...props}
          >
            {/* Header */}
            {title && (
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 id="modal-title" className="text-xl font-bold text-text-primary">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-text-secondary hover:text-text-primary transition-colors text-2xl leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-border bg-background-primary rounded-b-lg">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
