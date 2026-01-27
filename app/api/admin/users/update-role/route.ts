/**
 * Update User Role
 * POST /api/admin/users/update-role
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['PWD', 'CAREGIVER']),
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

    const isAdminRole = ['SUPER_ADMIN', 'ADMIN'].includes(session.role);
    if (!isAdminRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateRoleSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId, role } = validation.data;

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User role updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
