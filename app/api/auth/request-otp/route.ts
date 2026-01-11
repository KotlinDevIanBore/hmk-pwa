/**
 * Request OTP API Route
 * POST /api/auth/request-otp
 * Generates and logs an OTP for phone verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateOTP, getOTPExpiryDate, validatePhoneNumber, formatPhoneNumber } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { sendOTP } from '@/lib/otp-notification';

const requestOTPSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number is required'),
  purpose: z.enum(['registration', 'login', 'pin_reset']),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = requestOTPSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { phoneNumber, purpose } = validation.data;
    
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Rate limiting
    const rateLimitResult = checkRateLimit(`otp:${formattedPhone}`);
    const headers = getRateLimitHeaders(rateLimitResult);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many OTP requests. Please try again later.',
          resetTime: new Date(rateLimitResult.reset).toISOString(),
        },
        { status: 429, headers }
      );
    }
    
    // Check if user exists (for login and pin_reset purposes)
    if (purpose === 'login' || purpose === 'pin_reset') {
      const user = await prisma.user.findUnique({
        where: { phoneNumber: formattedPhone },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found with this phone number' },
          { status: 404, headers }
        );
      }
      
      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Account is deactivated. Please contact support.' },
          { status: 403, headers }
        );
      }
    }
    
    // For registration, check if user already exists and completed registration
    if (purpose === 'registration') {
      const existingUser = await prisma.user.findUnique({
        where: { phoneNumber: formattedPhone },
      });
      
      // Only reject if user has completed registration (has a PIN set)
      if (existingUser && existingUser.pinHash) {
        return NextResponse.json(
          { error: 'Phone number already registered. Please login instead.' },
          { status: 409, headers }
        );
      }
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryDate();
    
    // Invalidate any existing unused OTPs for this phone number and purpose
    await prisma.otpLog.updateMany({
      where: {
        phoneNumber: formattedPhone,
        purpose,
        isUsed: false,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
    
    // Find or create temporary user ID for registration
    let userId: string;
    
    if (purpose === 'registration') {
      // Check if temporary user already exists (incomplete registration)
      let tempUser = await prisma.user.findUnique({
        where: { phoneNumber: formattedPhone },
      });
      
      // Create temporary user record if doesn't exist
      if (!tempUser) {
        tempUser = await prisma.user.create({
          data: {
            phoneNumber: formattedPhone,
            role: 'PWD', // Default role, will be updated during registration
            phoneVerified: false,
          },
        });
      }
      
      userId = tempUser.id;
    } else {
      // Get existing user
      const user = await prisma.user.findUnique({
        where: { phoneNumber: formattedPhone },
      });
      userId = user!.id;
    }
    
    // Save OTP to database
    await prisma.otpLog.create({
      data: {
        userId,
        phoneNumber: formattedPhone,
        otp,
        purpose,
        expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
    });

    await sendOTP(userId,phoneNumber,otp,purpose)   
    // Log SMS (simulated)
    await prisma.smsLog.create({
      data: {
        userId,
        phoneNumber: formattedPhone,
        message: `Your HMK verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.`,
        purpose: 'otp',
        status: 'sent',
      },
    });
    
    // In development, return OTP for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent successfully',
        expiresAt: expiresAt.toISOString(),
        ...(isDevelopment && { otp }), // Only include OTP in development
      },
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('Request OTP error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { 
        error: 'Failed to send OTP. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { 
          debug: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    );
  }
}

