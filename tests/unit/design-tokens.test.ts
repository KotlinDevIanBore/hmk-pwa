import { describe, it, expect } from 'vitest';
import { colors, typography, spacing, borderRadius } from '@/lib/design-tokens';

describe('Design Tokens', () => {
  describe('colors', () => {
    it('should have primary color palette', () => {
      expect(colors.primary).toBeDefined();
      expect(colors.primary[500]).toBe('#3b82f6');
      expect(colors.primary[600]).toBe('#2563eb');
    });

    it('should have secondary color palette', () => {
      expect(colors.secondary).toBeDefined();
      expect(colors.secondary[500]).toBeDefined();
    });

    it('should have semantic colors', () => {
      expect(colors.success).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.warning).toBeDefined();
      expect(colors.info).toBeDefined();
    });
  });

  describe('typography', () => {
    it('should have font families defined', () => {
      expect(typography.fontFamily.sans).toBeDefined();
      expect(typography.fontFamily.sans[0]).toBe('Inter');
    });

    it('should have font sizes with line heights', () => {
      expect(typography.fontSize.base).toEqual(['1rem', { lineHeight: '1.5rem' }]);
      expect(typography.fontSize.lg).toEqual(['1.125rem', { lineHeight: '1.75rem' }]);
    });

    it('should have font weights', () => {
      expect(typography.fontWeight.normal).toBe('400');
      expect(typography.fontWeight.bold).toBe('700');
    });
  });

  describe('spacing', () => {
    it('should have consistent spacing scale', () => {
      expect(spacing[0]).toBe('0');
      expect(spacing[4]).toBe('1rem');
      expect(spacing[8]).toBe('2rem');
    });
  });

  describe('borderRadius', () => {
    it('should have border radius values', () => {
      expect(borderRadius.none).toBe('0');
      expect(borderRadius.sm).toBeDefined();
      expect(borderRadius.full).toBe('9999px');
    });
  });
});

