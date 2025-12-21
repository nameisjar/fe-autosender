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
          <!-- 🆕 Health Badge -->
          <span 
            v-if="selectedDeviceHealth" 
            class="health-badge"
            :class="getHealthBadge(selectedDevice.id).color"
            :title="getHealthTooltip(selectedDevice.id)"
            @click.stop="showHealthModal = true"
          ></span>
        </div>
        <div
          class="device-status-compact"
          :class="{ online: selectedDevice.isConnected }"
        >
          {{ selectedDevice.isConnected ? "● Online" : "● Offline" }}
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
        :class="{ online: device.isConnected, paused: device.health?.isPaused }"
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
            class="health-badge-small"
            :class="getHealthBadge(device.id).color"
          ></span>
        </span>
        <span class="status-dot" :class="{ online: device.isConnected }"></span>
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

/* 🆕 Health Badge Styles */
.health-badge {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 8px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  background: #9ca3af;
}

.health-badge:hover {
  transform: scale(1.3);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.health-badge.green { background: #22c55e; }
.health-badge.yellow { background: #f59e0b; }
.health-badge.red { background: #ef4444; }
.health-badge.gray { background: #9ca3af; }

.health-badge-small {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 6px;
  background: #9ca3af;
}

.health-badge-small.green { background: #22c55e; }
.health-badge-small.yellow { background: #f59e0b; }
.health-badge-small.red { background: #ef4444; }
.health-badge-small.gray { background: #9ca3af; }

.paused-indicator {
  color: #f59e0b;
  font-size: 11px;
  margin-left: 4px;
}

.device-item-compact.paused {
  border-color: #fbbf24;
  background: #fefce8;
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
  background: white;
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
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.health-modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
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
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
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
  color: #64748b;
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

.health-header.healthy { background: #f0fdf4; border: 1px solid #bbf7d0; }
.health-header.warning { background: #fffbeb; border: 1px solid #fde68a; }
.health-header.critical { background: #fef2f2; border: 1px solid #fecaca; }
.health-header.paused { background: #f8fafc; border: 1px solid #e2e8f0; }
.health-header.banned { background: #fef2f2; border: 1px solid #fecaca; }

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
  color: #1e293b;
}

.status-time {
  font-size: 12px;
  color: #64748b;
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
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-box.has-warning { border-color: #fbbf24; background: #fffbeb; }
.stat-box.has-error { border-color: #f87171; background: #fef2f2; }

.stat-box .stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-box.has-warning .stat-value { color: #d97706; }
.stat-box.has-error .stat-value { color: #dc2626; }

.stat-box .stat-label {
  font-size: 11px;
  color: #64748b;
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
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.notice.info {
  background: #f0f9ff;
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
  color: #475569;
}

.section-count {
  font-size: 12px;
  color: #94a3b8;
  background: #f1f5f9;
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
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
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
  color: #374151;
  font-weight: 500;
}

.activity-message {
  font-size: 12px;
  color: #6b7280;
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
.activity-confidence.low { background: #d1d5db; }

.activity-time {
  font-size: 12px;
  color: #94a3b8;
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
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-toggle:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
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
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn.secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn.icon-only {
  padding: 10px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn.icon-only:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
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
