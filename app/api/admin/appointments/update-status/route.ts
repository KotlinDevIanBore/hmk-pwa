/**
 * Update Appointment Status
 * POST /api/admin/appointments/update-status
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { sendAppointmentStatusNotification } from '@/lib/notifications';

const updateStatusSchema = z.object({
  appointmentId: z.string(),
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'RESCHEDULED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { appointmentId, status } = validation.data;

    // Get appointment with user details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: true,
        outreachLocation: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Update status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    // Send notification
    try {
      const locationName = appointment.outreachLocation?.name || appointment.location || 'Resource Center';
      await sendAppointmentStatusNotification(
        appointmentId,
        status,
        appointment.appointmentDate,
        appointment.appointmentTime,
        locationName
      );
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment status updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment status' },
      { status: 500 }
    );
  }
}
