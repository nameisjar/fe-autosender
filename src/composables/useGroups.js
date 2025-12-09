// Reusable groups loader from database with cache and debounce
// Uses database-stored WhatsApp groups with smart caching
import { ref, onUnmounted } from 'vue';
import { userApi } from '../api/http.js';
import { listenToGroupUpdates, listenToNewGroup, listenToGroupLeft } from '../api/socket.js';
import { cache } from '../utils/cache.js';
import { debounce } from '../utils/debounce.js';

// Singleton state (module-scoped)
const groupsState = ref([]); // { value, label, meta }
const loadingState = ref(false);
const errorState = ref('');
let inFlight = null;
let socketCleanups = [];

// ✅ Cache configuration
const CACHE_KEY_PREFIX = 'groups_device_';
const CACHE_TTL = 30; // 30 seconds

// ✅ Flag untuk mencegah multiple socket setup
let socketSetupCompleted = false;

const getDeviceId = () => {
  try { return localStorage.getItem('device_selected_id') || ''; } catch { return ''; }
};

const normalizeGroupValue = (g) => {
  const groupId = g?.groupId || g?.id || g?.jid || '';
  if (!groupId) return '';
  return groupId.includes('@') ? groupId : `${groupId}@g.us`;
};

const mapGroups = (items) => {
  const arr = Array.isArray(items) ? items : [];
  return arr
    .map((g) => ({
      value: normalizeGroupValue(g),
      label: g?.groupName || g?.subject || g?.name || g?.title || g?.groupId || 'Tanpa Nama',
      meta: { 
        id: g?.id, 
        groupId: g?.groupId, 
        isActive: g?.isActive,
        participants: g?.participants || 0,
        sessionId: g?.sessionId
      },
    }))
    .filter((g) => g.value);
};

const getCacheKey = (deviceId) => {
  return `${CACHE_KEY_PREFIX}${deviceId}`;
};

// ✅ Debounced version untuk mencegah race condition
const debouncedLoadGroups = debounce(async ({ force = false } = {}) => {
  return loadGroupsInternal({ force });
}, 500); // 500ms debounce

const fetchGroupsFromDatabase = async () => {
  const deviceId = getDeviceId();
  if (!deviceId) {
    throw new Error('Device ID tidak ditemukan. Silakan pilih device terlebih dahulu.');
  }

  try {
    const res = await userApi.get(`/whatsapp-groups/device/${deviceId}/active`);
    const payload = res?.data;
    
    if (!payload?.status) {
      const errorMsg = payload?.message || 'Gagal mengambil data grup dari server';
      throw new Error(errorMsg);
    }
    
    const list = Array.isArray(payload?.data) ? payload.data : [];
    const mappedGroups = mapGroups(list);
    
    return mappedGroups;
  } catch (error) {
    throw error;
  }
};

// 🔥 Internal load function at module scope
const loadGroupsInternal = async ({ force = false } = {}) => {
  errorState.value = '';
  
  const deviceId = getDeviceId();
  if (!deviceId) {
    errorState.value = 'Device ID tidak ditemukan. Silakan pilih device terlebih dahulu.';
    return [];
  }

  // ✅ Check cache first (jika tidak force reload)
  if (!force) {
    const cacheKey = getCacheKey(deviceId);
    const cachedGroups = cache.get(cacheKey);
    if (cachedGroups) {
      groupsState.value = cachedGroups;
      
      // ✅ Setup socket hanya jika belum setup
      if (!socketSetupCompleted) {
        setupGroupSocketListeners(deviceId);
        socketSetupCompleted = true;
      }
      
      return groupsState.value;
    }
  }

  // ✅ Check in-flight request
  if (inFlight && !force) {
    return inFlight;
  }
  
  loadingState.value = true;
  
  inFlight = (async () => {
    try {
      const data = await fetchGroupsFromDatabase();
      groupsState.value = data;
      
      // ✅ Save to cache
      const cacheKey = getCacheKey(deviceId);
      cache.set(cacheKey, data, CACHE_TTL);
      
      // ✅ Setup socket hanya sekali
      if (!socketSetupCompleted) {
        setupGroupSocketListeners(deviceId);
        socketSetupCompleted = true;
      }
      
      return groupsState.value;
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Gagal memuat grup dari database';
      errorState.value = errorMsg;
      return [];
    } finally {
      loadingState.value = false;
      inFlight = null;
    }
  })();
  return inFlight;
};

