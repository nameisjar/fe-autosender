<template>
  <div class="wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <circle cx="9" cy="10" r="1"/>
            <circle cx="12" cy="10" r="1"/>
            <circle cx="15" cy="10" r="1"/>
          </svg>
          Feedback Berulang (Algo)
        </h2>
        <p class="subtitle">Pengiriman akan berulang tiap minggu untuk setiap lesson. Waktu akan dikirim sesuai persis dengan input Anda.</p>
      </div>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="submit" class="feedback-form">
      <!-- Card 0: Device Selection -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            Pilih Device WhatsApp
          </h3>
          <button 
            type="button" 
            class="btn-refresh-header" 
            @click="loadDevices" 
            :disabled="loadingDevices"
            title="Refresh device list"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loadingDevices }">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            {{ loadingDevices ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
        <div class="card-body">
          <!-- Device Info Card (when device is selected) -->
          <div v-if="selectedDevice" class="device-info-card" :class="{ 'connected': selectedDevice.isConnected, 'disconnected': !selectedDevice.isConnected }">
            <div class="device-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M12 8v4"/>
                <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
              </svg>
              <div class="status-indicator" :class="{ 'online': selectedDevice.isConnected }"></div>
            </div>
            <div class="device-details">
              <div class="device-name">{{ selectedDevice.name || 'Unknown Device' }}</div>
              <div class="device-meta">
                <span class="device-status" :class="{ 'online': selectedDevice.isConnected }">
                  <svg viewBox="0 0 8 8" fill="currentColor">
                    <circle cx="4" cy="4" r="3"/>
                  </svg>
                  {{ selectedDevice.isConnected ? 'Online' : 'Offline' }}
                </span>
                <span class="device-divider">•</span>
                <span class="device-id">{{ selectedDevice.status || 'Unknown' }}</span>
              </div>
            </div>
            <button type="button" class="btn-change-device" @click="handleChangeDevice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              Ganti Device
            </button>
          </div>

          <!-- Device Selector (when no device selected) -->
          <div v-else class="device-selector-empty">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div class="empty-text">
              <h4>Pilih Device WhatsApp</h4>
              <p>Pilih device yang akan digunakan untuk mengirim feedback</p>
            </div>
          </div>

          <!-- Device List -->
          <div v-if="otherDevices.length > 0" class="device-list">
            <label class="form-label">
              {{ selectedDevice ? 'Atau pilih device lain:' : 'Pilih dari daftar device:' }}
            </label>
            <div class="device-grid">
              <button
                v-for="device in otherDevices"
                :key="device.id"
                type="button"
                class="device-item"
                :class="{ 
                  'active': device.id === selectedDeviceId,
                  'connected': device.isConnected,
                  'disconnected': !device.isConnected
                }"
                @click="handleSelectDevice(device.id)"
              >
                <div class="device-item-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  <div class="device-item-status" :class="{ 'online': device.isConnected }"></div>
                </div>
                <div class="device-item-info">
                  <div class="device-item-name">{{ device.name }}</div>
                  <div class="device-item-status-text" :class="{ 'online': device.isConnected }">
                    {{ device.isConnected ? 'Terhubung' : 'Terputus' }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 1: Basic Info -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0-2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Informasi Dasar
          </h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                Nama Feedback <span class="required">*</span>
              </label>
              <input 
                v-model.trim="form.name" 
                placeholder="Contoh: IND-PS-358-SAT-16.00 {PREM}" 
                required 
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                Tanggal Mulai <span class="required">*</span>
              </label>
              <input 
                v-model="form.schedule" 
                type="datetime-local" 
                required 
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                Course <span class="required">*</span>
              </label>
              <select v-model="form.courseName" required class="form-select">
                <option value="" disabled>Pilih course...</option>
                <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">
                Mulai dari Lesson <span class="required">*</span>
              </label>
              <select 
                v-model.number="form.startLesson" 
                required 
                :disabled="!form.courseName"
                class="form-select"
              >
                <option value="" disabled>{{ form.courseName ? 'Pilih lesson...' : 'Pilih course terlebih dahulu' }}</option>
                <option v-for="lessonNum in availableLessons" :key="lessonNum" :value="lessonNum">
                  Lesson {{ lessonNum }}
                </option>
              </select>
            </div>
          </div>

          <!-- Message Preview - Full Width Below -->
          <div v-if="previewMessage" class="form-group preview-section">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview Pesan - Lesson {{ form.startLesson }}
            </label>
            <div class="message-preview">
              <pre>{{ previewMessage }}</pre>
            </div>
          </div>
          
          <div v-else-if="form.courseName && form.startLesson" class="form-group preview-section">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Preview Pesan
            </label>
            <div class="message-preview no-preview">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>Tidak ada template untuk Lesson {{ form.startLesson }} di course "{{ form.courseName }}"</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Recipients -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Penerima
          </h3>
          <span class="badge-count" v-if="recipients.length > 0">{{ recipients.length }} dipilih</span>
        </div>
        <div class="card-body">
          <!-- Selected Recipients -->
          <div v-if="recipients.length > 0" class="selected-recipients">
            <div class="recipients-chips">
              <span v-for="(r, i) in recipients" :key="r + i" class="recipient-chip">
                <span class="chip-label">{{ chipLabel(r) }}</span>
                <button type="button" class="chip-close" @click="removeRecipient(i)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </span>
            </div>
          </div>

          <!-- Add Recipients Tabs -->
          <div class="recipient-tabs">
            <button 
              type="button"
              class="recipient-tab"
              :class="{ active: activeTab === 'manual' }"
              @click="activeTab = 'manual'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0-2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Manual
            </button>
            <button 
              type="button"
              class="recipient-tab"
              :class="{ active: activeTab === 'contacts' }"
              @click="activeTab = 'contacts'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Kontak
            </button>
            <button 
              type="button"
              class="recipient-tab"
              :class="{ active: activeTab === 'groups' }"
              @click="activeTab = 'groups'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Grup
            </button>
            <button 
              type="button"
              class="recipient-tab"
              :class="{ active: activeTab === 'labels' }"
              @click="activeTab = 'labels'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              Label
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Manual Tab -->
            <div v-show="activeTab === 'manual'" class="tab-pane">
              <div class="input-with-button">
                <input
                  v-model="recipientInput"
                  @keydown.enter.prevent="addRecipientsFromInput"
                  placeholder="628123456789 (pisahkan dengan koma untuk banyak nomor)"
                  class="form-input"
                />
                <button type="button" class="btn-primary" @click="addRecipientsFromInput">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Tambah
                </button>
              </div>
            </div>

            <!-- Contacts Tab -->
            <div v-show="activeTab === 'contacts'" class="tab-pane">
              <div class="input-with-button">
                <select v-model="selectedContactId" class="form-select">
                  <option value="" disabled>Pilih kontak...</option>
                  <option v-for="c in filteredContacts" :key="c.id" :value="c.phone">
                    {{ contactDisplay(c) }}
                  </option>
                </select>
                <button type="button" class="btn-primary" @click="addSelectedContact" :disabled="!selectedContactId">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Tambah
                </button>
                <button type="button" class="btn-secondary" @click="loadContacts" :disabled="loadingContacts">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loadingContacts }">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Groups Tab -->
            <div v-show="activeTab === 'groups'" class="tab-pane">
              <div class="input-with-button">
                <select v-model="selectedGroupId" class="form-select">
                  <option value="" disabled>Pilih grup...</option>
                  <option v-for="g in groups" :key="g.value" :value="g.value">{{ g.label }}</option>
                </select>
                <button type="button" class="btn-primary" @click="addSelectedGroup" :disabled="!selectedGroupId">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Tambah
                </button>
                <button type="button" class="btn-secondary" @click="loadGroups" :disabled="loadingGroups">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loadingContacts }">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Labels Tab -->
            <div v-show="activeTab === 'labels'" class="tab-pane">
              <div class="input-with-button">
                <select v-model="selectedLabelValue" class="form-select">
                  <option value="" disabled>Pilih label...</option>
                  <option v-for="l in filteredLabels" :key="l.value" :value="l.value">{{ l.label }}</option>
                </select>
                <button type="button" class="btn-primary" @click="addSelectedLabel" :disabled="!selectedLabelValue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Tambah
                </button>
                <button type="button" class="btn-secondary" @click="loadLabels" :disabled="loadingLabels">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loadingContacts }">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info & Alerts -->
      <div class="info-section">
        <div class="info-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <div class="info-content">
            <div class="info-text">
              Estimasi kirim: <strong>{{ estimatedCount }}</strong> kali
              <span v-if="lastDate"> — Perkiraan selesai: <strong>{{ lastDate }}</strong></span>
            </div>
          </div>
        </div>

        <div v-if="validationError" class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ validationError }}
        </div>

        <div v-if="msg" class="alert alert-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ msg }}
        </div>

        <div v-if="err" class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ err }}
        </div>
      </div>

      <!-- Submit Button -->
      <div class="form-actions">
        <button 
          type="submit"
          class="btn-submit" 
          :disabled="loading || !!validationError"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span v-if="loading">Memproses...</span>
          <span v-else>Jadwalkan Feedback</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { deviceApi, userApi } from '../api/http.js';
