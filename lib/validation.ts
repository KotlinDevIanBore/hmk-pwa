/**
 * Validation utilities for HMK PWA
 * Handles validation for phone numbers, ID numbers, age, etc.
 */

import { z } from 'zod';

/**
 * Phone number validation for Kenyan numbers
 * Accepts formats: 0712345678, +254712345678, 254712345678
 */
export function validatePhoneNumber(phone: string): boolean {
  // Handle null/undefined gracefully
  if (!phone) {
    return false;
  }
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Kenyan phone number pattern (Safaricom: 07XX, 01XX; Airtel: 07XX, 01XX)
  const pattern = /^(?:\+?254|0)?[17]\d{8}$/;
  
  return pattern.test(cleaned);
}

/**
 * Normalize phone number to E.164 format (+254XXXXXXXXX)
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  if (cleaned.startsWith('+254')) {
    return cleaned;
  } else if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  }
  
  return cleaned;
}

/**
 * Validate age (must be between 0 and 120)
 */
export function validateAge(age: number): boolean {
  return age >= 0 && age <= 120;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Validate date of birth (must be in the past and person must be at least 0 years old)
 */
export function validateDateOfBirth(dateOfBirth: Date): boolean {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  if (birthDate > today) {
    return false;
  }
  
  const age = calculateAge(birthDate);
  return validateAge(age);
}

/**
 * Validate Kenyan National ID
 * Format: 8 digits
 */
export function validateNationalId(nationalId: string): boolean {
  const pattern = /^\d{8}$/;
  return pattern.test(nationalId);
}

/**
 * Validate Kenyan Passport
 * Format: 1-2 letters followed by 6-7 digits
 */
export function validatePassport(passport: string): boolean {
  const pattern = /^[A-Z]{1,2}\d{6,7}$/i;
  return pattern.test(passport);
}

/**
 * Validate Birth Certificate Number
 * Format: Alphanumeric, typically 7-10 characters
 */
export function validateBirthCertificate(certNumber: string): boolean {
  const pattern = /^[A-Z0-9]{7,10}$/i;
  return pattern.test(certNumber);
}

/**
 * Validate NCPWD (National Council for Persons with Disabilities) Card Number
 * Format: Alphanumeric, typically 8-12 characters
 */
export function validateNCPWD(ncpwdNumber: string): boolean {
  const pattern = /^[A-Z0-9]{8,12}$/i;
  return pattern.test(ncpwdNumber);
}

/**
 * Validate ID number based on ID type
 */
export function validateIdNumber(idType: string, idNumber: string): boolean {
  switch (idType) {
    case 'NATIONAL_ID':
      return validateNationalId(idNumber);
    case 'PASSPORT':
      return validatePassport(idNumber);
    case 'BIRTH_CERTIFICATE':
      return validateBirthCertificate(idNumber);
    case 'NCPWD':
      return validateNCPWD(idNumber);
    default:
      return false;
  }
}

/**
 * Validate PIN format (4-6 digits)
 */
export function validatePinFormat(pin: string): boolean {
  const pattern = /^\d{4,6}$/;
  return pattern.test(pin);
}

/**
 * Validate email format (optional but must be valid if provided)
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return true; // Email is optional
  }
  
  // More robust email validation that accepts +, -, _, . and rejects consecutive dots
  const pattern = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Check for consecutive dots
  if (/\.\./.test(email)) {
    return false;
  }
  
  return pattern.test(email);
}

/**
 * Validate name (must be at least 2 characters, only letters, spaces, hyphens, and apostrophes)
 */
export function validateName(name: string): boolean {
  const pattern = /^[a-zA-Z\s\-']{2,50}$/;
  return pattern.test(name.trim());
}

/**
 * Zod schemas for form validation
 */

export const phoneNumberSchema = z.string()
  .min(10, 'Phone number is required')
  .refine(validatePhoneNumber, 'Invalid Kenyan phone number format');

export const pinSchema = z.string()
  .min(4, 'PIN must be at least 4 digits')
  .max(6, 'PIN must not exceed 6 digits')
  .refine(validatePinFormat, 'PIN must contain only digits');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .refine(validateName, 'Name must contain only letters, spaces, hyphens, and apostrophes');

export const emailSchema = z.string()
  .optional()
  .refine((email) => !email || validateEmail(email), 'Invalid email format');

export const ageSchema = z.number()
  .min(0, 'Age must be at least 0')
  .max(120, 'Age must not exceed 120')
  .int('Age must be a whole number');

export const dateOfBirthSchema = z.date()
  .refine(validateDateOfBirth, 'Invalid date of birth');

export const idTypeSchema = z.enum(['NATIONAL_ID', 'PASSPORT', 'BIRTH_CERTIFICATE', 'NCPWD']);

export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);

/**
 * PWD Registration Schema
 */
export const pwdRegistrationSchema = z.object({
  // Basic info
  firstName: nameSchema,
  lastName: nameSchema,
  age: ageSchema.optional(),
  dateOfBirth: dateOfBirthSchema.optional(),
  gender: genderSchema,
  
  // Contact
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
  
  // Location
  county: z.string().min(2, 'County is required'),
  subCounty: z.string().optional(),
  ward: z.string().optional(),
  village: z.string().optional(),
  
  // ID
  idType: idTypeSchema,
  idNumber: z.string().min(1, 'ID number is required'),
  
  // Disability
  disabilityType: z.enum(['MOBILITY', 'VISUAL', 'HEARING', 'COGNITIVE', 'MULTIPLE', 'OTHER']),
  
  // PIN
  pin: pinSchema,
  confirmPin: z.string(),
}).refine((data) => data.pin === data.confirmPin, {
  message: 'PINs do not match',
  path: ['confirmPin'],
}).refine((data) => validateIdNumber(data.idType, data.idNumber), {
  message: 'Invalid ID number format for selected ID type',
  path: ['idNumber'],
});

/**
 * Caregiver Registration Schema
 */
export const caregiverRegistrationSchema = z.object({
  // Caregiver info
  firstName: nameSchema,
  lastName: nameSchema,
  age: ageSchema.optional(),
  dateOfBirth: dateOfBirthSchema.optional(),
  gender: genderSchema,
  
  // Contact
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
  
  // Location
  county: z.string().min(2, 'County is required'),
  subCounty: z.string().optional(),
  ward: z.string().optional(),
  village: z.string().optional(),
  
  // ID
  idType: idTypeSchema,
  idNumber: z.string().min(1, 'ID number is required'),
  
  // PIN
  pin: pinSchema,
  confirmPin: z.string(),
  
  // Beneficiary (optional during initial registration)
  registeringForBeneficiary: z.boolean().default(false),
  beneficiary: z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    age: ageSchema.optional(),
    dateOfBirth: dateOfBirthSchema.optional(),
    gender: genderSchema,
    phoneNumber: phoneNumberSchema.optional(),
    relationship: z.enum(['PARENT', 'CHILD', 'SPOUSE', 'SIBLING', 'GUARDIAN', 'OTHER']),
    disabilityType: z.enum(['MOBILITY', 'VISUAL', 'HEARING', 'COGNITIVE', 'MULTIPLE', 'OTHER']),
  }).optional(),
}).refine((data) => data.pin === data.confirmPin, {
  message: 'PINs do not match',
  path: ['confirmPin'],
}).refine((data) => validateIdNumber(data.idType, data.idNumber), {
  message: 'Invalid ID number format for selected ID type',
  path: ['idNumber'],
});

