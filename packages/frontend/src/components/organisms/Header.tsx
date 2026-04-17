import React from 'react';
import { cn } from '../../utils/cn';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logoUrl?: string;
  logoAlt?: string;
  title?: string;
  rightContent?: React.ReactNode;
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ logoUrl = '📊', title, rightContent, className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn('bg-background-secondary border-b border-border px-6 py-4', className)}
        {...props}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{logoUrl}</div>
            {title && <h1 className="text-xl font-bold text-text-primary">{title}</h1>}
          </div>

          {rightContent && <div className="flex items-center gap-4">{rightContent}</div>}
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';
