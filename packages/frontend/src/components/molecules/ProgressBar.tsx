import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  total: number;
  showLabel?: boolean;
  variant?: 'default' | 'success';
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ current, total, showLabel = true, variant = 'default', className, ...props }, ref) => {
    const percentage = (current / total) * 100;

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-text-secondary">Progress</span>
            <span className="text-xs font-semibold text-text-primary">
              {current} / {total}
            </span>
          </div>
        )}

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-normal',
              variant === 'success' ? 'bg-success' : 'bg-primary'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemin={1}
            aria-valuemax={total}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
