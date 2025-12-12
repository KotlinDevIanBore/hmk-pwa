'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type FontSize = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  announceMessage: (message: string) => void;
  reducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size') as FontSize;
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
    
    if (savedHighContrast === 'true') {
      setHighContrast(true);
    }

    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save font size preference
  useEffect(() => {
    localStorage.setItem('accessibility-font-size', fontSize);
    
    // Apply font size class to body
    document.body.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    document.body.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  // Save high contrast preference
  useEffect(() => {
    localStorage.setItem('accessibility-high-contrast', String(highContrast));
    
    // Apply high contrast class to html element
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Screen reader announcement function
  const announceMessage = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const value = {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    announceMessage,
    reducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}


