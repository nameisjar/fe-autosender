<template>
  <div class="wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Reminder (Algo)
        </h2>
        <p class="subtitle">Pengiriman akan berulang setiap minggu. Waktu akan dikirim sesuai persis dengan input Anda. Bisa digunakan untuk pengingat 1 hari sebelum kelas dan 3 jam sebelum kelas.</p>
      </div>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="submit" class="reminder-form">
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
              <p>Pilih device yang akan digunakan untuk mengirim reminder</p>
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Informasi Dasar
          </h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                Nama Reminder <span class="required">*</span>
              </label>
              <input 
                v-model.trim="form.name" 
                placeholder="Contoh: IND-PS-358-SAT-16.00 {PREM} (H-3)" 
                required 
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                Jumlah Reminder <span class="required">*</span>
              </label>
              <input 
                v-model.number="form.lessons" 
                type="number" 
                min="1" 
                required 
                class="form-input"
                placeholder="Jumlah pengulangan"
              />
              <small class="help-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Jumlah pengulangan (lesson saat ini - total lesson)
              </small>
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
          </div>

          <div class="form-group">
            <label class="form-label">
              Pesan <span class="required">*</span>
            </label>
            <textarea 
              v-model.trim="form.message" 
              rows="4" 
              placeholder="Tulis pesan reminder yang akan dikirim..." 
              required 
              class="form-textarea"
            />
            <div class="form-help">
              {{ form.message.length }} karakter
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Media Upload -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Media
          </h3>
          <span class="badge-optional">Opsional</span>
        </div>
        <div class="card-body">
          <div class="upload-section">
            <input 
              type="file" 
              @change="onFile" 
              :accept="acceptTypes"
              class="file-input"
              id="media-upload"
            />
            <label v-if="!mediaFile" for="media-upload" class="upload-label">
              <div class="upload-icon-wrapper">
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div class="upload-text">
                <p class="upload-title">Klik untuk upload media</p>
                <p class="upload-subtitle">Mendukung: Gambar, Video, Audio, dan Dokumen</p>
              </div>
            </label>

            <!-- Media Preview -->
            <div v-else class="media-preview-section">
              <!-- Image Preview -->
              <div v-if="isImage" class="media-preview image-preview">
                <img :src="mediaPreview" alt="Preview" />
              </div>

              <!-- Document Preview -->
              <div v-else class="media-preview document-preview">
                <div class="doc-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div class="doc-details">
                  <p class="doc-name">{{ mediaName }}</p>
                </div>
              </div>

              <button type="button" class="btn-remove-media" @click="removeMedia">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Hapus Media
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Recipients -->
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loadingGroups }">
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
            <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-if="loading">Memproses...</span>
          <span v-else>Jadwalkan Reminder</span>
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
  message: '',
  lessons: 1,
  delay: 5000,
  schedule: ''
});

const loading = ref(false);
const msg = ref('');
const err = ref('');

// Media handling
const mediaFile = ref(null);
const mediaPreview = ref('');
const acceptTypes = '.png,.jpg,.jpeg,.webp,.gif,.mp4,.mp3,.wav,.pdf,.doc,.docx,.xls,.xlsx,.txt';

const isImage = computed(() => mediaFile.value && mediaFile.value.type?.startsWith('image'));
const mediaName = computed(() => mediaFile.value?.name || '');

function onFile(e) {
  const file = e.target.files?.[0];
  mediaFile.value = file || null;
  if (file && file.type?.startsWith('image')) {
    mediaPreview.value = URL.createObjectURL(file);
  } else {
    mediaPreview.value = '';
  }
}

function removeMedia() {
  mediaFile.value = null;
  mediaPreview.value = '';
}

// Recipients (same behaviour as ScheduleReminder)
const recipients = ref([]);
const recipientInput = ref('');

// Use cached groups across app
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

