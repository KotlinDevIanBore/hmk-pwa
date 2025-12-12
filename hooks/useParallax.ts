'use client';

import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Hook for creating subtle parallax effects
 * Automatically respects prefers-reduced-motion
 */
export function useParallax(offset = 50) {
  const elementRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: elementRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-offset, offset]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.3, 1, 1, 0.3]
  );

  return { ref: elementRef, y, opacity };
}

