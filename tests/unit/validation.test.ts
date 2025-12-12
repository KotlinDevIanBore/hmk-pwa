/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validatePhoneNumber,
  normalizePhoneNumber,
  validateAge,
  calculateAge,
  validateDateOfBirth,
  validateNationalId,
  validatePassport,
  validateBirthCertificate,
  validateNCPWD,
  validateIdNumber,
  validatePinFormat,
  validateEmail,
  validateName,
  getIdValidationMessage,
} from '@/lib/validation';

describe('Phone Number Validation', () => {
  describe('validatePhoneNumber', () => {
    it('should validate Kenyan phone numbers with 07 prefix', () => {
      expect(validatePhoneNumber('0712345678')).toBe(true);
      expect(validatePhoneNumber('0723456789')).toBe(true);
      expect(validatePhoneNumber('0734567890')).toBe(true);
    });

    it('should validate Kenyan phone numbers with 01 prefix', () => {
      expect(validatePhoneNumber('0112345678')).toBe(true);
      expect(validatePhoneNumber('0123456789')).toBe(true);
    });

    it('should validate phone numbers with +254 prefix', () => {
      expect(validatePhoneNumber('+254712345678')).toBe(true);
      expect(validatePhoneNumber('+254723456789')).toBe(true);
    });

    it('should validate phone numbers with 254 prefix (no +)', () => {
      expect(validatePhoneNumber('254712345678')).toBe(true);
      expect(validatePhoneNumber('254723456789')).toBe(true);
    });

    it('should handle phone numbers with spaces and dashes', () => {
      expect(validatePhoneNumber('0712 345 678')).toBe(true);
      expect(validatePhoneNumber('0712-345-678')).toBe(true);
      expect(validatePhoneNumber('+254 712 345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('0612345678')).toBe(false); // Invalid prefix
      expect(validatePhoneNumber('071234567')).toBe(false); // Too short
      expect(validatePhoneNumber('07123456789')).toBe(false); // Too long
      expect(validatePhoneNumber('1234567890')).toBe(false); // Invalid format
      expect(validatePhoneNumber('')).toBe(false); // Empty
      expect(validatePhoneNumber('abcdefghij')).toBe(false); // Letters
    });
  });

  describe('normalizePhoneNumber', () => {
    it('should normalize phone numbers to E.164 format', () => {
      expect(normalizePhoneNumber('0712345678')).toBe('+254712345678');
      expect(normalizePhoneNumber('254712345678')).toBe('+254712345678');
      expect(normalizePhoneNumber('+254712345678')).toBe('+254712345678');
    });

    it('should handle spaces and dashes', () => {
      expect(normalizePhoneNumber('0712 345 678')).toBe('+254712345678');
      expect(normalizePhoneNumber('0712-345-678')).toBe('+254712345678');
    });
  });
});

describe('Age Validation', () => {
  describe('validateAge', () => {
    it('should validate valid ages', () => {
      expect(validateAge(0)).toBe(true);
      expect(validateAge(25)).toBe(true);
      expect(validateAge(65)).toBe(true);
      expect(validateAge(120)).toBe(true);
    });

    it('should reject invalid ages', () => {
      expect(validateAge(-1)).toBe(false);
      expect(validateAge(121)).toBe(false);
      expect(validateAge(200)).toBe(false);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const birthDate20YearsAgo = new Date(
        today.getFullYear() - 20,
        today.getMonth(),
        today.getDate()
      );
      expect(calculateAge(birthDate20YearsAgo)).toBe(20);
    });

    it('should handle birthday not yet occurred this year', () => {
      const today = new Date();
      const birthDateNextMonth = new Date(
        today.getFullYear() - 20,
        today.getMonth() + 1,
        today.getDate()
      );
      // If birthday hasn't occurred yet this year, age should be 19, not 20
      expect(calculateAge(birthDateNextMonth)).toBe(19);
    });
  });

  describe('validateDateOfBirth', () => {
    it('should validate valid dates of birth', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(validateDateOfBirth(yesterday)).toBe(true);

      const twentyYearsAgo = new Date();
      twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
      expect(validateDateOfBirth(twentyYearsAgo)).toBe(true);
    });

    it('should reject future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(validateDateOfBirth(tomorrow)).toBe(false);

      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      expect(validateDateOfBirth(nextYear)).toBe(false);
    });

    it('should reject dates resulting in invalid age', () => {
      const tooOld = new Date();
      tooOld.setFullYear(tooOld.getFullYear() - 121);
      expect(validateDateOfBirth(tooOld)).toBe(false);
    });
  });
});

