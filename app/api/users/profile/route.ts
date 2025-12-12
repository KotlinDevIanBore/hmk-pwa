/**
 * User Profile API Route
 * GET /api/users/profile - Get current user's profile
 * PUT /api/users/profile - Update current user's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { profileUpdateSchema, calculateAge } from '@/lib/validation';
import { z } from 'zod';

/**
 * GET - Fetch current user's profile
 */
export async function GET(_request: NextRequest) {
  try {
    // Get session
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch user profile with relations
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        beneficiaries: {
          include: {
            pwd: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                disabilityType: true,
              },
            },
          },
        },
        caregivers: {
          include: {
            caregiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Remove sensitive data (pinHash and pin are intentionally excluded)
    const { pinHash: _pinHash, pin: _pin, ...userProfile } = user;
    
    return NextResponse.json(
      {
        success: true,
        profile: userProfile,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Get session
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = profileUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Calculate age from date of birth if provided
    let age;
    if (data.dateOfBirth) {
      age = calculateAge(data.dateOfBirth);
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth, age }),
        ...(data.gender && { gender: data.gender }),
        ...(data.county && { county: data.county }),
        ...(data.subCounty !== undefined && { subCounty: data.subCounty }),
        ...(data.ward !== undefined && { ward: data.ward }),
        ...(data.village !== undefined && { village: data.village }),
        ...(data.preferredLanguage && { preferredLanguage: data.preferredLanguage }),
        profileComplete: true,
      },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        age: true,
        dateOfBirth: true,
        gender: true,
        county: true,
        subCounty: true,
        ward: true,
        village: true,
        idType: true,
        idNumber: true,
        disabilityType: true,
        profileComplete: true,
        preferredLanguage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        profile: updatedUser,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

