import React from 'react';
import { cn } from '../../utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          'bg-border',
          orientation === 'horizontal' ? 'h-px w-full border-0' : 'w-px h-full border-0',
          className
        )}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
