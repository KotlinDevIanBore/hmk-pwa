'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  initialFocus?: HTMLElement | null;
  returnFocus?: HTMLElement | null;
}

/**
 * Component that traps focus within its children
 * Useful for modals, dialogs, and popovers
 */
export function FocusTrap({
  children,
  active = true,
  initialFocus,
  returnFocus,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus initial element or first focusable element
    const focusInitial = () => {
      if (initialFocus) {
        initialFocus.focus();
      } else if (containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    focusInitial();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (!containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Return focus to previously focused element
      if (returnFocus) {
        returnFocus.focus();
      } else if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [active, initialFocus, returnFocus]);

  return <div ref={containerRef}>{children}</div>;
}

