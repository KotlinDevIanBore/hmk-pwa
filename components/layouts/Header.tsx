'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AccessibilityControls } from '@/components/AccessibilityControls';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import {
  Accessibility,
  Menu,
  X,
  Home,
  Calendar,
  Package,
  Heart,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: t('navigation.home'), href: '/', icon: Home },
    { name: t('navigation.appointments'), href: '/appointments', icon: Calendar },
    { name: t('navigation.devices'), href: '/devices', icon: Package },
    { name: t('navigation.services'), href: '/services', icon: Heart },
    { name: t('navigation.profile'), href: '/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname.match(/^\/[a-z]{2}$/);
    }
    return pathname.includes(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <nav className="container mx-auto px-4" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
              aria-label={t('common.welcome')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
                <Accessibility className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-primary-600">HMK</span>
                <span className="ml-1 text-sm text-gray-600">PWA</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <LanguageSwitcher />
              <AccessibilityControls />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t py-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
                      active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Controls */}
            <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:hidden">
              <div className="flex items-center justify-between px-3">
                <span className="text-sm font-medium text-gray-700">
                  {t('navigation.settings')}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3">
                <LanguageSwitcher />
                <AccessibilityControls />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

