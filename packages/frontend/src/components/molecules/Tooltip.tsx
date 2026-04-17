import React from 'react';
import { cn } from '../../utils/cn';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayMs?: number;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, side = 'top', delayMs = 200 }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

    const showTooltip = () => {
      timeoutRef.current = setTimeout(() => setIsVisible(true), delayMs);
    };

    const hideTooltip = () => {
      clearTimeout(timeoutRef.current);
      setIsVisible(false);
    };

    const sideClasses = {
      top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
      bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
      left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
      right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
    };

    return (
      <div
        ref={ref}
        className="relative inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}

        {isVisible && (
          <div
            className={cn(
              'absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-md whitespace-nowrap pointer-events-none',
              'animate-fade-in',
              sideClasses[side]
            )}
          >
            {content}
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';
