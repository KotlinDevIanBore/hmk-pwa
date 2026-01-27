/**
 * Admin Feedback API Route
 * GET /api/admin/feedback
 * Returns all feedback for admin review
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check authentication
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdminRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(session.role);
    if (!isAdminRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch all feedback with user information
    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        feedbacks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
