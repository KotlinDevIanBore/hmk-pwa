'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { ServicesSection } from './ServicesSection';
import { ProductsSection } from './ProductsSection';
import { VisionMissionSection } from './VisionMissionSection';
import { LandingFooter } from './LandingFooter';
import
 { LandingNavigation } from './LandingNavigation';
import { AutoScrollTour } from './AutoScrollTour';
import { SmoothScrollProvider } from './SmoothScrollProvider';
import { motion, MotionConfig } from 'framer-motion';

interface LandingPageProps {
  locale: string;
}

export function LandingPage({ locale }: LandingPageProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
      <SmoothScrollProvider>
        <div className="min-h-screen bg-white">
          {/* Navigation */}
          <LandingNavigation locale={locale} />

          {/* Hero Section */}
          <HeroSection locale={locale} />

          {/* About Section */}
          <AboutSection />

          {/* Services Section */}
          <ServicesSection />

          {/* Products Section */}
          <ProductsSection locale={locale} />

          {/* Vision & Mission Section */}
          <VisionMissionSection />

          {/* Footer */}
          <LandingFooter locale={locale} />

          {/* Scroll to Top Button */}
          <ScrollToTopButton />

          {/* Auto-scroll Tour */}
          <AutoScrollTour
            sections={[
              { id: 'about', label: 'About Us' },
              { id: 'services', label: 'Services' },
              { id: 'products', label: 'Products' },
              { id: 'vision-mission', label: 'Vision & Mission' },
            ]}
          />
        </div>
      </SmoothScrollProvider>
    </MotionConfig>
  );
}

function ScrollToTopButton() {
  const prefersReducedMotion = useReducedMotion();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <motion.button
      className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all z-50 focus:outline-none focus:ring-4 focus:ring-blue-300"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </motion.button>
  );
}

