'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { BookOpen, Phone, Mail, Calendar } from 'lucide-react';

export default function SpiritualAssessmentPage() {
  // const t = useTranslations();
  const router = useRouter();

  const contactInfo = {
    phone: '+254 712 345 678',
    email: 'spiritual@hmk.org',
    hours: 'Monday - Friday: 9:00 AM - 5:00 PM',
  };

  const handleBookAppointment = () => {
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(en|sw)/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    router.push(`/${locale}/dashboard/appointments/book?purpose=${encodeURIComponent('Spiritual Assessment')}`);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Spiritual Assessment
          </h1>
          <p className="mt-2 text-gray-600">
            Contact our spiritual services team for assessment
          </p>
        </div>

        {/* Contact information card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Reach out to our spiritual services team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-600">{contactInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{contactInfo.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Office Hours</p>
                <p className="text-sm text-gray-600">{contactInfo.hours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Book appointment card */}
        <Card className="border-primary-200 bg-primary-50">
          <CardHeader>
            <CardTitle>Book an Appointment</CardTitle>
            <CardDescription>
              Schedule a spiritual assessment appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBookAppointment} className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </CardContent>
        </Card>

        {/* Information card */}
        <Card>
          <CardHeader>
            <CardTitle>About Spiritual Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Our spiritual assessment service provides support and guidance for individuals
              seeking spiritual care. Our trained staff will work with you to understand your
              spiritual needs and provide appropriate support.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

