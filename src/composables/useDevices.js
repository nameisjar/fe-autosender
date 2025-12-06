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
      
      // Check apakah deviceId dari localStorage masih valid
      const savedDeviceId = localStorage.getItem('device_selected_id');
      if (savedDeviceId) {
        const deviceExists = devices.value.find((d) => d.id === savedDeviceId);
        if (deviceExists) {
          selectedDeviceId.value = savedDeviceId;
          
          // ⚠️ Cek jika device sudah closed, auto-select device lain yang open
          if (deviceExists.status !== 'open') {
            // console.warn('[useDevices] Selected device is not open, finding alternative...');
            const openDevice = devices.value.find((d) => d.status === 'open');
            if (openDevice) {
              // console.log('[useDevices] Auto-selecting open device:', openDevice.name);
              selectDevice(openDevice.id);
            }
          }
          return; // Device masih valid
        }
      }
      
      // Auto-select device jika belum ada yang dipilih atau device tidak valid
      if (!selectedDeviceId.value || devices.value.length > 0) {
        // Prioritas: device yang open, atau device pertama
        const openDevice = devices.value.find((d) => d.status === 'open');
        const defaultDevice = openDevice || devices.value[0];
        
        if (defaultDevice) {
          selectedDeviceId.value = defaultDevice.id;
          // ✅ HANYA simpan deviceId dan name, TIDAK simpan API key
          localStorage.setItem('device_selected_id', defaultDevice.id);
          localStorage.setItem('device_selected_name', defaultDevice.name || 'Unknown Device');
        }
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      devices.value = [];
    } finally {
      loading.value = false;
    }
  };

  const selectDevice = (deviceId) => {
    if (!deviceId) return;
    
    selectedDeviceId.value = deviceId;
    const device = devices.value.find((d) => d.id === deviceId);
    if (device) {
      // ✅ HANYA simpan deviceId dan name
      localStorage.setItem('device_selected_id', device.id);
      localStorage.setItem('device_selected_name', device.name || 'Unknown Device');
      
      // 🔔 Trigger event untuk notify komponen lain bahwa device berubah
      window.dispatchEvent(new CustomEvent('device:changed', { 
        detail: { deviceId: device.id, deviceName: device.name } 
      }));
    }
  };

  const selectedDevice = computed(() => {
    const device = devices.value.find((d) => d.id === selectedDeviceId.value);
    if (!device) return null;
    
    // ✅ Map device dengan format yang sama seperti availableDevices
    return {
      id: device.id,
      name: device.name || 'Unknown Device',
      status: device.status || 'unknown',
      isConnected: device.status === 'open', // ✅ Mapping status yang benar
    };
  });

  const availableDevices = computed(() => {
    return devices.value.map((d) => ({
      id: d.id,
      name: d.name || 'Unknown Device',
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
    // console.warn('[useDevices] Device session closed:', deviceId);
    
    // Jika device yang closed adalah device yang sedang dipilih
    if (deviceId === selectedDeviceId.value) {
      // Refresh device list untuk update status
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
