// Reusable groups loader from database (no cache, always fresh from DB)
// Uses database-stored WhatsApp groups instead of cache
import { ref } from 'vue';
import { userApi } from '../api/http.js';

// Singleton state (module-scoped)
const groupsState = ref([]); // { value, label, meta }
const loadingState = ref(false);
const errorState = ref('');
let inFlight = null;

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

  return {
    groups,
    loadingGroups: loading,
    errGroups: error,
    loadGroups,
    refreshGroups,
    ensureFullGroupJid,
    clearGroups,
    syncGroups,
  };
}
