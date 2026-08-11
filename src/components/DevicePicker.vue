// filepath: d:\Doc\autosender\fe-autosender\src\components\DevicePicker.vue
<template>
  <div class="device-picker">
    <!-- Device Info Compact (ketika device sudah dipilih) -->
    <div v-if="selectedDevice && !showDeviceList" class="device-info-compact">
      <div
        class="device-avatar-compact"
        :class="{ online: selectedDevice.isConnected, reconnecting: selectedDevice.isReconnecting }"
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
          <!-- 🆕 Health Badge -->
          <span 
            v-if="selectedDeviceHealth" 
            class="health-pill"
            :class="getHealthBadge(selectedDevice.id).color"
            :title="getHealthTooltip(selectedDevice.id)"
            @click.stop="showHealthModal = true"
          >
            {{ getHealthBadge(selectedDevice.id).label }}
          </span>
        </div>
        <div
          class="device-status-compact"
          :class="{ online: selectedDevice.isConnected, reconnecting: selectedDevice.isReconnecting }"
        >
          ● {{ selectedDevice.connectionLabel }}
          <span v-if="selectedDeviceHealth?.isPaused" class="paused-indicator">
            • Paused
          </span>
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
        :class="{ online: device.isConnected, reconnecting: device.isReconnecting, paused: device.health?.isPaused }"
        @click="handleSelectDevice(device.id)"
      >
        <span class="device-item-label">
          {{ device.name }}
          <span v-if="device.phone" class="device-phone-inline">
            - {{ device.phone }}
          </span>
          <!-- 🆕 Health Badge in list -->
          <span 
            v-if="device.health" 
            class="health-pill-small"
            :class="getHealthBadge(device.id).color"
          >
            {{ getHealthBadge(device.id).label }}
          </span>
        </span>
        <span class="status-dot" :class="{ online: device.isConnected, reconnecting: device.isReconnecting }"></span>
      </button>
    </div>

    <!-- 🆕 Health Modal -->
    <Teleport to="body">
      <div v-if="showHealthModal" class="health-modal-overlay" @click.self="showHealthModal = false">
        <div class="health-modal">
          <div class="health-modal-header">
            <h3>Device Health - {{ selectedDevice?.name }}</h3>
            <button class="close-btn" @click="showHealthModal = false">&times;</button>
          </div>
          <div class="health-modal-body">
            <div v-if="healthModalLoading" class="loading-state">
              <div class="spinner-small"></div>
              <span>Loading...</span>
            </div>
            <template v-else-if="selectedDeviceHealth">
              <!-- Status Header -->
              <div class="health-header" :class="selectedDeviceHealth.healthStatus">
                <div class="status-dot"></div>
                <div class="status-text">
                  <span class="status-label">{{ getStatusLabel(selectedDeviceHealth.healthStatus) }}</span>
                  <span class="status-time" v-if="selectedDeviceHealth.stats?.lastConnected">
                    Last seen {{ formatDate(selectedDeviceHealth.stats?.lastConnected) }}
                  </span>
                </div>
              </div>

              <!-- Stats Grid -->
              <div class="stats-grid">
                <div class="stat-box">
                  <span class="stat-value">{{ selectedDeviceHealth.todayMessages || 0 }}</span>
                  <span class="stat-label">Messages (today)</span>
                </div>
                <div class="stat-box" :class="{ 'has-warning': selectedDeviceHealth.recentRateLimits > 0 }">
                  <span class="stat-value">{{ selectedDeviceHealth.recentRateLimits || 0 }}</span>
                  <span class="stat-label">Rate Limits (24h)</span>
                </div>
                <div class="stat-box" :class="{ 'has-error': selectedDeviceHealth.recentConnectionErrors > 0 }">
                  <span class="stat-value">{{ selectedDeviceHealth.recentConnectionErrors || 0 }}</span>
                  <span class="stat-label">Errors (24h)</span>
                </div>
              </div>

              <!-- Pause Notice -->
              <div v-if="selectedDeviceHealth.isPaused" class="notice warning">
                <strong>Paused</strong>
                <span>{{ selectedDeviceHealth.pauseReason || 'Manually paused' }}</span>
                <span v-if="selectedDeviceHealth.resumeAt" class="notice-meta">Resumes {{ formatDate(selectedDeviceHealth.resumeAt) }}</span>
              </div>

              <!-- Recommendation -->
              <div v-if="selectedDeviceHealth.recommendations?.length" class="notice info">
                {{ selectedDeviceHealth.recommendations[0] }}
              </div>

              <!-- Activity Log -->
              <div v-if="recentSignals.length" class="activity-section">
                <div class="section-header">
                  <span class="section-title">Activity</span>
                  <span class="section-count">{{ recentSignals.length }}</span>
                </div>
                <div class="activity-list">
                  <div 
                    v-for="signal in visibleSignals" 
                    :key="signal.id" 
                    class="activity-item"
                    :class="getSignalClass(signal.signalType)"
                  >
                    <div class="activity-indicator"></div>
                    <div class="activity-content">
                      <div class="activity-header">
                        <span class="activity-type">{{ formatSignalType(signal.signalType) }}</span>
                        <span 
                          v-if="shouldShowConfidence(signal.signalType)"
                          class="activity-confidence"
                          :class="signal.confidence"
                          :title="getConfidenceTooltip(signal.confidence)"
                        ></span>
                      </div>
                      <span v-if="signal.message" class="activity-message">{{ signal.message }}</span>
                    </div>
                    <span class="activity-time">{{ formatDate(signal.createdAt) }}</span>
                  </div>
                </div>
                <button 
                  v-if="recentSignals.length > SIGNALS_LIMIT" 
                  class="btn-toggle"
                  @click="showAllSignals = !showAllSignals"
                >
                  {{ showAllSignals ? 'Show less' : `View all ${recentSignals.length} events` }}
                </button>
              </div>

              <!-- Actions -->
              <div class="action-bar">
                <button 
                  v-if="selectedDeviceHealth.isPaused"
                  class="btn primary"
                  @click="handleResumeDevice"
                  :disabled="healthModalLoading || pauseResumeLoading"
                >
                  Resume
                </button>
                <button 
                  v-else-if="selectedDeviceHealth.healthStatus !== 'banned'"
                  class="btn secondary"
                  @click="handlePauseDevice"
                  :disabled="healthModalLoading || pauseResumeLoading"
                >
                  Pause
                </button>
                <button 
                  class="btn icon-only"
                  @click="refreshHealth"
                  :disabled="healthModalLoading"
                  title="Refresh"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.65 2.35A8 8 0 1 0 16 8h-2a6 6 0 1 1-1.76-4.24L10 6h6V0l-2.35 2.35z"/>
                  </svg>
                </button>
              </div>
            </template>
            <div v-else class="empty-state">
              <p>No data available</p>
              <button class="btn secondary" @click="refreshHealth">Load Data</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
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
  // 🆕 Health functions
  fetchDeviceHealth,
  fetchDeviceSignals,
  selectedDeviceHealth,
  getHealthBadge,
  pauseDevice,
  resumeDevice,
} = useDevices();

