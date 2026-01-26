import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  Heart,
  Calendar,
  Package,
  MessageSquare,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default async function DashboardPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const t = await getTranslations();
  const session = await getSession();
  const { locale } = await params;

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  // Fetch recent appointments and service requests
  const [recentAppointments, recentServiceRequests] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        outreachLocation: {
          select: {
            name: true,
            county: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
    prisma.serviceRequest.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
  ]);

  const quickActions = [
    {
      title: t('services.requestService'),
      description: t('services.services'),
      href: `/${locale}/dashboard/services`,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: t('appointments.bookAppointment'),
      description: t('appointments.myAppointments'),
      href: `/${locale}/dashboard/appointments`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('devices.deviceCatalog'),
      description: t('devices.mobilityDevices'),
      href: `/${locale}/dashboard/devices`,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('feedback.giveFeedback'),
      description: t('feedback.feedback'),
      href: `/${locale}/dashboard/feedback`,
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

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent service requests and appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 && recentServiceRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {/* Recent Appointments */}
                {recentAppointments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Recent Appointments
                    </h3>
                    <div className="space-y-2">
                      {recentAppointments.map((appointment) => {
                        const appointmentDate = new Date(appointment.appointmentDate);
                        const isUpcoming = appointmentDate >= new Date();
                        const statusColors: Record<string, string> = {
                          PENDING: 'bg-yellow-100 text-yellow-800',
                          CONFIRMED: 'bg-blue-100 text-blue-800',
                          COMPLETED: 'bg-green-100 text-green-800',
                          CANCELLED: 'bg-red-100 text-red-800',
                        };
                        return (
                          <Link
                            key={appointment.id}
                            href={`/${locale}/dashboard/appointments`}
                            className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {appointment.purpose}
                                  </p>
                                  <Badge
                                    className={`text-xs ${statusColors[appointment.status] || 'bg-gray-100 text-gray-800'}`}
                                  >
                                    {appointment.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {appointmentDate.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })} at {appointment.appointmentTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {appointment.locationType === 'OUTREACH'
                                      ? appointment.outreachLocation?.name || 'Outreach Location'
                                      : 'Resource Center'}
                                  </span>
                                </div>
                              </div>
                              {isUpcoming && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Service Requests */}
                {recentServiceRequests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Recent Service Requests
                    </h3>
                    <div className="space-y-2">
                      {recentServiceRequests.map((request) => {
                        const requestDate = new Date(request.createdAt);
                        const statusColors: Record<string, string> = {
                          PENDING: 'bg-yellow-100 text-yellow-800',
                          IN_PROGRESS: 'bg-blue-100 text-blue-800',
                          COMPLETED: 'bg-green-100 text-green-800',
                          CANCELLED: 'bg-red-100 text-red-800',
                        };
                        return (
                          <Link
                            key={request.id}
                            href={`/${locale}/dashboard/services`}
                            className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {request.title}
                                  </p>
                                  <Badge
                                    className={`text-xs ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}
                                  >
                                    {request.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-1">{request.description}</p>
                                <p className="text-xs text-gray-500">
                                  {requestDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View All Link */}
                {(recentAppointments.length > 0 || recentServiceRequests.length > 0) && (
                  <div className="pt-2 border-t">
                    <Link
                      href={`/${locale}/dashboard/appointments`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View all appointments
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

