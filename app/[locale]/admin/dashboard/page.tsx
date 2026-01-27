import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const session = await getSession();
  const { locale } = await params;

  if (!session) {
    redirect(`/${locale}/auth/login?admin=true`);
  }

  // Check if user is admin
  const isAdminRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(session.role);
  if (!isAdminRole) {
    redirect(`/${locale}/auth/login?admin=true`);
  }

  // Fetch recent appointments (1-2 most recent)
  const recentAppointments = await prisma.appointment.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
      outreachLocation: {
        select: {
          name: true,
          county: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage users, appointments, and system settings
          </p>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Recently booked appointments</CardDescription>
              </div>
              <Link href={`/${locale}/admin/appointments`}>
                <Button variant="outline" size="sm">
                  Show More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No recent appointments</p>
            ) : (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <Link
                    key={appointment.id}
                    href={`/${locale}/admin/appointments`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">
                          {appointment.user.firstName} {appointment.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.purpose}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                          {' '}
                          {appointment.locationType === 'OUTREACH'
                            ? `(${appointment.outreachLocation?.name || appointment.location})`
                            : `(${appointment.location})`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{appointment.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {await prisma.appointment.count()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {await prisma.appointment.count({ where: { status: 'PENDING' } })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {await prisma.user.count()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {await prisma.user.count({ where: { isActive: true } })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
