import React from 'react';
import { cn } from '../../utils/cn';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
  autoCloseDuration?: number; // in ms, 0 to disable
}

const toastStyles = {
  success: 'bg-green-100 text-green-900 border-l-4 border-success',
  error: 'bg-red-100 text-red-900 border-l-4 border-error',
  info: 'bg-blue-100 text-blue-900 border-l-4 border-info',
  warning: 'bg-amber-100 text-amber-900 border-l-4 border-warning',
};

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = 'info', onClose, autoCloseDuration = 5000, className, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (autoCloseDuration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, autoCloseDuration);
        return () => clearTimeout(timer);
      }
    }, [autoCloseDuration, onClose]);

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-md animate-fade-in',
          toastStyles[variant],
          className
        )}
        {...props}
      >
        <span className="text-lg">{icons[variant]}</span>
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="hover:opacity-70 text-lg"
            aria-label="Close toast"
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';
