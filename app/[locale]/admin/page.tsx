'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    // Redirect to login page with admin context
    router.push(`/${locale}/auth/login?admin=true`);
  }, [router, locale]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to login...</p>
    </div>
  );
}
