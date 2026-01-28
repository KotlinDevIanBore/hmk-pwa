'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  delay?: number; // delay before starting (milliseconds)
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
  cursorBlinkSpeed?: number;
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
  showCursor = true,
  cursorBlinkSpeed = 530,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text.length === 0) return;

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const startTyping = () => {
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutId = setTimeout(typeNextChar, speed);
        } else {
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
        }
      };

      typeNextChar();
    };

    if (delay > 0) {
      timeoutId = setTimeout(startTyping, delay);
    } else {
      startTyping();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <motion.span
          animate={{ opacity: isComplete ? [1, 0.3, 1] : [1, 0, 1] }}
          transition={{
            duration: cursorBlinkSpeed / 1000,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="inline-block ml-1"
          aria-hidden="true"
        >
          |
        </motion.span>
      )}
    </span>
  );
}
