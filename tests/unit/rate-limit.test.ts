/**
 * Rate Limiting Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  const testIdentifier = 'test-user-123';

  beforeEach(() => {
    // Reset before each test
    resetRateLimit(testIdentifier);
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit(testIdentifier, { max: 5 });
      
      expect(result.success).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(4);
    });

    it('should track multiple requests', () => {
      checkRateLimit(testIdentifier, { max: 5 });
      checkRateLimit(testIdentifier, { max: 5 });
      const result = checkRateLimit(testIdentifier, { max: 5 });
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should block requests after limit', () => {
      const config = { max: 3 };
      
      checkRateLimit(testIdentifier, config); // 1
      checkRateLimit(testIdentifier, config); // 2
      checkRateLimit(testIdentifier, config); // 3
      const result = checkRateLimit(testIdentifier, config); // 4 - should fail
      
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should include reset time', () => {
      const result = checkRateLimit(testIdentifier, { max: 5 });
      
      expect(result.reset).toBeDefined();
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('should allow different identifiers independently', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';
      const config = { max: 2 };
      
      checkRateLimit(user1, config);
      checkRateLimit(user1, config);
      const result1 = checkRateLimit(user1, config);
      
      const result2 = checkRateLimit(user2, config);
      
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for identifier', () => {
      const config = { max: 2 };
      
      checkRateLimit(testIdentifier, config);
      checkRateLimit(testIdentifier, config);
      let result = checkRateLimit(testIdentifier, config);
      expect(result.success).toBe(false);
      
      resetRateLimit(testIdentifier);
      
      result = checkRateLimit(testIdentifier, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('custom configuration', () => {
    it('should respect custom max limit', () => {
      const result = checkRateLimit(testIdentifier, { max: 10 });
      
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
    });

    it('should respect custom window', () => {
      const windowMs = 60 * 1000; // 1 minute
      const result = checkRateLimit(testIdentifier, { max: 5, windowMs });
      
      const expectedReset = Date.now() + windowMs;
      expect(result.reset).toBeGreaterThan(Date.now());
      expect(result.reset).toBeLessThanOrEqual(expectedReset + 100); // Allow 100ms tolerance
    });
  });
});

