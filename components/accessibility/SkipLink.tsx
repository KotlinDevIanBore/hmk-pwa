import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Skip link that appears on focus for keyboard navigation
 * Allows users to skip repetitive content and jump to main content
 */
export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:absolute focus:left-4 focus:top-4 focus:z-50',
        'focus:rounded-md focus:bg-primary focus:px-4 focus:py-2',
        'focus:text-primary-foreground focus:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
}

