/**
 * Validate Admin Invite
 * GET /api/admin/invites/validate
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find invite
    const invite = await prisma.adminInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid invite token' },
        { status: 404 }
      );
    }

    if (invite.isUsed) {
      return NextResponse.json(
        { error: 'This invite has already been used' },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: 'This invite has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        invite: {
          email: invite.email,
          role: invite.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Validate invite error:', error);
    return NextResponse.json(
      { error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}
