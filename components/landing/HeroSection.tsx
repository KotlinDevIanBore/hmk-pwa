'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSpeechOnView, useSpeechOnInteraction } from '@/hooks/useSpeech';
import { Accessibility, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Speech announcements for accessibility
  const heroText = `Hope Mobility Kenya. ${t('common.welcome')} - Empowering Persons with Disabilities. Providing accessible technology, mobility devices, and comprehensive support services across Kenya`;
  useSpeechOnView(heroText, true, { lang: locale === 'sw' ? 'sw-KE' : 'en-US', enabled: true });
  
  const getStartedSpeech = useSpeechOnInteraction(`${t('auth.getStarted')} button. Click to get started`, { onFocus: true });
  const learnMoreSpeech = useSpeechOnInteraction(`${t('common.learnMore')} button. Click to learn more about our services`, { onFocus: true });
  const scrollIndicatorSpeech = useSpeechOnInteraction('Scroll to next section', { onFocus: true });

  // Parallax transforms (subtle, performance-optimized)
  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 100]
  );
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 50]
  );
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

  const scrollToNext = () => {
    const aboutSection = document.getElementById('about');
    aboutSection?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white overflow-hidden pt-16 md:pt-20"
    >
{/* Background image */}
<motion.div
  className="absolute inset-0 bg-cover bg-top"
  style={{
    backgroundImage: "url('/hmk-homepage.jpeg')",
    y: backgroundY,
  }}
/>

{/* Gradient overlay */}
<div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-500/70 to-purple-600/80" />



      {/* Animated background elements with parallax */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y: backgroundY }}
      >
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.2, 1],
                  x: [0, 50, 0],
                  y: [0, 30, 0],
                }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.3, 1],
                  x: [0, -30, 0],
                  y: [0, -50, 0],
                }
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Content with parallax */}
      <motion.div
        className="relative z-10 container mx-auto px-4 text-center"
        style={{ y: contentY, opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.8,
          }}
          className="mb-8"
        >
          {/* Enhanced Logo Animation */}
          <motion.div
            className="inline-flex items-center justify-center mb-6"
            initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
            animate={prefersReducedMotion ? {} : { scale: 1, rotate: 0 }}
            transition={
              prefersReducedMotion
                ? {}
                : {
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    duration: 1,
                  }
            }
          >
            <motion.div
              className="relative"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Accessibility className="h-24 w-24 md:h-32 md:w-32" />
              {/* Glow effect */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.3,
              duration: prefersReducedMotion ? 0 : 0.8,
            }}
          >
            Hope Mobility Kenya
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.5,
              duration: prefersReducedMotion ? 0 : 0.8,
            }}
          >
            {t('common.welcome')} - Empowering Persons with Disabilities
          </motion.p>

          <motion.p
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.7,
              duration: prefersReducedMotion ? 0 : 0.8,
            }}
          >
            Providing accessible technology, mobility devices, and comprehensive support services across Kenya
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex gap-4 justify-center flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.9,
            duration: prefersReducedMotion ? 0 : 0.8,
          }}
        >
          <Link href={`/${locale}/auth/login`}>
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-all shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50"
              {...getStartedSpeech}
            >
              {t('auth.getStarted')}
            </Button>
          </Link>
          <Button
  size="lg"
  variant="outline"
  className="text-lg px-8 py-6 border-2 border-blue-600 text-white bg-transparent hover:bg-transparent hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-white/50"
  onClick={scrollToNext}
  {...learnMoreSpeech}
>
  {t('common.learnMore')}
</Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white rounded-full p-2"
        animate={
          prefersReducedMotion
            ? {}
            : {
                y: [0, 10, 0],
              }
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        onClick={scrollToNext}
        aria-label="Scroll to next section"
        {...scrollIndicatorSpeech}
      >
        <ChevronDown className="h-8 w-8" />
      </motion.button>
    </section>
  );
}

