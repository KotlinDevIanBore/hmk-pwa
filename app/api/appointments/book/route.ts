/**
 * Book Appointment API Route
 * POST /api/appointments/book
 * Creates a new appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import {
  isSlotAvailable,
  getAgeGroup,
  LocationType,
  getResourceCenterServiceFee,
} from '@/lib/appointments';
import { calculateAge } from '@/lib/validation';

const bookAppointmentSchema = z.object({
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  locationType: z.enum(['RESOURCE_CENTER', 'OUTREACH']),
  outreachLocationId: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Parse request body
    const body = await request.json();
    const validation = bookAppointmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      appointmentDate,
      appointmentTime,
      locationType,
      outreachLocationId,
      purpose,
      notes,
    } = validation.data;

    // Parse date
    const date = new Date(appointmentDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        dateOfBirth: true,
        age: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate user age for Resource Center slots
    let userAge: number | null | undefined = null;
    if (user.dateOfBirth) {
      userAge = calculateAge(user.dateOfBirth);
    } else if (user.age !== null && user.age !== undefined) {
      userAge = user.age;
    }

    // Check slot availability
    const slotAvailable = await isSlotAvailable(
      date,
      appointmentTime,
      locationType as LocationType,
      userAge,
      outreachLocationId
    );

    if (!slotAvailable) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      );
    }

    // Validate outreach location if provided
    if (locationType === 'OUTREACH' && outreachLocationId) {
      const outreachLocation = await prisma.outreachLocation.findUnique({
        where: { id: outreachLocationId },
      });

      if (!outreachLocation || !outreachLocation.isActive) {
        return NextResponse.json(
          { error: 'Invalid or inactive outreach location' },
          { status: 400 }
        );
      }
    }

    // Determine age group for Resource Center
    let ageGroup: '<15' | '15+' | null = null;
    if (locationType === 'RESOURCE_CENTER') {
      ageGroup = getAgeGroup(userAge);
    }

    // Determine service fee (Resource Center only)
    let serviceFee: number | null = null;
    if (locationType === 'RESOURCE_CENTER') {
      serviceFee = getResourceCenterServiceFee();
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: session.userId,
        appointmentDate: date,
        appointmentTime,
        locationType,
        location: locationType === 'OUTREACH' && outreachLocationId
          ? (await prisma.outreachLocation.findUnique({ where: { id: outreachLocationId } }))?.name || null
          : locationType === 'RESOURCE_CENTER'
          ? 'Resource Center'
          : null,
        outreachLocationId: locationType === 'OUTREACH' ? outreachLocationId : null,
        purpose,
        notes,
        serviceFee,
        ageGroup,
        status: 'PENDING',
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

    // Send SMS confirmation
    const userName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : 'User';
    
    const locationName = appointment.outreachLocation?.name || 'Resource Center';
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const serviceFeeText = serviceFee ? `Service fee: KES ${serviceFee}. ` : '';
    
    const smsMessage = `Dear ${userName}, your appointment has been booked successfully. Date: ${formattedDate}, Time: ${appointmentTime}, Location: ${locationName}. ${serviceFeeText}Thank you! - HMK`;

    await prisma.smsLog.create({
      data: {
        userId: session.userId,
        phoneNumber: user.phoneNumber,
        message: smsMessage,
        purpose: 'appointment_confirmation',
        status: 'sent',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment booked successfully',
        appointment,
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Book appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}