const showDeviceList = ref(false);

// 🆕 Health modal state
const showHealthModal = ref(false);
const healthModalLoading = ref(false);
const recentSignals = ref([]);
const pauseResumeLoading = ref(false);

// 🆕 Signals pagination
const SIGNALS_LIMIT = 5;
const showAllSignals = ref(false);
const visibleSignals = computed(() => {
  if (showAllSignals.value) return recentSignals.value;
  return recentSignals.value.slice(0, SIGNALS_LIMIT);
});

// Handle select device
function handleSelectDevice(deviceId) {
  const oldDeviceId = selectedDeviceId.value;
  selectDevice(deviceId);
  showDeviceList.value = false;
  
  // Emit event jika device berubah (hanya di sini, tidak di watch)
  if (oldDeviceId && oldDeviceId !== deviceId) {
    emit("device-changed", deviceId);
  }
  
  // 🆕 Fetch health for new device
  fetchDeviceHealth(deviceId);
}

// 🆕 Health tooltip
function getHealthTooltip(deviceId) {
  const badge = getHealthBadge(deviceId);
  return `Health: ${badge.label} - Click for details`;
}

// 🆕 Format date helper
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 🆕 Format signal type
function formatSignalType(type) {
  const typeMap = {
    'rate_limit': 'Rate limited',
    'forced_logout': 'Logged out',
    'connection_error': 'Connection error',
    'banned': 'Banned',
    'reconnected': 'Connected',
    'resumed': 'Resumed',
  };
  return typeMap[type] || type;
}

// 🆕 Get signal CSS class
function getSignalClass(type) {
  const classes = {
    'rate_limit': 'warning',
    'forced_logout': 'error',
    'connection_error': 'error',
    'banned': 'error',
    'reconnected': 'success',
    'resumed': 'info',
  };
  return classes[type] || '';
}

// 🆕 Get status label
function getStatusLabel(status) {
  const labels = {
    'healthy': 'Healthy',
    'warning': 'Warning',
    'critical': 'Critical',
    'paused': 'Paused',
    'banned': 'Banned',
  };
  return labels[status] || status;
}

// 🆕 Should show confidence (not for positive signals)
function shouldShowConfidence(type) {
  return !['reconnected', 'resumed'].includes(type);
}

