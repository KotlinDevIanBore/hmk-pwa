import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScreenReaderOnlyProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  focusable?: boolean;
}

/**
 * Component that hides content visually but keeps it accessible to screen readers
 * Use for descriptive text, labels, or instructions that should be announced
 * but don't need to be visible
 */
export function ScreenReaderOnly({
  children,
  focusable = false,
  className,
  ...props
}: ScreenReaderOnlyProps) {
  return (
    <span
      className={cn(
        'sr-only',
        focusable && 'focus:not-sr-only focus:absolute focus:z-50 focus:p-2',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

