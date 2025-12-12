/**
 * Device Details API Route
 * GET /api/devices/[id]
 * Fetches a specific device by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const device = await prisma.mobilityDevice.findUnique({
      where: { id },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        device,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get device error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device' },
      { status: 500 }
    );
  }
}

