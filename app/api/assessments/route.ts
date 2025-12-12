/**
 * Assessment API Route
 * POST /api/assessments - Create or update assessment
 * GET /api/assessments - Get user's assessments
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

const assessmentSchema = z.object({
  responses: z.record(z.string()),
  status: z.enum(['DRAFT', 'SUBMITTED']),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Parse request body
    const body = await request.json();
    const validation = assessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { responses, status } = validation.data;

    // Check if draft assessment exists
    const existingDraft = await prisma.assessment.findFirst({
      where: {
        userId: session.userId,
        status: 'DRAFT',
      },
    });

    let assessment;

    if (existingDraft) {
      // Update existing draft
      assessment = await prisma.assessment.update({
        where: { id: existingDraft.id },
        data: {
          responses: responses as any,
          status,
          submittedAt: status === 'SUBMITTED' ? new Date() : null,
        },
      });
    } else {
      // Create new assessment
      assessment = await prisma.assessment.create({
        data: {
          userId: session.userId,
          responses: responses as any,
          status,
          submittedAt: status === 'SUBMITTED' ? new Date() : null,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: status === 'SUBMITTED' ? 'Assessment submitted successfully' : 'Assessment saved',
        assessment,
      },
      { status: status === 'SUBMITTED' ? 201 : 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      userId: session.userId,
    };

    if (status) {
      where.status = status;
    }

    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return the most recent one if status filter is used
    if (status && assessments.length > 0) {
      return NextResponse.json(
        {
          success: true,
          assessment: assessments[0],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        assessments,
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

    console.error('Get assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

