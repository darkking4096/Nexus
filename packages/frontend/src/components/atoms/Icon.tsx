import React from 'react';
import { cn } from '../../utils/cn';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  variant?: 'info' | 'success' | 'error' | 'warning' | 'help' | 'close';
  size?: 16 | 24 | 32 | 48;
}

const iconColors = {
  info: '#3b82f6',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  help: '#6366f1',
  close: '#1a202c',
};

const sizeMap = {
  16: 'w-4 h-4',
  24: 'w-6 h-6',
  32: 'w-8 h-8',
  48: 'w-12 h-12',
};

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ variant = 'info', size = 24, className, ...props }, ref) => {
    const iconContent = {
      info: <circle cx="12" cy="12" r="10" />,
      success: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />,
      error: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />,
      warning: <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />,
      help: <circle cx="12" cy="12" r="10" />,
      close: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />,
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(sizeMap[size], className)}
        style={{ color: iconColors[variant] }}
        {...props}
      >
        {iconContent[variant]}
      </svg>
    );
  }
);

Icon.displayName = 'Icon';