function getConfidenceTooltip(confidence) {
  const tooltips = {
    'high': 'High confidence detection',
    'medium': 'Medium confidence',
    'low': 'Low confidence - needs verification',
  };
  return tooltips[confidence] || '';
}

// 🆕 Refresh health data
async function refreshHealth() {
  if (!selectedDevice.value?.id) return;
  
  healthModalLoading.value = true;
  try {
    await fetchDeviceHealth(selectedDevice.value.id);
    recentSignals.value = await fetchDeviceSignals(selectedDevice.value.id, 10);
  } finally {
    healthModalLoading.value = false;
  }
}

// 🆕 Pause device handler
async function handlePauseDevice() {
  if (!selectedDevice.value?.id) return;
  
  pauseResumeLoading.value = true;
  try {
    await pauseDevice(selectedDevice.value.id, 'Manual pause dari health modal');
    await refreshHealth();
  } catch (error) {
    console.error('Failed to pause device:', error);
    alert('Gagal mempause device: ' + (error.response?.data?.message || error.message));
  } finally {
    pauseResumeLoading.value = false;
  }
}

// 🆕 Resume device handler
async function handleResumeDevice() {
  if (!selectedDevice.value?.id) return;
  
  pauseResumeLoading.value = true;
  try {
    await resumeDevice(selectedDevice.value.id);
    await refreshHealth();
  } catch (error) {
    console.error('Failed to resume device:', error);
    alert('Gagal resume device: ' + (error.response?.data?.message || error.message));
  } finally {
    pauseResumeLoading.value = false;
  }
}

// 🆕 Load health when modal opens
watch(showHealthModal, async (isOpen) => {
  if (isOpen && selectedDevice.value?.id) {
    showAllSignals.value = false; // Reset pagination
    await refreshHealth();
  }
});

// Refresh devices
async function refresh() {
  await loadDevices();
  // 🆕 Also refresh health for selected device
  if (selectedDeviceId.value) {
    fetchDeviceHealth(selectedDeviceId.value);
  }
}

// Load devices saat mount
onMounted(async () => {
  await loadDevices();
  // 🆕 Fetch health for selected device
  if (selectedDeviceId.value) {
    fetchDeviceHealth(selectedDeviceId.value);
  }
});

// Expose untuk parent component
defineExpose({
  selectedDeviceId,
  selectedDevice,
  availableDevices,
  loading,
  refresh,
  loadDevices,
  // 🆕 Health
  selectedDeviceHealth,
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
  background: var(--theme-gradient-surface);
  border: 1.5px solid var(--theme-border);
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

.device-avatar-compact.reconnecting {
  background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
}

.device-info-text {
  flex: 1;
  min-width: 0;
}

.device-name-compact {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-phone-inline {
  font-size: 14px;
  color: var(--theme-text-muted);
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

.device-status-compact.reconnecting {
  color: #d97706;
}

.btn-change-compact {
  padding: 6px 12px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  color: var(--theme-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-change-compact:hover {
  background: var(--theme-surface-soft);
  border-color: var(--theme-border-strong);
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
  color: var(--theme-text-muted);
  font-size: 14px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid var(--theme-border);
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
  color: var(--theme-text-muted);
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
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  font-size: 13px;
  font-weight: 500;
  color: var(--theme-text);
}

.device-item-compact:hover {
  background: var(--theme-surface-soft);
  border-color: #3b82f6;
}

.device-item-compact.online {
  border-color: var(--theme-success-border);
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

.status-dot.reconnecting {
  background: #f59e0b;
  animation: device-status-pulse 1.2s ease-in-out infinite;
}

@keyframes device-status-pulse {
  50% { opacity: 0.35; }
}

/* 🆕 Health Pill Styles */
.health-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  margin-left: 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
}

.health-pill:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.health-pill.green {
  background: var(--theme-success-soft);
  color: var(--theme-success-text);
}

.health-pill.yellow {
  background: var(--theme-warning-soft);
  color: var(--theme-warning-text);
}

.health-pill.red {
  background: var(--theme-danger-soft);
  color: var(--theme-danger-text);
}

.health-pill.gray {
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
}

.health-pill-small {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  margin-left: 6px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
}

.health-pill-small.green {
  background: var(--theme-success-soft);
  color: var(--theme-success-text);
}

.health-pill-small.yellow {
  background: var(--theme-warning-soft);
  color: var(--theme-warning-text);
}

.health-pill-small.red {
  background: var(--theme-danger-soft);
  color: var(--theme-danger-text);
}

.health-pill-small.gray {
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
}

.paused-indicator {
  color: #f59e0b;
  font-size: 11px;
  margin-left: 4px;
}

.device-item-compact.paused {
  border-color: #fbbf24;
  background: var(--theme-warning-soft);
}

/* 🆕 Health Modal Styles */
.health-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.health-modal {
  background: var(--theme-surface);
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.health-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--theme-border);
  background: var(--theme-surface-soft);
}

.health-modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--theme-text);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--theme-text-muted);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--theme-surface-hover);
  color: var(--theme-text);
}

.health-modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(85vh - 60px);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  color: var(--theme-text-muted);
  font-size: 14px;
}

