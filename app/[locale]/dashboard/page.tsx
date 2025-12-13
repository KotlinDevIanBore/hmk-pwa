import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import {
  Heart,
  Calendar,
  Package,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export default async function DashboardPage() {
  const t = await getTranslations();
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const quickActions = [
    {
      title: t('services.requestService'),
      description: t('services.services'),
      href: '/dashboard/services',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: t('appointments.bookAppointment'),
      description: t('appointments.myAppointments'),
      href: '/dashboard/appointments',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('devices.deviceCatalog'),
      description: t('devices.mobilityDevices'),
      href: '/dashboard/devices',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('feedback.giveFeedback'),
      description: t('feedback.feedback'),
      href: '/dashboard/feedback',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            {t('common.welcome')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('services.services')} - {t('common.learnMore')}
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.href} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg ${action.bgColor}`}>
                    <Icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={action.href}>
                      {t('common.learnMore')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent activity placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent service requests and appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