describe('ID Number Validation', () => {
  describe('validateNationalId', () => {
    it('should validate valid national IDs', () => {
      expect(validateNationalId('12345678')).toBe(true);
      expect(validateNationalId('98765432')).toBe(true);
    });

    it('should reject invalid national IDs', () => {
      expect(validateNationalId('1234567')).toBe(false); // Too short
      expect(validateNationalId('123456789')).toBe(false); // Too long
      expect(validateNationalId('1234567A')).toBe(false); // Contains letter
      expect(validateNationalId('')).toBe(false); // Empty
    });
  });

  describe('validatePassport', () => {
    it('should validate valid passport numbers', () => {
      expect(validatePassport('A1234567')).toBe(true);
      expect(validatePassport('AB123456')).toBe(true);
      expect(validatePassport('P1234567')).toBe(true);
      expect(validatePassport('a1234567')).toBe(true); // Case insensitive
    });

    it('should reject invalid passport numbers', () => {
      expect(validatePassport('A12345')).toBe(false); // Too short
      expect(validatePassport('ABC123456')).toBe(false); // Too many letters
      expect(validatePassport('12345678')).toBe(false); // No letters
      expect(validatePassport('')).toBe(false); // Empty
    });
  });

  describe('validateBirthCertificate', () => {
    it('should validate valid birth certificate numbers', () => {
      expect(validateBirthCertificate('1234567')).toBe(true);
      expect(validateBirthCertificate('ABC123456')).toBe(true);
      expect(validateBirthCertificate('A1B2C3D4E5')).toBe(true);
      expect(validateBirthCertificate('abcd1234')).toBe(true); // Case insensitive
    });

    it('should reject invalid birth certificate numbers', () => {
      expect(validateBirthCertificate('123456')).toBe(false); // Too short
      expect(validateBirthCertificate('12345678901')).toBe(false); // Too long
      expect(validateBirthCertificate('ABC-123')).toBe(false); // Special characters
      expect(validateBirthCertificate('')).toBe(false); // Empty
    });
  });

  describe('validateNCPWD', () => {
    it('should validate valid NCPWD card numbers', () => {
      expect(validateNCPWD('12345678')).toBe(true);
      expect(validateNCPWD('ABC12345')).toBe(true);
      expect(validateNCPWD('A1B2C3D4E5F6')).toBe(true);
      expect(validateNCPWD('abcd12345678')).toBe(true); // Case insensitive
    });

    it('should reject invalid NCPWD card numbers', () => {
      expect(validateNCPWD('1234567')).toBe(false); // Too short
      expect(validateNCPWD('1234567890123')).toBe(false); // Too long
      expect(validateNCPWD('NCPWD-123')).toBe(false); // Special characters
      expect(validateNCPWD('')).toBe(false); // Empty
    });
  });

  describe('validateIdNumber', () => {
    it('should validate based on ID type', () => {
      expect(validateIdNumber('NATIONAL_ID', '12345678')).toBe(true);
      expect(validateIdNumber('PASSPORT', 'A1234567')).toBe(true);
      expect(validateIdNumber('BIRTH_CERTIFICATE', 'ABC12345')).toBe(true);
      expect(validateIdNumber('NCPWD', 'ABC123456')).toBe(true);
    });

    it('should reject invalid ID numbers for each type', () => {
      expect(validateIdNumber('NATIONAL_ID', '1234567')).toBe(false);
      expect(validateIdNumber('PASSPORT', '12345678')).toBe(false);
      expect(validateIdNumber('BIRTH_CERTIFICATE', '123456')).toBe(false);
      expect(validateIdNumber('NCPWD', '1234567')).toBe(false);
    });

    it('should reject unknown ID types', () => {
      expect(validateIdNumber('UNKNOWN', '12345678')).toBe(false);
    });
  });
});

