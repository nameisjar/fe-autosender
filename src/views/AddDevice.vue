<template>
  <div class="wrapper">
    <h2>Tambah Device</h2>

    <section class="create card">
      <h3>Buat Device Baru</h3>
      <div v-if="tutorReachedLimit" class="info">
        Tutor hanya bisa memiliki 1 device. Hapus device lama terlebih dahulu untuk membuat yang baru.
      </div>
      <form v-else @submit.prevent="createDevice" class="form-inline">
        <label class="field">
          <span>Nama Device</span>
          <input v-model="name" placeholder="Contoh: Device Tutor" required />
        </label>
        <button class="btn primary" :disabled="loading || tutorReachedLimit || !name.trim()">{{ loading ? 'Menyimpan...' : 'Buat Device' }}</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </section>

    <section class="pairing card">
      <h3>Pairing (QR)</h3>
      <div class="toolbar">
        <div class="filters">
          <div class="field">
            <label>Device</label>
            <select v-model="deviceId" :disabled="pairingLoading || selectedStatus === 'open'">
              <option value="" disabled>Pilih device</option>
              <option v-for="d in devices" :key="d.id" :value="String(d.id)">{{ d.name }}</option>
            </select>
          </div>
          <div class="field">
            <label>&nbsp;</label>
            <div class="row-btns">
              <!-- Tombol Mulai: 
                   - Hilang jika: single device (tutor) DAN status open
                   - Muncul jika: multi device (admin) ATAU status bukan open
              -->
              <button 
                v-if="devices.length > 1 || selectedStatus !== 'open'"
                class="btn primary" 
                @click="startPairing" 
                :disabled="!deviceId || pairingLoading || selectedStatus === 'open'">
                {{ pairingLoading ? 'Menunggu QR...' : 'Mulai' }}
              </button>
              <button 
                v-if="controller && selectedStatus !== 'open'" 
                class="btn outline" 
                @click="stopPairing">
                Hentikan
              </button>
            </div>
          </div>
        </div>
      </div>
      <p class="hint">Scan QR dari WhatsApp di ponsel Anda. Jika sudah terhubung, jangan lupa direfresh.</p>
      
      <!-- Success Connection Display -->
      <div v-if="selectedStatus === 'open'" class="connection-success">
        <div class="success-icon">✅</div>
        <div class="success-content">
          <h4>WhatsApp Berhasil Terhubung!</h4>
          <p>Device sudah siap digunakan untuk mengirim pesan dan broadcast.</p>
          <div class="success-features">
            <div class="feature-item">
              <span class="feature-icon">💬</span>
              <span>Feedback</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📢</span>
              <span>Broadcast</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">👥</span>
              <span>Grup Tersinkron</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📱</span>
              <span>Reminder</span>
            </div>
          </div>
          <p class="success-note">💡 1 Device hanya untuk 1 akun WhatsApp</p>
        </div>
      </div>
      
      <!-- Status Display with Auto-refresh indicator -->
      <div v-else-if="statusText && statusText !== 'Dihentikan'" class="status-display">
        <span class="status-icon">⛷️</span> 
        <span>{{ statusText }}</span>
      </div>
      
      <p v-if="apiError" class="error">❌ {{ apiError }}</p>

      <!-- QR Code Display - Only show if NOT connected and have QR -->
      <div v-if="qr && selectedStatus !== 'open'" class="qr-container">
        <h4>QR Code WhatsApp</h4>
        <div class="qr">
          <img :src="qr" alt="QR Code" @error="onQRImageError" />
        </div>
        <p class="qr-instructions">Buka WhatsApp di ponsel Anda → Ketuk titik tiga → Perangkat Tertaut → Tautkan Perangkat → Scan QR code di atas</p>
      </div>

      <div v-else-if="asciiQr && selectedStatus !== 'open'" class="qr-ascii">
        <h4>QR Code (Text)</h4>
        <pre>{{ asciiQr }}</pre>
      </div>

      <!-- Loading indicator when waiting for QR - Only if NOT connected -->
      <div v-else-if="pairingLoading && !apiError && selectedStatus !== 'open'" class="loading-qr">
        <div class="spinner"></div>
        <p>Menunggu QR Code...</p>
      </div>
    </section>

    <section class="list card">
      <h3>Daftar Device</h3>
      <div class="list-header">
        <button class="btn outline" @click="fetchDevices">Muat Ulang</button>
      </div>

      <div class="table-wrap">
        <table v-if="devices.length">
          <thead>
            <tr>
              <th>Nama</th>
              <th class="status-col">Status</th>
              <th class="group-col">Grup</th>
              <th class="action-col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in devices" :key="d.id">
              <td class="name-col">{{ d.name }}</td>
              <td class="status-col">
                <span class="status-badge" :class="statusClass(d.status)">{{ humanStatus(d.status) }}</span>
              </td>
              <td class="group-col">
                <div class="group-cell">
                  <template v-if="d.status === 'open'">
                    <span class="checkmark" aria-hidden="true">✔</span>
                    <span>Grup tersinkron otomatis</span>
                  </template>
                  <template v-else>
                    <span class="dim">Belum terhubung</span>
                  </template>
                </div>
              </td>
              <td class="action-col">
                <div class="row-btns">
                  <button class="btn danger btn-sm" @click="deleteOne(d)" :disabled="deleting">Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <p>Belum ada device.</p>
          <small>Silakan buat device baru pada formulir di atas.</small>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted, watch } from 'vue';
