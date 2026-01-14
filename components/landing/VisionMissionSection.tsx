'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSpeechOnView, useSpeechOnInteraction } from '@/hooks/useSpeech';
import { Eye, Target, Lightbulb, Globe } from 'lucide-react';

// Vision card component with speech
function VisionCard({
  isInView,
  prefersReducedMotion,
}: {
  isInView: boolean;
  prefersReducedMotion: boolean;
}) {
  const visionSpeech = useSpeechOnInteraction(
    'Our Vision. A Kenya where every person with a disability has equal access to opportunities, lives with dignity, and is fully integrated into society with the mobility and support they need to thrive.',
    { onFocus: true }
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.8,
        delay: prefersReducedMotion ? 0 : 0.2,
      }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-10 shadow-2xl border border-white/20"
      tabIndex={0}
      {...visionSpeech}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-white/20 rounded-xl">
          <Eye className="h-10 w-10" aria-hidden="true" />
        </div>
        <h3 className="text-3xl font-bold">Our Vision</h3>
      </div>
      <p className="text-lg leading-relaxed mb-6 opacity-95">
        A Kenya where every person with a disability has equal access to opportunities,
        lives with dignity, and is fully integrated into society with the mobility
        and support they need to thrive.
      </p>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 mt-1 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm opacity-90">
            Nationwide accessibility and inclusion
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 mt-1 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm opacity-90">
            Innovation in assistive technology
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Mission card component with speech
function MissionCard({
  isInView,
  prefersReducedMotion,
}: {
  isInView: boolean;
  prefersReducedMotion: boolean;
}) {
  const missionSpeech = useSpeechOnInteraction(
    'Our Mission. To empower persons with disabilities through comprehensive rehabilitation services, quality mobility devices, accessible technology, spiritual support, and community advocacy, following WHO best practices.',
    { onFocus: true }
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.8,
        delay: prefersReducedMotion ? 0 : 0.4,
      }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-10 shadow-2xl border border-white/20"
      tabIndex={0}
      {...missionSpeech}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-white/20 rounded-xl">
          <Target className="h-10 w-10" aria-hidden="true" />
        </div>
        <h3 className="text-3xl font-bold">Our Mission</h3>
      </div>
      <p className="text-lg leading-relaxed mb-6 opacity-95">
        To empower persons with disabilities through comprehensive rehabilitation services,
        quality mobility devices, accessible technology, spiritual support, and community
        advocacy, following WHO best practices.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold mb-1">Quality Care</div>
          <div className="text-sm opacity-90">WHO Standards</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold mb-1">Accessibility</div>
          <div className="text-sm opacity-90">For All</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold mb-1">Technology</div>
          <div className="text-sm opacity-90">Innovation</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold mb-1">Community</div>
          <div className="text-sm opacity-90">Empowerment</div>
        </div>
      </div>
    </motion.div>
  );
}

export function VisionMissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  // Speech announcements
  const sectionIntro =
    'Vision and Mission. Our vision is a Kenya where every person with a disability has equal access to opportunities, lives with dignity, and is fully integrated into society. Our mission is to empower persons with disabilities through comprehensive rehabilitation services, quality mobility devices, accessible technology, spiritual support, and community advocacy.';
  useSpeechOnView(sectionIntro, isInView, { enabled: true });

  // Generate static positions for background elements (avoid Math.random in render)
  const backgroundElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    width: 50 + (i * 7) % 50,
    height: 50 + (i * 11) % 50,
    top: (i * 13) % 100,
    left: (i * 17) % 100,
  }));

  return (
    <section id="vision-mission" className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white relative overflow-hidden" ref={ref}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {backgroundElements.map((element) => (
            <motion.div
              key={element.id}
              className="absolute bg-white rounded-full"
              style={{
                width: element.width,
                height: element.height,
                top: `${element.top}%`,
                left: `${element.left}%`,
              }}
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [0, (element.id % 5) * 10 - 25],
                      x: [0, (element.id % 7) * 7 - 25],
                      scale: [1, 1.1, 1],
                    }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      duration: 5 + (element.id % 5),
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.8,
          }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Vision & Mission
          </h2>
          <div className="w-24 h-1 bg-white mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Vision */}
          <VisionCard isInView={isInView} prefersReducedMotion={prefersReducedMotion} />

          {/* Mission */}
          <MissionCard isInView={isInView} prefersReducedMotion={prefersReducedMotion} />
        </div>

        {/* Strategic Goals */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.8,
            delay: prefersReducedMotion ? 0 : 0.6,
          }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            Strategic Goals for 2025-2030
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-sm opacity-90">Counties Reached</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-sm opacity-90">PWDs Served</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-sm opacity-90">Outreach Centers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm opacity-90">Trained Staff</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

