/**
 * Appointment Booking Business Logic
 * Handles slot calculation, validation, and business rules
 */

import { prisma } from './prisma';
import { AppointmentStatus, Prisma } from '@prisma/client';

export type LocationType = 'RESOURCE_CENTER' | 'OUTREACH';

export interface SlotAvailability {
  date: string;
  available: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  availableForAgeGroup?: '<15' | '15+';
  slotCount?: number; // Available slots for this time
}

/**
 * Get the day of week (0 = Sunday, 1 = Monday, etc.)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Check if a date is a weekday (Monday-Friday)
 */
export function isWeekday(date: Date): boolean {
  const day = getDayOfWeek(date);
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
}

/**
 * Check if Resource Center appointment is allowed on this date
 * Resource Center: Only Tuesday (2) and Thursday (4)
 */
export function isResourceCenterDateAvailable(date: Date): boolean {
  const day = getDayOfWeek(date);
  return day === 2 || day === 4; // Tuesday or Thursday
}

/**
 * Check if Outreach appointment is allowed on this date
 * Outreach: Weekdays only (Monday-Friday)
 */
export function isOutreachDateAvailable(date: Date): boolean {
  return isWeekday(date);
}

/**
 * Get default time slots for appointments
 */
export function getDefaultTimeSlots(): string[] {
  // Standard appointment slots: 9 AM to 4 PM, hourly
  return [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];
}

/**
 * Determine age group from age
 */
export function getAgeGroup(age: number | null | undefined): '<15' | '15+' | null {
  if (age === null || age === undefined) {
    return null;
  }
  return age < 15 ? '<15' : '15+';
}

/**
 * Get default slot allocation for Resource Center
 */
export function getResourceCenterSlotAllocation() {
  return {
    totalSlots: 15,
    slotsUnder15: 6,
    slotsOver15: 9,
  };
}

/**
 * Check appointment configuration for a specific date
 */
export async function getAppointmentConfig(
  date: Date,
  locationType: LocationType
) {
  const dateStr = date.toISOString().split('T')[0];
  const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
  const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

  const config = await prisma.appointmentConfig.findFirst({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      locationType,
    },
  });

  return config;
}

/**
 * Get booked slots for a specific date and location type
 */
export async function getBookedSlots(
  date: Date,
  locationType: LocationType,
  outreachLocationId?: string
) {
  const dateStr = date.toISOString().split('T')[0];
  const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
  const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

  const where: Prisma.AppointmentWhereInput = {
    appointmentDate: {
      gte: startOfDay,
      lte: endOfDay,
    },
    locationType,
    status: {
      not: 'CANCELLED' as AppointmentStatus,
    },
  };

  if (locationType === 'OUTREACH' && outreachLocationId) {
    where.outreachLocationId = outreachLocationId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      appointmentTime: true,
      ageGroup: true,
      status: true,
    },
  });

  return appointments;
}

/**
 * Calculate available slots for Resource Center
 */
export async function calculateResourceCenterSlots(
  date: Date,
  userAge: number | null | undefined
): Promise<TimeSlot[]> {
  const config = await getAppointmentConfig(date, 'RESOURCE_CENTER');
  const bookedSlots = await getBookedSlots(date, 'RESOURCE_CENTER');
  
  const defaultAllocation = getResourceCenterSlotAllocation();
  
  // Use config overrides if available, otherwise use defaults
  const slotsUnder15 = config?.slotsUnder15 ?? defaultAllocation.slotsUnder15;
  const slotsOver15 = config?.slotsOver15 ?? defaultAllocation.slotsOver15;

  // Group booked slots by time and age group
  const bookedByTime: Record<string, { '<15': number; '15+': number }> = {};
  
  bookedSlots.forEach((appointment) => {
    if (!bookedByTime[appointment.appointmentTime]) {
      bookedByTime[appointment.appointmentTime] = { '<15': 0, '15+': 0 };
    }
    
    if (appointment.ageGroup === '<15') {
      bookedByTime[appointment.appointmentTime]['<15']++;
    } else if (appointment.ageGroup === '15+') {
      bookedByTime[appointment.appointmentTime]['15+']++;
    }
  });

  const timeSlots = getDefaultTimeSlots();
  const userAgeGroup = getAgeGroup(userAge);

  return timeSlots.map((time) => {
    const booked = bookedByTime[time] || { '<15': 0, '15+': 0 };
    
    // Calculate available slots for each age group
    const availableUnder15 = Math.max(0, slotsUnder15 - booked['<15']);
    const availableOver15 = Math.max(0, slotsOver15 - booked['15+']);
    
    // Determine if this slot is available for the user's age group
    let available = false;
    let availableForAgeGroup: '<15' | '15+' | undefined;
    let slotCount: number | undefined;

    if (userAgeGroup === '<15') {
      available = availableUnder15 > 0;
      availableForAgeGroup = '<15';
      slotCount = availableUnder15;
    } else if (userAgeGroup === '15+') {
      available = availableOver15 > 0;
      availableForAgeGroup = '15+';
      slotCount = availableOver15;
    } else {
      // If age is unknown, show if any slots are available
      available = availableUnder15 > 0 || availableOver15 > 0;
      slotCount = availableUnder15 + availableOver15;
    }

    return {
      time,
      available,
      availableForAgeGroup,
      slotCount,
    };
  });
}

/**
 * Calculate available slots for Outreach
 * Outreach has unlimited slots, so we just check if the date is available
 */
export async function calculateOutreachSlots(
  date: Date,
  _outreachLocationId?: string
): Promise<TimeSlot[]> {
  const config = await getAppointmentConfig(date, 'OUTREACH');
  
  // Check if date is disabled via config
  if (config && !config.isAvailable) {
    return getDefaultTimeSlots().map((time) => ({
      time,
      available: false,
    }));
  }

  // Outreach has unlimited slots, all times are available on weekdays
  const timeSlots = getDefaultTimeSlots();
  
  return timeSlots.map((time) => ({
    time,
    available: true,
  }));
}

/**
 * Check if a specific slot is available
 */
export async function isSlotAvailable(
  date: Date,
  time: string,
  locationType: LocationType,
  userAge: number | null | undefined,
  outreachLocationId?: string
): Promise<boolean> {
  // Check date availability based on location type
  if (locationType === 'RESOURCE_CENTER') {
    if (!isResourceCenterDateAvailable(date)) {
      return false;
    }
  } else if (locationType === 'OUTREACH') {
    if (!isOutreachDateAvailable(date)) {
      return false;
    }
  }

  // Check appointment config
  const config = await getAppointmentConfig(date, locationType);
  if (config && !config.isAvailable) {
    return false;
  }

  // Check slot availability
  if (locationType === 'RESOURCE_CENTER') {
    const slots = await calculateResourceCenterSlots(date, userAge);
    const slot = slots.find((s) => s.time === time);
    return slot?.available ?? false;
  } else {
    const slots = await calculateOutreachSlots(date, outreachLocationId);
    const slot = slots.find((s) => s.time === time);
    return slot?.available ?? false;
  }
}

/**
 * Get service fee for Resource Center (if applicable)
 */
export function getResourceCenterServiceFee(): number {
  // Default service fee (can be made configurable later)
  return 500; // KES 500
}

