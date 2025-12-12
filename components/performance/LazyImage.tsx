'use client';

import * as React from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImageProps, 'placeholder'> {
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Optimized lazy-loading image component
 * Automatically uses Next.js Image optimization with loading states
 */
export function LazyImage({
  src,
  alt,
  fallback,
  className,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div
          className="absolute inset-0 animate-pulse bg-gray-200"
          aria-label="Loading image"
        />
      )}
      <Image
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

