'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import type { ReactNode } from 'react';

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Don't show Header/Footer on landing page
  const isLandingPage = pathname === '/' || pathname.match(/^\/[a-z]{2}$/);
  
  if (isLandingPage) {
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