import { useGroups } from '../composables/useGroups.js';
import { useDevices } from '../composables/useDevices.js';
import { useToast } from '../composables/useToast.js';
import { 
  convertToServerTime, 
  formatLocalTime, 
  isValidDateTime,
  addInterval 
} from '../utils/datetime.js';

const toast = useToast();

// Device management
const { 
  selectedDeviceId, 
  selectedDevice, 
  availableDevices, 
  loading: loadingDevices, 
  loadDevices, 
  selectDevice 
} = useDevices();

const otherDevices = computed(() => availableDevices.value.filter(device => device.id !== selectedDeviceId.value));

function handleChangeDevice() {
  selectedDeviceId.value = '';
}

function handleSelectDevice(deviceId) {
  selectDevice(deviceId);
}

const form = ref({
  name: '',
  courseName: '',
  startLesson: 1,
  delay: 5000,
  schedule: ''
});

const loading = ref(false);
const msg = ref('');
const err = ref('');

// Recipients (same behaviour as ScheduleReminder)
const recipients = ref([]);
const recipientInput = ref('');

// Use database-based groups instead of cache
const { groups, loadingGroups, loadGroups, ensureFullGroupJid, syncGroups } = useGroups();
const selectedGroupId = ref('');
const recipientLabels = ref({}); // map recipient string -> label for chip

