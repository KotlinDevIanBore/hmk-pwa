/**
 * PWD (Person with Disability) Registration API Route
 * POST /api/users/register-pwd
 * Complete registration for PWDs with full profile details
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPin } from '@/lib/auth';
import { createSession } from '@/lib/session';
import {
  pwdRegistrationSchema,
  normalizePhoneNumber,
  calculateAge,
} from '@/lib/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = pwdRegistrationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
    
    // Check if phone number already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });
    
    if (existingUser && existingUser.pinHash) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      );
    }
    
    // Check if ID number already exists (if provided)
    if (data.idNumber) {
      const existingIdUser = await prisma.user.findFirst({
        where: {
          idType: data.idType,
          idNumber: data.idNumber,
        },
      });
      
      if (existingIdUser) {
        return NextResponse.json(
          { error: 'ID number already registered' },
          { status: 409 }
        );
      }
    }
    
    // Hash PIN
    const pinHash = await hashPin(data.pin);
    
    // Calculate age from date of birth if provided
    const age = data.dateOfBirth ? calculateAge(data.dateOfBirth) : data.age;
    
    // Create or update user
    let user;
    if (existingUser) {
      // Update existing user (from OTP verification)
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          pinHash,
          role: 'PWD',
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          age,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          county: data.county,
          subCounty: data.subCounty,
          ward: data.ward,
          village: data.village,
          idType: data.idType,
          idNumber: data.idNumber,
          disabilityType: data.disabilityType,
          phoneVerified: true,
          profileComplete: true,
          lastLogin: new Date(),
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          phoneNumber: normalizedPhone,
          pinHash,
          role: 'PWD',
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          age,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          county: data.county,
          subCounty: data.subCounty,
          ward: data.ward,
          village: data.village,
          idType: data.idType,
          idNumber: data.idNumber,
          disabilityType: data.disabilityType,
          phoneVerified: true,
          profileComplete: true,
        },
      });
    }
    
    // Create session
    await createSession(user.id, user.phoneNumber, user.role);
    
    // Log SMS welcome message
    await prisma.smsLog.create({
      data: {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        message: `Welcome to HMK, ${data.firstName}! Your PWD registration is complete. You can now access all our services.`,
        purpose: 'notification',
        status: 'sent',
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'PWD registration completed successfully',
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          profileComplete: user.profileComplete,
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('PWD registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

