// Simple cache utility with TTL
class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttlSeconds = 30) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
    console.log(`[Cache] Set "${key}" with TTL ${ttlSeconds}s`);
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      console.log(`[Cache] Miss for "${key}"`);
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      console.log(`[Cache] Expired for "${key}"`);
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache] Hit for "${key}"`);
    return cached.value;
  }

  invalidate(key) {
    if (key) {
      console.log(`[Cache] Invalidate "${key}"`);
      this.cache.delete(key);
    } else {
      console.log('[Cache] Clear all');
      this.cache.clear();
    }
  }

  has(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

// Export singleton instance
export const cache = new CacheManager();
