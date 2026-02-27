import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../../utils/debounce.js';

describe('Debounce Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', async () => {
    const fn = vi.fn().mockResolvedValue('result');
    const debounced = debounce(fn, 100);

    // Call multiple times
    debounced('arg1');
    debounced('arg2');
    debounced('arg3');

    // Function should not be called yet
    expect(fn).not.toHaveBeenCalled();

    // Advance timers
    await vi.advanceTimersByTimeAsync(100);

    // Function should be called once with last args
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('arg3');
  });

  it('should resolve all pending promises with same result', async () => {
    const fn = vi.fn().mockResolvedValue('shared-result');
    const debounced = debounce(fn, 100);

    const promise1 = debounced('arg1');
    const promise2 = debounced('arg2');
    const promise3 = debounced('arg3');

    await vi.advanceTimersByTimeAsync(100);

    const results = await Promise.all([promise1, promise2, promise3]);

    expect(results).toEqual(['shared-result', 'shared-result', 'shared-result']);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use default wait time of 1000ms', async () => {
    const fn = vi.fn().mockResolvedValue('result');
    const debounced = debounce(fn);

    debounced('arg');
    
    // At 500ms, should not be called
    await vi.advanceTimersByTimeAsync(500);
    expect(fn).not.toHaveBeenCalled();

    // At 1000ms, should be called
    await vi.advanceTimersByTimeAsync(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on subsequent calls', async () => {
    const fn = vi.fn().mockResolvedValue('result');
    const debounced = debounce(fn, 100);

    debounced('arg1');
    await vi.advanceTimersByTimeAsync(50);
    
    debounced('arg2');
    await vi.advanceTimersByTimeAsync(50);
    
    // Function still not called (timer was reset)
    expect(fn).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('arg2');
  });

  it('should handle async functions', async () => {
    const fn = vi.fn().mockImplementation(async (arg) => {
      return `processed-${arg}`;
    });
    const debounced = debounce(fn, 100);

    const promise = debounced('test');
    await vi.advanceTimersByTimeAsync(100);

    const result = await promise;
    expect(result).toBe('processed-test');
  });
});