import { userApi } from '../api/http.js';
import { useAuthStore } from '../stores/auth.js';
import QRCode from 'qrcode';
import { useGroups } from '../composables/useGroups.js';
import { listenToDeviceStatus } from '../api/socket.js';
import { cache } from '../utils/cache.js';
import { debounce } from '../utils/debounce.js';

const auth = useAuthStore();
const devices = ref([]);
const name = ref('');
const loading = ref(false);
const deleting = ref(false);
const error = ref('');
const success = ref('');

// Pairing state
const deviceId = ref('');
const qr = ref('');
const asciiQr = ref('');
const statusText = ref('');
const pairingLoading = ref(false);
const apiError = ref('');
let controller = null;
let socketCleanupFunctions = [];

const CACHE_KEY = 'devices_list';
const CACHE_TTL = 30; // 30 seconds

const isTutor = computed(() => auth.roleName === 'cs');
const tutorReachedLimit = computed(() => isTutor.value && devices.value.length >= 1);

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
  
  // Jika hanya ada 1 device, langsung pilih
  if (devices.value.length === 1) {
    deviceId.value = String(devices.value[0].id);
    console.log('[Auto-Select] Otomatis memilih device:', devices.value[0].name);
    return;
  }
  
  // Jika ada device yang sudah open, pilih yang itu
  const openDevice = devices.value.find(d => d.status === 'open');
  if (openDevice) {
    deviceId.value = String(openDevice.id);
    console.log('[Auto-Select] Otomatis memilih device terhubung:', openDevice.name);
    return;
  }
  
  // Jika ada device tersimpan di localStorage, gunakan itu
  const savedDeviceId = localStorage.getItem('device_selected_id');
  if (savedDeviceId) {
    const savedDevice = devices.value.find(d => String(d.id) === savedDeviceId);
    if (savedDevice) {
      deviceId.value = savedDeviceId;
      console.log('[Auto-Select] Menggunakan device tersimpan:', savedDevice.name);
      return;
    }
  }
  
  // Default: pilih device pertama
  deviceId.value = String(devices.value[0].id);
  console.log('[Auto-Select] Memilih device pertama:', devices.value[0].name);
};

// Debounced version untuk mencegah multiple calls
const debouncedFetchDevices = debounce(fetchDevices, 1000);

const createDevice = async () => {
  error.value = '';
  success.value = '';
  
  if (!name.value.trim()) {
    error.value = 'Nama device tidak boleh kosong';
    return;
  }
  
  if (tutorReachedLimit.value) {
    error.value = 'Tutor hanya dapat memiliki 1 device';
    return;
  }
  
  loading.value = true;
  try {
    await userApi.post('/tutors/devices', { name: name.value });
    success.value = 'Device berhasil dibuat';
    name.value = '';
    
    // Invalidate cache dan fetch ulang
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  } catch (e) {
    error.value = (e && e.response && e.response.data && e.response.data.message) || 'Gagal membuat device';
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
    success.value = 'Device berhasil dihapus';
    
    // Invalidate cache dan fetch ulang
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  } catch (e) {
    error.value = (e && e.response && e.response.data && e.response.data.message) || 'Gagal menghapus device';
  } finally {
    deleting.value = false;
  }
};

const deleteOne = async (d) => {
  await doDelete([d.id]);
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
  if (key === 'connecting' || key === 'pending') return 'is-pending';
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
      
      // Show success message
      success.value = 'Device berhasil terhubung dengan WhatsApp!';
      setTimeout(() => { success.value = ''; }, 5000);
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
      
      // Show error message
      error.value = 'Device terputus dari WhatsApp. Silakan lakukan pairing ulang.';
      setTimeout(() => { error.value = ''; }, 5000);
      
      console.log('⚠️ Device terputus, UI telah direset ke state awal');
    }
  }
});

