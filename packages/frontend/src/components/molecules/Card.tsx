import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, header, footer, noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-background-secondary rounded-xl shadow-md border border-border',
          className
        )}
        {...props}
      >
        {header && (
          <div className={cn('border-b border-border', !noPadding && 'px-6 py-4')}>
            {header}
          </div>
        )}

        <div className={!noPadding ? 'px-6 py-4' : ''}>
          {children}
        </div>

        {footer && (
          <div className={cn('border-t border-border', !noPadding && 'px-6 py-4')}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';
