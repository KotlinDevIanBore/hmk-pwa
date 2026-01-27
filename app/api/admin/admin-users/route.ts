/**
 * Admin Users API Route
 * GET /api/admin/admin-users
 * Returns all admin users
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const isAdminRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(session.role);
    if (!isAdminRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        adminUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}
