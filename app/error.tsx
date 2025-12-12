'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-light">
        <AlertTriangle className="h-8 w-8 text-error" aria-hidden="true" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Something went wrong!
      </h1>
      <p className="mb-6 max-w-md text-gray-600">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go Home
        </Button>
      </div>
    </div>
  );
}

