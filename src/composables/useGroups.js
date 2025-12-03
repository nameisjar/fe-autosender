// Reusable groups loader from database (no cache, always fresh from DB)
// Uses database-stored WhatsApp groups instead of cache
import { ref, onUnmounted } from 'vue';
import { userApi } from '../api/http.js';
import { listenToGroupUpdates, listenToNewGroup, listenToGroupLeft } from '../api/socket.js';

// Singleton state (module-scoped)
const groupsState = ref([]); // { value, label, meta }
const loadingState = ref(false);
const errorState = ref('');
let inFlight = null;
let socketCleanups = [];

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

const fetchGroupsFromDatabase = async () => {
  const deviceId = getDeviceId();
  if (!deviceId) {
    throw new Error('Device ID tidak ditemukan. Silakan pilih device terlebih dahulu.');
  }

  console.log('Fetching groups for device ID:', deviceId);
  console.log('API endpoint will be:', `/whatsapp-groups/device/${deviceId}/active`);

  try {
    // Fetch active groups from database
    const res = await userApi.get(`/whatsapp-groups/device/${deviceId}/active`);
    console.log('Groups API response:', res.data);
    console.log('Full API response status:', res.status);
    console.log('API response headers:', res.headers);
    
    const payload = res?.data;
    
    if (!payload?.status) {
      const errorMsg = payload?.message || 'Gagal mengambil data grup dari server';
      console.error('Groups API error:', errorMsg);
      console.error('Full payload:', payload);
      throw new Error(errorMsg);
    }
    
    const list = Array.isArray(payload?.data) ? payload.data : [];
    console.log('Raw groups data:', list);
    console.log('Number of groups found:', list.length);
    
    if (list.length === 0) {
      console.warn('⚠️ No groups returned from API. Checking if device ID exists and has groups...');
    }
    
    const mappedGroups = mapGroups(list);
    console.log('Mapped groups:', mappedGroups);
    
    return mappedGroups;
  } catch (error) {
    console.error('Error in fetchGroupsFromDatabase:', error);
    console.error('Error response:', error?.response);
    throw error;
  }
};

const clearGroups = () => {
  groupsState.value = [];
  errorState.value = '';
  inFlight = null;
  cleanupSocketListeners();
};

// 🆕 Cleanup socket listeners
const cleanupSocketListeners = () => {
  socketCleanups.forEach(cleanup => cleanup());
  socketCleanups = [];
};

