import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const httpMocks = vi.hoisted(() => ({
  get: vi.fn(),
  revoke: vi.fn(),
  setLogout: vi.fn(),
}));
const clearSession = vi.hoisted(() => vi.fn());
const refreshSocketAuth = vi.hoisted(() => vi.fn());

vi.mock('../../api/http.js', () => ({
  userApi: { get: httpMocks.get },
  revokeSessionInBackground: httpMocks.revoke,
  setLogoutInProgress: httpMocks.setLogout,
}));
vi.mock('../../api/socket.js', () => ({ refreshSocketAuth }));
vi.mock('../../utils/sessionState.js', () => ({ clearUserSessionState: clearSession }));

import { useAuthStore } from '../../stores/auth.js';

describe('auth logout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    httpMocks.revoke.mockReturnValue(new Promise(() => {}));
  });

  it('membersihkan sesi lokal tanpa menunggu revokasi server', () => {
    const auth = useAuthStore();
    auth.me = { id: 'user-1' };

    const result = auth.logout({ redirect: false });

    expect(result).toBeUndefined();
    expect(auth.me).toBeNull();
    expect(httpMocks.setLogout).toHaveBeenCalledWith(true);
    expect(httpMocks.revoke).toHaveBeenCalledOnce();
    expect(clearSession).toHaveBeenCalledOnce();
  });
});
