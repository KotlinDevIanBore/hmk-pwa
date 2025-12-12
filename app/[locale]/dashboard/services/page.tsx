'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Heart, Stethoscope, BookOpen, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function ServicesPage() {
  const t = useTranslations();
  const router = useRouter();
  // const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const operationalServices = [
    {
      id: 'assessment',
      title: 'Assessment/Fitting',
      description: 'Complete disability assessment questionnaire',
      action: () => router.push('/dashboard/services/assessment'),
    },
    {
      id: 'followup',
      title: 'Follow-up',
      description: 'Skip to device selection',
      action: () => router.push('/dashboard/services/devices'),
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Skip to device selection',
      action: () => router.push('/dashboard/services/devices'),
    },
  ];

  const spiritualServices = [
    {
      id: 'spiritual-assessment',
      title: 'Spiritual Assessment',
      description: 'Contact information and book appointment',
      action: () => router.push('/dashboard/services/spiritual/assessment'),
    },
    {
      id: 'spiritual-followup',
      title: 'Spiritual Follow-up',
      description: 'Contact information and book appointment',
      action: () => router.push('/dashboard/services/spiritual/followup'),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            {t('services.services')}
          </h1>
          <p className="mt-2 text-gray-600">
            Request operational or spiritual services
          </p>
        </div>

        {/* Request for Services button */}
        <Card className="border-primary-200 bg-primary-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary-600" />
              {t('services.requestService')}
            </CardTitle>
            <CardDescription>
              Choose between operational services (assessments, devices) or spiritual services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Select a service type below to get started
            </p>
          </CardContent>
        </Card>

        {/* Operational Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              {t('services.operationalServices')}
            </CardTitle>
            <CardDescription>
              Assessment, fitting, follow-up, and maintenance services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {operationalServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{service.title}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
                <Button onClick={service.action} variant="outline" size="sm">
                  {t('common.next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Spiritual Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              {t('services.spiritualServices')}
            </CardTitle>
            <CardDescription>
              Spiritual assessment and follow-up services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {spiritualServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{service.title}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
                <Button onClick={service.action} variant="outline" size="sm">
                  {t('common.next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

