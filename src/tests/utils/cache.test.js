import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cache } from '../../utils/cache.js';

describe('Cache Utils', () => {
  beforeEach(() => {
    cache.invalidate(); // Clear all cache
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set('testKey', { data: 'testValue' });
      expect(cache.get('testKey')).toEqual({ data: 'testValue' });
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonExistent')).toBeNull();
    });

    it('should store primitive values', () => {
      cache.set('string', 'hello');
      cache.set('number', 42);
      cache.set('boolean', true);

      expect(cache.get('string')).toBe('hello');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('boolean')).toBe(true);
    });

    it('should store arrays', () => {
      const arr = [1, 2, 3, { nested: true }];
      cache.set('array', arr);
      expect(cache.get('array')).toEqual(arr);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire after default TTL (30 seconds)', () => {
      cache.set('expiring', 'value');
      
      // Still valid at 29 seconds
      vi.advanceTimersByTime(29000);
      expect(cache.get('expiring')).toBe('value');

      // Expired at 31 seconds
      vi.advanceTimersByTime(2000);
      expect(cache.get('expiring')).toBeNull();
    });

    it('should expire after custom TTL', () => {
      cache.set('customTtl', 'value', 5); // 5 seconds

      // Still valid at 4 seconds
      vi.advanceTimersByTime(4000);
      expect(cache.get('customTtl')).toBe('value');

      // Expired at 6 seconds
      vi.advanceTimersByTime(2000);
      expect(cache.get('customTtl')).toBeNull();
    });
  });

  describe('invalidate', () => {
    it('should invalidate specific key', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.invalidate('key1');

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should clear all cache when called without key', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.invalidate();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired keys', () => {
      cache.set('existing', 'value');
      expect(cache.has('existing')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('nonExistent')).toBe(false);
    });

    it('should return false for expired keys', () => {
      cache.set('expiring', 'value', 1);
      
      vi.advanceTimersByTime(2000);
      expect(cache.has('expiring')).toBe(false);
    });
  });
});