const contacts = ref([]);
const selectedContactId = ref('');
const loadingContacts = ref(false);
const contactSearch = ref('');
const filteredContacts = computed(() => {
  const q = contactSearch.value.toLowerCase();
  if (!q) return contacts.value;
  return contacts.value.filter((c) =>
    [c.firstName, c.lastName, c.phone]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q))
  );
});

// Labels (kelas)
const labels = ref([]); // { value: 'label_<slugOrName>', label: 'Name' }
const selectedLabelValue = ref('');
const loadingLabels = ref(false);
const labelSearch = ref('');
const filteredLabels = computed(() => {
  const q = labelSearch.value.toLowerCase();
  if (!q) return labels.value;
  return labels.value.filter((l) => l.label.toLowerCase().includes(q));
});

const mapLabels = (items) => {
  const arr = Array.isArray(items) ? items : [];
  return arr
    .map((it) => {
      if (typeof it === 'string') {
        const name = it;
        return { value: `label_${name}`, label: name };
      }
      const name = it.name || it.label || it.title || '';
      const slug = it.slug || '';
      const value = `label_${slug || name}`;
      return name ? { value, label: name } : null;
    })
    .filter(Boolean);
};

const deriveLabelsFromContacts = () => {
  const names = new Set();
  (contacts.value || []).forEach((c) => {
    (c.ContactLabel || []).forEach((cl) => {
      const n = cl?.label?.name;
      if (n && !String(n).startsWith('device_')) names.add(n);
    });
  });
  return Array.from(names);
};

