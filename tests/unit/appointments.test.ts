/**
 * Unit tests for appointment booking business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDayOfWeek,
  isWeekday,
  isResourceCenterDateAvailable,
  isOutreachDateAvailable,
  getDefaultTimeSlots,
  getAgeGroup,
  getResourceCenterSlotAllocation,
} from '@/lib/appointments';

describe('Appointment Business Logic', () => {
  describe('getDayOfWeek', () => {
    it('should return correct day of week', () => {
      // Sunday = 0, Monday = 1, Tuesday = 2, etc.
      const sunday = new Date('2024-12-15'); // Sunday
      const monday = new Date('2024-12-16'); // Monday
      const tuesday = new Date('2024-12-17'); // Tuesday
      const thursday = new Date('2024-12-19'); // Thursday

      expect(getDayOfWeek(sunday)).toBe(0);
      expect(getDayOfWeek(monday)).toBe(1);
      expect(getDayOfWeek(tuesday)).toBe(2);
      expect(getDayOfWeek(thursday)).toBe(4);
    });
  });

  describe('isWeekday', () => {
    it('should return true for weekdays (Monday-Friday)', () => {
      const monday = new Date('2024-12-16');
      const wednesday = new Date('2024-12-18');
      const friday = new Date('2024-12-20');

      expect(isWeekday(monday)).toBe(true);
      expect(isWeekday(wednesday)).toBe(true);
      expect(isWeekday(friday)).toBe(true);
    });

    it('should return false for weekends', () => {
      const saturday = new Date('2024-12-21');
      const sunday = new Date('2024-12-15');

      expect(isWeekday(saturday)).toBe(false);
      expect(isWeekday(sunday)).toBe(false);
    });
  });

  describe('isResourceCenterDateAvailable', () => {
    it('should return true for Tuesday', () => {
      const tuesday = new Date('2024-12-17'); // Tuesday
      expect(isResourceCenterDateAvailable(tuesday)).toBe(true);
    });

    it('should return true for Thursday', () => {
      const thursday = new Date('2024-12-19'); // Thursday
      expect(isResourceCenterDateAvailable(thursday)).toBe(true);
    });

    it('should return false for other days', () => {
      const monday = new Date('2024-12-16'); // Monday
      const wednesday = new Date('2024-12-18'); // Wednesday
      const friday = new Date('2024-12-20'); // Friday
      const saturday = new Date('2024-12-21'); // Saturday
      const sunday = new Date('2024-12-15'); // Sunday

      expect(isResourceCenterDateAvailable(monday)).toBe(false);
      expect(isResourceCenterDateAvailable(wednesday)).toBe(false);
      expect(isResourceCenterDateAvailable(friday)).toBe(false);
      expect(isResourceCenterDateAvailable(saturday)).toBe(false);
      expect(isResourceCenterDateAvailable(sunday)).toBe(false);
    });
  });

  describe('isOutreachDateAvailable', () => {
    it('should return true for weekdays', () => {
      const monday = new Date('2024-12-16');
      const tuesday = new Date('2024-12-17');
      const wednesday = new Date('2024-12-18');
      const thursday = new Date('2024-12-19');
      const friday = new Date('2024-12-20');

      expect(isOutreachDateAvailable(monday)).toBe(true);
      expect(isOutreachDateAvailable(tuesday)).toBe(true);
      expect(isOutreachDateAvailable(wednesday)).toBe(true);
      expect(isOutreachDateAvailable(thursday)).toBe(true);
      expect(isOutreachDateAvailable(friday)).toBe(true);
    });

    it('should return false for weekends', () => {
      const saturday = new Date('2024-12-21');
      const sunday = new Date('2024-12-15');

      expect(isOutreachDateAvailable(saturday)).toBe(false);
      expect(isOutreachDateAvailable(sunday)).toBe(false);
    });
  });

  describe('getDefaultTimeSlots', () => {
    it('should return correct time slots', () => {
      const slots = getDefaultTimeSlots();
      
      expect(slots).toHaveLength(8);
      expect(slots).toContain('09:00');
      expect(slots).toContain('10:00');
      expect(slots).toContain('11:00');
      expect(slots).toContain('12:00');
      expect(slots).toContain('13:00');
      expect(slots).toContain('14:00');
      expect(slots).toContain('15:00');
      expect(slots).toContain('16:00');
    });

    it('should return slots in correct order', () => {
      const slots = getDefaultTimeSlots();
      expect(slots[0]).toBe('09:00');
      expect(slots[slots.length - 1]).toBe('16:00');
    });
  });

  describe('getAgeGroup', () => {
    it('should return <15 for ages less than 15', () => {
      expect(getAgeGroup(0)).toBe('<15');
      expect(getAgeGroup(5)).toBe('<15');
      expect(getAgeGroup(14)).toBe('<15');
    });

    it('should return 15+ for ages 15 and above', () => {
      expect(getAgeGroup(15)).toBe('15+');
      expect(getAgeGroup(25)).toBe('15+');
      expect(getAgeGroup(100)).toBe('15+');
    });

    it('should return null for null or undefined', () => {
      expect(getAgeGroup(null)).toBeNull();
      expect(getAgeGroup(undefined)).toBeNull();
    });
  });

  describe('getResourceCenterSlotAllocation', () => {
    it('should return correct slot allocation', () => {
      const allocation = getResourceCenterSlotAllocation();

      expect(allocation.totalSlots).toBe(15);
      expect(allocation.slotsUnder15).toBe(6);
      expect(allocation.slotsOver15).toBe(9);
      expect(allocation.slotsUnder15 + allocation.slotsOver15).toBe(allocation.totalSlots);
    });
  });
});

describe('Slot Calculation Logic', () => {
  // These tests would require mocking Prisma, so they're integration tests
  // Unit tests for pure functions are above
  
  describe('Age-based slot allocation validation', () => {
    it('should allocate slots correctly based on age', () => {
      // This is a conceptual test - actual implementation would require Prisma mocking
      const allocation = getResourceCenterSlotAllocation();
      
      // Verify that total slots equal sum of age group slots
      expect(allocation.totalSlots).toBe(
        allocation.slotsUnder15 + allocation.slotsOver15
      );
    });
  });
});

