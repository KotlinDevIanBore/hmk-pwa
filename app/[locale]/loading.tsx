import { PageSkeleton } from '@/components/loading/CardSkeleton';

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading">
      <span className="sr-only">Loading page content...</span>
      <PageSkeleton />
    </div>
  );
}

