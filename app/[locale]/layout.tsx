import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { ConditionalLayout } from '@/components/layouts/ConditionalLayout';
import { Toaster } from '@/components/ui/toaster';
import { SkipLink } from '@/components/accessibility/SkipLink';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HMK PWA - Hope Mobility Kenya',
  description: 'Progressive Web App for Hope Mobility Kenya - Supporting Persons with Disabilities',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HMK PWA',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
};

const locales = ['en', 'sw'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Fetch messages for the locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <AccessibilityProvider>
            <SkipLink href="#main-content">Skip to main content</SkipLink>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster />
          </AccessibilityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


