'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface LiveRegionProps {
  children: React.ReactNode;
  /**
   * Politeness level
   * - 'polite': Wait until user is idle
   * - 'assertive': Interrupt immediately
   * - 'off': Don't announce
   */
  politeness?: 'polite' | 'assertive' | 'off';
  /**
   * Whether to announce entire region or only changes
   */
  atomic?: boolean;
  /**
   * Which changes to announce
   */
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

/**
 * ARIA live region for dynamic content updates
 * Screen readers will announce changes to content in this region
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'all',
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
  const [message, setMessage] = React.useState('');

  const announce = React.useCallback((text: string, timeout = 1000) => {
    setMessage(text);
    setTimeout(() => setMessage(''), timeout);
  }, []);

  return {
    message,
    announce,
    LiveRegionComponent: () => message ? <LiveRegion>{message}</LiveRegion> : null,
  };
}

