// IndexedDB Cache Manager with Memory + Persistent Storage
// Implements stale-while-revalidate pattern for instant loading

const DB_NAME = 'autosender-cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

// TTL Configuration (in milliseconds)
export const CACHE_TTL = {
  TEMPLATES: 5 * 60 * 1000,          // 5 menit - jarang berubah
  MONTHLY_TEMPLATES: 5 * 60 * 1000,  // 5 menit - jarang berubah
  CONTACTS: 2 * 60 * 1000,           // 2 menit - bisa berubah saat import
  LABELS: 5 * 60 * 1000,             // 5 menit - jarang berubah
  GROUPS: 30 * 1000,                 // 30 detik - ada socket update
  SCHEDULES: 30 * 1000,              // 30 detik - sering berubah
  SNIPPETS: 2 * 60 * 1000,           // 2 menit - jarang berubah
  TUTORS: 2 * 60 * 1000,             // 2 menit - jarang berubah
  DEVICES: 60 * 1000,                // 1 menit
  DEFAULT: 30 * 1000,                // 30 detik
};

// Cache Keys
export const CACHE_KEYS = {
  TEMPLATES: 'templates',
  MONTHLY_TEMPLATES: 'monthly_templates',
  CONTACTS: (deviceId) => `contacts_${deviceId}`,
  LABELS: (deviceId) => `labels_${deviceId}`,
  GROUPS: (deviceId) => `groups_${deviceId}`,
  SCHEDULES: (userId) => `schedules_${userId}`,
  SNIPPETS: 'snippets',
  TUTORS: 'tutors',
  DEVICES: 'devices',
};

class IndexedDBCache {
  constructor() {
    this.memory = new Map();
    this.db = null;
    this.dbReady = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('[IndexedDBCache] Failed to open database, falling back to memory only');
        resolve(null);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDBCache] Database ready');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  /**
   * Set data ke cache (memory + IndexedDB)
   */
  async set(key, value, ttl = CACHE_TTL.DEFAULT) {
    const entry = {
      key,
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    };

    // Always set to memory (instant access)
    this.memory.set(key, entry);

    // Persist to IndexedDB (async, non-blocking)
    try {
      await this.dbReady;
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(entry);
      }
    } catch (e) {
      console.warn('[IndexedDBCache] Failed to persist to IndexedDB:', e);
    }

    return entry;
  }

  /**
   * Get data dari cache
   * Returns: { data, isStale, fromCache }
   */
  async get(key) {
    // 1. Check memory first (instant)
    const memEntry = this.memory.get(key);
    if (memEntry) {
      const isStale = Date.now() > memEntry.expiresAt;
      return {
        data: memEntry.value,
        isStale,
        fromCache: true,
        source: 'memory',
      };
    }

    // 2. Check IndexedDB
    try {
      await this.dbReady;
      if (this.db) {
        const entry = await this.getFromDB(key);
        if (entry) {
          // Restore to memory for faster subsequent access
          this.memory.set(key, entry);
          const isStale = Date.now() > entry.expiresAt;
          return {
            data: entry.value,
            isStale,
            fromCache: true,
            source: 'indexeddb',
          };
        }
      }
    } catch (e) {
      console.warn('[IndexedDBCache] Failed to read from IndexedDB:', e);
    }

    return { data: null, isStale: true, fromCache: false, source: null };
  }

  /**
   * Get fresh data only (not stale)
   */
  async getFresh(key) {
    const result = await this.get(key);
    if (result.fromCache && !result.isStale) {
      return result.data;
    }
    return null;
  }

  /**
   * Internal: Get from IndexedDB
   */
  getFromDB(key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null);
        return;
      }

      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Invalidate cache (hapus dari memory + IndexedDB)
   */
  async invalidate(key) {
    // Remove from memory
    if (key) {
      this.memory.delete(key);
    } else {
      this.memory.clear();
    }

    // Remove from IndexedDB
    try {
      await this.dbReady;
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        if (key) {
          store.delete(key);
        } else {
          store.clear();
        }
      }
    } catch (e) {
      console.warn('[IndexedDBCache] Failed to invalidate:', e);
    }
  }

  /**
   * Invalidate by prefix (e.g., invalidate all contacts_*)
   * Also aliased as invalidatePattern for convenience
   */
  async invalidateByPrefix(prefix) {
    // Memory
    for (const key of this.memory.keys()) {
      if (key.startsWith(prefix)) {
        this.memory.delete(key);
      }
    }

    // IndexedDB
    try {
      await this.dbReady;
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.key.startsWith(prefix)) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      }
    } catch (e) {
      console.warn('[IndexedDBCache] Failed to invalidate by prefix:', e);
    }
  }

  /**
   * Alias for invalidateByPrefix
   */
  invalidatePattern(pattern) {
    return this.invalidateByPrefix(pattern);
  }

  /**
   * Cleanup expired entries (run periodically)
   */
  async cleanup() {
    const now = Date.now();

    // Memory cleanup
    for (const [key, entry] of this.memory.entries()) {
      if (now > entry.expiresAt + 60000) { // Keep stale for 1 extra minute
        this.memory.delete(key);
      }
    }

    // IndexedDB cleanup
    try {
      await this.dbReady;
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('expiresAt');
        const range = IDBKeyRange.upperBound(now - 60000);
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      }
    } catch (e) {
      console.warn('[IndexedDBCache] Cleanup failed:', e);
    }
  }

  /**
   * Helper: Fetch with cache (stale-while-revalidate)
   * @param {string} key - Cache key
   * @param {Function} fetcher - Async function to fetch fresh data
   * @param {number} ttl - Time to live in ms
   * @param {Object} options - Additional options
   */
  async fetchWithCache(key, fetcher, ttl = CACHE_TTL.DEFAULT, options = {}) {
    const { forceRefresh = false, onStaleData = null } = options;

    // 1. Try to get from cache first
    if (!forceRefresh) {
      const cached = await this.get(key);
      
      if (cached.fromCache) {
        if (!cached.isStale) {
          // Fresh data - return immediately
          return { data: cached.data, fromCache: true, refreshed: false };
        } else {
          // Stale data - return immediately but refresh in background
          if (onStaleData) {
            onStaleData(cached.data);
          }
          
          // Background refresh (non-blocking)
          this.backgroundRefresh(key, fetcher, ttl);
          
          return { data: cached.data, fromCache: true, refreshed: true };
        }
      }
    }

    // 2. No cache or force refresh - fetch fresh data
    try {
      const freshData = await fetcher();
      await this.set(key, freshData, ttl);
      return { data: freshData, fromCache: false, refreshed: false };
    } catch (error) {
      // On error, try to return stale data if available
      const cached = await this.get(key);
      if (cached.fromCache) {
        console.warn('[IndexedDBCache] Fetch failed, returning stale data');
        return { data: cached.data, fromCache: true, refreshed: false, error };
      }
      throw error;
    }
  }

  /**
   * Background refresh (non-blocking)
   */
  async backgroundRefresh(key, fetcher, ttl) {
    try {
      const freshData = await fetcher();
      await this.set(key, freshData, ttl);
      console.log(`[IndexedDBCache] Background refresh completed for ${key}`);
    } catch (e) {
      console.warn(`[IndexedDBCache] Background refresh failed for ${key}:`, e);
    }
  }
}

// Singleton instance
export const indexedDBCache = new IndexedDBCache();

// Auto cleanup every 5 minutes
setInterval(() => {
  indexedDBCache.cleanup();
}, 5 * 60 * 1000);

// Export default
export default indexedDBCache;
