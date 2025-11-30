<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
          Kelola Device WhatsApp
        </h2>
        <p class="subtitle">Kelola dan hubungkan perangkat WhatsApp untuk mengirim pesan</p>
      </div>
      
      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          <div>
            <div class="stat-value">{{ devices.length }}</div>
            <div class="stat-label">Total Device</div>
          </div>
        </div>
        <div class="stat-card stat-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <div class="stat-value">{{ devices.filter(d => d.status === 'open').length }}</div>
            <div class="stat-label">Terhubung</div>
          </div>
        </div>
        <div class="stat-card stat-warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <div class="stat-value">{{ devices.filter(d => d.status !== 'open').length }}</div>
            <div class="stat-label">Belum Terhubung</div>
          </div>
        </div>
      </div>
    </div>

    <section class="create card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Buat Device Baru
        </h3>
      </div>
      <div v-if="tutorReachedLimit" class="info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Tutor hanya bisa memiliki 1 device.
      </div>
      <form v-else @submit.prevent="createDevice" class="form-inline">
        <div class="field">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            Nama Device
          </label>
          <input v-model="name" placeholder="Contoh: Device Tutor" required />
        </div>
        <button class="btn primary" :disabled="loading || tutorReachedLimit || !name.trim()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          {{ loading ? 'Menyimpan...' : 'Buat Device' }}
        </button>
      </form>
    </section>

    <section class="pairing card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
            <line x1="2" y1="2" x2="22" y2="22"/>
          </svg>
          Pairing WhatsApp (QR Code)
        </h3>
      </div>
      <div class="toolbar">
        <div class="filters">
          <div class="field">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              Pilih Device
            </label>
            <select v-model="deviceId" :disabled="pairingLoading">
              <option value="" disabled>Pilih device</option>
              <option v-for="d in devices" :key="d.id" :value="String(d.id)">
                {{ d.name }} {{ d.status === 'open' ? '✓ Terhubung' : '' }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>&nbsp;</label>
            <div class="row-btns">
              <button 
                v-if="selectedStatus !== 'open'"
                class="btn primary" 
                @click="startPairing" 
                :disabled="!deviceId || pairingLoading || (isTutor && tutorHasConnectedDevice)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {{ pairingLoading ? 'Menunggu QR...' : 'Mulai Pairing' }}
              </button>
              <button 
                v-else-if="!isTutor"
                class="btn outline" 
                @click="selectNextDisconnectedDevice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                Pairing Device Lain
              </button>
              <button 
                v-if="controller && selectedStatus !== 'open'" 
                class="btn outline" 
                @click="stopPairing">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="6" y="6" width="12" height="12"/>
                </svg>
                Hentikan
              </button>
            </div>
          </div>
        </div>
      </div>
      <p class="hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Scan QR dari WhatsApp di ponsel Anda. Jika sudah terhubung, halaman akan otomatis update.
      </p>
      
      <!-- Success Connection Display -->
      <div v-if="selectedStatus === 'open'" class="connection-success">
        <div class="success-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="success-content">
          <h4>✅ WhatsApp Berhasil Terhubung!</h4>
          <p>Device <strong>{{ selectedDevice?.name }}</strong> sudah siap digunakan untuk mengirim pesan dan broadcast.</p>
          <div class="success-features">
            <div class="feature-item">
              <span class="feature-icon">💬</span>
              <span>Kirim Feedback</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📢</span>
              <span>Broadcast Massal</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">👥</span>
              <span>Sinkron Grup</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📱</span>
              <span>Reminder Otomatis</span>
            </div>
          </div>
          <div class="success-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>1 Device = 1 Akun WhatsApp. Jangan logout dari WhatsApp di ponsel Anda.</span>
          </div>
        </div>
      </div>
      
      <!-- Status Display with Auto-refresh indicator -->
      <div v-else-if="statusText && statusText !== 'Dihentikan'" class="status-display">
        <div class="status-spinner"></div>
        <span>{{ statusText }}</span>
      </div>
      
      <div v-if="apiError" class="error-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {{ apiError }}
      </div>

      <!-- QR Code Display -->
      <div v-if="qr && selectedStatus !== 'open'" class="qr-container">
        <div class="qr-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <h4>Scan QR Code WhatsApp</h4>
        </div>
        <div class="qr">
          <img :src="qr" alt="QR Code" @error="onQRImageError" />
        </div>
        <div class="qr-instructions">
          <div class="instruction-step">
            <span class="step-number">1</span>
            <span>Buka <strong>WhatsApp</strong> di ponsel Anda</span>
          </div>
          <div class="instruction-step">
            <span class="step-number">2</span>
            <span>Ketuk <strong>titik tiga</strong> (menu) di pojok kanan atas</span>
          </div>
          <div class="instruction-step">
            <span class="step-number">3</span>
            <span>Pilih <strong>Perangkat Tertaut</strong></span>
          </div>
          <div class="instruction-step">
            <span class="step-number">4</span>
            <span>Ketuk <strong>Tautkan Perangkat</strong></span>
          </div>
          <div class="instruction-step">
            <span class="step-number">5</span>
            <span><strong>Scan QR code</strong> di atas</span>
          </div>
        </div>
      </div>

      <div v-else-if="asciiQr && selectedStatus !== 'open'" class="qr-ascii">
        <h4>QR Code (Text Format)</h4>
        <pre>{{ asciiQr }}</pre>
      </div>

      <!-- Loading indicator -->
      <div v-else-if="pairingLoading && !apiError && selectedStatus !== 'open'" class="loading-qr">
        <div class="spinner-large"></div>
        <p>Menunggu QR Code dari server...</p>
        <small>Proses ini membutuhkan waktu beberapa detik</small>
      </div>
    </section>

    <section class="list card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
          Daftar Device ({{ devices.length }})
        </h3>
        <button class="btn-reload" @click="fetchDevices(true)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Muat Ulang
        </button>
      </div>

      <div class="devices-grid" v-if="devices.length">
        <div v-for="d in devices" :key="d.id" class="device-card" :class="{ 'is-connected': d.status === 'open' }">
          <div class="device-header">
            <div class="device-icon" :class="statusClass(d.status)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
            </div>
            <div class="device-info">
              <h4>{{ d.name }}</h4>
              <span class="device-id">ID: {{ d.id }}</span>
            </div>
            <span class="status-badge" :class="statusClass(d.status)">
              <span class="status-dot"></span>
              {{ humanStatus(d.status) }}
            </span>
          </div>
          <div class="device-body">
            <div class="device-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Kontak & Grup</span>
            </div>
            <div class="sync-status">
              <template v-if="d.status === 'open'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sync-icon">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                <span class="sync-text">Grup tersinkron otomatis</span>
              </template>
              <template v-else>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="warning-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span class="dim">Belum terhubung</span>
              </template>
            </div>
          </div>
          <div class="device-footer">
            <button class="btn-delete" @click="deleteOne(d)" :disabled="deleting">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Hapus Device
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
        <h3>Belum Ada Device</h3>
        <p>Buat device baru untuk mulai menggunakan fitur WhatsApp</p>
        <small>Satu device dapat terhubung ke satu nomor WhatsApp</small>
      </div>
    </section>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay delete-modal-overlay" @click="cancelDelete">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-icon">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
          </div>
        </div>
        
        <div class="delete-modal-content">
          <h3>Hapus Device Ini?</h3>
          <p class="delete-warning">Tindakan ini tidak dapat dibatalkan. Device dan semua koneksi WhatsApp-nya akan dihapus secara permanen.</p>
          
          <div class="device-preview" v-if="deviceToDelete">
            <div class="preview-icon" :class="statusClass(deviceToDelete.status)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
            </div>
            <div class="preview-info">
              <div class="preview-name">{{ deviceToDelete.name }}</div>
              <div class="preview-status">
                <span class="status-dot" :class="statusClass(deviceToDelete.status)"></span>
                {{ humanStatus(deviceToDelete.status) }}
              </div>
            </div>
          </div>
        </div>

        <div class="delete-modal-actions">
          <button type="button" class="btn-keep" @click="cancelDelete" :disabled="deleting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            Batal
          </button>
          <button type="button" class="btn-delete-confirm" @click="confirmDelete" :disabled="deleting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus Device' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted, watch } from 'vue';
import { userApi } from '../api/http.js';
import { useAuthStore } from '../stores/auth.js';
import QRCode from 'qrcode';
import { useGroups } from '../composables/useGroups.js';
import { useToast } from '../composables/useToast.js';
import { listenToDeviceStatus, listenToGroupUpdates, listenToNewGroup } from '../api/socket.js';
import { cache } from '../utils/cache.js';
import { debounce } from '../utils/debounce.js';

const toast = useToast();
const auth = useAuthStore();
const devices = ref([]);
const name = ref('');
const loading = ref(false);
const deleting = ref(false);
const error = ref('');
const success = ref('');

// Delete confirmation modal state
const showDeleteModal = ref(false);
const deviceToDelete = ref(null);

// Pairing state
const deviceId = ref('');
const qr = ref('');
const asciiQr = ref('');
const statusText = ref('');
const pairingLoading = ref(false);
const apiError = ref('');
let controller = null;
let socketCleanupFunctions = [];

// 🆕 Flag untuk mendeteksi apakah user manual memilih device
let isManualSelection = false;

const CACHE_KEY = 'devices_list';
const CACHE_TTL = 30; // 30 seconds

const isTutor = computed(() => auth.roleName === 'cs');
const tutorReachedLimit = computed(() => isTutor.value && devices.value.length >= 1);
const tutorHasConnectedDevice = computed(() => isTutor.value && devices.value.some(d => d.status === 'open'));

// Simplified group handling - groups are automatically synced when device connects
const { clearGroups } = useGroups();

// Pairing helpers
const selectedDevice = computed(() => devices.value.find(d => String(d.id) === String(deviceId.value)));
const selectedStatus = computed(() => selectedDevice.value?.status || '');
// expose for template tests
// eslint-disable-next-line no-undef
defineExpose({ selectedStatus });

// Fetch devices dengan cache layer
const fetchDevices = async (forceRefresh = false) => {
  try {
    // Check cache first (kecuali force refresh)
    if (!forceRefresh) {
      const cachedDevices = cache.get(CACHE_KEY);
      if (cachedDevices) {
        devices.value = cachedDevices;
        console.log('[Fetch] Using cached devices, no API call needed');
        
        // Auto-select device jika ada
        autoSelectDevice();
        
        // Setup socket listeners dengan data cache
        setupSocketListeners();
        return;
      }
    }

    console.log('[Fetch] Cache miss atau force refresh, calling API...');
    const { data } = await userApi.get('/devices');
    devices.value = data;
    
    // Save to cache
    cache.set(CACHE_KEY, data, CACHE_TTL);
    
    // Auto-select device jika ada
    autoSelectDevice();
    
    // Setup socket listeners after fetching devices
    setupSocketListeners();
    
    // Clear groups cache if current device is not connected
    const curId = localStorage.getItem('device_selected_id');
    if (curId) {
      const cur = devices.value.find((d) => String(d.id) === String(curId));
      if (cur && String(cur.status).toLowerCase() !== 'open') {
        clearGroups();
      }
    }
  } catch (e) {
    console.error('[Fetch] Error:', e);
  }
};

// Auto-select device saat load halaman
const autoSelectDevice = () => {
  if (!devices.value.length) return;
  
  // ✅ SKIP auto-select jika user baru saja manual memilih device
  if (isManualSelection) {
    console.log('[Auto-Select] Skipped - User manual selection');
    isManualSelection = false; // Reset flag
    return;
  }
  
  // Jika hanya ada 1 device, langsung pilih
  if (devices.value.length === 1) {
    deviceId.value = String(devices.value[0].id);
    console.log('[Auto-Select] Otomatis memilih device:', devices.value[0].name);
    return;
  }
  
  // ✅ PRIORITAS #1: Jika ada device tersimpan di localStorage, gunakan itu
  const savedDeviceId = localStorage.getItem('device_selected_id');
  if (savedDeviceId) {
    const savedDevice = devices.value.find(d => String(d.id) === savedDeviceId);
    if (savedDevice) {
      deviceId.value = savedDeviceId;
      console.log('[Auto-Select] Menggunakan device tersimpan dari localStorage:', savedDevice.name);
      return;
    }
  }
  
  // ✅ PRIORITAS #2: UNTUK ADMIN: Prioritas pilih device yang belum terhubung agar bisa langsung pairing
  if (!isTutor.value) {
    const disconnectedDevice = devices.value.find(d => d.status !== 'open');
    if (disconnectedDevice) {
      deviceId.value = String(disconnectedDevice.id);
      console.log('[Auto-Select] Admin - memilih device yang belum terhubung:', disconnectedDevice.name);
      return;
    }
  }
  
  // ✅ PRIORITAS #3: Untuk Tutor: Jika ada device yang sudah open, pilih yang itu
  const openDevice = devices.value.find(d => d.status === 'open');
  if (openDevice) {
    deviceId.value = String(openDevice.id);
    console.log('[Auto-Select] Otomatis memilih device terhubung:', openDevice.name);
    return;
  }
  
  // ✅ PRIORITAS #4: Default: pilih device pertama
  deviceId.value = String(devices.value[0].id);
  console.log('[Auto-Select] Memilih device pertama:', devices.value[0].name);
};

// Debounced version untuk mencegah multiple calls
const debouncedFetchDevices = debounce(fetchDevices, 1000);

const createDevice = async () => {
  error.value = '';
  success.value = '';
  
  if (!name.value.trim()) {
    toast.error('Nama device tidak boleh kosong');
    return;
  }
  
  if (tutorReachedLimit.value) {
    toast.error('Tutor hanya dapat memiliki 1 device');
    return;
  }
  
  loading.value = true;
  try {
    await userApi.post('/tutors/devices', { name: name.value });
    toast.success('Device berhasil dibuat');
    name.value = '';
    
    // Invalidate cache dan fetch ulang
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  } catch (e) {
    toast.error((e && e.response && e.response.data && e.response.data.message) || 'Gagal membuat device');
  } finally {
    loading.value = false;
  }
};

const doDelete = async (ids) => {
  if (!ids || ids.length === 0) return;
  const msg = ids.length === 1 ? 'Hapus device ini?' : `Hapus ${ids.length} device terpilih?`;
  if (!window.confirm(msg)) return;
  error.value = '';
  success.value = '';
  deleting.value = true;
  try {
    await userApi.delete('/devices', { data: { deviceIds: ids } });
    toast.success('Device berhasil dihapus');
    
    // Invalidate cache dan fetch ulang
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  } catch (e) {
    toast.error((e && e.response && e.response.data && e.response.data.message) || 'Gagal menghapus device');
  } finally {
    deleting.value = false;
  }
};

const deleteOne = async (d) => {
  // Show custom delete modal instead of browser confirm
  deviceToDelete.value = d;
  showDeleteModal.value = true;
};

// Confirm delete action
const confirmDelete = async () => {
  if (!deviceToDelete.value) return;
  
  deleting.value = true;
  
  try {
    await userApi.delete('/devices', { data: { deviceIds: [deviceToDelete.value.id] } });
    toast.success('Device berhasil dihapus');
    
    // Close modal
    showDeleteModal.value = false;
    deviceToDelete.value = null;
    
    // Invalidate cache dan fetch ulang
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  } catch (e) {
    toast.error((e && e.response && e.response.data && e.response.data.message) || 'Gagal menghapus device');
  } finally {
    deleting.value = false;
  }
};

// Cancel delete action
const cancelDelete = () => {
  showDeleteModal.value = false;
  deviceToDelete.value = null;
};

const onQRImageError = () => {
  console.error('QR image failed to load');
  if (qr.value && !qr.value.startsWith('data:image')) {
    generateQRFromString(qr.value);
  }
};

const generateQRFromString = async (qrString) => {
  try {
    qr.value = await QRCode.toDataURL(qrString);
    asciiQr.value = '';
  } catch (error) {
    console.error('Error generating QR from string:', error);
  }
};

async function openSSEOnce() {
  controller = new AbortController();
  apiError.value = '';
  qr.value = '';
  asciiQr.value = '';

  const token = localStorage.getItem('token') || '';
  
  // Get API base URL from environment
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  const sseUrl = `${API_BASE}/tutors/sessions/create-sse`;

  try {
    const resp = await fetch(sseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ deviceId: deviceId.value }),
      signal: controller.signal,
      cache: 'no-store'
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${errorText}`);
    }

    if (!resp.body) {
      throw new Error('Response body is null');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let connectedOpen = false;

    const processLines = async () => {
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const json = line.slice(5).trim();
          if (!json) continue;

          try {
            const data = JSON.parse(json);

            if (data.error) {
              apiError.value = data.error;
              continue;
            }

            if (data.qr) {
              if (typeof data.qr === 'string' && data.qr.startsWith('data:image')) {
                qr.value = data.qr;
                asciiQr.value = '';
              } else if (typeof data.qr === 'string') {
                await generateQRFromString(data.qr);
              }
            }

            if (!qr.value && data.qrRaw) {
              asciiQr.value = data.qrRaw;
            }

            if (data.connection) {
              statusText.value = data.connection;
              if (data.connection === 'open') {
                connectedOpen = true;
                qr.value = '';
                asciiQr.value = '';
                statusText.value = 'Berhasil terhubung!';
              }
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError);
          }
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      await processLines();
    }

    return connectedOpen;
  } catch (error) {
    if (error.name === 'AbortError') {
      return false; // Stopped manually
    }
    throw error;
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const startPairing = async () => {
  if (!deviceId.value || pairingLoading.value) return;

  // Clear groups cache before re-pairing (old session groups become invalid)
  clearGroups();

  // Refresh device list to reflect latest status (use cache if available)
  await fetchDevices();

  // prevent parallel streams
  if (controller) {
    try { controller.abort(); } catch (e) { console.error('Error aborting controller:', e); }
  }

  qr.value = '';
  asciiQr.value = '';
  statusText.value = 'Menghubungkan...';
  pairingLoading.value = true;
  apiError.value = '';

  try {
    const maxCycles = 3;
    for (let i = 0; i < maxCycles; i++) {
      statusText.value = `Mencoba koneksi... (${i + 1}/${maxCycles})`;
      const opened = await openSSEOnce();
      if (opened) {
        statusText.value = 'Berhasil terhubung!';
        toast.success('WhatsApp berhasil terhubung!');
        break;
      }
      if (!pairingLoading.value) break; // stopped manually
      if (i < maxCycles - 1) {
        await wait(1000);
      }
    }
  } catch (e) {
    console.error('Pairing error:', e);
    statusText.value = e?.message || 'Koneksi terputus';
    apiError.value = e?.message || 'Terjadi kesalahan saat melakukan pairing';
    toast.error(e?.message || 'Gagal melakukan pairing WhatsApp');
  } finally {
    pairingLoading.value = false;
    controller = null;
    
    // Invalidate cache setelah pairing selesai untuk pastikan data fresh
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  }
};

const stopPairing = () => {
  try { controller && controller.abort && controller.abort(); } catch (e) { console.error('Error stopping pairing:', e); }
  controller = null;
  pairingLoading.value = false;
  apiError.value = '';
  qr.value = '';
  asciiQr.value = '';
  statusText.value = 'Dihentikan';
};

// 🆕 Function untuk memilih device berikutnya yang belum terhubung
const selectNextDisconnectedDevice = () => {
  // Cari device yang belum terhubung (status !== 'open')
  const disconnectedDevices = devices.value.filter(d => d.status !== 'open');
  
  if (disconnectedDevices.length === 0) {
    toast.info('Semua device sudah terhubung');
    return;
  }
  
  // Pilih device pertama yang belum terhubung
  const nextDevice = disconnectedDevices[0];
  deviceId.value = String(nextDevice.id);
  
  console.log('[Select Next] Memilih device yang belum terhubung:', nextDevice.name);
  toast.success(`Device "${nextDevice.name}" dipilih. Klik "Mulai Pairing" untuk menghubungkan.`);
};

// Pretty status mapping for table badges
const humanStatus = (s) => {
  const key = String(s || '').toLowerCase();
  const map = {
    open: 'Terhubung',
    connected: 'Terhubung',
    connecting: 'Menghubungkan…',
    pending: 'Menunggu…',
    closed: 'Terputus',
    disconnected: 'Terputus',
    close: 'Terputus',
  };
  return map[key] || (s || '-');
};

const statusClass = (s) => {
  const key = String(s || '').toLowerCase();
  if (key === 'open' || key === 'connected') return 'is-open';
  if (key === 'connecting' || 'pending') return 'is-pending';
  return 'is-closed';
};

// Watch for status changes and auto-refresh
watch(selectedStatus, async (newStatus, oldStatus) => {
  if (oldStatus && newStatus !== oldStatus) {
    console.log(`✅ Status berubah dari ${oldStatus} ke ${newStatus}`);
    
    // Update cache dengan status baru (no API call needed)
    const cachedDevices = cache.get(CACHE_KEY);
    if (cachedDevices) {
      const deviceIndex = cachedDevices.findIndex(d => d.id === selectedDevice.value.id);
      if (deviceIndex !== -1) {
        cachedDevices[deviceIndex].status = newStatus;
        cache.set(CACHE_KEY, cachedDevices, CACHE_TTL);
        console.log('[Cache] Updated device status in cache');
      }
    }
    
    // Jika berubah menjadi open (terhubung)
    if (newStatus === 'open') {
      statusText.value = 'Berhasil terhubung! ✅';
      qr.value = '';
      asciiQr.value = '';
      pairingLoading.value = false;
      
      // Stop controller
      if (controller) {
        try { controller.abort(); } catch (e) { console.error('Error aborting:', e); }
        controller = null;
      }
      
      // Show success toast
      toast.success('Device berhasil terhubung dengan WhatsApp!');
    }
    
    // Jika berubah menjadi closed/disconnected (terputus)
    if ((oldStatus === 'open' || oldStatus === 'connected') && 
        (newStatus === 'close' || newStatus === 'closed' || newStatus === 'disconnected')) {
      
      // Reset semua state pairing
      pairingLoading.value = false;
      qr.value = '';
      asciiQr.value = '';
      statusText.value = '';
      
      // Stop controller jika masih ada
      if (controller) {
        try { controller.abort(); } catch (e) { console.error('Error aborting:', e); }
        controller = null;
      }
      
      // Clear success message jika masih ada
      success.value = '';
      
      // Show warning toast
      toast.warning('Device terputus dari WhatsApp. Silakan lakukan pairing ulang.');
      
      console.log('⚠️ Device terputus, UI telah direset ke state awal');
    }
  }
});

// Watch deviceId untuk save ke localStorage
watch(deviceId, (newDeviceId, oldDeviceId) => {
  if (newDeviceId) {
    localStorage.setItem('device_selected_id', newDeviceId);
    const device = devices.value.find(d => String(d.id) === newDeviceId);
    if (device) {
      localStorage.setItem('device_selected_name', device.name);
    }
    
    // ✅ Set flag bahwa ini adalah manual selection dari user
    // HANYA jika ada oldDeviceId (artinya user ganti device, bukan initial load)
    if (oldDeviceId && oldDeviceId !== newDeviceId) {
      isManualSelection = true;
      console.log('[Manual Selection] User memilih device:', device?.name);
    }
  }
});

// Setup Socket.IO listeners for all devices - PURE REAL-TIME (NO POLLING)
const setupSocketListeners = () => {
  // Clean up existing listeners first
  cleanupSocketListeners();
  
  console.log(`[Socket.IO] Setting up listeners for ${devices.value.length} devices`);
  
  // Setup listener untuk setiap device
  devices.value.forEach((device) => {
    const cleanup = listenToDeviceStatus(device.id, async (newStatus) => {
      console.log(`[Socket.IO] Device ${device.id} status: ${newStatus}`);
      
      // Update device status in local state TANPA API call
      const deviceIndex = devices.value.findIndex(d => d.id === device.id);
      if (deviceIndex !== -1) {
        const oldStatus = devices.value[deviceIndex].status;
        devices.value[deviceIndex].status = newStatus;
        
        // Trigger Vue reactivity
        devices.value = [...devices.value];
        
        // Update cache juga
        const cachedDevices = cache.get(CACHE_KEY);
        if (cachedDevices) {
          const cachedIndex = cachedDevices.findIndex(d => d.id === device.id);
          if (cachedIndex !== -1) {
            cachedDevices[cachedIndex].status = newStatus;
            cache.set(CACHE_KEY, cachedDevices, CACHE_TTL);
          }
        }
        
        console.log(`[Socket.IO] ✅ Updated: ${oldStatus} -> ${newStatus} (0 API calls)`);
      }
    });
    
    socketCleanupFunctions.push(cleanup);
  });
  
  console.log('[Socket.IO] ✅ All listeners active, monitoring real-time via WebSocket');
};

const cleanupSocketListeners = () => {
  socketCleanupFunctions.forEach(cleanup => cleanup());
  socketCleanupFunctions = [];
};

onMounted(async () => {
  console.log('[Mount] 🚀 Optimasi Ekstrem Active: Socket.IO + Cache (No Polling)');
  
  if (!auth.me) {
    try { await auth.fetchMe(); } catch (_) {}
  }
  
  // Initial fetch (akan pakai cache jika tersedia)
  await fetchDevices();
});

// Cleanup on unmount
onUnmounted(() => {
  console.log('[Unmount] Cleaning up...');
  
  if (controller) {
    try { controller.abort(); } catch (e) { console.error('Error aborting controller on unmount:', e); }
  }
  
  cleanupSocketListeners();
});
</script>

<style scoped>
/* Base Styles */
.wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  margin-bottom: 24px;
}

.header-content h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.header-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
  stroke-width: 2.5;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.stat-card svg {
  width: 40px;
  height: 40px;
  color: #3b82f6;
  flex-shrink: 0;
}

.stat-card.stat-success svg {
  color: #10b981;
}

.stat-card.stat-warning svg {
  color: #f59e0b;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* Card Styles */
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.card-header-section h3 svg {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

.btn-reload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reload:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-reload svg {
  width: 16px;
  height: 16px;
}

/* Form Styles */
.form-inline {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 250px;
}

.field label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.field label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.field input,
.field select {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn.outline {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
}

.btn.outline:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

/* Info Box */
.info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  border-radius: 10px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.info svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #f59e0b;
}

/* Toolbar */
.toolbar {
  margin-bottom: 16px;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.row-btns {
  display: flex;
  gap: 8px;
}

/* Hint */
.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  margin-top: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.hint svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #3b82f6;
}

/* Connection Success */
.connection-success {
  margin: 20px 0;
  padding: 24px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #34d399;
  border-radius: 16px;
  display: flex;
  gap: 20px;
  box-shadow: 0 4px 16px rgba(52, 211, 153, 0.2);
}

.success-icon-box {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.success-icon-box svg {
  width: 32px;
  height: 32px;
  color: #ffffff;
}

.success-content {
  flex: 1;
}

.success-content h4 {
  margin: 0 0 8px 0;
  color: #065f46;
  font-size: 18px;
  font-weight: 700;
}

.success-content p {
  margin: 0 0 16px 0;
  color: #047857;
  line-height: 1.6;
}

.success-content strong {
  font-weight: 600;
  color: #065f46;
}

.success-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.feature-icon {
  font-size: 18px;
}

.success-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  font-size: 13px;
  color: #047857;
  border-left: 3px solid #10b981;
}

.success-note svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #10b981;
}

/* Status Display */
.status-display {
  margin: 16px 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #60a5fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e40af;
  font-weight: 500;
}

.status-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Box */
.error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1px solid #f87171;
  border-radius: 10px;
  color: #991b1b;
  font-weight: 500;
}

.error-box svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #dc2626;
}

/* QR Container */
.qr-container {
  margin: 24px 0;
  text-align: center;
}

.qr-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.qr-header svg {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.qr-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.qr {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.qr img {
  width: 320px;
  height: 320px;
  object-fit: contain;
  border: 3px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.qr-instructions {
  max-width: 500px;
  margin: 24px auto 0;
  text-align: left;
}

.instruction-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #475569;
}

.step-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.instruction-step strong {
  color: #1e293b;
  font-weight: 600;
}

/* QR ASCII */
.qr-ascii {
  margin-top: 20px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
}

.qr-ascii h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #475569;
}

.qr-ascii pre {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  line-height: 10px;
  white-space: pre;
  color: #1e293b;
  overflow-x: auto;
}

/* Loading QR */
.loading-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
}

.spinner-large {
  width: 56px;
  height: 56px;
  border: 5px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-qr p {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #475569;
}

.loading-qr small {
  color: #64748b;
  font-size: 13px;
}

/* Devices Grid */
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.device-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.device-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.device-card.is-connected {
  border-color: #34d399;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.device-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.device-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-icon svg {
  width: 28px;
  height: 28px;
  color: #1e40af;
}

.device-icon.is-open {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.device-icon.is-open svg {
  color: #065f46;
}

.device-icon.is-closed {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.device-icon.is-closed svg {
  color: #991b1b;
}

.device-info {
  flex: 1;
  min-width: 0;
}

.device-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-id {
  font-size: 12px;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}

.status-badge .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-badge.is-open {
  color: #065f46;
  background: #d1fae5;
  border-color: #34d399;
}

.status-badge.is-open .status-dot {
  background: #10b981;
}

.status-badge.is-pending {
  color: #92400e;
  background: #fef3c7;
  border-color: #fbbf24;
}

.status-badge.is-pending .status-dot {
  background: #f59e0b;
}

.status-badge.is-closed {
  color: #991b1b;
  background: #fee2e2;
  border-color: #f87171;
}

.status-badge.is-closed .status-dot {
  background: #dc2626;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.device-body {
  padding: 20px;
}

.device-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 12px;
}

.device-feature svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
  flex-shrink: 0;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.sync-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.sync-text {
  color: #059669;
  font-weight: 500;
}

.warning-icon {
  width: 16px;
  height: 16px;
  color: #f59e0b;
}

.dim {
  color: #94a3b8;
}

.device-footer {
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.btn-delete {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border: 1.5px solid #fca5a5;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delete svg {
  width: 16px;
  height: 16px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  text-align: center;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #475569;
}

.empty-state p {
  margin: 0 0 4px 0;
  color: #64748b;
  font-size: 15px;
}

.empty-state small {
  color: #94a3b8;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 1024px) {
  .devices-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .success-features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .wrapper {
    padding: 0 16px;
  }

  .header-content h2 {
    font-size: 24px;
  }

  .header-icon {
    width: 28px;
    height: 28px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .devices-grid {
    grid-template-columns: 1fr;
  }

  .form-inline {
    flex-direction: column;
    align-items: stretch;
  }

  .field {
    min-width: unset;
  }

  .row-btns {
    flex-direction: column;
  }

  .row-btns button {
    width: 100%;
  }

  .connection-success {
    flex-direction: column;
    text-align: center;
  }

  .success-icon-box {
    margin: 0 auto;
  }

  .qr img {
    width: 280px;
    height: 280px;
  }
}

@media (max-width: 480px) {
  .wrapper {
    padding: 0 12px;
  }

  .card {
    padding: 16px;
  }

  .header-content h2 {
    font-size: 20px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-card svg {
    width: 32px;
    height: 32px;
  }

  .stat-value {
    font-size: 24px;
  }

  .qr img {
    width: 240px;
    height: 240px;
  }

  .success-features {
    grid-template-columns: 1fr;
  }
}

/* Delete Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.delete-modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.delete-modal {
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 32px;
  text-align: center;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.delete-modal-icon {
  margin-bottom: 20px;
  animation: pulse-icon 0.5s ease-out;
}

@keyframes pulse-icon {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.icon-circle::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  opacity: 0.3;
  animation: ripple 1.5s infinite;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.icon-circle svg {
  width: 40px;
  height: 40px;
  color: #dc2626;
  position: relative;
  z-index: 1;
}

.delete-modal-content h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.delete-warning {
  margin: 0 0 24px 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.device-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: left;
  transition: all 0.2s ease;
}

.device-preview:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.preview-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-icon svg {
  width: 24px;
  height: 24px;
  color: #1e40af;
}

.preview-icon.is-open {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.preview-icon.is-open svg {
  color: #065f46;
}

.preview-icon.is-closed {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.preview-icon.is-closed svg {
  color: #991b1b;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.preview-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.preview-status .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.preview-status .status-dot.is-open {
  background: #10b981;
}

.preview-status .status-dot.is-closed {
  background: #dc2626;
}

.preview-status .status-dot.is-pending {
  background: #f59e0b;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-keep,
.btn-delete-confirm {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-keep {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-keep:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-delete-confirm {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-delete-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
}

.btn-delete-confirm:disabled,
.btn-keep:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-keep svg,
.btn-delete-confirm svg {
  width: 18px;
  height: 18px;
}

/* Responsive for Delete Modal */
@media (max-width: 768px) {
  .delete-modal {
    padding: 24px;
    max-width: 90%;
  }

  .icon-circle {
    width: 72px;
    height: 72px;
  }

  .icon-circle svg {
    width: 36px;
    height: 36px;
  }

  .delete-modal-content h3 {
    font-size: 20px;
  }

  .delete-modal-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-keep,
  .btn-delete-confirm {
    width: 100%;
  }
}
</style>