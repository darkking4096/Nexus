import React from 'react';
import { Badge, BadgeProps } from '../atoms/Badge';
import { cn } from '../../utils/cn';

export interface BadgeItem {
  id: string;
  label: string;
  variant?: BadgeProps['variant'];
}

export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BadgeItem[];
  onRemove?: (id: string) => void;
}

export const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ items, onRemove, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-2', className)}
        {...props}
      >
        {items.map((item) => (
          <Badge key={item.id} variant={item.variant} className="cursor-pointer">
            {item.label}
            {onRemove && (
              <button
                onClick={() => onRemove(item.id)}
                className="ml-2 hover:opacity-70"
                aria-label={`Remove ${item.label}`}
              >
                ×
              </button>
            )}
          </Badge>
        ))}
      </div>
    );
  }
);

BadgeGroup.displayName = 'BadgeGroup';