// Sync groups from WhatsApp (database will be updated)
const handleSyncGroups = async () => {
  try {
    err.value = '';
    await syncGroups();
    toast.success('Grup berhasil disinkronkan dari WhatsApp');
  } catch (e) {
    toast.error(e?.message || 'Gagal sinkronisasi grup');
  }
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

// Add/remove recipients manually
function addRecipientsFromInput() {
  if (!recipientInput.value) return;
  const items = recipientInput.value
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const set = new Set([...recipients.value, ...items]);
  recipients.value = Array.from(set);
  recipientInput.value = '';
}

function removeRecipient(index) {
  recipients.value.splice(index, 1);
}

onMounted(async () => {
  await Promise.allSettled([loadGroups(), loadContacts(), loadLabels()]);
});

const estimatedCount = computed(() => {
  return Number(form.value.lessons || 1);
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
  if (!form.value.message) return 'Pesan wajib diisi';
  if (!form.value.lessons || Number(form.value.lessons) <= 0) return 'Jumlah lesson minimal 1';
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
    
    if (!mediaFile.value) {
      // Kirim tanpa media (JSON)
      const payload = {
        name: form.value.name,
        message: form.value.message,
        lessons: form.value.lessons,
        delay: form.value.delay ?? 5000,
        schedule: scheduleISO,
        recipients: recipients.value,
        deviceId, // Kirim deviceId
      };
      await deviceApi.post('/messages/broadcasts/reminder-algo', payload);
    } else {
      // Kirim dengan media (FormData)
      const fd = new FormData();
      fd.append('name', form.value.name);
      fd.append('message', form.value.message);
      fd.append('lessons', String(form.value.lessons));
      fd.append('delay', String(form.value.delay ?? 5000));
      fd.append('schedule', scheduleISO);
      fd.append('deviceId', deviceId); // Kirim deviceId
      recipients.value.forEach((r) => fd.append('recipients', r));
      fd.append('media', mediaFile.value);
      await deviceApi.post('/messages/broadcasts/reminder-algo', fd);
    }
    
    toast.success('Jadwal reminder berhasil dibuat');
    form.value.name = '';
    form.value.message = '';
    form.value.lessons = 1;
    form.value.delay = 5000;
    form.value.schedule = '';
    recipients.value = [];
    recipientLabels.value = {};
    mediaFile.value = null;
    mediaPreview.value = '';
  } catch (e) {
    const errorMsg = 'Gagal mengirim reminder berkala. Pastikan WhatsApp sudah terhubung' || e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Gagal membuat jadwal reminder';
    toast.error(errorMsg);
  } finally {
    loading.value = false;
  }
};

// auto-load groups initially (fast cached)
loadGroups().catch(() => {});

// Load devices on mount
loadDevices().catch(() => {});

// 🆕 Watch selectedDeviceId untuk auto-refresh data ketika device berubah
watch(selectedDeviceId, async (newDeviceId, oldDeviceId) => {
  if (newDeviceId && oldDeviceId && newDeviceId !== oldDeviceId) {
    console.log('[ReminderAlgo] Device berubah dari', oldDeviceId, 'ke', newDeviceId);
    console.log('[ReminderAlgo] Auto-refresh data: Kontak, Grup, dan Label...');
    
    // Clear recipients ketika ganti device
    recipients.value = [];
    recipientLabels.value = {};
    selectedContactId.value = '';
    selectedGroupId.value = '';
    selectedLabelValue.value = '';
    
    // Auto-refresh semua data
    await Promise.allSettled([
      loadGroups(),
      loadContacts(),
      loadLabels()
    ]);
    
    toast.success('Device berhasil diganti. Data kontak, grup, dan label telah di-refresh.');
  }
});

const activeTab = ref('manual');
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
.reminder-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

/* Card */
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

.badge-optional {
  padding: 6px 12px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #a5b4fc;
}

.badge-count {
  padding: 6px 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #93c5fd;
}

.card-body {
  padding: 24px;
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
}

.required {
  color: #ef4444;
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

/* Upload Section */
.upload-section {
  position: relative;
}

.file-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 48px 32px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.upload-label:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.upload-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.upload-text {
  text-align: center;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.upload-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Media Preview Section */
.media-preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-preview {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  min-height: 200px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  display: block;
}

.document-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
}

.doc-icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-icon-wrapper svg {
  width: 32px;
  height: 32px;
  color: #1e40af;
}

.doc-details {
  flex: 1;
  min-width: 0;
}

.doc-name {
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}

.btn-remove-media {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border: 1.5px solid #fca5a5;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-remove-media:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #f87171;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.btn-remove-media svg {
  width: 18px;
  height: 18px;
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

  .upload-label {
    padding: 32px 20px;
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