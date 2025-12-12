/**
 * Verify OTP API Route
 * POST /api/auth/verify-otp
 * Validates an OTP code
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validatePhoneNumber, formatPhoneNumber } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const verifyOTPSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number is required'),
  otp: z.string().length(parseInt(process.env.OTP_LENGTH || '6'), 'Invalid OTP length'),
  purpose: z.enum(['registration', 'login', 'pin_reset']),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = verifyOTPSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { phoneNumber, otp, purpose } = validation.data;
    
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Rate limiting (stricter for verification)
    const rateLimitResult = checkRateLimit(`verify:${formattedPhone}`, {
      max: 3,
      windowMs: 5 * 60 * 1000, // 5 minutes
    });
    const headers = getRateLimitHeaders(rateLimitResult);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many verification attempts. Please request a new OTP.',
          resetTime: new Date(rateLimitResult.reset).toISOString(),
        },
        { status: 429, headers }
      );
    }
    
    // Find the most recent unused OTP for this phone number and purpose
    const otpLog = await prisma.otpLog.findFirst({
      where: {
        phoneNumber: formattedPhone,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (!otpLog) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400, headers }
      );
    }
    
    // Verify OTP matches
    if (otpLog.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400, headers }
      );
    }
    
    // Mark OTP as used
    await prisma.otpLog.update({
      where: { id: otpLog.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
    
    // Update user phone verification status
    await prisma.user.update({
      where: { id: otpLog.userId },
      data: {
        phoneVerified: true,
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully',
        userId: otpLog.userId,
      },
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}