/* Status Header */
.health-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.health-header.healthy { background: var(--theme-success-soft); border: 1px solid var(--theme-success-border); }
.health-header.warning { background: var(--theme-warning-soft); border: 1px solid var(--theme-warning-border); }
.health-header.critical { background: var(--theme-danger-soft); border: 1px solid var(--theme-danger-border); }
.health-header.paused { background: var(--theme-surface-soft); border: 1px solid var(--theme-border); }
.health-header.banned { background: var(--theme-danger-soft); border: 1px solid var(--theme-danger-border); }

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.health-header.healthy .status-dot { background: #22c55e; }
.health-header.warning .status-dot { background: #f59e0b; }
.health-header.critical .status-dot { background: #ef4444; }
.health-header.paused .status-dot { background: #94a3b8; }
.health-header.banned .status-dot { background: #dc2626; }

.status-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-label {
  font-weight: 600;
  font-size: 15px;
  color: var(--theme-text);
}

.status-time {
  font-size: 12px;
  color: var(--theme-text-muted);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 12px;
  background: var(--theme-surface-soft);
  border-radius: 8px;
  border: 1px solid var(--theme-border);
}

.stat-box.has-warning { border-color: #fbbf24; background: var(--theme-warning-soft); }
.stat-box.has-error { border-color: #f87171; background: var(--theme-danger-soft); }

.stat-box .stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--theme-text);
  line-height: 1;
}

.stat-box.has-warning .stat-value { color: #d97706; }
.stat-box.has-error .stat-value { color: #dc2626; }

.stat-box .stat-label {
  font-size: 11px;
  color: var(--theme-text-muted);
  margin-top: 4px;
}

/* Notice Banners */
.notice {
  padding: 12px 14px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.4;
}

.notice.warning {
  background: var(--theme-warning-soft);
  border: 1px solid var(--theme-warning-border);
  color: var(--theme-warning-text);
}

.notice.info {
  background: var(--theme-info-soft);
  border: 1px solid #bae6fd;
  color: #0369a1;
}

.notice strong {
  display: block;
  margin-bottom: 4px;
}

.notice-meta {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

/* Activity Section */
.activity-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-text-secondary);
}

.section-count {
  font-size: 12px;
  color: var(--theme-text-muted);
  background: var(--theme-surface-soft);
  padding: 2px 8px;
  border-radius: 10px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: var(--theme-surface);
  border-radius: 6px;
  border: 1px solid var(--theme-border);
  font-size: 13px;
}

.activity-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}

.activity-item.success .activity-indicator { background: #22c55e; }
.activity-item.warning .activity-indicator { background: #f59e0b; }
.activity-item.error .activity-indicator { background: #ef4444; }
.activity-item.info .activity-indicator { background: #3b82f6; }

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.activity-type {
  color: var(--theme-text-secondary);
  font-weight: 500;
}

.activity-message {
  font-size: 12px;
  color: var(--theme-text-muted);
  line-height: 1.4;
  word-break: break-word;
}

.activity-confidence {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.activity-confidence.high { background: #ef4444; }
.activity-confidence.medium { background: #f59e0b; }
.activity-confidence.low { background: var(--theme-surface-hover); }

.activity-time {
  font-size: 12px;
  color: var(--theme-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-toggle {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  background: transparent;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: var(--theme-text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-toggle:hover {
  background: var(--theme-surface-soft);
  border-color: #9ca3af;
  color: var(--theme-text-secondary);
}

/* Action Bar */
.action-bar {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.btn.primary {
  flex: 1;
  background: #3b82f6;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn.secondary {
  flex: 1;
  background: var(--theme-surface-soft);
  color: var(--theme-text-secondary);
  border: 1px solid #d1d5db;
}

.btn.secondary:hover:not(:disabled) {
  background: var(--theme-surface-hover);
}

.btn.icon-only {
  padding: 10px;
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
  border: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn.icon-only:hover:not(:disabled) {
  background: var(--theme-surface-hover);
  color: var(--theme-text-secondary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--theme-text-muted);
}

.empty-state p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* Keep old styles for backwards compat - can remove later */
.health-status-card {
  display: none;
}
</style>
