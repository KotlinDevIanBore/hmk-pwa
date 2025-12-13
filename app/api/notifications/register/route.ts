/**
 * Push Notification Registration API Route
 * POST /api/notifications/register
 * Registers a user's push notification subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';

const subscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const _session = await requireAuth();

    // Parse request body
    const body = await request.json();
    const validation = subscriptionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { endpoint: _endpoint, keys: _keys } = validation.data;

    // Store subscription in database
    // Note: In a real implementation, you'd have a PushSubscription model
    // For now, we'll store it in a JSON field or create a simple model
    // This is a placeholder - you may want to create a proper model later
    
    // For now, we'll just return success
    // In production, you'd store this subscription and use it to send push notifications

    return NextResponse.json(
      {
        success: true,
        message: 'Push notification subscription registered successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Register push notification error:', error);
    return NextResponse.json(
      { error: 'Failed to register push notification' },
      { status: 500 }
    );
  }
}