const clearGroups = () => {
  groupsState.value = [];
  errorState.value = '';
  inFlight = null;
  socketSetupCompleted = false; // ✅ Reset flag
  cleanupSocketListeners();
  
  const deviceId = getDeviceId();
  if (deviceId) {
    const cacheKey = getCacheKey(deviceId);
    cache.invalidate(cacheKey);
  }
};

// 🆕 Cleanup socket listeners
const cleanupSocketListeners = () => {
  socketCleanups.forEach((fn) => {
    if (typeof fn === 'function') {
      try { fn(); } catch (e) { console.error('Error cleaning up socket:', e); }
    }
  });
  socketCleanups = [];
};

// ✅ Setup socket listeners dengan debounce untuk mencegah spam request
const setupGroupSocketListeners = (deviceId) => {
  // Clean up existing listeners
  cleanupSocketListeners();
  
  if (!deviceId) return;
  
  // ✅ Debounced refresh function untuk mencegah spam
  const debouncedRefresh = debounce(async () => {
    await loadGroupsInternal({ force: true });
  }, 1000); // 1 second debounce
  
  // Listen untuk group updates (bulk update)
  const cleanup1 = listenToGroupUpdates(deviceId, async (data) => {
    // Jika action adalah group-left, hapus grup dari list secara langsung
    if (data.action === 'group-left' && data.groupId) {
      const groupIdNormalized = normalizeGroupValue({ groupId: data.groupId });
      groupsState.value = groupsState.value.filter(g => g.value !== groupIdNormalized);
      
      // ✅ Update cache
      const cacheKey = getCacheKey(deviceId);
      cache.set(cacheKey, groupsState.value, CACHE_TTL);
    } else {
      // ✅ Debounced refresh untuk update lainnya
      debouncedRefresh();
    }
  });
  
  // Listen untuk new group joined (single group)
  const cleanup2 = listenToNewGroup(deviceId, async (groupData) => {
    // Add new group to existing list tanpa full reload
    if (groupData && groupData.groupId) {
      const newGroup = {
        value: normalizeGroupValue(groupData),
        label: groupData.groupName || groupData.subject || 'Grup Baru',
        meta: {
          id: groupData.id,
          groupId: groupData.groupId,
          isActive: groupData.isActive,
          participants: groupData.participants || 0,
          sessionId: groupData.sessionId
        }
      };
      
      // Check jika grup sudah ada (hindari duplikat)
      const exists = groupsState.value.some(g => g.value === newGroup.value);
      if (!exists) {
        groupsState.value = [...groupsState.value, newGroup];
        
        // ✅ Update cache
        const cacheKey = getCacheKey(deviceId);
        cache.set(cacheKey, groupsState.value, CACHE_TTL);
      }
    }
    
    // ✅ Debounced full refresh
    setTimeout(() => {
      debouncedRefresh();
    }, 2000);
  });
  
  // 🆕 Listen untuk device keluar/dikick dari grup
  const cleanup3 = listenToGroupLeft(deviceId, (data) => {
    if (data.groupId) {
      const groupIdNormalized = normalizeGroupValue({ groupId: data.groupId });
      
      // Hapus grup dari list
      const beforeCount = groupsState.value.length;
      groupsState.value = groupsState.value.filter(g => g.value !== groupIdNormalized);
      const afterCount = groupsState.value.length;
      
      if (beforeCount > afterCount) {
        // ✅ Update cache
        const cacheKey = getCacheKey(deviceId);
        cache.set(cacheKey, groupsState.value, CACHE_TTL);
      }
    }
  });
  
  socketCleanups.push(cleanup1, cleanup2, cleanup3);
};

