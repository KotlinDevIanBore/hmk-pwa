import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any spaces, dashes, or parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // If starts with 0, replace with +254
  if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  }
  
  // If starts with 254, add +
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  }
  
  // If already starts with +254, return as is
  if (cleaned.startsWith('+254')) {
    return cleaned;
  }
  
  // Default: assume it's a Kenyan number without prefix
  return `+254${cleaned}`;
}

/**
 * Validate Kenyan phone number
 */
export function isValidKenyanPhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Kenyan numbers are +254 followed by 9 digits
  return /^\+254[17]\d{8}$/.test(formatted);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * Generate a random OTP
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/**
 * Validate PIN (4 digits)
 */
export function isValidPIN(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