// 🆕 Setup socket listeners untuk auto-refresh grup
const setupGroupSocketListeners = (deviceId) => {
  // Clean up existing listeners
  cleanupSocketListeners();
  
  if (!deviceId) return;
  
  console.log(`[Groups Socket] Setting up listeners for device ${deviceId}`);
  
  // Listen untuk group updates (bulk update)
  const cleanup1 = listenToGroupUpdates(deviceId, async (data) => {
    console.log('[Groups Socket] Groups updated, refreshing...', data);
    
    // Jika action adalah group-left, hapus grup dari list secara langsung
    if (data.action === 'group-left' && data.groupId) {
      const groupIdNormalized = normalizeGroupValue({ groupId: data.groupId });
      groupsState.value = groupsState.value.filter(g => g.value !== groupIdNormalized);
      console.log('[Groups Socket] ✅ Group removed from list:', data.groupId);
    } else {
      // Untuk update lainnya, lakukan full refresh
      await loadGroups({ force: true });
    }
  });
  
  // Listen untuk new group joined (single group)
  const cleanup2 = listenToNewGroup(deviceId, async (groupData) => {
    console.log('[Groups Socket] New group joined:', groupData);
    
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
        console.log('[Groups Socket] ✅ New group added to list:', newGroup.label);
      }
    }
    
    // Optional: Full refresh untuk memastikan data konsisten
    setTimeout(() => {
      loadGroups({ force: true });
    }, 2000);
  });
  
  // 🆕 Listen untuk device keluar/dikick dari grup
  const cleanup3 = listenToGroupLeft(deviceId, (data) => {
    console.log('[Groups Socket] Device left/removed from group:', data);
    
    if (data.groupId) {
      const groupIdNormalized = normalizeGroupValue({ groupId: data.groupId });
      
      // Hapus grup dari list
      const beforeCount = groupsState.value.length;
      groupsState.value = groupsState.value.filter(g => g.value !== groupIdNormalized);
      const afterCount = groupsState.value.length;
      
      if (beforeCount > afterCount) {
        console.log('[Groups Socket] ✅ Group removed from dropdown:', data.groupId);
        console.log(`[Groups Socket] Groups count: ${beforeCount} -> ${afterCount}`);
      } else {
        console.warn('[Groups Socket] ⚠️ Group not found in list:', data.groupId);
      }
    }
  });
  
  socketCleanups.push(cleanup1, cleanup2, cleanup3);
  console.log('[Groups Socket] ✅ Listeners active');
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

  const loadGroups = async ({ force = false } = {}) => {
    error.value = '';
    
    if (!force && groups.value && groups.value.length > 0) {
      console.log('Using cached groups:', groups.value.length, 'groups');
      return groups.value;
    }

    if (inFlight && !force) {
      console.log('Groups already loading, waiting for existing request...');
      return inFlight;
    }
    
    loading.value = true;
    console.log('Starting to load groups from database...');
    
    inFlight = (async () => {
      try {
        const data = await fetchGroupsFromDatabase();
        groups.value = data;
        console.log('Successfully loaded', data.length, 'groups');
        
        if (data.length === 0) {
          console.warn('No groups found. Make sure WhatsApp is connected and groups exist.');
        }
        
        // 🆕 Setup socket listeners setelah load groups
        const deviceId = getDeviceId();
        if (deviceId) {
          setupGroupSocketListeners(deviceId);
        }
        
        return groups.value;
      } catch (e) {
        const errorMsg = e?.response?.data?.message || e?.message || 'Gagal memuat grup dari database';
        error.value = errorMsg;
        console.error('Error loading groups from database:', e);
        console.error('Error details:', {
          status: e?.response?.status,
          statusText: e?.response?.statusText,
          data: e?.response?.data
        });
        return [];
      } finally {
        loading.value = false;
        inFlight = null;
      }
    })();
    return inFlight;
  };

  const refreshGroups = async () => {
    console.log('Refreshing groups (force reload)...');
    return loadGroups({ force: true });
  };

  const ensureFullGroupJid = async (jidOrId) => {
    // Resolve using loaded groups first
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

    // Fallback: just normalize format
    return val.includes('@') ? val : `${val}@g.us`;
  };

  // Sync groups manually (trigger backend sync)
  const syncGroups = async () => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      throw new Error('Device ID tidak ditemukan');
    }
    
    console.log('Syncing groups for device:', deviceId);
    
    try {
      loading.value = true;
      const res = await userApi.post(`/whatsapp-groups/device/${deviceId}/sync`);
      console.log('Sync response:', res.data);
      
      // After sync, reload groups from database
      await loadGroups({ force: true });
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Gagal sinkronisasi grup';
      error.value = errorMsg;
      console.error('Error syncing groups:', e);
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
    
    console.log('Joining group with link:', inviteLink);
    
    try {
      loading.value = true;
      error.value = '';
      
      const res = await userApi.post(`/whatsapp-groups/device/${deviceId}/join`, {
        inviteLink: inviteLink.trim()
      });
      
      console.log('Join group response:', res.data);
      
      // Reload groups after joining
      await loadGroups({ force: true });
      
      return res.data;
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Gagal join grup';
      error.value = errorMsg;
      console.error('Error joining group:', e);
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
    
    console.log('Leaving group:', groupJid);
    
    try {
      loading.value = true;
      error.value = '';
      
      const res = await userApi.post(`/whatsapp-groups/device/${deviceId}/leave/${groupJid}`);
      
      console.log('Leave group response:', res.data);
      
      // Remove group from local state immediately
      const groupIdNormalized = normalizeGroupValue({ groupId: groupJid });
      groups.value = groups.value.filter(g => g.value !== groupIdNormalized);
      
      return res.data;
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Gagal keluar dari grup';
      error.value = errorMsg;
      console.error('Error leaving group:', e);
      throw new Error(errorMsg);
    } finally {
      loading.value = false;
    }
  };

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
