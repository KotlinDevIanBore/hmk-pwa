/**
 * Notification Service
 * Handles push notifications and SMS notifications
 */

import { prisma } from './prisma';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send push notification (placeholder - requires web push library)
 * In production, you would use web-push library to send notifications
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  // TODO: Implement push notification sending
  // This would require:
  // 1. Storing user push subscriptions in database
  // 2. Using web-push library to send notifications
  // 3. Handling VAPID keys
  
  console.log(`[Push Notification] To user ${userId}: ${title} - ${body}`, data);
  
  // Placeholder implementation
  // In production:
  // const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  // for (const subscription of subscriptions) {
  //   await webpush.sendNotification(
  //     JSON.parse(subscription.subscription),
  //     JSON.stringify({ title, body, data })
  //   );
  // }
}

/**
 * Send SMS notification
 */
export async function sendSmsNotification(
  userId: string | null,
  phoneNumber: string,
  message: string,
  purpose: string = 'notification'
): Promise<void> {
  try {
    // Log SMS (simulated - in production, integrate with SMS provider)
    await prisma.smsLog.create({
      data: {
        userId,
        phoneNumber,
        message,
        purpose,
        status: 'sent',
        provider: process.env.SMS_PROVIDER || 'simulated',
      },
    });

    // In production, you would send actual SMS here:
    // if (process.env.SMS_PROVIDER === 'africastalking') {
    //   await sendViaAfricasTalking(phoneNumber, message);
    // }
    
    console.log(`[SMS Notification] To ${phoneNumber}: ${message}`);
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    throw error;
  }
}

/**
 * Send appointment status change notification
 */
export async function sendAppointmentStatusNotification(
  appointmentId: string,
  newStatus: string,
  appointmentDate: Date,
  appointmentTime: string,
  locationName: string
): Promise<void> {
  try {
    // Fetch appointment with user
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const userName = appointment.user.firstName && appointment.user.lastName
      ? `${appointment.user.firstName} ${appointment.user.lastName}`
      : 'User';

    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create notification message based on status
    let message = '';
    const title = 'Appointment Status Update';

    switch (newStatus) {
      case 'CONFIRMED':
        message = `Dear ${userName}, your appointment has been confirmed. Date: ${formattedDate}, Time: ${appointmentTime}, Location: ${locationName}. Thank you! - HMK`;
        break;
      case 'RESCHEDULED':
        message = `Dear ${userName}, your appointment has been rescheduled. New Date: ${formattedDate}, Time: ${appointmentTime}, Location: ${locationName}. Thank you! - HMK`;
        break;
      case 'CHECKED_IN':
        message = `Dear ${userName}, you have been checked in for your appointment on ${formattedDate} at ${appointmentTime}. - HMK`;
        break;
      case 'CHECKED_OUT':
        message = `Dear ${userName}, you have been checked out. Thank you for visiting HMK! - HMK`;
        break;
      case 'COMPLETED':
        message = `Dear ${userName}, your appointment on ${formattedDate} has been marked as completed. Thank you! - HMK`;
        break;
      case 'CANCELLED':
        message = `Dear ${userName}, your appointment on ${formattedDate} has been cancelled. Please contact us if you have any questions. - HMK`;
        break;
      case 'NO_SHOW':
        message = `Dear ${userName}, we noticed you missed your appointment on ${formattedDate}. Please contact us to reschedule. - HMK`;
        break;
      default:
        message = `Dear ${userName}, your appointment status has been updated to ${newStatus}. Date: ${formattedDate}, Time: ${appointmentTime}. - HMK`;
    }

    // Send push notification
    await sendPushNotification(
      appointment.user.id,
      title,
      message,
      {
        appointmentId,
        status: newStatus,
        type: 'appointment_status_update',
      }
    );

    // Send SMS notification
    await sendSmsNotification(
      appointment.user.id,
      appointment.user.phoneNumber,
      message,
      'appointment_status_update'
    );
  } catch (error) {
    console.error('Failed to send appointment status notification:', error);
    // Don't throw - we don't want notification failures to break the status update
  }
}

