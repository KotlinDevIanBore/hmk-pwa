/**
 * Mark SMS as Delivered API Route
 * POST /api/admin/sms-logs/mark-delivered
 * Updates SMS status to delivered
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const markDeliveredSchema = z.object({
  id: z.string().cuid('Invalid SMS log ID'),
});

export async function POST(request: NextRequest) {
  try {
    // In production, add authentication check here
    // const session = await requireAuth();
    // if (session.role !== 'ADMIN') { ... }
    
    const body = await request.json();
    const validation = markDeliveredSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { id } = validation.data;
    
    // Update SMS log status
    await prisma.smsLog.update({
      where: { id },
      data: {
        status: 'delivered',
        deliveredAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'SMS marked as delivered',
    });
    
  } catch (error) {
    console.error('Mark delivered error:', error);
    return NextResponse.json(
      { error: 'Failed to update SMS status' },
      { status: 500 }
    );
  }
}

