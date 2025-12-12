/**
 * Login API Route
 * POST /api/auth/login
 * Authenticates a user with phone number and PIN
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validatePhoneNumber, formatPhoneNumber, verifyPin, validatePin } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const loginSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number is required'),
  pin: z.string().min(4, 'PIN must be at least 4 digits'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { phoneNumber, pin } = validation.data;
    
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    // Validate PIN format
    if (!validatePin(pin)) {
      return NextResponse.json(
        { error: 'Invalid PIN format. PIN must be 4-6 digits.' },
        { status: 400 }
      );
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Rate limiting (prevent brute force)
    const rateLimitResult = checkRateLimit(`login:${formattedPhone}`, {
      max: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });
    const headers = getRateLimitHeaders(rateLimitResult);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          resetTime: new Date(rateLimitResult.reset).toISOString(),
        },
        { status: 429, headers }
      );
    }
    
    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber: formattedPhone },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid phone number or PIN' },
        { status: 401, headers }
      );
    }
    
    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403, headers }
      );
    }
    
    // Check if phone is verified
    if (!user.phoneVerified) {
      return NextResponse.json(
        { error: 'Phone number not verified. Please verify your phone first.' },
        { status: 403, headers }
      );
    }
    
    // Check if PIN is set
    if (!user.pinHash) {
      return NextResponse.json(
        { error: 'PIN not set. Please complete registration.' },
        { status: 403, headers }
      );
    }
    
    // Verify PIN
    const isPinValid = await verifyPin(pin, user.pinHash);
    
    if (!isPinValid) {
      return NextResponse.json(
        { error: 'Invalid phone number or PIN' },
        { status: 401, headers }
      );
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });
    
    // Create session
    await createSession(user.id, user.phoneNumber, user.role);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          profileComplete: user.profileComplete,
        },
      },
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

