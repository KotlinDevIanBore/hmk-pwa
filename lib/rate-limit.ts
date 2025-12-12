/**
 * Rate Limiting Utility
 * Implements in-memory rate limiting for API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  max?: number;
  windowMs?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID, phone number)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const max = config.max || parseInt(process.env.RATE_LIMIT_MAX || '5');
  const windowMs = config.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
  
  const now = Date.now();
  const resetTime = now + windowMs;
  
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || entry.resetTime < now) {
    // First request or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime,
    });
    
    return {
      success: true,
      limit: max,
      remaining: max - 1,
      reset: resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitMap.set(identifier, entry);
  
  if (entry.count > max) {
    return {
      success: false,
      limit: max,
      remaining: 0,
      reset: entry.resetTime,
    };
  }
  
  return {
    success: true,
    limit: max,
    remaining: max - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Reset rate limit for an identifier
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}

