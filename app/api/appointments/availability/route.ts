/**
 * Appointment Availability API Route
 * GET /api/appointments/availability
 * Checks slot availability for appointments
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import {
  calculateResourceCenterSlots,
  calculateOutreachSlots,
  isResourceCenterDateAvailable,
  isOutreachDateAvailable,
  LocationType,
} from '@/lib/appointments';
import { calculateAge } from '@/lib/validation';

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  locationType: z.enum(['RESOURCE_CENTER', 'OUTREACH']),
  outreachLocationId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Get session for user age
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateStr = searchParams.get('date');
    const locationType = searchParams.get('locationType') as LocationType | null;
    const outreachLocationId = searchParams.get('outreachLocationId') || undefined;

    // Validate query parameters
    const validation = availabilityQuerySchema.safeParse({
      date: dateStr,
      locationType,
      outreachLocationId,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { date, locationType: locationTypeValue, outreachLocationId: locationId } = validation.data;

    // Parse date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      );
    }

    // Check date availability based on location type
    let dateAvailable = false;
    if (locationTypeValue === 'RESOURCE_CENTER') {
      dateAvailable = isResourceCenterDateAvailable(appointmentDate);
    } else {
      dateAvailable = isOutreachDateAvailable(appointmentDate);
    }

    if (!dateAvailable) {
      return NextResponse.json({
        success: true,
        dateAvailable: false,
        slots: [],
        message: `Appointments are not available on ${appointmentDate.toLocaleDateString()}`,
      });
    }

    // Get user age for Resource Center slot calculation
    let userAge: number | null | undefined = null;
    if (locationTypeValue === 'RESOURCE_CENTER') {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { dateOfBirth: true, age: true },
      });

      if (user?.dateOfBirth) {
        userAge = calculateAge(user.dateOfBirth);
      } else if (user?.age !== null && user?.age !== undefined) {
        userAge = user.age;
      }
    }

    // Calculate available slots
    let slots;
    if (locationTypeValue === 'RESOURCE_CENTER') {
      slots = await calculateResourceCenterSlots(appointmentDate, userAge);
    } else {
      slots = await calculateOutreachSlots(appointmentDate, locationId);
    }

    return NextResponse.json({
      success: true,
      dateAvailable: true,
      slots,
      locationType: locationTypeValue,
    });

  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

