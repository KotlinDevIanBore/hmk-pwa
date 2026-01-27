/**
 * Update Admin User Role
 * POST /api/admin/admin-users/update-role
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT']),
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

    // Only SUPER_ADMIN can change roles
    if (session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only super admins can change roles.' },
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

    await prisma.adminUser.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user role updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Failed to update admin user role' },
      { status: 500 }
    );
  }
}
