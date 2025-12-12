'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Play, Pause, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AutoScrollTourProps {
  sections: Array<{ id: string; label: string }>;
}

/**
 * Auto-scroll tour component that guides users through landing page sections
 * Respects prefers-reduced-motion and provides full keyboard control
 */
export function AutoScrollTour({ sections }: AutoScrollTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToSection = (index: number) => {
    const section = document.getElementById(sections[index].id);
    if (section) {
      section.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      setCurrentIndex(index);
    }
  };

  const startTour = () => {
    if (prefersReducedMotion) {
      // For reduced motion, just show the first section
      scrollToSection(0);
      return;
    }

    setIsActive(true);
    setIsPaused(false);
    setCurrentIndex(0);
    scrollToSection(0);

    // Auto-advance through sections
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % sections.length;
        scrollToSection(next);
        return next;
      });
    }, 5000); // 5 seconds per section
  };

  const stopTour = () => {
    setIsActive(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % sections.length;
          scrollToSection(next);
          return next;
        });
      }, 5000);
    } else {
      // Pause
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const goToSection = (index: number) => {
    scrollToSection(index);
    if (isActive && !isPaused) {
      // Reset interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % sections.length;
          scrollToSection(next);
          return next;
        });
      }, 5000);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (sections.length === 0) return null;

  return (
    <AnimatePresence>
      {isActive ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-white rounded-lg shadow-2xl p-4 border border-gray-200 max-w-md w-full mx-4"
          role="dialog"
          aria-label="Auto-scroll tour controls"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Guided Tour
            </h3>
            <button
              onClick={stopTour}
              className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              onClick={togglePause}
              aria-label={isPaused ? 'Resume tour' : 'Pause tour'}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1 flex gap-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => goToSection(index)}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
                    index === currentIndex
                      ? 'bg-blue-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  )}
                  aria-label={`Go to ${section.label}`}
                  aria-current={index === currentIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-600 text-center">
            {sections[currentIndex].label}
          </div>
        </motion.div>
      ) : (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={startTour}
          className="fixed bottom-24 right-8 z-40 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
          aria-label="Start guided tour"
        >
          <Play className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

