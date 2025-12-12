/**
 * Logout API Route
 * POST /api/auth/logout
 * Destroys the user session
 */

import { NextResponse } from 'next/server';
import { destroySession, getSession } from '@/lib/session';

export async function POST() {
  try {
    // Get current session
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      );
    }
    
    // Destroy session
    await destroySession();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed. Please try again.' },
      { status: 500 }
    );
  }
}

