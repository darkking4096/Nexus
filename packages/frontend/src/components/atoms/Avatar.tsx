import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 24 | 32 | 40 | 48 | 64;
  initials?: string;
  fallbackBg?: string;
}

const sizeMap = {
  24: 'w-6 h-6 text-xs',
  32: 'w-8 h-8 text-sm',
  40: 'w-10 h-10 text-base',
  48: 'w-12 h-12 text-lg',
  64: 'w-16 h-16 text-2xl',
};

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = 48, initials, fallbackBg = 'bg-primary', src, alt = 'Avatar', ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    if (!src || imageError) {
      return (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white',
            sizeMap[size],
            fallbackBg
          )}
        >
          {initials || (alt?.[0] || '?')}
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        className={cn('rounded-full object-cover', sizeMap[size], className)}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';
