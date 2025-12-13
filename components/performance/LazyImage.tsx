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

  // Determine if we should use fill mode (when no explicit dimensions provided)
  const hasWidth = 'width' in props;
  const hasHeight = 'height' in props;
  const hasFill = 'fill' in props;
  const shouldUseFill = !hasWidth && !hasHeight && !hasFill;

  // Separate dimension props from other props
  const { fill: propsFill, width: propsWidth, height: propsHeight, ...restProps } = props;

  // Build image props based on what was provided
  const imageProps = {
    src,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      className
    ),
    onLoad: () => setIsLoading(false),
    onError: () => {
      setIsLoading(false);
      setError(true);
    },
    loading: 'lazy' as const,
    ...restProps,
    // Add dimension props: use fill mode if no dimensions provided
    ...(shouldUseFill 
      ? { fill: true }
      : {
          ...(propsFill !== undefined && { fill: propsFill }),
          ...(propsWidth !== undefined && { width: propsWidth }),
          ...(propsHeight !== undefined && { height: propsHeight }),
        }
    ),
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {isLoading && (
        <div
          className="absolute inset-0 animate-pulse bg-gray-200"
          aria-label="Loading image"
        />
      )}
      <Image alt={alt} {...imageProps} />
    </div>
  );
}

