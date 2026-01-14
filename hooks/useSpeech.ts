'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getSpeechManager,
  type SpeechOptions,
  type SpeechInstance,
} from '@/lib/speech';

export interface UseSpeechReturn {
  /** Speak the provided text */
  speak: (text: string, options?: SpeechOptions) => Promise<void>;
  /** Stop current speech */
  stop: () => void;
  /** Check if speech is currently active */
  isSpeaking: boolean;
  /** Check if speech synthesis is available */
  isAvailable: boolean;
  /** Cancel all queued speech */
  cancel: () => void;
}

/**
 * React hook for text-to-speech functionality
 * 
 * @param defaultOptions - Default options for all speech calls
 * @returns Speech control functions and state
 * 
 * @example
 * ```tsx
 * const { speak, stop, isSpeaking } = useSpeech({ lang: 'en-US', rate: 1.2 });
 * 
 * // Speak text
 * await speak('Hello, welcome to our website');
 * 
 * // Stop speech
 * stop();
 * ```
 */
export function useSpeech(
  defaultOptions?: SpeechOptions
): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const speechInstanceRef = useRef<SpeechInstance | null>(null);

  // Initialize speech instance
  useEffect(() => {
    const manager = getSpeechManager();
    setIsAvailable(manager.isAvailable());
    speechInstanceRef.current = manager;

    // Cleanup on unmount
    return () => {
      if (speechInstanceRef.current) {
        speechInstanceRef.current.stop();
      }
    };
  }, []);

  const speak = useCallback(
    async (text: string, options?: SpeechOptions) => {
      if (!speechInstanceRef.current || !text.trim()) {
        return;
      }

      const mergedOptions = { ...defaultOptions, ...options };
      setIsSpeaking(true);

      try {
        await speechInstanceRef.current.speak(text, mergedOptions);
      } catch (error) {
        console.error('Speech error:', error);
      } finally {
        setIsSpeaking(false);
      }
    },
    [defaultOptions]
  );

  const stop = useCallback(() => {
    if (speechInstanceRef.current) {
      speechInstanceRef.current.stop();
      setIsSpeaking(false);
    }
  }, []);

  const cancel = useCallback(() => {
    if (speechInstanceRef.current) {
      speechInstanceRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isAvailable,
    cancel,
  };
}

/**
 * Hook for speaking text when an element comes into view
 * Useful for automatically announcing sections as users scroll
 */
export function useSpeechOnView(
  text: string,
  isInView: boolean,
  options?: SpeechOptions & { enabled?: boolean }
) {
  const { speak, stop } = useSpeech(options);
  const hasSpokenRef = useRef(false);
  const { enabled = true, ...speechOptions } = options || {};

  useEffect(() => {
    if (enabled && isInView && !hasSpokenRef.current && text.trim()) {
      hasSpokenRef.current = true;
      speak(text, speechOptions);
    }

    return () => {
      if (hasSpokenRef.current) {
        stop();
      }
    };
  }, [isInView, text, enabled, speak, stop, speechOptions]);
}

/**
 * Hook for speaking text on focus/hover
 * Useful for interactive elements like buttons and links
 */
export function useSpeechOnInteraction(
  text: string,
  options?: SpeechOptions & { 
    onFocus?: boolean;
    onHover?: boolean;
    onClick?: boolean;
  }
) {
  const { speak, stop } = useSpeech(options);
  const {
    onFocus = true,
    onHover = false,
    onClick = false,
    ...speechOptions
  } = options || {};

  const handleFocus = useCallback(() => {
    if (onFocus && text.trim()) {
      speak(text, speechOptions);
    }
  }, [onFocus, text, speak, speechOptions]);

  const handleBlur = useCallback(() => {
    if (onFocus) {
      stop();
    }
  }, [onFocus, stop]);

  const handleMouseEnter = useCallback(() => {
    if (onHover && text.trim()) {
      speak(text, speechOptions);
    }
  }, [onHover, text, speak, speechOptions]);

  const handleMouseLeave = useCallback(() => {
    if (onHover) {
      stop();
    }
  }, [onHover, stop]);

  const handleClick = useCallback(() => {
    if (onClick && text.trim()) {
      speak(text, speechOptions);
    }
  }, [onClick, text, speak, speechOptions]);

  return {
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
  };
}
