/**
 * Register API Route
 * POST /api/auth/register
 * Completes user registration after OTP verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPin, validatePin } from '@/lib/auth';
import { createSession } from '@/lib/session';

const registerSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  pin: z.string().min(4, 'PIN must be at least 4 digits'),
  confirmPin: z.string().min(4, 'PIN confirmation is required'),
  role: z.enum(['PWD', 'CAREGIVER']),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  disabilityType: z.enum(['MOBILITY', 'VISUAL', 'HEARING', 'COGNITIVE', 'MULTIPLE', 'OTHER']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { userId, pin, confirmPin, role, firstName, lastName, disabilityType } = validation.data;
    
    // Validate PIN format
    if (!validatePin(pin)) {
      return NextResponse.json(
        { error: 'Invalid PIN format. PIN must be 4-6 digits.' },
        { status: 400 }
      );
    }
    
    // Check if PINs match
    if (pin !== confirmPin) {
      return NextResponse.json(
        { error: 'PINs do not match' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if phone is verified
    if (!user.phoneVerified) {
      return NextResponse.json(
        { error: 'Phone number not verified. Please verify OTP first.' },
        { status: 403 }
      );
    }
    
    // Check if already registered (has PIN)
    if (user.pinHash) {
      return NextResponse.json(
        { error: 'User already registered' },
        { status: 409 }
      );
    }
    
    // Hash PIN
    const pinHash = await hashPin(pin);
    
    // Update user with registration details
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pinHash,
        role,
        firstName,
        lastName,
        disabilityType: role === 'PWD' ? disabilityType : null,
        lastLogin: new Date(),
      },
    });
    
    // Create session
    await createSession(updatedUser.id, updatedUser.phoneNumber, updatedUser.role);
    
    // Log SMS welcome message
    await prisma.smsLog.create({
      data: {
        userId: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        message: `Welcome to HMK, ${firstName}! Your registration is complete. You can now access all our services.`,
        purpose: 'notification',
        status: 'sent',
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Registration completed successfully',
        user: {
          id: updatedUser.id,
          phoneNumber: updatedUser.phoneNumber,
          role: updatedUser.role,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          profileComplete: updatedUser.profileComplete,
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

