import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { userApi } from '../api/http.js';
import {
  listenToDeviceAccessChanges,
  listenToDeviceStatus,
  listenToSocketConnection,
  connectSocket,
} from '../api/socket.js';
import {
  getDeviceStatusLabel,
  normalizeDeviceStatus,
} from '../utils/deviceStatus.js';

// 🔄 Inisialisasi dari localStorage
const devices = ref([]);
const selectedDeviceId = ref(localStorage.getItem('device_selected_id') || '');
const loading = ref(false);

// 🆕 Device health state
const deviceHealthCache = ref({});
const healthLoading = ref({});

// 🆕 Track socket listeners untuk cleanup
let socketCleanups = [];
let loadPromise = null;
let latestLoadDevices = null;
let lifecycleListenersReady = false;
let lastResyncAt = 0;

const RESYNC_THROTTLE_MS = 5000;
const FALLBACK_POLL_MS = 60000;

function isTransientStatus(status) {
  return status === 'connecting' || status === 'reconnecting';
}

function scheduleDeviceResync(force = false) {
  if (!localStorage.getItem('token') || !latestLoadDevices) return;
  const now = Date.now();
  if (!force && now - lastResyncAt < RESYNC_THROTTLE_MS) return;
  lastResyncAt = now;
  void latestLoadDevices();
}

function ensureLifecycleResync() {
  if (lifecycleListenersReady || typeof window === 'undefined') return;
  lifecycleListenersReady = true;

  window.addEventListener('focus', () => scheduleDeviceResync());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') scheduleDeviceResync();
  });
  window.setInterval(() => {
    if (document.visibilityState === 'visible') scheduleDeviceResync(true);
  }, FALLBACK_POLL_MS);
}

