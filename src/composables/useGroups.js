// Reusable groups loader with cache (memory + localStorage)
// Speeds up group dropdowns across pages.
import { ref } from 'vue';
import { deviceApi } from '../api/http.js';

// Singleton state (module-scoped)
const groupsState = ref([]); // { value, label, meta }
const loadingState = ref(false);
const errorState = ref('');
let inFlight = null;

const CACHE_KEY = 'wa_groups_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const normalizeGroupValue = (g) => {
  const full = g?.id || g?.jid || '';
  const short = g?.idShort || g?.shortId || g?.groupId || '';
  const chosen = full || short || '';
  if (!chosen) return '';
  return chosen.includes('@') ? chosen : `${chosen}@g.us`;
};

const mapGroups = (items) => {
  const arr = Array.isArray(items) ? items : [];
  return arr
    .map((g) => ({
      value: normalizeGroupValue(g),
      label: g?.subject || g?.name || g?.title || g?.id || g?.jid || 'Tanpa Nama',
      meta: { id: g?.id, shortId: g?.shortId || g?.idShort, jid: g?.jid },
    }))
    .filter((g) => g.value);
};

// Device-aware caching additions
let lastDeviceId = null;
const getDeviceId = () => {
  try { return localStorage.getItem('device_selected_id') || ''; } catch { return ''; }
};
const cacheKey = (id) => `wa_groups_cache_v1_${id || 'none'}`;

const removeCacheFor = (id) => {
  try { localStorage.removeItem(cacheKey(id)); } catch { }
};

const clearGroups = () => {
  // also remove cache for current device
  const id = getDeviceId();
  removeCacheFor(id);
  groupsState.value = [];
  errorState.value = '';
  inFlight = null;
};

// Override readCache / writeCache to be device-specific
const readCache = (id) => {
  try {
    const raw = localStorage.getItem(cacheKey(id));
    if (!raw) return null;
    const { ts, data, deviceId } = JSON.parse(raw);
    if (deviceId && deviceId !== id) return null; // safety
    if (!ts || !Array.isArray(data)) return null;
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch { return null; }
};

const writeCache = (id, data) => {
  try {
    localStorage.setItem(
      cacheKey(id),
      JSON.stringify({ ts: Date.now(), data, deviceId: id })
    );
  } catch {}
};

// Attach storage listener to invalidate cache on device change from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'device_selected_id') {
      const newId = e.newValue || '';
      if (newId !== lastDeviceId) {
        clearGroups();
        lastDeviceId = newId;
      }
    }
    // If device_api_key removed (session closed), clear groups cache
    if (e.key === 'device_api_key' && !e.newValue) {
      clearGroups();
    }
  });
  // same-tab event when device session closed
  window.addEventListener('wa:device-session-closed', () => {
    clearGroups();
  });
}

const fetchGroups = async () => {
  // Prefer the lighter endpoint; fallback to detail
  let res;
  try {
    res = await deviceApi.get('/messages/get-groups');
  } catch (_) {
    try {
      res = await deviceApi.get('/messages/get-groups/detail');
    } catch (__) {
      return [];
    }
  }
  const payload = res?.data;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload?.data)
    ? payload.data
    : [];
  return mapGroups(list);
};

export function useGroups() {
  const groups = groupsState;
  const loading = loadingState;
  const error = errorState;

  const loadGroups = async ({ force = false } = {}) => {
    error.value = '';
    const currentId = getDeviceId();
    if (lastDeviceId && currentId !== lastDeviceId) {
      // Device switched; invalidate memory
      clearGroups();
    }
    lastDeviceId = currentId;

    if (!force && groups.value && groups.value.length > 0) {
      // If session key missing, invalidate cache
      if (!localStorage.getItem('device_api_key')) {
        clearGroups();
      } else {
        return groups.value;
      }
    }

    if (!force && (!groups.value || groups.value.length === 0)) {
      const cached = readCache(currentId);
      if (cached && cached.length > 0 && localStorage.getItem('device_api_key')) {
        groups.value = cached;
        return groups.value;
      }
    }

    if (inFlight) return inFlight;
    loading.value = true;
    inFlight = (async () => {
      try {
        const data = await fetchGroups();
        // Determine live device id after request (may be set by interceptors)
        const liveId = getDeviceId();
        groups.value = data;
        // Write cache with the best-known id
        writeCache(liveId || currentId, data);
        lastDeviceId = liveId || currentId || null;
        return groups.value;
      } catch (e) {
        error.value = e?.response?.data?.message || e?.message || 'Gagal memuat grup';
        return [];
      } finally {
        loading.value = false;
        inFlight = null;
      }
    })();
    return inFlight;
  };

  const refreshGroups = async () => loadGroups({ force: true });

  const ensureFullGroupJid = async (jidOrId) => {
    // Resolve using cached groups first (no network)
    let val = String(jidOrId || '').trim();
    if (!val) return '';
    const clean = val.replace(/@g\.us$/i, '');

    const found = (groups.value || []).find((g) => {
      const id = (g.meta?.id || '').replace(/@g\.us$/i, '');
      const shortId = (g.meta?.shortId || '').replace(/@g\.us$/i, '');
      const value = (g.value || '').replace(/@g\.us$/i, '');
      return id === clean || shortId === clean || value === clean;
    });
    if (found?.value) {
      return found.value.includes('@g.us') ? found.value : `${found.value}@g.us`;
    }

    // Fallback: just normalize format without extra calls
    return val.includes('@') ? val : `${val}@g.us`;
  };

  return {
    groups,
    loadingGroups: loading,
    errGroups: error,
    loadGroups,
    refreshGroups,
    ensureFullGroupJid,
    clearGroups,
    removeCacheFor,
  };
}
