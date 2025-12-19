// filepath: d:\Doc\autosender\fe-autosender\src\components\DevicePicker.vue
<template>
  <div class="device-picker">
    <!-- Device Info Compact (ketika device sudah dipilih) -->
    <div v-if="selectedDevice && !showDeviceList" class="device-info-compact">
      <div
        class="device-avatar-compact"
        :class="{ online: selectedDevice.isConnected }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
      </div>
      <div class="device-info-text">
        <div class="device-name-compact">
          {{ selectedDevice.name || "Unknown" }}
          <span v-if="selectedDevice.phone" class="device-phone-inline">
            - {{ selectedDevice.phone }}
          </span>
        </div>
        <div
          class="device-status-compact"
          :class="{ online: selectedDevice.isConnected }"
        >
          {{ selectedDevice.isConnected ? "● Online" : "● Offline" }}
        </div>
      </div>
      <button
        type="button"
        class="btn-change-compact"
        @click="showDeviceList = true"
      >
        Ganti
      </button>
    </div>

    <!-- Device List Compact (ketika belum ada device atau sedang memilih) -->
    <div v-if="!selectedDevice || showDeviceList" class="device-list-compact">
      <div v-if="loading" class="device-loading">
        <div class="spinner-small"></div>
        <span>Memuat devices...</span>
      </div>
      <div v-else-if="availableDevices.length === 0" class="device-empty">
        <p>Tidak ada device tersedia</p>
      </div>
      <button
        v-else
        v-for="device in availableDevices"
        :key="device.id"
        type="button"
        class="device-item-compact"
        :class="{ online: device.isConnected }"
        @click="handleSelectDevice(device.id)"
      >
        <span class="device-item-label">
          {{ device.name }}
          <span v-if="device.phone" class="device-phone-inline">
            - {{ device.phone }}
          </span>
        </span>
        <span class="status-dot" :class="{ online: device.isConnected }"></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDevices } from "../composables/useDevices.js";

const emit = defineEmits(["device-changed"]);

// Device management dari composable
const {
  selectedDeviceId,
  selectedDevice,
  availableDevices,
  loading,
  loadDevices,
  selectDevice,
} = useDevices();

const showDeviceList = ref(false);

// Handle select device
function handleSelectDevice(deviceId) {
  const oldDeviceId = selectedDeviceId.value;
  selectDevice(deviceId);
  showDeviceList.value = false;
  
  // Emit event jika device berubah (hanya di sini, tidak di watch)
  if (oldDeviceId && oldDeviceId !== deviceId) {
    emit("device-changed", deviceId);
  }
}

// Refresh devices
async function refresh() {
  await loadDevices();
}

// Load devices saat mount
onMounted(async () => {
  await loadDevices();
});

// Expose untuk parent component
defineExpose({
  selectedDeviceId,
  selectedDevice,
  availableDevices,
  loading,
  refresh,
  loadDevices,
});
</script>

<style scoped>
.device-picker {
  width: 100%;
}

/* Device Info Compact */
.device-info-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
}

.device-avatar-compact {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-avatar-compact svg {
  width: 20px;
  height: 20px;
  color: white;
}

.device-avatar-compact.online {
  background: linear-gradient(135deg, #86efac 0%, #4ade80 100%);
}

.device-info-text {
  flex: 1;
  min-width: 0;
}

.device-name-compact {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-phone-inline {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.device-status-compact {
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
}

.device-status-compact.online {
  color: #059669;
}

.btn-change-compact {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-change-compact:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Device List Compact */
.device-list-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: #64748b;
  font-size: 14px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.device-empty {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.device-empty p {
  margin: 0;
}

.device-item-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.device-item-compact:hover {
  background: #f8fafc;
  border-color: #3b82f6;
}

.device-item-compact.online {
  border-color: #86efac;
}

.device-item-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: #10b981;
}
</style>
