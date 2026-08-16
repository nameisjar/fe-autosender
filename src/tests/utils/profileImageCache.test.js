import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/socket.js', () => ({
  connectSocket: vi.fn(() => ({ onAny: vi.fn(), offAny: vi.fn() })),
}));

import {
  clearProfileImageCache,
  getProfileImageCacheKey,
  getProfileImageCacheStats,
  invalidateProfileImage,
  loadProfileImage,
  peekProfileImage,
  profileImageCacheConfig,
} from '../../utils/profileImageCache.js';

let objectUrlSequence = 0;
const NativeURL = globalThis.URL;

const successfulImageResponse = () => ({
  ok: true,
  status: 200,
  blob: vi.fn().mockResolvedValue(new Blob(['image'], { type: 'image/png' })),
});

describe('shared profile image cache', () => {
  beforeEach(() => {
    clearProfileImageCache();
    objectUrlSequence = 0;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(successfulImageResponse()));
    class MockURL extends NativeURL {}
    MockURL.createObjectURL = vi.fn(() => `blob:profile-${++objectUrlSequence}`);
    MockURL.revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', MockURL);
  });

  it('uses one cache key for signed URLs of the same profile', () => {
    const first = '/inbox-profile/device/contact%40s.whatsapp.net?expires=1&token=one';
    const second = '/inbox-profile/device/contact%40s.whatsapp.net?expires=2&token=two';

    expect(getProfileImageCacheKey(first)).toBe(getProfileImageCacheKey(second));
  });

  it('deduplicates concurrent loads and reuses the resulting object URL', async () => {
    const source = '/inbox-profile/device/contact?expires=1&token=one';
    const [first, second] = await Promise.all([
      loadProfileImage(source),
      loadProfileImage(source),
    ]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(first).toBe('blob:profile-1');
    expect(second).toBe(first);
    expect(peekProfileImage(source)).toBe(first);
  });

  it('keeps the old image visible until a socket invalidation refresh succeeds', async () => {
    const source = '/inbox-profile/device/contact?expires=1&token=one';
    const first = await loadProfileImage(source);

    invalidateProfileImage(source);
    expect(peekProfileImage(source)).toBe(first);

    const refreshed = await loadProfileImage(source);
    expect(refreshed).toBe('blob:profile-2');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][1].cache).toBe('reload');
  });

  it('caps retained profile objects at the configured LRU size', async () => {
    for (let index = 0; index < profileImageCacheConfig.maxEntries + 5; index += 1) {
      await loadProfileImage(`/inbox-profile/device/contact-${index}?token=${index}`);
    }

    expect(getProfileImageCacheStats().entries).toBe(profileImageCacheConfig.maxEntries);
  });

  it('does not retain an in-flight image after the user cache is cleared', async () => {
    let finishRequest;
    fetch.mockImplementationOnce(() => new Promise(resolve => {
      finishRequest = resolve;
    }));

    const loading = loadProfileImage('/inbox-profile/device/contact?token=one');
    clearProfileImageCache();
    finishRequest(successfulImageResponse());

    expect(await loading).toBe('');
    expect(getProfileImageCacheStats().entries).toBe(0);
  });
});
