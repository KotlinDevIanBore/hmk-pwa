/**
 * Current User API Route
 * GET /api/auth/me
 * Returns the current authenticated user's information
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get current session
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if this is an admin user (role will be AdminRole enum value)
    const isAdminRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(session.role);
    
    if (isAdminRole) {
      // Fetch admin user details
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
        },
      });
      
      if (!adminUser) {
        return NextResponse.json(
          { error: 'Admin user not found' },
          { status: 404 }
        );
      }
      
      if (!adminUser.isActive) {
        return NextResponse.json(
          { error: 'Account is deactivated' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        {
          success: true,
          user: adminUser,
        },
        { status: 200 }
      );
    }
    
    // Fetch regular user details
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        phoneNumber: true,
        role: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        county: true,
        subCounty: true,
        ward: true,
        village: true,
        disabilityType: true,
        profileComplete: true,
        preferredLanguage: true,
        phoneVerified: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

