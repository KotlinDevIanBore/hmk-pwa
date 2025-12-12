'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

/**
 * Component that lazy loads its children when they enter the viewport
 * Uses Intersection Observer for efficient lazy loading
 */
export function LazyLoad({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.01,
  className,
}: LazyLoadProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : fallback || <div className="h-32" />}
    </div>
  );
}

