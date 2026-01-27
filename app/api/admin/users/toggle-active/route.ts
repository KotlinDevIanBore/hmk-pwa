/**
 * Toggle User Active Status
 * POST /api/admin/users/toggle-active
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const toggleActiveSchema = z.object({
  userId: z.string(),
  isActive: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const isAdminRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(session.role);
    if (!isAdminRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = toggleActiveSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId, isActive } = validation.data;

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return NextResponse.json(
      {
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Toggle active error:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