const loadLabels = async () => {
  try {
    loadingLabels.value = true;
    const deviceId = (await ensureDeviceId()) || undefined;
    const res = await userApi.get('/contacts/labels', { params: deviceId ? { deviceId } : {} });
    const data = res?.data;
    let list = Array.isArray(data?.labels) ? data.labels : Array.isArray(data) ? data : [];
    if (!Array.isArray(list) || list.length === 0) {
      if (!contacts.value || contacts.value.length === 0) {
        await loadContacts();
      }
      list = deriveLabelsFromContacts();
    }
    labels.value = mapLabels(list);
  } catch (_) {
    if (!contacts.value || contacts.value.length === 0) {
      await loadContacts().catch(() => {});
    }
    const list = deriveLabelsFromContacts();
    labels.value = mapLabels(list);
  } finally {
    loadingLabels.value = false;
  }
};

const loadContacts = async () => {
  try {
    loadingContacts.value = true;
    err.value = '';
    // Gunakan userApi untuk contacts, bukan deviceApi
    const deviceId = (await ensureDeviceId()) || undefined;
    const res = await userApi.get('/contacts', {
      params: deviceId ? { deviceId } : {},
    });
    contacts.value = res?.data || [];
  } catch (e) {
    console.error('Error loading contacts:', e);
    // Jangan tampilkan error jika hanya gagal load contacts
    contacts.value = [];
  } finally {
    loadingContacts.value = false;
  }
};

const addSelectedGroup = async () => {
  if (!selectedGroupId.value) return;
  const fullJid = await ensureFullGroupJid(selectedGroupId.value);
  if (!fullJid) return;
  if (!recipients.value.includes(fullJid)) {
    recipients.value.push(fullJid);
    const found = groups.value.find((g) => g.value === selectedGroupId.value);
    if (found) recipientLabels.value[fullJid] = `Group: ${found.label}`;
  }
  selectedGroupId.value = '';
};

const contactLabelNames = (c) => {
  try {
    const arr = (c?.ContactLabel || []).map((x) => x?.label?.name).filter((n) => n && !String(n).startsWith('device_'));
    return arr.join(', ');
  } catch { return ''; }
};
const contactDisplay = (c) => {
  const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.phone || '-';
  const labels = contactLabelNames(c);
  return labels ? `${name} (${c.phone}) — [${labels}]` : `${name} (${c.phone})`;
};

const addSelectedContact = () => {
  if (!selectedContactId.value) return;
  if (!recipients.value.includes(selectedContactId.value)) {
    recipients.value.push(selectedContactId.value);
    const found = contacts.value.find((c) => c.phone === selectedContactId.value);
    if (found) {
      const labels = contactLabelNames(found);
      recipientLabels.value[selectedContactId.value] = `Contact: ${found.firstName} ${found.lastName || ''}${labels ? ' [' + labels + ']' : ''}`;
    }
  }
  selectedContactId.value = '';
};

const addSelectedLabel = () => {
  if (!selectedLabelValue.value) return;
  const val = selectedLabelValue.value;
  if (!recipients.value.includes(val)) {
    recipients.value.push(val);
    const found = labels.value.find((l) => l.value === val);
    if (found) recipientLabels.value[val] = `Label: ${found.label}`;
  }
  selectedLabelValue.value = '';
};

const chipLabel = (r) => recipientLabels.value[r] || r;

