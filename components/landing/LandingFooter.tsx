'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
} from 'lucide-react';
import Link from 'next/link';

interface LandingFooterProps {
  locale: string;
}

export function LandingFooter({ locale }: LandingFooterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const locations = [
    {
      name: 'Nairobi Head Office',
      address: 'Moi Avenue, Nairobi CBD',
      phone: '+254 700 000 000',
      email: 'nairobi@hopemobility.ke',
    },
    {
      name: 'Mombasa Office',
      address: 'Kenyatta Avenue, Mombasa',
      phone: '+254 700 000 001',
      email: 'mombasa@hopemobility.ke',
    },
    {
      name: 'Kisumu Office',
      address: 'Oginga Odinga Street, Kisumu',
      phone: '+254 700 000 002',
      email: 'kisumu@hopemobility.ke',
    },
    {
      name: 'Eldoret Office',
      address: 'Uganda Road, Eldoret',
      phone: '+254 700 000 003',
      email: 'eldoret@hopemobility.ke',
    },
  ];

  const quickLinks = [
    { label: 'About Us', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Products', href: '#products' },
    { label: 'Register', href: `/${locale}/auth/register` },
    { label: 'Login', href: `/${locale}/auth/login` },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/hopemobilitykenya', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/hopemobilityke', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/hopemobilitykenya', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/hopemobilitykenya', label: 'LinkedIn' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-blue-400" />
              <h3 className="text-2xl font-bold">Hope Mobility Kenya</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering persons with disabilities through comprehensive support,
              quality mobility devices, and accessible technology.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-bold mb-4">Contact Us</h4>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Nairobi Head Office</div>
                  <div className="text-sm">Moi Avenue, Nairobi CBD</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Phone</div>
                  <div className="text-sm">+254 700 000 000</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Email</div>
                  <div className="text-sm">info@hopemobility.ke</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Locations */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-bold mb-4">Our Locations</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              {locations.map((location, index) => (
                <li key={index} className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">{location.name}</div>
                    <div>{location.address}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="border-t border-gray-800 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
            <div className="text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} Hope Mobility Kenya. All rights reserved.</p>
              <p className="mt-1">Supporting Persons with Disabilities across Kenya</p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="hover:text-blue-400 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

