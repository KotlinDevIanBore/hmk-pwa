import type { ReactNode } from 'react';
import { Header } from '@/components/layouts/Header';
import { Footer } from '@/components/layouts/Footer';

export default function AppLayout({ children }: { children: ReactNode }) {
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

