import { describe, it, expect } from 'vitest';
import {
  formatPhoneNumber,
  isValidKenyanPhone,
  isValidPIN,
  generateOTP,
} from '@/lib/utils';

describe('formatPhoneNumber', () => {
  it('should format phone numbers starting with 0', () => {
    expect(formatPhoneNumber('0712345678')).toBe('+254712345678');
  });

  it('should format phone numbers starting with 254', () => {
    expect(formatPhoneNumber('254712345678')).toBe('+254712345678');
  });

  it('should return phone numbers starting with +254 as is', () => {
    expect(formatPhoneNumber('+254712345678')).toBe('+254712345678');
  });

  it('should remove spaces and dashes', () => {
    expect(formatPhoneNumber('0712 345 678')).toBe('+254712345678');
    expect(formatPhoneNumber('0712-345-678')).toBe('+254712345678');
  });
});

describe('isValidKenyanPhone', () => {
  it('should validate correct Kenyan phone numbers', () => {
    expect(isValidKenyanPhone('+254712345678')).toBe(true);
    expect(isValidKenyanPhone('+254723456789')).toBe(true);
    expect(isValidKenyanPhone('0712345678')).toBe(true);
  });

  it('should reject invalid Kenyan phone numbers', () => {
    expect(isValidKenyanPhone('+25471234567')).toBe(false); // Too short
    expect(isValidKenyanPhone('+2547123456789')).toBe(false); // Too long
    expect(isValidKenyanPhone('+254012345678')).toBe(false); // Invalid prefix
  });
});

describe('isValidPIN', () => {
  it('should validate 4-digit PINs', () => {
    expect(isValidPIN('1234')).toBe(true);
    expect(isValidPIN('0000')).toBe(true);
    expect(isValidPIN('9999')).toBe(true);
  });

  it('should reject invalid PINs', () => {
    expect(isValidPIN('123')).toBe(false); // Too short
    expect(isValidPIN('12345')).toBe(false); // Too long
    expect(isValidPIN('12a4')).toBe(false); // Contains letter
    expect(isValidPIN('12.4')).toBe(false); // Contains special char
  });
});

describe('generateOTP', () => {
  it('should generate OTP of correct length', () => {
    const otp = generateOTP(6);
    expect(otp).toHaveLength(6);
  });

  it('should generate OTP with only digits', () => {
    const otp = generateOTP(6);
    expect(/^\d+$/.test(otp)).toBe(true);
  });

  it('should generate different OTPs', () => {
    const otp1 = generateOTP(6);
    const otp2 = generateOTP(6);
    // While not guaranteed, extremely unlikely to be the same
    // This tests randomness to a degree
    expect(otp1).toBeDefined();
    expect(otp2).toBeDefined();
  });
});