// ✅ Fungsi validasi nomor telepon
function isValidPhoneNumber(phone) {
  // Nomor harus berupa string yang hanya mengandung digit
  const cleaned = String(phone).replace(/\D/g, '');
  
  // Nomor harus dimulai dengan 62 dan minimal 10 digit (62 + 8 digit)
  // Format yang valid: 628xxx (minimal) hingga 62xxxxxxxxxxxxxx
  if (!cleaned.startsWith('62')) {
    return false;
  }
  
  // Panjang minimal 10 digit (62 + 8 digit nomor)
  // Panjang maksimal 15 digit (standar internasional)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return false;
  }
  
  return true;
}

// Add/remove recipients manually
function addRecipientsFromInput() {
  if (!recipientInput.value) return;
  
  const items = recipientInput.value
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  
  // ✅ Validasi setiap nomor sebelum ditambahkan
  const validNumbers = [];
  const invalidNumbers = [];
  
  items.forEach((item) => {
    if (isValidPhoneNumber(item)) {
      validNumbers.push(item);
    } else {
      invalidNumbers.push(item);
    }
  });
  
  // Tambahkan nomor valid ke recipients
  if (validNumbers.length > 0) {
    const set = new Set([...recipients.value, ...validNumbers]);
    recipients.value = Array.from(set);
  }
  
  // Tampilkan notifikasi
  if (validNumbers.length > 0 && invalidNumbers.length > 0) {
    toast.success(`${validNumbers.length} nomor berhasil ditambahkan`);
    toast.error(`${invalidNumbers.length} nomor tidak valid: ${invalidNumbers.join(', ')}`);
  } else if (validNumbers.length > 0) {
    toast.success(`${validNumbers.length} nomor berhasil ditambahkan`);
  } else if (invalidNumbers.length > 0) {
    toast.error(`Nomor tidak valid: ${invalidNumbers.join(', ')}. Format harus: 62xxx (minimal 10 digit)`);
  }
  
  recipientInput.value = '';
}

function removeRecipient(index) {
  recipients.value.splice(index, 1);
}

// Course dropdown from templates
const templates = ref([]);
const courseOptions = ref([]);
const filterCourse = ref('');
const tf = ref({ courseName: '', lesson: 1, message: '' });

const extractCourseOptions = (items) => {
  const set = new Set((items || []).map((t) => t.courseName).filter(Boolean));
  courseOptions.value = Array.from(set).sort();
};

const loadTemplates = async () => {
  try {
    let data;
    if (filterCourse.value) {
      try {
        const res = await userApi.get(`/algorithmics/feedback/${encodeURIComponent(filterCourse.value)}`);
        data = res.data;
        templates.value = data.feedbacks || [];
      } catch (e) {
        console.error('Error loading course templates:', e);
        templates.value = [];
      }
    } else {
      try {
        const res = await userApi.get('/algorithmics/feedbacks');
        data = res.data;
        templates.value = data.feedbacks || [];
      } catch (e) {
        console.error('Error loading all templates:', e);
        templates.value = [];
      }
    }
    extractCourseOptions(templates.value);
  } catch (e) {
    console.error('Error in loadTemplates:', e);
    templates.value = [];
    courseOptions.value = [];
  }
};

const createTemplate = async () => {
  try {
    await userApi.post('/algorithmics/feedback', tf.value);
    tf.value = { courseName: '', lesson: 1, message: '' };
    await loadTemplates();
  } catch (e) {
    alert('Gagal membuat template');
  }
};

onMounted(async () => {
  await Promise.allSettled([loadTemplates(), loadGroups(), loadContacts(), loadLabels(), loadDevices()]);
});

// Estimation helpers - perbaiki dengan utility functions
const lessonsForCourse = computed(() => {
  if (!form.value.courseName) return [];
  return (templates.value || [])
    .filter((t) => t.courseName === form.value.courseName)
    .sort((a, b) => Number(a.lesson) - Number(b.lesson));
});

// Daftar lesson yang tersedia untuk course yang dipilih
const availableLessons = computed(() => {
  if (!form.value.courseName) return [];
  const lessons = lessonsForCourse.value.map((t) => Number(t.lesson));
  return lessons.length > 0 ? lessons : [];
});

