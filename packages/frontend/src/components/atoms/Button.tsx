import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-primary text-white hover:bg-primary-dark active:scale-95 disabled:bg-primary-light disabled:cursor-not-allowed',
  secondary: 'bg-gray-200 text-text-primary hover:bg-gray-300 active:scale-95 disabled:bg-gray-100 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-primary border border-primary hover:bg-blue-50 active:scale-95 disabled:text-primary-light disabled:border-primary-light disabled:cursor-not-allowed',
  danger: 'bg-error text-white hover:bg-red-700 active:scale-95 disabled:bg-red-300 disabled:cursor-not-allowed',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-base', // 48px touch-friendly
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-normal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          buttonVariants[variant],
          sizes[size],
          loading && 'opacity-70 cursor-wait',
          disabled && 'opacity-60',
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