// Watch deviceId untuk save ke localStorage
watch(deviceId, (newDeviceId) => {
  if (newDeviceId) {
    localStorage.setItem('device_selected_id', newDeviceId);
    const device = devices.value.find(d => String(d.id) === newDeviceId);
    if (device) {
      localStorage.setItem('device_selected_name', device.name);
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
.wrapper { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.card { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 1px 2px rgba(16,24,40,0.04); padding: 12px; margin-top: 16px; }

.form-inline { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field > span, .field > label { font-size: 12px; color: #667085; }
.field input, .field select { height: 36px; padding: 6px 10px; border: 1px solid #d8dde6; border-radius: 8px; background: #fff; }

.toolbar { margin-top: 8px; }
.toolbar .filters { display: grid; grid-template-columns: repeat(3, minmax(160px, 1fr)); gap: 10px; }
.row-btns { display: flex; gap: 8px; }

.btn { height: 36px; padding: 0 12px; border: 1px solid #d0d5dd; background: #f9fafb; border-radius: 8px; cursor: pointer; font-weight: 500; }
.btn:disabled { opacity: .6; cursor: not-allowed; }
.btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
.btn.outline { background: #fff; }
.btn.danger { background: #e74c3c; border-color: #e74c3c; color: #fff; }
.btn-sm { height: 30px; padding: 0 10px; font-size: 13px; }

.table-wrap { overflow: auto; margin-top: 12px; }
 table { width: 100%; border-collapse: collapse; font-size: 14px; }
 thead th { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
 th, td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: left; }
 tbody tr:nth-child(odd) { background: #fcfcfc; }
 tbody tr:hover { background: #f6faff; }

/* Pairing styles and QR remain */
.hint { color:#666; margin-top:8px; font-size: 14px; }
.success { color: #0a0; margin-top: 8px; font-weight: 500; }
.error { color: #c00; margin-top: 8px; font-weight: 500; }
.info { 
  padding: 12px 16px; 
  background: #fff3cd; 
  border: 1px solid #ffc107; 
  border-radius: 8px; 
  color: #856404; 
  font-size: 14px; 
  line-height: 1.5;
}
.qr-container { margin-top: 20px; text-align: center; }
.qr { margin: 12px 0; display: flex; justify-content: center; }
.qr img { width: 320px; height: 320px; object-fit: contain; border: 2px solid #eee; border-radius: 8px; padding: 16px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.qr-instructions { 
  margin-top: 12px; 
  color: #475569; 
  font-size: 14px; 
  line-height: 1.6; 
  max-width: 500px; 
  margin-left: auto; 
  margin-right: auto;
}
.qr-ascii { margin-top: 12px; border: 1px solid #eee; background: #fff; padding: 8px; border-radius: 4px; }
.qr-ascii pre { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; line-height: 10px; white-space: pre; color: #000; }
.loading-qr { display: flex; flex-direction: column; align-items: center; margin: 20px 0; padding: 20px; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Status badge */
.status-col { width: 1%; white-space: nowrap; text-align: center; }
.action-col { width: 1%; white-space: nowrap; text-align: right; }
.name-col { font-weight: 500; color: #222; }
.status-badge { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1px solid transparent; }
.status-badge.is-open { color: #0b6b2b; background: #e6f6eb; border-color: #cbeed7; }
.status-badge.is-pending { color: #8a5a00; background: #fff6e5; border-color: #ffe8b8; }
.status-badge.is-closed { color: #7a2121; background: #fdeaea; border-color: #f7c8c8; }

.empty-state { border: 1px dashed #d8dbe3; border-radius: 8px; padding: 16px; text-align: center; color: #666; background: #fbfcfe; }
.empty-state p { margin: 0 0 4px 0; font-weight: 500; }
.empty-state small { color: #888; }

/* Group column styles */
.group-col { width: 30%; }
.group-cell { display: inline-flex; align-items: center; gap: 8px; }
.dim { color: #98a2b3; }
.loader-ring { width: 16px; height: 16px; border: 2px solid rgba(37,99,235,.2); border-top-color: #2563eb; border-radius: 50%; animation: spin .9s linear infinite; display: inline-block; }
.checkmark { color: #16a34a; font-weight: 700; }

/* Success Connection Display */
.connection-success {
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%);
  border: 2px solid #4ade80;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.15);
}

.success-icon {
  font-size: 32px;
  line-height: 1;
  margin-top: 4px;
}

.success-content h4 {
  margin: 0 0 8px 0;
  color: #16a34a;
  font-size: 18px;
  font-weight: 600;
}

.success-content p {
  margin: 0 0 16px 0;
  color: #15803d;
  line-height: 1.5;
}

.success-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #15803d;
}

.feature-icon {
  font-size: 16px;
}

.success-note {
  margin: 0;
  padding: 8px 12px;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 6px;
  font-size: 13px;
  color: #15803d;
  border-left: 3px solid #4ade80;
}

/* Status Display with Auto-refresh */
.status-display {
  margin: 16px 0;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-weight: 500;
}

.status-icon {
  font-size: 16px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 720px) {
  .toolbar .filters { grid-template-columns: 1fr; }
  
  .connection-success {
    flex-direction: column;
    text-align: center;
  }
  
  .success-features {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .status-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>