import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

const badgeVariants = {
  success: 'bg-green-100 text-green-900 border border-green-300',
  error: 'bg-red-100 text-red-900 border border-red-300',
  warning: 'bg-amber-100 text-amber-900 border border-amber-300',
  info: 'bg-blue-100 text-blue-900 border border-blue-300',
};

const sizes = {
  sm: 'px-3 py-1 text-xs h-7',
  md: 'px-3 py-2 text-xs h-8',
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'info', size = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-full',
          badgeVariants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
