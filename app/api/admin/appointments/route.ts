/**
 * Admin Appointments API Route
 * GET /api/admin/appointments
 * Returns all appointments for admin management
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const isAdminRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(session.role);
    if (!isAdminRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const appointments = await prisma.appointment.findMany({
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
      orderBy: {
        appointmentDate: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        appointments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
