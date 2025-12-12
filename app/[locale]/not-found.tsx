import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <FileQuestion className="h-8 w-8 text-primary-500" aria-hidden="true" />
      </div>
      <h1 className="mb-2 text-6xl font-bold text-gray-900">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-gray-700">
        Page Not Found
      </h2>
      <p className="mb-6 max-w-md text-gray-600">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
        moved or deleted.
      </p>
      <Link href="/">
        <Button>Go Back Home</Button>
      </Link>
    </div>
  );
}

