'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { BookOpen, Phone, Mail, Calendar } from 'lucide-react';

export default function SpiritualFollowupPage() {
  // const t = useTranslations();
  const router = useRouter();

  const contactInfo = {
    phone: '+254 712 345 678',
    email: 'spiritual@hmk.org',
    hours: 'Monday - Friday: 9:00 AM - 5:00 PM',
  };

  const handleBookAppointment = () => {
    router.push('/dashboard/appointments?type=spiritual-followup');
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Spiritual Follow-up
          </h1>
          <p className="mt-2 text-gray-600">
            Contact our spiritual services team for follow-up care
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
              Schedule a spiritual follow-up appointment
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
            <CardTitle>About Spiritual Follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Our spiritual follow-up service provides ongoing support and care for individuals
              who have previously received spiritual services. We continue to walk alongside you
              in your spiritual journey.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

