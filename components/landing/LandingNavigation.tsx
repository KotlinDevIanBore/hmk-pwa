'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/button';
import { Accessibility, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingNavigationProps {
  locale: string;
}

export function LandingNavigation({ locale }: LandingNavigationProps) {
  const t = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const navigation = [
    { name: t('navigation.about') || 'About', href: '#about' },
    { name: t('navigation.services') || 'Services', href: '#services' },
    { name: t('navigation.products') || 'Products', href: '#products' },
    { name: t('navigation.vision') || 'Vision', href: '#vision-mission' },
  ];

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      )}
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            aria-label="Hope Mobility Kenya Home"
          >
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-blue-600 text-white"
            >
              <Accessibility className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-xl md:text-2xl font-bold text-gray-900">
                Hope Mobility Kenya
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  'text-gray-700 hover:text-blue-600 hover:bg-blue-50',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                {item.name}
              </a>
            ))}
            <Link href={`/${locale}/auth/login`} className="ml-4">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('auth.getStarted') || 'Get Started'}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.2,
            ease: 'easeInOut',
          }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'block px-4 py-2 rounded-md text-base font-medium',
                  'text-gray-700 hover:text-blue-600 hover:bg-blue-50',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                {item.name}
              </a>
            ))}
            <Link
              href={`/${locale}/auth/login`}
              onClick={handleLinkClick}
              className="block px-4 py-2"
            >
              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('auth.getStarted') || 'Get Started'}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}

