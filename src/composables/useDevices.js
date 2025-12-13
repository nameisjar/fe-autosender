import { ref, computed, onMounted, onUnmounted } from 'vue';
import { userApi } from '../api/http.js';

// 🔄 Inisialisasi dari localStorage
const devices = ref([]);
const selectedDeviceId = ref(localStorage.getItem('device_selected_id') || '');
const loading = ref(false);

export function useDevices() {
  const loadDevices = async () => {
    try {
      loading.value = true;
      const { data } = await userApi.get('/devices');
      devices.value = Array.isArray(data) ? data : [];

      // 1) If there is a saved selection and it still exists, keep it as-is.
      //    Do NOT auto-switch to an 'open' device; user may want to operate on another device.
      const savedDeviceId = localStorage.getItem('device_selected_id');
      if (savedDeviceId) {
        const deviceExists = devices.value.find((d) => String(d.id) === String(savedDeviceId));
        if (deviceExists) {
          selectedDeviceId.value = String(savedDeviceId);
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
    } catch (error) {
      console.error('Error loading devices:', error);
      devices.value = [];
    } finally {
      loading.value = false;
    }
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
      isConnected: device.status === 'open',
    };
  });

  const availableDevices = computed(() => {
    return devices.value.map((d) => ({
      id: d.id,
      name: d.name || 'Unknown Device',
      phone: d.phone || '', // 🆕 Tambahkan nomor WhatsApp
      status: d.status || 'unknown',
      isConnected: d.status === 'open',
    }));
  });

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
  };
}