export function useDevices() {
  const loadDevices = async () => {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      try {
        loading.value = true;
        const { data } = await userApi.get('/devices');
        devices.value = Array.isArray(data)
          ? data.map((device) => ({
              ...device,
              status: normalizeDeviceStatus(device.status) || 'close',
            }))
          : [];

        // 1) If there is a saved selection and it still exists, keep it as-is.
        //    Do NOT auto-switch to an 'open' device; user may want to operate on another device.
        const savedDeviceId = localStorage.getItem('device_selected_id');
        if (savedDeviceId) {
          const deviceExists = devices.value.find((d) => String(d.id) === String(savedDeviceId));
          if (deviceExists) {
            selectedDeviceId.value = String(savedDeviceId);
            setupSocketListeners();
            return;
          }
        }

        // 2) If nothing is selected (or saved selection is invalid), pick a stable default.
        //    Prefer the first device (NOT prioritizing 'open') to avoid jumping around.
        const defaultDevice = devices.value[0];
        if (defaultDevice) {
          selectedDeviceId.value = String(defaultDevice.id);
          localStorage.setItem('device_selected_id', String(defaultDevice.id));
          localStorage.setItem('device_selected_name', defaultDevice.name || 'Unknown Device');
        } else {
          selectedDeviceId.value = '';
          localStorage.removeItem('device_selected_id');
          localStorage.removeItem('device_selected_name');
        }

        setupSocketListeners();
      } catch (error) {
        console.error('Error loading devices:', error);
      } finally {
        loading.value = false;
        loadPromise = null;
      }
    })();

    return loadPromise;
  };

  latestLoadDevices = loadDevices;
  ensureLifecycleResync();

  // 🆕 Setup socket listeners untuk semua devices
  const setupSocketListeners = () => {
    // Cleanup existing listeners first
    cleanupSocketListeners();

    // Connect socket
    connectSocket();

    socketCleanups.push(
      listenToDeviceAccessChanges(() => {
        loadDevices();
      })
    );

    socketCleanups.push(
      listenToSocketConnection(() => {
        scheduleDeviceResync(true);
      })
    );

    // Listen to status changes for ALL devices
    devices.value.forEach((device) => {
      const cleanup = listenToDeviceStatus(device.id, (newStatus) => {
        const normalizedStatus = normalizeDeviceStatus(newStatus);
        if (!normalizedStatus) return;

        // console.log(`[useDevices] Device ${device.id) status changed to: ${newStatus}`);
        
        // Update device status in the devices array
        const deviceIndex = devices.value.findIndex((d) => String(d.id) === String(device.id));
        if (deviceIndex !== -1) {
          devices.value[deviceIndex] = {
            ...devices.value[deviceIndex],
            status: normalizedStatus,
          };
          
          // Trigger reactivity by reassigning array
          devices.value = [...devices.value];
        }

        // 🆕 Jika device yang berubah adalah device yang sedang dipilih dan statusnya close
        if (String(device.id) === String(selectedDeviceId.value)) {
          if (normalizedStatus === 'close' || normalizedStatus === 'logged_out') {
            // Emit event untuk memberitahu komponen lain
            try {
              window.dispatchEvent(
                new CustomEvent('wa:device-session-closed', {
                  detail: { deviceId: device.id, status: normalizedStatus },
                })
              );
            } catch (_) {}
          }
        }
      });
      
      socketCleanups.push(cleanup);
    });
  };

  // 🆕 Cleanup socket listeners
  const cleanupSocketListeners = () => {
    socketCleanups.forEach((cleanup) => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    socketCleanups = [];
  };

  const selectDevice = (deviceId) => {
    if (deviceId === undefined || deviceId === null || deviceId === '') return;

    const id = String(deviceId);
    selectedDeviceId.value = id;

    // Find by stringified id (avoid number/string mismatch)
    const device = devices.value.find((d) => String(d.id) === id);
    if (device) {
      localStorage.setItem('device_selected_id', String(device.id));
      localStorage.setItem('device_selected_name', device.name || 'Unknown Device');

      window.dispatchEvent(
        new CustomEvent('device:changed', {
          detail: { deviceId: String(device.id), deviceName: device.name },
        })
      );
    }
  };

  const selectedDevice = computed(() => {
    const device = devices.value.find((d) => String(d.id) === String(selectedDeviceId.value));
    if (!device) return null;

    return {
      id: String(device.id),
      name: device.name || 'Unknown Device',
      phone: device.phone || '',
      status: device.status || 'unknown',
      sessionId: device.sessionId || null,
      isConnected: device.status === 'open',
      isReconnecting: isTransientStatus(device.status),
      connectionLabel: getDeviceStatusLabel(device),
      isOwner: device.isOwner !== false,
      accessType: device.accessType || 'owner',
      canManage: device.canManage !== false,
      assignmentCount: Number(device.assignmentCount || 0),
    };
  });

  const availableDevices = computed(() => {
    return devices.value.map((d) => ({
      id: d.id,
      name: d.name || 'Unknown Device',
      phone: d.phone || '',
      status: d.status || 'unknown',
      sessionId: d.sessionId || null,
      isConnected: d.status === 'open',
      isReconnecting: isTransientStatus(d.status),
      connectionLabel: getDeviceStatusLabel(d),
      isOwner: d.isOwner !== false,
      accessType: d.accessType || 'owner',
      canManage: d.canManage !== false,
      assignmentCount: Number(d.assignmentCount || 0),
      // 🆕 Health info from cache
      health: deviceHealthCache.value[d.id] || null,
    }));
  });

  // 🆕 Fetch device health status
  const fetchDeviceHealth = async (deviceId) => {
    if (!deviceId) return null;
    
    try {
      healthLoading.value[deviceId] = true;
      const { data } = await userApi.get(`/devices/${deviceId}/health`);
      deviceHealthCache.value[deviceId] = data;
      return data;
    } catch (error) {
      console.error(`Error fetching health for device ${deviceId}:`, error);
      return null;
    } finally {
      healthLoading.value[deviceId] = false;
    }
  };

  // 🆕 Fetch device signals history
  const fetchDeviceSignals = async (deviceId, limit = 20) => {
    if (!deviceId) return [];
    
    try {
      const { data } = await userApi.get(`/devices/${deviceId}/signals`, {
        params: { limit }
      });
      return data.signals || [];
    } catch (error) {
      console.error(`Error fetching signals for device ${deviceId}:`, error);
      return [];
    }
  };

  // 🆕 Pause device manually
  const pauseDevice = async (deviceId, reason = 'Manual pause') => {
    if (!deviceId) return false;
    
    try {
      const { data } = await userApi.post(`/devices/${deviceId}/pause`, { reason });
      // Refresh health cache
      await fetchDeviceHealth(deviceId);
      return data;
    } catch (error) {
      console.error(`Error pausing device ${deviceId}:`, error);
      throw error;
    }
  };

  // 🆕 Resume device manually
  const resumeDevice = async (deviceId) => {
    if (!deviceId) return false;
    
    try {
      const { data } = await userApi.post(`/devices/${deviceId}/resume`);
      // Refresh health cache
      await fetchDeviceHealth(deviceId);
      return data;
    } catch (error) {
      console.error(`Error resuming device ${deviceId}:`, error);
      throw error;
    }
  };

  // 🆕 Get selected device health
  const selectedDeviceHealth = computed(() => {
    if (!selectedDeviceId.value) return null;
    return deviceHealthCache.value[selectedDeviceId.value] || null;
  });

  // 🆕 Health status badge info
  const getHealthBadge = (deviceId) => {
    const health = deviceHealthCache.value[deviceId];
    if (!health) return { label: '-', color: 'gray', icon: '' };

    if (health.requiresPairing) {
      return { label: 'Perlu pairing', color: 'red', icon: '' };
    }
    if (health.connectionStatus === 'connecting' || health.connectionStatus === 'reconnecting') {
      return { label: 'Menghubungkan', color: 'yellow', icon: '' };
    }
    
    const statusMap = {
      healthy: { label: 'Baik', color: 'green', icon: '' },
      warning: { label: 'Periksa', color: 'yellow', icon: '' },
      critical: { label: 'Kritis', color: 'red', icon: '' },
      paused: { label: 'Dijeda', color: 'gray', icon: '' },
      banned: { label: 'Banned', color: 'red', icon: '' },
    };
    
    return statusMap[health.healthStatus] || { label: '-', color: 'gray', icon: '' };
  };

  // 🆕 Method untuk clear device selection
  const clearDevice = () => {
    selectedDeviceId.value = '';
    localStorage.removeItem('device_selected_id');
    localStorage.removeItem('device_selected_name');
  };

  // 🆕 Listen untuk event device session closed
  const handleDeviceSessionClosed = (event) => {
    const { deviceId } = event.detail || {};

    // Compare as strings to avoid pkId/id mismatch
    if (String(deviceId || '') === String(selectedDeviceId.value || '')) {
      loadDevices();
    }
  };

  // Setup event listener
  onMounted(() => {
    window.addEventListener('wa:device-session-closed', handleDeviceSessionClosed);
  });

  onUnmounted(() => {
    window.removeEventListener('wa:device-session-closed', handleDeviceSessionClosed);
    // Socket listeners are module-level because device state is shared by App,
    // Sidebar, DevicePicker, and pages. One unmount must not disconnect the
    // remaining consumers from live status updates.
  });

  return {
    devices,
    selectedDeviceId,
    selectedDevice,
    availableDevices,
    loading,
    loadDevices,
    selectDevice,
    clearDevice,
    // 🆕 Health management
    deviceHealthCache,
    healthLoading,
    fetchDeviceHealth,
    fetchDeviceSignals,
    pauseDevice,
    resumeDevice,
    selectedDeviceHealth,
    getHealthBadge,
  };
}
