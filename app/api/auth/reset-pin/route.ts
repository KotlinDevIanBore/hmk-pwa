/**
 * Reset PIN API Route
 * POST /api/auth/reset-pin
 * Resets user PIN after OTP verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validatePhoneNumber, formatPhoneNumber, hashPin, validatePin } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { sendViaAfricasTalking } from '@/lib/notifications/providers/africastalking';

const resetPinSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number is required'),
  userId: z.string().cuid('Invalid user ID'),
  newPin: z.string().min(4, 'PIN must be at least 4 digits'),
  confirmPin: z.string().min(4, 'PIN confirmation is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPinSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { phoneNumber, userId, newPin, confirmPin } = validation.data;
    
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    // Validate PIN format
    if (!validatePin(newPin)) {
      return NextResponse.json(
        { error: 'Invalid PIN format. PIN must be 4-6 digits.' },
        { status: 400 }
      );
    }
    
    // Check if PINs match
    if (newPin !== confirmPin) {
      return NextResponse.json(
        { error: 'PINs do not match' },
        { status: 400 }
      );
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Rate limiting
    const rateLimitResult = checkRateLimit(`reset:${formattedPhone}`, {
      max: 3,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });
    const headers = getRateLimitHeaders(rateLimitResult);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many reset attempts. Please try again later.',
          resetTime: new Date(rateLimitResult.reset).toISOString(),
        },
        { status: 429, headers }
      );
    }
    
    // Verify user exists and phone number matches
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user || user.phoneNumber !== formattedPhone) {
      return NextResponse.json(
        { error: 'Invalid user or phone number' },
        { status: 404, headers }
      );
    }
    
    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403, headers }
      );
    }
    
    // Verify that OTP was recently verified for pin_reset
    const recentOtpVerification = await prisma.otpLog.findFirst({
      where: {
        userId,
        purpose: 'pin_reset',
        isUsed: true,
        usedAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000), // Within last 10 minutes
        },
      },
      orderBy: {
        usedAt: 'desc',
      },
    });
    
    if (!recentOtpVerification) {
      return NextResponse.json(
        { error: 'OTP verification required. Please verify OTP first.' },
        { status: 403, headers }
      );
    }
    
    // Hash new PIN
    const pinHash = await hashPin(newPin);
    
    // Update user PIN
    await prisma.user.update({
      where: { id: userId },
      data: {
        pinHash,
        pin: null, // Clear old plain text PIN if exists
      },
    });
    
    // Log SMS notification

    const message =
  'HopemobilityKE: Your PIN has been successfully reset. If you did not request this change, please contact Hopemobility support.';


    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

   await sendViaAfricasTalking(formattedPhoneNumber,message);
    await prisma.smsLog.create({
      data: {
        userId,
        phoneNumber: formattedPhone,
        message: message,
        purpose: 'notification',
        status: 'sent',
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'PIN reset successfully',
      },
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('Reset PIN error:', error);
    return NextResponse.json(
      { error: 'Failed to reset PIN. Please try again.' },
      { status: 500 }
    );
  }
}

