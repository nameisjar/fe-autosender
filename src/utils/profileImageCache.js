import { ref } from 'vue';
import { connectSocket } from '../api/socket.js';
import { mediaUrl } from './mediaUrl.js';

const MAX_CACHE_ENTRIES = 150;
const MAX_CACHE_BYTES = 30 * 1024 * 1024;
const CACHE_TTL_MS = 60 * 60 * 1000;
const NEGATIVE_CACHE_TTL_MS = 15 * 60 * 1000;
const RETIRED_URL_GRACE_MS = 60 * 1000;

const entries = new Map();
const inFlight = new Map();
export const profileImageCacheRevision = ref(0);

let attachedSocket = null;
let socketEventHandler = null;
let cacheGeneration = 0;

export function getProfileImageCacheKey(source) {
  const resolved = mediaUrl(source);
  if (!resolved) return '';

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(resolved, base);
    if (url.pathname.includes('/inbox-profile/')) {
      return `${url.origin}${url.pathname}`;
    }
    return url.toString();
  } catch {
    return resolved;
  }
}

function safelyRevokeObjectUrl(objectUrl, delay = RETIRED_URL_GRACE_MS) {
  if (!String(objectUrl || '').startsWith('blob:')) return;
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), delay);
}

function trimCache() {
  let retainedBytes = [...entries.values()]
    .reduce((total, entry) => total + Number(entry.sizeBytes || 0), 0);
  if (entries.size <= MAX_CACHE_ENTRIES && retainedBytes <= MAX_CACHE_BYTES) return;

  const oldest = [...entries.entries()]
    .sort((left, right) => left[1].lastAccessedAt - right[1].lastAccessedAt);
  while (
    (entries.size > MAX_CACHE_ENTRIES || retainedBytes > MAX_CACHE_BYTES)
    && oldest.length > 0
  ) {
    const [key, entry] = oldest.shift();
    entries.delete(key);
    retainedBytes -= Number(entry.sizeBytes || 0);
    safelyRevokeObjectUrl(entry.objectUrl);
  }
}

export function peekProfileImage(source) {
  const key = getProfileImageCacheKey(source);
  const entry = key ? entries.get(key) : null;
  if (!entry) return '';

  entry.lastAccessedAt = Date.now();
  if (entry.objectUrl) return entry.objectUrl;
  if (entry.expiresAt <= Date.now()) entries.delete(key);
  return '';
}

export async function loadProfileImage(source, { force = false, status = '' } = {}) {
  const resolved = mediaUrl(source);
  const key = getProfileImageCacheKey(source);
  if (!resolved || !key) return '';

  const now = Date.now();
  const existing = entries.get(key);
  if (!force && existing && !existing.stale && existing.expiresAt > now) {
    existing.lastAccessedAt = now;
    return existing.objectUrl || '';
  }
  if (status === 'unavailable' && !existing?.objectUrl) return '';

  const running = inFlight.get(key);
  if (running) return running;
  const requestGeneration = cacheGeneration;

  let task;
  task = (async () => {
    try {
      const response = await fetch(resolved, {
        method: 'GET',
        credentials: 'omit',
        cache: force || existing?.stale ? 'reload' : 'default',
        headers: { Accept: 'image/*' },
      });
      if (requestGeneration !== cacheGeneration) return '';
      if (!response.ok || response.status === 204) {
        if (existing?.objectUrl) {
          existing.stale = false;
          existing.expiresAt = now + NEGATIVE_CACHE_TTL_MS;
          existing.lastAccessedAt = now;
          return existing.objectUrl;
        }
        entries.set(key, {
          objectUrl: '',
          expiresAt: now + NEGATIVE_CACHE_TTL_MS,
          lastAccessedAt: now,
          stale: false,
          sizeBytes: 0,
        });
        trimCache();
        return '';
      }

      const image = await response.blob();
      if (requestGeneration !== cacheGeneration) return '';
      if (!(image instanceof Blob) || image.size === 0 || !image.type.startsWith('image/')) {
        throw new Error('Invalid profile image response');
      }

      const objectUrl = URL.createObjectURL(image);
      entries.set(key, {
        objectUrl,
        expiresAt: Date.now() + CACHE_TTL_MS,
        lastAccessedAt: Date.now(),
        stale: false,
        sizeBytes: image.size,
      });
      if (existing?.objectUrl && existing.objectUrl !== objectUrl) {
        safelyRevokeObjectUrl(existing.objectUrl);
      }
      trimCache();
      return objectUrl;
    } catch {
      if (requestGeneration !== cacheGeneration) return '';
      if (existing?.objectUrl) {
        existing.stale = false;
        existing.expiresAt = now + NEGATIVE_CACHE_TTL_MS;
        existing.lastAccessedAt = now;
        return existing.objectUrl;
      }
      entries.set(key, {
        objectUrl: '',
        expiresAt: now + NEGATIVE_CACHE_TTL_MS,
        lastAccessedAt: now,
        stale: false,
        sizeBytes: 0,
      });
      trimCache();
      return '';
    }
  })().finally(() => {
    if (inFlight.get(key) === task) inFlight.delete(key);
  });

  inFlight.set(key, task);
  return task;
}

export function invalidateProfileImage(source) {
  const key = getProfileImageCacheKey(source);
  const entry = key ? entries.get(key) : null;
  if (!entry) return;

  entry.stale = true;
  entry.expiresAt = 0;
  profileImageCacheRevision.value += 1;
}

export function ensureProfileImageSocketInvalidation() {
  const socket = connectSocket();
  if (attachedSocket === socket) return;

  if (attachedSocket && socketEventHandler) attachedSocket.offAny(socketEventHandler);
  socketEventHandler = (eventName, payload) => {
    if (!String(eventName || '').endsWith(':profile-updated')) return;
    const source = payload?.groupPicUrl || payload?.profilePicUrl || '';
    if (source) invalidateProfileImage(source);
  };
  socket.onAny(socketEventHandler);
  attachedSocket = socket;
}

export function clearProfileImageCache() {
  cacheGeneration += 1;
  for (const entry of entries.values()) safelyRevokeObjectUrl(entry.objectUrl, 0);
  entries.clear();
  inFlight.clear();
  profileImageCacheRevision.value += 1;
}

export function getProfileImageCacheStats() {
  return {
    entries: entries.size,
    inFlight: inFlight.size,
    bytes: [...entries.values()]
      .reduce((total, entry) => total + Number(entry.sizeBytes || 0), 0),
  };
}

export const profileImageCacheConfig = Object.freeze({
  maxEntries: MAX_CACHE_ENTRIES,
  maxBytes: MAX_CACHE_BYTES,
  ttlMs: CACHE_TTL_MS,
  negativeTtlMs: NEGATIVE_CACHE_TTL_MS,
});
