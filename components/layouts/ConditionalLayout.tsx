'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import type { ReactNode } from 'react';

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Don't show Header/Footer on landing page
  const isLandingPage = pathname === '/' || pathname.match(/^\/[a-z]{2}$/);
  
  // Don't show Header/Footer on dashboard or admin pages (they have their own layouts)
  const isDashboardPage = pathname.includes('/dashboard') || pathname.includes('/admin');
  
  if (isLandingPage || isDashboardPage) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Header />
      <main id="main-content" role="main" className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}

