/**
 * Authentication Utilities
 * Handles JWT token generation, validation, and password hashing
 */

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Convert expiration string to seconds
function getExpirationSeconds(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));
  
  switch (unit) {
    case 'd': return value * 24 * 60 * 60;
    case 'h': return value * 60 * 60;
    case 'm': return value * 60;
    case 's': return value;
    default: return 7 * 24 * 60 * 60; // Default 7 days
  }
}

/**
 * JWT Token Payload Interface
 */
export interface TokenPayload {
  userId: string;
  phoneNumber: string;
  role: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown; // Index signature for JWTPayload compatibility
}

/**
 * Generate a JWT token for a user
 */
export async function generateToken(payload: TokenPayload): Promise<string> {
  const expirationSeconds = getExpirationSeconds(JWT_EXPIRES_IN);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expirationSeconds}s`)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Hash a PIN using bcrypt
 */
export async function hashPin(pin: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  return bcrypt.hash(pin, rounds);
}

/**
 * Verify a PIN against its hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  return bcrypt.hash(password, rounds);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a random OTP code
 */
export function generateOTP(): string {
  const length = parseInt(process.env.OTP_LENGTH || '6');
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
}

/**
 * Calculate OTP expiration time
 */
export function getOTPExpiryDate(): Date {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5');
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
}

/**
 * Validate phone number format (Kenyan numbers)
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove any spaces or dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check if it matches Kenyan phone number patterns
  // Accepts: 0712345678, +254712345678, 254712345678
  const kenyanPattern = /^(?:\+?254|0)?[17]\d{8}$/;
  
  return kenyanPattern.test(cleaned);
}

/**
 * Format phone number to standard format (+254...)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any spaces or dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // If starts with 0, replace with +254
  if (cleaned.startsWith('0')) {
    return `+254${cleaned.slice(1)}`;
  }
  
  // If starts with 254, add +
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  }
  
  // If already has +254, return as is
  if (cleaned.startsWith('+254')) {
    return cleaned;
  }
  
  // Otherwise, assume it needs +254 prefix
  return `+254${cleaned}`;
}

/**
 * Validate PIN format (4-6 digits)
 */
export function validatePin(pin: string): boolean {
  const pinPattern = /^\d{4,6}$/;
  return pinPattern.test(pin);
}

/**
 * Session cookie options
 */
export function getSessionCookieOptions() {
  const maxAge = parseInt(process.env.SESSION_MAX_AGE || '604800'); // 7 days default
  
  return {
    name: process.env.SESSION_COOKIE_NAME || 'hmk_session',
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