/**
 * Profile Update Schema
 */
export const profileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema,
  dateOfBirth: dateOfBirthSchema.optional(),
  gender: genderSchema.optional(),
  county: z.string().optional(),
  subCounty: z.string().optional(),
  ward: z.string().optional(),
  village: z.string().optional(),
  preferredLanguage: z.enum(['en', 'sw']).optional(),
});

/**
 * Change PIN Schema
 */
export const changePinSchema = z.object({
  currentPin: pinSchema,
  newPin: pinSchema,
  confirmNewPin: z.string(),
}).refine((data) => data.newPin === data.confirmNewPin, {
  message: 'New PINs do not match',
  path: ['confirmNewPin'],
}).refine((data) => data.currentPin !== data.newPin, {
  message: 'New PIN must be different from current PIN',
  path: ['newPin'],
});

/**
 * Get validation error message for ID type
 */
export function getIdValidationMessage(idType: string): string {
  switch (idType) {
    case 'NATIONAL_ID':
      return 'National ID must be 8 digits';
    case 'PASSPORT':
      return 'Passport must be 1-2 letters followed by 6-7 digits';
    case 'BIRTH_CERTIFICATE':
      return 'Birth Certificate must be 7-10 alphanumeric characters';
    case 'NCPWD':
      return 'NCPWD card number must be 8-12 alphanumeric characters';
    default:
      return 'Invalid ID number format';
  }
}

