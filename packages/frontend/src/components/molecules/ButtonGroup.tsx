import React from 'react';
import { Button, ButtonProps } from '../atoms/Button';
import { cn } from '../../utils/cn';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  buttons: (ButtonProps & { id: string; label: React.ReactNode })[];
  vertical?: boolean;
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ buttons, vertical = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3',
          vertical ? 'flex-col' : 'flex-row',
          className
        )}
        {...props}
      >
        {buttons.map(({ id, label, ...buttonProps }) => (
          <Button key={id} {...buttonProps} className="flex-1">
            {label}
          </Button>
        ))}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';
