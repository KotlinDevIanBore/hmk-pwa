/**
 * SMS Logs API Route
 * GET /api/admin/sms-logs
 * Retrieves all SMS logs for the simulator dashboard
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // In production, add authentication check here
    // const session = await requireAuth();
    // if (session.role !== 'ADMIN') { ... }
    
    const smsLogs = await prisma.smsLog.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to last 100 messages
    });
    
    return NextResponse.json({
      success: true,
      smsLogs,
    });
    
  } catch (error) {
    console.error('Fetch SMS logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMS logs' },
      { status: 500 }
    );
  }
}

