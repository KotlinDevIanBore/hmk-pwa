'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ClipboardCheck,
  Users,
  Package,
  Heart,
  GraduationCap,
  Stethoscope,
  Home,
  Phone,
} from 'lucide-react';

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  // WHO 8-step process
  const whoSteps = [
    {
      step: 1,
      title: 'Referral',
      description: 'Identifying persons who need rehabilitation services',
      icon: Phone,
    },
    {
      step: 2,
      title: 'Assessment',
      description: 'Comprehensive evaluation of needs and capabilities',
      icon: ClipboardCheck,
    },
    {
      step: 3,
      title: 'Goal Setting',
      description: 'Establishing clear, achievable rehabilitation objectives',
      icon: Heart,
    },
    {
      step: 4,
      title: 'Intervention',
      description: 'Providing appropriate services and support',
      icon: Stethoscope,
    },
    {
      step: 5,
      title: 'Device Provision',
      description: 'Supplying necessary assistive devices and equipment',
      icon: Package,
    },
    {
      step: 6,
      title: 'Training',
      description: 'Teaching proper use of devices and adaptive techniques',
      icon: GraduationCap,
    },
    {
      step: 7,
      title: 'Follow-up',
      description: 'Regular monitoring and adjustment of services',
      icon: Home,
    },
    {
      step: 8,
      title: 'Empowerment',
      description: 'Enabling full participation in community life',
      icon: Users,
    },
  ];

  const staffHighlights = [
    {
      title: 'Certified Professionals',
      description: 'Our team includes physiotherapists, occupational therapists, and social workers',
    },
    {
      title: 'Community Health Workers',
      description: 'Trained staff embedded in local communities for continuous support',
    },
    {
      title: 'Peer Counselors',
      description: 'PWDs supporting other PWDs through shared experiences',
    },
  ];

  return (
    <section id="services" className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-blue-50" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            We follow the WHO 8-step rehabilitation process to ensure comprehensive,
            person-centered care for every individual we serve.
          </p>
        </motion.div>

        {/* WHO 8-Step Process */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            WHO 8-Step Rehabilitation Process
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whoSteps.map((step) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <step.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Staff Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Trained Staff
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {staffHighlights.map((highlight, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-xl"
              >
                <h4 className="text-xl font-bold mb-3">{highlight.title}</h4>
                <p className="leading-relaxed opacity-90">{highlight.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ministry Training Programs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <GraduationCap className="h-12 w-12 text-blue-600" />
              <h3 className="text-3xl font-bold text-gray-900">
                Ministry Training Programs
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Spiritual Support Training
                </h4>
                <p className="text-gray-700 mb-4">
                  Equipping ministry leaders to provide spiritual care and counseling
                  to persons with disabilities and their families.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Biblical perspectives on disability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Inclusive worship practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Pastoral care for PWDs</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Community Advocacy
                </h4>
                <p className="text-gray-700 mb-4">
                  Training community leaders to advocate for the rights and inclusion
                  of persons with disabilities.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Disability rights and legislation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Accessibility awareness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Community mobilization</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

