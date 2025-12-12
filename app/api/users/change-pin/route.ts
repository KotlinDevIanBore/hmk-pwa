/**
 * Change PIN API Route
 * POST /api/users/change-pin
 * Allows users to change their PIN
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPin, verifyPin } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { changePinSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = changePinSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { currentPin, newPin } = validation.data;
    
    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        pinHash: true,
        phoneNumber: true,
        firstName: true,
      },
    });
    
    if (!user || !user.pinHash) {
      return NextResponse.json(
        { error: 'User not found or PIN not set' },
        { status: 404 }
      );
    }
    
    // Verify current PIN
    const isValidPin = await verifyPin(currentPin, user.pinHash);
    
    if (!isValidPin) {
      return NextResponse.json(
        { error: 'Current PIN is incorrect' },
        { status: 401 }
      );
    }
    
    // Hash new PIN
    const newPinHash = await hashPin(newPin);
    
    // Update user's PIN
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pinHash: newPinHash,
      },
    });
    
    // Log SMS notification
    await prisma.smsLog.create({
      data: {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        message: `Your HMK PIN has been changed successfully. If you did not make this change, please contact support immediately.`,
        purpose: 'notification',
        status: 'sent',
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'PIN changed successfully',
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Change PIN error:', error);
    
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
      { error: 'Failed to change PIN' },
      { status: 500 }
    );
  }
}