// Watch untuk reset startLesson ketika course berubah
watch(() => form.value.courseName, (newCourse) => {
  if (newCourse) {
    // Reset ke lesson pertama yang tersedia atau 1
    const lessons = availableLessons.value;
    form.value.startLesson = lessons.length > 0 ? lessons[0] : 1;
  } else {
    form.value.startLesson = 1;
  }
});

const estimatedCount = computed(() => {
  const start = Number(form.value.startLesson || 1);
  const list = lessonsForCourse.value.filter((t) => Number(t.lesson) >= start);
  return list.length || 0;
});

const lastDate = computed(() => {
  try {
    if (!form.value.schedule || !estimatedCount.value) return '';
    
    if (!isValidDateTime(form.value.schedule)) return '';
    
    const start = new Date(form.value.schedule);
    const weeks = Math.max(estimatedCount.value - 1, 0);
    const last = addInterval(start, 'weekly', weeks);
    
    // Use formatLocalTime untuk konsistensi timezone display
    return formatLocalTime(last.toISOString());
  } catch {
    return '';
  }
});

// Validation
const validationError = computed(() => {
  if (!form.value.name) return 'Nama wajib diisi';
  if (!form.value.courseName) return 'Course wajib dipilih';
  if (!form.value.startLesson || Number(form.value.startLesson) <= 0) return 'Start lesson minimal 1';
  if (!form.value.schedule) return 'Tanggal mulai wajib diisi';
  
  if (!isValidDateTime(form.value.schedule)) return 'Format tanggal mulai tidak valid';
  
  if (recipients.value.length === 0) return 'Minimal satu penerima';
  const hasAll = recipients.value.includes('all');
  const hasLabel = recipients.value.some((r) => r.startsWith('label'));
  if (hasAll && hasLabel) return 'Tidak boleh mencampur all dan label_* dalam penerima';
  return '';
});

const submit = async () => {
  msg.value = '';
  err.value = '';
  if (validationError.value) {
    toast.error(validationError.value);
    return;
  }
  loading.value = true;
  try {
    // Convert schedule menggunakan utility function
    const scheduleISO = convertToServerTime(form.value.schedule);
    
    // Gunakan deviceId dari device selector
    const deviceId = selectedDeviceId.value || (await ensureDeviceId());
    if (!deviceId) {
      toast.error('Device tidak ditemukan atau belum login');
      loading.value = false;
      return;
    }
    
    const payload = {
      name: form.value.name,
      courseName: form.value.courseName,
      startLesson: form.value.startLesson,
      delay: form.value.delay ?? 5000,
      schedule: scheduleISO, // Waktu sudah dinormalisasi
      recipients: recipients.value,
      deviceId, // Kirim deviceId
    };
    await deviceApi.post('/messages/broadcasts/feedback', payload);
    toast.success('Jadwal feedback berhasil dibuat');
    form.value.name = '';
    form.value.courseName = '';
    form.value.startLesson = 1;
    form.value.delay = 5000;
    form.value.schedule = '';
    recipients.value = [];
    recipientLabels.value = {};
  } catch (e) {
    const errorMsg = 'Gagal membuat jadwal feedback. Pastikan WhatsApp sudah terhubung' || e?.response?.data?.message || e?.response?.data?.error || e?.message;
    toast.error(errorMsg);
  } finally {
    loading.value = false;
  }
};

const handleSyncGroups = async () => {
  try {
    err.value = '';
    await syncGroups();
    toast.success('Grup berhasil disinkronkan dari WhatsApp');
  } catch (e) {
    toast.error(e?.message || 'Gagal sinkronisasi grup');
  }
};

// Preview pesan berdasarkan course dan lesson yang dipilih
const previewMessage = computed(() => {
  if (!form.value.courseName || !form.value.startLesson) return '';
  
  const template = templates.value.find(
    (t) => t.courseName === form.value.courseName && 
           Number(t.lesson) === Number(form.value.startLesson)
  );
  
  return template?.message || '';
});

