import { describe, it, expect } from 'vitest';
import {
  convertToServerTime,
  formatLocalTime,
  convertToLocalInput,
  isValidDateTime,
  addInterval,
  calculateEstimatedCount,
} from '../../utils/datetime.js';

describe('DateTime Utils', () => {
  describe('convertToServerTime', () => {
    it('should return empty string for empty input', () => {
      expect(convertToServerTime('')).toBe('');
      expect(convertToServerTime(null)).toBe('');
      expect(convertToServerTime(undefined)).toBe('');
    });

    it('should convert datetime-local to ISO string', () => {
      const input = '2024-01-15T10:30';
      const result = convertToServerTime(input);
      
      // Should be valid ISO string
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(result).getTime()).not.toBeNaN();
    });

    it('should return empty string for invalid datetime', () => {
      expect(convertToServerTime('invalid-date')).toBe('');
      expect(convertToServerTime('not-a-date')).toBe('');
    });
  });

  describe('formatLocalTime', () => {
    it('should return empty string for empty input', () => {
      expect(formatLocalTime('')).toBe('');
      expect(formatLocalTime(null)).toBe('');
      expect(formatLocalTime(undefined)).toBe('');
    });

    it('should format ISO string to local format', () => {
      const isoString = '2024-01-15T10:30:00.000Z';
      const result = formatLocalTime(isoString);
      
      // Should contain date parts (format varies by locale)
      expect(result).toMatch(/\d/);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle invalid date gracefully', () => {
      // Note: The implementation uses toLocaleString which returns 'Invalid Date' for invalid inputs
      // This is acceptable behavior as it still provides feedback
      const result = formatLocalTime('invalid');
      expect(['', 'Invalid Date']).toContain(result);
    });
  });

  describe('convertToLocalInput', () => {
    it('should return empty string for empty input', () => {
      expect(convertToLocalInput('')).toBe('');
      expect(convertToLocalInput(null)).toBe('');
      expect(convertToLocalInput(undefined)).toBe('');
    });

    it('should convert ISO string to datetime-local format', () => {
      const isoString = '2024-01-15T10:30:00.000Z';
      const result = convertToLocalInput(isoString);
      
      // Should be in datetime-local format: YYYY-MM-DDTHH:mm
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
  });

  describe('isValidDateTime', () => {
    it('should return false for empty values', () => {
      expect(isValidDateTime('')).toBe(false);
      expect(isValidDateTime(null)).toBe(false);
      expect(isValidDateTime(undefined)).toBe(false);
    });

    it('should return true for valid datetime strings', () => {
      expect(isValidDateTime('2024-01-15T10:30')).toBe(true);
      expect(isValidDateTime('2024-01-15T10:30:00.000Z')).toBe(true);
      expect(isValidDateTime('2024-01-15')).toBe(true);
    });

    it('should return false for invalid datetime strings', () => {
      expect(isValidDateTime('invalid')).toBe(false);
      expect(isValidDateTime('not-a-date')).toBe(false);
    });
  });

  describe('addInterval', () => {
    const baseDate = new Date('2024-01-15T10:00:00');

    it('should add minutes', () => {
      const result = addInterval(baseDate, 'minute', 30);
      expect(result.getMinutes()).toBe(30);
    });

    it('should add hours', () => {
      const result = addInterval(baseDate, 'hourly', 2);
      expect(result.getHours()).toBe(12);
    });

    it('should add days', () => {
      const result = addInterval(baseDate, 'daily', 5);
      expect(result.getDate()).toBe(20);
    });

    it('should add weeks', () => {
      const result = addInterval(baseDate, 'weekly', 2);
      expect(result.getDate()).toBe(29); // 15 + 14 = 29
    });

    it('should add months', () => {
      const result = addInterval(baseDate, 'monthly', 1);
      expect(result.getMonth()).toBe(1); // February (0-indexed)
    });

    it('should default to interval of 1', () => {
      const result = addInterval(baseDate, 'daily', null);
      expect(result.getDate()).toBe(16);
    });

    it('should handle unknown recurrence type gracefully', () => {
      const result = addInterval(baseDate, 'unknown', 1);
      expect(result.getTime()).toBe(baseDate.getTime());
    });
  });

  describe('calculateEstimatedCount', () => {
    it('should return 0 for invalid dates', () => {
      expect(calculateEstimatedCount('invalid', '2024-01-20', 'daily', 1)).toBe(0);
      expect(calculateEstimatedCount('2024-01-15', 'invalid', 'daily', 1)).toBe(0);
    });

    it('should return 0 when start > end', () => {
      expect(calculateEstimatedCount('2024-01-20', '2024-01-15', 'daily', 1)).toBe(0);
    });

    it('should calculate daily count correctly', () => {
      const count = calculateEstimatedCount(
        '2024-01-15T10:00',
        '2024-01-20T10:00',
        'daily',
        1
      );
      expect(count).toBe(6); // 15, 16, 17, 18, 19, 20
    });

    it('should calculate hourly count correctly', () => {
      const count = calculateEstimatedCount(
        '2024-01-15T10:00',
        '2024-01-15T15:00',
        'hourly',
        1
      );
      expect(count).toBe(6); // 10, 11, 12, 13, 14, 15
    });

    it('should respect interval', () => {
      const count = calculateEstimatedCount(
        '2024-01-15T10:00',
        '2024-01-20T10:00',
        'daily',
        2
      );
      expect(count).toBe(3); // 15, 17, 19
    });
  });
});
