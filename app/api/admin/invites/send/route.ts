/**
 * Send Admin Invite
 * POST /api/admin/invites/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const sendInviteSchema = z.object({
  email: z.string().email(),
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

    const isAdminRole = ['SUPER_ADMIN', 'ADMIN'].includes(session.role);
    if (!isAdminRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = sendInviteSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'An admin user with this email already exists' },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invite
    const invite = await prisma.adminInvite.create({
      data: {
        email: normalizedEmail,
        token,
        role,
        invitedBy: session.userId,
        expiresAt,
      },
    });

    // Get base URL from request
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const inviteUrl = `${origin}/admin/register?token=${token}`;

    // TODO: Send email with invite link
    // For now, we'll just return the URL
    // In production, you would use an email service like SendGrid, AWS SES, etc.
    console.log(`Invite URL for ${normalizedEmail}: ${inviteUrl}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Invite sent successfully',
        invite: {
          id: invite.id,
          email: invite.email,
          inviteUrl, // Return URL for testing
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send invite error:', error);
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    );
  }
}
