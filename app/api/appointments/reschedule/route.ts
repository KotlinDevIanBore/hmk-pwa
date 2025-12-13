/**
 * Reschedule Appointment API Route
 * PUT /api/appointments/reschedule
 * Updates an existing appointment's date and time
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import {
  isSlotAvailable,
  LocationType,
} from '@/lib/appointments';
import { calculateAge } from '@/lib/validation';

const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
});

export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Parse request body
    const body = await request.json();
    const validation = rescheduleAppointmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { appointmentId, appointmentDate, appointmentTime } = validation.data;

    // Find existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: {
          select: {
            id: true,
            dateOfBirth: true,
            age: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify appointment belongs to user
    if (existingAppointment.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to reschedule this appointment' },
        { status: 403 }
      );
    }

    // Check if appointment can be rescheduled (not completed or cancelled)
    if (existingAppointment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot reschedule a completed appointment' },
        { status: 400 }
      );
    }

    if (existingAppointment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot reschedule a cancelled appointment' },
        { status: 400 }
      );
    }

    // Parse new date
    const newDate = new Date(appointmentDate);
    if (isNaN(newDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      );
    }

    // Calculate user age for slot checking
    let userAge: number | null | undefined = null;
    const user = existingAppointment.user;
    if (user.dateOfBirth) {
      userAge = calculateAge(user.dateOfBirth);
    } else if (user.age !== null && user.age !== undefined) {
      userAge = user.age;
    }

    // Check if new slot is available
    // Note: We should exclude the current appointment from availability check
    // For simplicity, we'll check availability and then verify it's not the same slot
    const slotAvailable = await isSlotAvailable(
      newDate,
      appointmentTime,
      existingAppointment.locationType as LocationType,
      userAge,
      existingAppointment.outreachLocationId || undefined
    );

    // If same date/time, allow rescheduling
    const isSameSlot = 
      existingAppointment.appointmentDate.toISOString().split('T')[0] === appointmentDate &&
      existingAppointment.appointmentTime === appointmentTime;

    if (!slotAvailable && !isSameSlot) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      );
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        appointmentDate: newDate,
        appointmentTime,
        status: 'PENDING', // Reset to pending after reschedule
        updatedAt: new Date(),
      },
      include: {
        outreachLocation: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    // Send notifications
    const locationName = updatedAppointment.outreachLocation?.name || 'Resource Center';
    const { sendAppointmentStatusNotification } = await import('@/lib/notifications');
    
    await sendAppointmentStatusNotification(
      appointmentId,
      'RESCHEDULED',
      newDate,
      appointmentTime,
      locationName
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment rescheduled successfully',
        appointment: updatedAppointment,
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

    console.error('Reschedule appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule appointment' },
      { status: 500 }
    );
  }
}