describe('PIN Validation', () => {
  describe('validatePinFormat', () => {
    it('should validate valid PINs', () => {
      expect(validatePinFormat('1234')).toBe(true);
      expect(validatePinFormat('12345')).toBe(true);
      expect(validatePinFormat('123456')).toBe(true);
    });

    it('should reject invalid PINs', () => {
      expect(validatePinFormat('123')).toBe(false); // Too short
      expect(validatePinFormat('1234567')).toBe(false); // Too long
      expect(validatePinFormat('12a4')).toBe(false); // Contains letter
      expect(validatePinFormat('12.4')).toBe(false); // Contains special character
      expect(validatePinFormat('')).toBe(false); // Empty
    });
  });
});

describe('Email Validation', () => {
  describe('validateEmail', () => {
    it('should validate valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@example.co.ke')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should accept empty email (optional)', () => {
      expect(validateEmail('')).toBe(true);
      expect(validateEmail('   ')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('invalid@example')).toBe(false);
      expect(validateEmail('invalid..email@example.com')).toBe(false);
    });
  });
});

describe('Name Validation', () => {
  describe('validateName', () => {
    it('should validate valid names', () => {
      expect(validateName('John')).toBe(true);
      expect(validateName('Mary Jane')).toBe(true);
      expect(validateName("O'Brien")).toBe(true);
      expect(validateName('Jean-Pierre')).toBe(true);
      expect(validateName('Al')).toBe(true); // Minimum 2 characters
    });

    it('should reject invalid names', () => {
      expect(validateName('J')).toBe(false); // Too short
      expect(validateName('A'.repeat(51))).toBe(false); // Too long
      expect(validateName('John123')).toBe(false); // Contains numbers
      expect(validateName('John@Doe')).toBe(false); // Special characters
      expect(validateName('')).toBe(false); // Empty
      expect(validateName('  ')).toBe(false); // Only spaces
    });
  });
});

describe('ID Validation Messages', () => {
  describe('getIdValidationMessage', () => {
    it('should return correct messages for each ID type', () => {
      expect(getIdValidationMessage('NATIONAL_ID')).toBe('National ID must be 8 digits');
      expect(getIdValidationMessage('PASSPORT')).toBe('Passport must be 1-2 letters followed by 6-7 digits');
      expect(getIdValidationMessage('BIRTH_CERTIFICATE')).toBe('Birth Certificate must be 7-10 alphanumeric characters');
      expect(getIdValidationMessage('NCPWD')).toBe('NCPWD card number must be 8-12 alphanumeric characters');
      expect(getIdValidationMessage('UNKNOWN')).toBe('Invalid ID number format');
    });
  });
});

describe('Edge Cases', () => {
  it('should handle null and undefined gracefully', () => {
    // Phone validation should return false for null/undefined
    expect(validatePhoneNumber(null as any)).toBe(false);
    expect(validatePhoneNumber(undefined as any)).toBe(false);
  });

  it('should handle special characters in phone numbers', () => {
    expect(validatePhoneNumber('0712-345-678')).toBe(true);
    expect(validatePhoneNumber('0712 345 678')).toBe(true);
    expect(validatePhoneNumber('+254 (0) 712 345678')).toBe(false); // Parentheses not supported
  });

  it('should trim whitespace in names', () => {
    expect(validateName('  John  ')).toBe(true);
    expect(validateName('  Mary Jane  ')).toBe(true);
  });
});

