/**
 * Send SMS
 * POST /api/admin/sms/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { sendSmsNotification } from '@/lib/notifications';

const sendSmsSchema = z.object({
  phoneNumber: z.string().min(10),
  message: z.string().min(1).max(500),
  purpose: z.string().default('admin_notification'),
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

    const isAdminRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(session.role);
    if (!isAdminRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = sendSmsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { phoneNumber, message, purpose } = validation.data;

    // Send SMS
    await sendSmsNotification(null, phoneNumber, message, purpose);

    return NextResponse.json(
      {
        success: true,
        message: 'SMS sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send SMS error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
