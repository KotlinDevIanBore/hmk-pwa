/**
 * User Appointments API Route
 * GET /api/appointments/user
 * Fetches all appointments for the authenticated user with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Prisma.AppointmentWhereInput = {
      userId: session.userId,
    };

    if (status) {
      where.status = status as AppointmentStatus;
    }

    if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) {
        where.appointmentDate.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        where.appointmentDate.lte = endDateObj;
      }
    }

    // Fetch appointments
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          outreachLocation: {
            select: {
              id: true,
              name: true,
              county: true,
              address: true,
            },
          },
        },
        orderBy: {
          appointmentDate: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        appointments,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Fetch user appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

