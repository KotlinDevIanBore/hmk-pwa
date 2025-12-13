/**
 * Feedback API Route
 * POST /api/feedback
 * Submits user feedback (system feedback with rating or service/process feedback)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const feedbackSchema = z.object({
  type: z.enum(['system', 'service']),
  rating: z.number().min(1).max(5).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must not exceed 1000 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Parse request body
    const body = await request.json();
    const validation = feedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { type, rating, message } = validation.data;

    // Validate rating is required for system feedback
    if (type === 'system' && !rating) {
      return NextResponse.json(
        { error: 'Rating is required for system feedback' },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId: session.userId,
        rating: type === 'system' ? rating : null,
        category: type === 'system' ? 'general' : 'service',
        message,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your feedback!',
        feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Submit feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

