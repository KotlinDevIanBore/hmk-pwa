/**
 * Service Request API Route
 * POST /api/services/request
 * Creates a new service request (operational or spiritual)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

const serviceRequestSchema = z.object({
  serviceType: z.enum(['OPERATIONAL', 'SPIRITUAL']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  deviceIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Parse request body
    const body = await request.json();
    const validation = serviceRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { serviceType, title, description, priority = 'medium', deviceIds } = validation.data;

    // Create service request
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        userId: session.userId,
        serviceType,
        title,
        description,
        priority,
        status: 'PENDING',
        notes: deviceIds ? `Requested devices: ${deviceIds.join(', ')}` : undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Service request created successfully',
        serviceRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Service request error:', error);
    return NextResponse.json(
      { error: 'Failed to create service request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/services/request
 * Get user's service requests
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const serviceType = searchParams.get('serviceType');

    const where: any = {
      userId: session.userId,
    };

    if (status) {
      where.status = status;
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    const serviceRequests = await prisma.serviceRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        serviceRequests,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Get service requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}

