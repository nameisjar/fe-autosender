import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, isValidPhoneNumber } from '../../utils/phone.js';

describe('Phone Utils', () => {
  describe('normalizePhoneNumber', () => {
    it('should return empty string for null/undefined input', () => {
      expect(normalizePhoneNumber(null)).toBe('');
      expect(normalizePhoneNumber(undefined)).toBe('');
      expect(normalizePhoneNumber('')).toBe('');
    });

    it('should convert 08xx format to 628xx', () => {
      expect(normalizePhoneNumber('08123456789')).toBe('628123456789');
      expect(normalizePhoneNumber('081234567890')).toBe('6281234567890');
    });

    it('should convert 8xx format to 628xx', () => {
      expect(normalizePhoneNumber('8123456789')).toBe('628123456789');
      expect(normalizePhoneNumber('81234567890')).toBe('6281234567890');
    });

    it('should keep 62xxx format as-is', () => {
      expect(normalizePhoneNumber('628123456789')).toBe('628123456789');
      expect(normalizePhoneNumber('6281234567890')).toBe('6281234567890');
    });

    it('should remove non-digit characters', () => {
      expect(normalizePhoneNumber('+62 812-345-6789')).toBe('628123456789');
      // (081) 234-5678 -> removes non-digits -> 0812345678 -> converts 08xx to 628xx
      expect(normalizePhoneNumber('(081) 234-5678')).toBe('62812345678');
      expect(normalizePhoneNumber('08 123 456 789')).toBe('628123456789');
    });

    it('should handle numeric input', () => {
      expect(normalizePhoneNumber(628123456789)).toBe('628123456789');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should return false for empty/null values', () => {
      expect(isValidPhoneNumber(null)).toBe(false);
      expect(isValidPhoneNumber(undefined)).toBe(false);
      expect(isValidPhoneNumber('')).toBe(false);
    });

    it('should return true for valid Indonesian phone numbers', () => {
      expect(isValidPhoneNumber('628123456789')).toBe(true);
      expect(isValidPhoneNumber('6281234567890')).toBe(true);
      expect(isValidPhoneNumber('62812345678901')).toBe(true);
    });

    it('should return false for numbers not starting with 62', () => {
      expect(isValidPhoneNumber('08123456789')).toBe(false);
      expect(isValidPhoneNumber('8123456789')).toBe(false);
      expect(isValidPhoneNumber('1234567890')).toBe(false);
    });

    it('should return false for numbers with non-digit characters', () => {
      expect(isValidPhoneNumber('62-8123456789')).toBe(false);
      expect(isValidPhoneNumber('+628123456789')).toBe(false);
    });

    it('should return false for too short or too long numbers', () => {
      expect(isValidPhoneNumber('628123')).toBe(false); // Too short
      expect(isValidPhoneNumber('6281234567890123456')).toBe(false); // Too long
    });
  });
});
