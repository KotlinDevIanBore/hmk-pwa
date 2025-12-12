/**
 * Devices API Route
 * GET /api/devices
 * Fetches mobility devices catalog
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const devices = await prisma.mobilityDevice.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        devices,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

