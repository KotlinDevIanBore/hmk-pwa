'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Accessibility, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.appointments'), href: '/appointments' },
    { name: t('navigation.devices'), href: '/devices' },
    { name: t('navigation.services'), href: '/services' },
  ];

  const supportLinks = [
    { name: t('feedback.feedback'), href: '/feedback' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
  ];

  return (
    <footer className="border-t bg-gray-50 no-print" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
                <Accessibility className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary-600">HMK PWA</h2>
                <p className="text-xs text-gray-600">Hope Mobility Kenya</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Empowering Persons with Disabilities across Kenya through accessible technology and comprehensive support services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600 focus:outline-none focus:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Support
            </h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600 focus:outline-none focus:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary-500" aria-hidden="true" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary-500" aria-hidden="true" />
                <a
                  href="tel:+254700000000"
                  className="hover:text-primary-600 focus:outline-none focus:underline"
                >
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary-500" aria-hidden="true" />
                <a
                  href="mailto:info@hmk.org"
                  className="hover:text-primary-600 focus:outline-none focus:underline"
                >
                  info@hmk.org
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-primary-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} Hope Mobility Kenya. All rights reserved.
            </p>
            <p className="text-sm text-gray-600">
              Made with <span className="text-red-500" aria-label="love">❤</span> for accessibility
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

