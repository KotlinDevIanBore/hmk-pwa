/**
 * Outreach Locations API Route
 * GET /api/outreach-locations
 * Fetches active outreach locations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Optional: Filter by county from query params
    const searchParams = request.nextUrl.searchParams;
    const county = searchParams.get('county');

    const where: any = {
      isActive: true,
    };

    if (county) {
      where.county = county;
    }

    const locations = await prisma.outreachLocation.findMany({
      where,
      orderBy: [
        { county: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        locations,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get outreach locations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outreach locations' },
      { status: 500 }
    );
  }
}

