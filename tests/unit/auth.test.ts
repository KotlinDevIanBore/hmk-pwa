/**
 * Authentication Utilities Unit Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  validatePhoneNumber,
  formatPhoneNumber,
  validatePin,
  generateOTP,
  hashPin,
  verifyPin,
} from '@/lib/auth';

describe('Authentication Utilities', () => {
  describe('validatePhoneNumber', () => {
    it('should validate correct Kenyan phone numbers', () => {
      expect(validatePhoneNumber('0712345678')).toBe(true);
      expect(validatePhoneNumber('0722345678')).toBe(true);
      expect(validatePhoneNumber('+254712345678')).toBe(true);
      expect(validatePhoneNumber('254712345678')).toBe(true);
      expect(validatePhoneNumber('0712 345 678')).toBe(true);
      expect(validatePhoneNumber('0712-345-678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('071234567')).toBe(false); // Too short
      expect(validatePhoneNumber('07123456789')).toBe(false); // Too long
      expect(validatePhoneNumber('0812345678')).toBe(false); // Invalid prefix
      expect(validatePhoneNumber('1234567890')).toBe(false); // Invalid format
      expect(validatePhoneNumber('')).toBe(false); // Empty
      expect(validatePhoneNumber('abcd')).toBe(false); // Non-numeric
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone numbers to +254 format', () => {
      expect(formatPhoneNumber('0712345678')).toBe('+254712345678');
      expect(formatPhoneNumber('254712345678')).toBe('+254712345678');
      expect(formatPhoneNumber('+254712345678')).toBe('+254712345678');
      expect(formatPhoneNumber('0722 345 678')).toBe('+254722345678');
      expect(formatPhoneNumber('0712-345-678')).toBe('+254712345678');
    });

    it('should handle edge cases', () => {
      expect(formatPhoneNumber('712345678')).toBe('+254712345678');
    });
  });

  describe('validatePin', () => {
    it('should validate correct PINs', () => {
      expect(validatePin('1234')).toBe(true);
      expect(validatePin('123456')).toBe(true);
      expect(validatePin('0000')).toBe(true);
      expect(validatePin('9999')).toBe(true);
    });

    it('should reject invalid PINs', () => {
      expect(validatePin('123')).toBe(false); // Too short
      expect(validatePin('1234567')).toBe(false); // Too long
      expect(validatePin('12a4')).toBe(false); // Contains letter
      expect(validatePin('')).toBe(false); // Empty
      expect(validatePin('12 34')).toBe(false); // Contains space
    });
  });

  describe('generateOTP', () => {
    it('should generate 6-digit OTP by default', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate numeric OTP', () => {
      const otp = generateOTP();
      expect(parseInt(otp, 10)).toBeGreaterThanOrEqual(0);
      expect(parseInt(otp, 10)).toBeLessThanOrEqual(999999);
    });

    it('should generate different OTPs', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      const otp3 = generateOTP();
      
      // Very unlikely all three are the same
      expect(otp1 === otp2 && otp2 === otp3).toBe(false);
    });
  });

  describe('hashPin and verifyPin', () => {
    let hashedPin: string;
    const testPin = '1234';

    beforeAll(async () => {
      hashedPin = await hashPin(testPin);
    });

    it('should hash a PIN', async () => {
      expect(hashedPin).toBeDefined();
      expect(hashedPin).not.toBe(testPin);
      expect(hashedPin.length).toBeGreaterThan(20);
    });

    it('should verify correct PIN', async () => {
      const isValid = await verifyPin(testPin, hashedPin);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect PIN', async () => {
      const isValid = await verifyPin('0000', hashedPin);
      expect(isValid).toBe(false);
    });

    it('should create different hashes for same PIN', async () => {
      const hash1 = await hashPin(testPin);
      const hash2 = await hashPin(testPin);
      
      // Bcrypt includes salt, so hashes should be different
      expect(hash1).not.toBe(hash2);
      
      // But both should verify correctly
      expect(await verifyPin(testPin, hash1)).toBe(true);
      expect(await verifyPin(testPin, hash2)).toBe(true);
    });
  });
});