// Pastikan deviceId tersedia
const ensureDeviceId = async () => {
  let deviceId = localStorage.getItem('device_selected_id');
  if (deviceId) return deviceId;
  try {
    const { data } = await userApi.get('/devices');
    const devices = Array.isArray(data) ? data : [];
    const current = devices.find((d) => d.status === 'open') || devices[0];
    if (current) {
      if (current.id) localStorage.setItem('device_selected_id', current.id);
      if (current.name) localStorage.setItem('device_selected_name', current.name);
      return current.id || '';
    }
  } catch (_) {}
  return '';
};

const activeTab = ref('manual');

// 🆕 Watch selectedDeviceId untuk auto-refresh data ketika device berubah
watch(selectedDeviceId, async (newDeviceId, oldDeviceId) => {
  if (newDeviceId && oldDeviceId && newDeviceId !== oldDeviceId) {
    // Clear recipients ketika ganti device
    recipients.value = [];
    recipientLabels.value = {};
    selectedContactId.value = '';
    selectedGroupId.value = '';
    selectedLabelValue.value = '';
    
    // Auto-refresh semua data (termasuk GROUPS dengan force!)
    await Promise.allSettled([
      loadGroups({ force: true }), // 🔥 Tambahkan force: true untuk memaksa reload
      loadContacts(),
      loadLabels()
    ]);
    
    toast.success('Device berhasil diganti. Data kontak, grup, dan label telah di-refresh.');
  }
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* Base Styles - Konsisten dengan menu Broadcast */
.wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Page Header - Konsisten dengan Broadcast */
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

.header-content h2 svg {
  width: 32px;
  height: 32px;
  color: #3b82f6;
  stroke-width: 2.5;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
}

/* Form */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

/* Device Selector Styles */
.badge-connected {
  padding: 6px 12px;
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #86efac;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-connected svg {
  width: 14px;
  height: 14px;
}

.badge-disconnected {
  padding: 6px 12px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #fca5a5;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-disconnected svg {
  width: 14px;
  height: 14px;
}

.device-selector-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.device-select {
  flex: 1;
}

.btn-refresh {
  padding: 12px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-refresh:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh svg {
  width: 18px;
  height: 18px;
}

.help-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
  font-style: normal;
}

.help-text svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: #94a3b8;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-title svg {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

/* 🆕 Device Selector Styles */
/* Button Refresh Header */
.btn-refresh-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh-header:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-refresh-header:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh-header svg {
  width: 16px;
  height: 16px;
}

/* Device Info Card (Selected Device) */
.device-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 2px solid;
  transition: all 0.3s;
}

.device-info-card.connected {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.device-info-card.disconnected {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
}

.device-avatar {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.device-info-card.connected .device-avatar {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.device-info-card.disconnected .device-avatar {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.device-avatar svg {
  width: 32px;
  height: 32px;
  color: white;
}

.status-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
  background: #94a3b8;
  transition: all 0.3s;
}

.status-indicator.online {
  background: #22c55e;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
  }
}

.device-details {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.device-status.online {
  color: #15803d;
}

.device-status svg {
  width: 8px;
  height: 8px;
}

.device-divider {
  color: #cbd5e1;
}

.device-id {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.btn-change-device {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-change-device:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-1px);
}

.btn-change-device svg {
  width: 18px;
  height: 18px;
}

/* Device Selector Empty State */
.device-selector-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  margin-bottom: 24px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
  color: #1e40af;
}

.empty-text {
  text-align: center;
}

.empty-text h4 {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.empty-text p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

/* Device List */
.device-list {
  margin-top: 24px;
}

.device-list .form-label {
  margin-bottom: 12px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.device-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.device-item.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.device-item.connected {
  border-color: #86efac;
}

.device-item.connected:hover {
  border-color: #22c55e;
  background: #f0fdf4;
}

.device-item.disconnected {
  border-color: #fca5a5;
  opacity: 0.7;
}

.device-item.disconnected:hover {
  border-color: #ef4444;
  background: #fef2f2;
}

.device-item-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-item.active .device-item-avatar {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.device-item.connected .device-item-avatar {
  background: linear-gradient(135deg, #86efac 0%, #4ade80 100%);
}

.device-item.disconnected .device-item-avatar {
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
}

.device-item-avatar svg {
  width: 24px;
  height: 24px;
  color: #1e40af;
}

.device-item.active .device-item-avatar svg,
.device-item.connected .device-item-avatar svg,
.device-item.disconnected .device-item-avatar svg {
  color: white;
}

.device-item-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: #94a3b8;
}

.device-item-status.online {
  background: #22c55e;
}

.device-item-info {
  flex: 1;
  min-width: 0;
}

.device-item-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-item-status-text {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.device-item-status-text.online {
  color: #15803d;
}

/* End Device Selector Styles */

.badge-count {
  padding: 6px 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #93c5fd;
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-body {
  padding: 24px;
}

/* Message Preview */
.preview-section {
  margin-top: 8px;
}

.message-preview {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.message-preview pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
}

.message-preview.no-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fcd34d;
}

.message-preview.no-preview svg {
  width: 24px;
  height: 24px;
  color: #92400e;
  flex-shrink: 0;
}

.message-preview.no-preview p {
  margin: 0;
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
}

/* Recipients */
.selected-recipients {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.recipients-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recipient-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  transition: all 0.2s;
}

.recipient-chip:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chip-label {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.chip-close:hover {
  color: #ef4444;
}

.chip-close svg {
  width: 16px;
  height: 16px;
}

/* Recipient Tabs */
.recipient-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
}

.recipient-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: -10px;
}

.recipient-tab:hover {
  color: #3b82f6;
  background: #f8fafc;
  border-radius: 10px 10px 0 0;
}

.recipient-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

.recipient-tab svg {
  width: 18px;
  height: 18px;
}

/* Tab Content */
.tab-content {
  margin-top: 16px;
}

.tab-pane {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-with-button {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.input-with-button .form-input,
.input-with-button .form-select {
  flex: 1;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 18px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
  padding: 12px;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary svg,
.btn-secondary svg {
  width: 18px;
  height: 18px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #93c5fd;
  border-radius: 12px;
}

.info-card svg {
  width: 24px;
  height: 24px;
  color: #1e40af;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-text {
  color: #1e40af;
  font-size: 14px;
  font-weight: 500;
}

.info-text strong {
  font-weight: 700;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid;
}

.alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.alert-success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.alert-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

/* Form Actions */
.form-actions {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-submit svg {
  width: 20px;
  height: 20px;
}

/* Form Label Styles */
.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
}

.form-label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.required {
  color: #ef4444;
}

.optional {
  color: #94a3b8;
  font-weight: 400;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: #f8fafc;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.form-help {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

.help-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
  font-style: normal;
}

.help-text svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 1200px) {
  .wrapper {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .wrapper {
    padding: 0 16px;
  }

  .header-content h2 {
    font-size: 24px;
  }

  .header-content h2 svg {
    width: 28px;
    height: 28px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .card-header {
    padding: 16px 20px;
  }

  .card-body {
    padding: 20px;
  }

  .recipient-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .input-with-button {
    flex-wrap: wrap;
  }

  .input-with-button .form-input,
  .input-with-button .form-select {
    flex: 1 1 100%;
  }

  .btn-primary {
    flex: 1;
  }

  .form-actions {
    padding: 20px;
  }

  .message-preview {
    max-height: 200px;
  }
}

@media (max-width: 480px) {
  .wrapper {
    padding: 0 12px;
  }

  .header-content h2 {
    font-size: 20px;
  }

  .card-header {
    padding: 14px 16px;
  }

  .card-body {
    padding: 16px;
  }
}
</style>