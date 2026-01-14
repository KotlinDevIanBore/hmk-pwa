'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Play, Pause, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSpeech } from '@/hooks/useSpeech';

interface AutoScrollTourProps {
  sections: Array<{ id: string; label: string; speechText?: string }>;
  locale?: string;
}

/**
 * Auto-scroll tour component that guides users through landing page sections
 * Respects prefers-reduced-motion and provides full keyboard control
 */
export function AutoScrollTour({ sections, locale = 'en' }: AutoScrollTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldAutoAdvanceRef = useRef(false);
  const { speak, isSpeaking, stop } = useSpeech({ 
    lang: locale === 'sw' ? 'sw-KE' : 'en-US',
    interrupt: true 
  });

  const scrollToSection = async (index: number, shouldSpeak: boolean = true, shouldAutoAdvance: boolean = true) => {
    const section = document.getElementById(sections[index].id);
    if (section) {
      section.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      setCurrentIndex(index);

      // Speak the section intro if speech text is provided
      if (shouldSpeak && sections[index].speechText) {
        try {
          await speak(sections[index].speechText!);
          
          // After speech completes, advance to next section if auto-advance is enabled
          if (shouldAutoAdvance && shouldAutoAdvanceRef.current && isActive && !isPaused) {
            const nextIndex = (index + 1) % sections.length;
            // Small delay to ensure smooth transition
            await new Promise(resolve => setTimeout(resolve, 500));
            await scrollToSection(nextIndex, true, true);
          }
        } catch (error) {
          console.error('Speech error:', error);
          // Even on error, continue to next section if auto-advance is enabled
          if (shouldAutoAdvance && shouldAutoAdvanceRef.current && isActive && !isPaused) {
            const nextIndex = (index + 1) % sections.length;
            await new Promise(resolve => setTimeout(resolve, 500));
            await scrollToSection(nextIndex, true, true);
          }
        }
      } else if (shouldAutoAdvance && shouldAutoAdvanceRef.current && isActive && !isPaused) {
        // If no speech text, still advance after a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        const nextIndex = (index + 1) % sections.length;
        await scrollToSection(nextIndex, true, true);
      }
    }
  };

  const startTour = async () => {
    if (prefersReducedMotion) {
      // For reduced motion, just show the first section
      await scrollToSection(0, false);
      return;
    }

    setIsActive(true);
    setIsPaused(false);
    setCurrentIndex(0);
    shouldAutoAdvanceRef.current = true;
    
    // Start with first section and speak it
    await scrollToSection(0, true);
  };

  const stopTour = () => {
    setIsActive(false);
    setIsPaused(false);
    shouldAutoAdvanceRef.current = false;
    stop(); // Stop any ongoing speech
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      shouldAutoAdvanceRef.current = true;
      // Continue from current section
      scrollToSection(currentIndex, true);
    } else {
      // Pause
      setIsPaused(true);
      shouldAutoAdvanceRef.current = false;
      stop(); // Stop current speech
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const goToSection = async (index: number) => {
    stop(); // Stop current speech
    // Continue auto-advance after this section if tour is active and not paused
    const willAutoAdvance = isActive && !isPaused;
    await scrollToSection(index, true, willAutoAdvance);
  };

  useEffect(() => {
    return () => {
      stop(); // Stop speech on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stop]);

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

