'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Push Notification Manager Component
 * Handles push notification subscription and registration
 */
export function PushNotificationManager() {
  const { toast } = useToast();
  const [_isSupported, setIsSupported] = useState(false);
  const [_isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser',
        variant: 'error',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast({
        title: 'Permission Denied',
        description: 'Please allow notifications to receive updates',
        variant: 'error',
      });
      return;
    }

    return permission === 'granted';
  };

  const _subscribeToPush = async () => {
    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register subscription');
      }

      setIsSubscribed(true);
      toast({
        title: 'Success',
        description: 'Push notifications enabled successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable push notifications',
        variant: 'error',
      });
    }
  };

  // Helper functions
  function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray as Uint8Array<ArrayBuffer>;
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // This component doesn't render anything visible
  // It just manages push notification subscription in the background
  return null;
}

