import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  valid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, valid, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            'w-full h-10 px-4 py-3 text-base font-regular rounded-md border-2 transition-colors duration-fast',
            'bg-background-secondary text-text-primary placeholder-text-disabled',
            'focus:outline-none focus:ring-0',
            error ? 'border-error focus:border-error' : valid ? 'border-success focus:border-success' : 'border-border focus:border-primary',
            disabled && 'bg-background-primary text-text-disabled cursor-not-allowed opacity-60',
            (valid || error) && 'pr-10',
            className
          )}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {(valid || error) && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg">
            {valid ? (
              <span className="text-success">✓</span>
            ) : (
              <span className="text-error">✗</span>
            )}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
