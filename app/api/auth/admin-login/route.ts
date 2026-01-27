/**
 * Admin Login API Route
 * POST /api/auth/admin-login
 * Authenticates an admin user with email and password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = adminLoginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    
    // Rate limiting
    const rateLimitResult = checkRateLimit(`admin-login:${normalizedEmail}`, {
      max: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });
    const headers = getRateLimitHeaders(rateLimitResult);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          resetTime: new Date(rateLimitResult.reset).toISOString(),
        },
        { status: 429, headers }
      );
    }
    
    // Find admin user by email
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401, headers }
      );
    }
    
    // Check if account is active
    if (!adminUser.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403, headers }
      );
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, adminUser.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401, headers }
      );
    }
    
    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        lastLogin: new Date(),
      },
    });
    
    // Create session (using admin user ID and role)
    await createSession(adminUser.id, adminUser.email, adminUser.role);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
        },
      },
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
