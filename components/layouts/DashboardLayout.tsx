'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Home,
  Package,
  Heart,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = React.useState<{
    firstName?: string;
    lastName?: string;
  } | null>(null);

  useEffect(() => {
    // Fetch user data
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // If not authenticated, redirect to login
        router.push('/auth/login');
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: t('navigation.home'), href: '/dashboard', icon: Home },
    { name: t('navigation.services'), href: '/dashboard/services', icon: Heart },
    { name: t('navigation.appointments'), href: '/dashboard/appointments', icon: Calendar },
    { name: t('navigation.devices'), href: '/dashboard/devices', icon: Package },
    { name: t('feedback.feedback'), href: '/dashboard/feedback', icon: MessageSquare },
    { name: t('navigation.profile'), href: '/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/en/dashboard' || pathname === '/sw/dashboard';
    }
    return pathname.includes(href);
  };

  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
    : 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                HMK
              </div>
              <span className="font-semibold text-lg">HMK PWA</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Welcome message */}
          <div className="border-b px-6 py-4">
            <p className="text-sm text-gray-600">
              {t('common.welcome')}, <span className="font-semibold">{userName}</span>
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span>{t('navigation.logout')}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold lg:text-xl">
              {navigation.find((item) => isActive(item.href))?.name || t('navigation.home')}
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}

