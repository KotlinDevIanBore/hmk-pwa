import { LandingPage } from '@/components/landing/LandingPage';

export default function HomePage({ params }: { params: { locale: string } }) {
  return <LandingPage locale={params.locale} />;
}