// Listen for device changes to clear groups
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'device_selected_id' || e.key === 'device_api_key') {
      clearGroups();
    }
  });
  
  window.addEventListener('wa:device-session-closed', () => {
    clearGroups();
  });
}

export function useGroups() {
  const groups = groupsState;
  const loading = loadingState;
  const error = errorState;

  // Wrapper function yang memanggil internal function
  const loadGroups = async ({ force = false } = {}) => {
    // ✅ Gunakan debounced version untuk normal load, immediate untuk force
    return force ? loadGroupsInternal({ force: true }) : debouncedLoadGroups({ force: false });
  };

  const refreshGroups = async () => {
    return loadGroups({ force: true });
  };

  const ensureFullGroupJid = async (jidOrId) => {
    let val = String(jidOrId || '').trim();
    if (!val) return '';
    const clean = val.replace(/@g\.us$/i, '');

    const found = (groups.value || []).find((g) => {
      const groupId = (g.meta?.groupId || '').replace(/@g\.us$/i, '');
      const value = (g.value || '').replace(/@g\.us$/i, '');
      return groupId === clean || value === clean;
    });
    
    if (found?.value) {
      return found.value.includes('@g.us') ? found.value : `${found.value}@g.us`;
    }

    return val.includes('@') ? val : `${val}@g.us`;
  };

  // Sync groups manually (trigger backend sync)
  const syncGroups = async () => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      throw new Error('Device ID tidak ditemukan');
    }
    
    try {
      loading.value = true;
      const res = await userApi.post(`/whatsapp-groups/device/${deviceId}/sync`);
      
      // ✅ Invalidate cache sebelum reload
      const cacheKey = getCacheKey(deviceId);
      cache.invalidate(cacheKey);
      
      // After sync, reload groups from database
      await loadGroupsInternal({ force: true });
      
      return res.data;
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Gagal sinkronisasi grup';
      error.value = errorMsg;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Join group via invite link
  const joinGroup = async (inviteLink) => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      throw new Error('Device ID tidak ditemukan');
    }
    
    if (!inviteLink || typeof inviteLink !== 'string') {
      throw new Error('Link invite grup harus diisi');
    }
    
    try {
      loading.value = true;
      error.value = '';
      
      const res = await userApi.post(`/whatsapp-groups/device/${deviceId}/join`, {
        inviteLink: inviteLink.trim()
      });
      
      // ✅ Invalidate cache sebelum reload
      const cacheKey = getCacheKey(deviceId);
      cache.invalidate(cacheKey);
      
      // Reload groups after joining
      await loadGroupsInternal({ force: true });
      
      return res.data;
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Gagal join grup';
      error.value = errorMsg;
      throw new Error(errorMsg);
    } finally {
      loading.value = false;
    }
  };

  // Leave group
  const leaveGroup = async (groupJid) => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      throw new Error('Device ID tidak ditemukan');
    }
    
    if (!groupJid) {
      throw new Error('Group JID harus diisi');
    }
    
    try {
      loading.value = true;
      error.value = '';
      
      const res = await userApi.post(`/whatsapp-groups/device/${deviceId}/leave/${groupJid}`);
      
      // Remove group from local state immediately
      const groupIdNormalized = normalizeGroupValue({ groupId: groupJid });
      groups.value = groups.value.filter(g => g.value !== groupIdNormalized);
      
      // ✅ Update cache
      const cacheKey = getCacheKey(deviceId);
      cache.set(cacheKey, groups.value, CACHE_TTL);
      
      return res.data;
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Gagal keluar dari grup';
      error.value = errorMsg;
      throw new Error(errorMsg);
    } finally {
      loading.value = false;
    }
  };

  // ✅ Cleanup on unmount
  onUnmounted(() => {
    cleanupSocketListeners();
    socketSetupCompleted = false;
  });

  return {
    groups,
    loadingGroups: loading,
    errGroups: error,
    loadGroups,
    refreshGroups,
    ensureFullGroupJid,
    clearGroups,
    syncGroups,
    joinGroup,
    leaveGroup,
  };
}
