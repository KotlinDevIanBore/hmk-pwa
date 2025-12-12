/**
 * Session Management Utilities
 * Handles user session creation and validation
 */

import { cookies } from 'next/headers';
import { generateToken, verifyToken, TokenPayload, getSessionCookieOptions } from './auth';

/**
 * Create a new session for a user
 */
export async function createSession(userId: string, phoneNumber: string, role: string): Promise<string> {
  const token = await generateToken({
    userId,
    phoneNumber,
    role,
  });
  
  const cookieOptions = getSessionCookieOptions();
  const cookieStore = await cookies();
  
  cookieStore.set(cookieOptions.name, token, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    maxAge: cookieOptions.maxAge,
    path: cookieOptions.path,
  });
  
  return token;
}

/**
 * Get the current session
 */
export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const cookieOptions = getSessionCookieOptions();
  const token = cookieStore.get(cookieOptions.name)?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const cookieOptions = getSessionCookieOptions();
  
  cookieStore.delete(cookieOptions.name);
}

/**
 * Refresh the session expiration
 */
export async function refreshSession(): Promise<void> {
  const session = await getSession();
  
  if (!session) {
    return;
  }
  
  await createSession(session.userId, session.phoneNumber, session.role);
}

/**
 * Require authentication for a page or API route
 * Throws an error if not authenticated
 */
export async function requireAuth(): Promise<TokenPayload> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized: No valid session found');
  }
  
  return session;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

