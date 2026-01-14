'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Users, Target, Award, LucideIcon } from 'lucide-react';
import { useSpeechOnView, useSpeechOnInteraction } from '@/hooks/useSpeech';

// Stat card component with speech
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  variants 
}: { 
  icon: LucideIcon; 
  label: string; 
  value: string; 
  variants: any;
}) {
  const statSpeech = useSpeechOnInteraction(`${label}: ${value}`, { onFocus: true });
  
  return (
    <motion.div
      variants={variants}
      className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow"
      tabIndex={0}
      {...statSpeech}
    >
      <Icon className="h-10 w-10 text-blue-600 mx-auto mb-3" aria-hidden="true" />
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  );
}

// Core value card component with speech
function CoreValueCard({ 
  title, 
  description, 
  borderColor 
}: { 
  title: string; 
  description: string; 
  borderColor: string;
}) {
  const valueSpeech = useSpeechOnInteraction(`${title}. ${description}`, { onFocus: true });
  
  return (
    <div 
      className={`bg-white p-6 rounded-xl shadow-md border-t-4 ${borderColor}`}
      tabIndex={0}
      {...valueSpeech}
    >
      <h4 className="text-xl font-bold text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Speech announcements
  const sectionIntro = 'About Hope Mobility Kenya. We are dedicated to empowering persons with disabilities through comprehensive support services, assistive technology, and community outreach.';
  useSpeechOnView(sectionIntro, isInView, { enabled: true });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const stats = [
    { icon: Users, label: 'PWDs Served', value: '5,000+' },
    { icon: Heart, label: 'Outreach Centers', value: '15+' },
    { icon: Target, label: 'Counties Reached', value: '12+' },
    { icon: Award, label: 'Years of Service', value: '10+' },
  ];

  return (
    <section id="about" className="py-20 md:py-32 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About Hope Mobility Kenya
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 shadow-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Heart className="h-8 w-8 text-blue-600" />
                Our Mission
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Hope Mobility Kenya is dedicated to empowering persons with disabilities
                through comprehensive support services, assistive technology, and community
                outreach. We believe in creating an inclusive society where everyone has
                equal access to opportunities, mobility, and dignity.
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                variants={itemVariants}
              />
            ))}
          </motion.div>

          {/* Core Values */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
              Our Core Values
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <CoreValueCard
                title="Compassion"
                description="We approach every individual with empathy, understanding their unique needs and challenges."
                borderColor="border-blue-600"
              />
              <CoreValueCard
                title="Inclusion"
                description="We work towards a society where persons with disabilities are fully integrated and valued."
                borderColor="border-purple-600"
              />
              <CoreValueCard
                title="Excellence"
                description="We strive for the highest quality in our services, technology, and support systems."
                borderColor="border-blue-600"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

