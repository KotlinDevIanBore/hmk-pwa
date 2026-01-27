/**
 * Admin Registration
 * POST /api/admin/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

const registerSchema = z.object({
  token: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { token, firstName, lastName, password } = validation.data;

    // Find and validate invite
    const invite = await prisma.adminInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid invite token' },
        { status: 400 }
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

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: invite.email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'An admin user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        email: invite.email,
        passwordHash,
        role: invite.role,
        firstName,
        lastName,
        isActive: true,
      },
    });

    // Mark invite as used
    await prisma.adminInvite.update({
      where: { id: invite.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    );
  }
}
