<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/>
          </svg>
          Kelola Kontak
        </h2>
        <p class="subtitle">Kelola kontak WhatsApp untuk setiap perangkat</p>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <div>
            <div class="stat-value">{{ meta.totalContacts || contacts.length }}</div>
            <div class="stat-label">Total Kontak</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          <div>
            <div class="stat-value">{{ devices.length }}</div>
            <div class="stat-label">Perangkat Tersedia</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <div>
            <div class="stat-value">{{ visibleContacts.length }}</div>
            <div class="stat-label">Kontak Ditampilkan</div>
          </div>
        </div>
      </div>
    </div>

    <section class="device-selection-card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          Pilih Perangkat
        </h3>
      </div>
      <div class="device-selection">
        <div class="form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            Perangkat
          </label>
          <select v-model="selectedDeviceId" @change="onDeviceChange">
            <option value="">Pilih Perangkat</option>
            <option v-for="d in devices" :key="d.id" :value="d.id">
              {{ d.name || d.id }} — {{ d.status }}
            </option>
          </select>
        </div>
        <div class="device-actions">
          <button @click="showAddForm = true" class="btn-add" :disabled="!selectedDeviceId">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Tambah Kontak
          </button>
          <button @click="loadContacts" :disabled="loading || !selectedDeviceId" class="btn-reload">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            {{ loading ? 'Memuat...' : 'Muat Ulang' }}
          </button>
          <button @click="triggerImport" :disabled="!selectedDeviceId || importBusy" class="btn-import">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ importBusy ? 'Mengimpor...' : 'Import XLSX' }}
          </button>
          <button @click="exportContactsFile" :disabled="!selectedDeviceId || exportBusy" class="btn-export">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ exportBusy ? 'Mengekspor...' : 'Export XLSX' }}
          </button>
          <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display:none" @change="onImportFileChange" />
        </div>
      </div>
    </section>

    <section class="list-card" v-if="selectedDeviceId">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Daftar Kontak ({{ meta.totalContacts || contacts.length }})
        </h3>
      </div>

      <div class="toolbar-section">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input v-model="q" placeholder="Cari nama, nomor, atau label..." />
        </div>
        <div class="filter-group">
          <select v-model="sortBy" class="filter-select">
            <option value="createdAt">Terbaru</option>
            <option value="firstName">Nama Depan</option>
            <option value="lastName">Nama Belakang</option>
            <option value="phone">Nomor</option>
          </select>
          <select v-model="sortDir" class="sort-dir-select">
            <option value="desc">↓ Desc</option>
            <option value="asc">↑ Asc</option>
          </select>
          <select v-model.number="pageSize" class="page-size-select">
            <option :value="10">10 per halaman</option>
            <option :value="25">25 per halaman</option>
            <option :value="50">50 per halaman</option>
            <option :value="100">100 per halaman</option>
          </select>
        </div>
      </div>

      <div class="contacts-grid" v-if="visibleContacts.length">
        <div v-for="contact in visibleContacts" :key="contact.id" class="contact-card">
          <div class="contact-header">
            <div class="contact-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="contact-info">
              <h4>{{ contact.firstName }} {{ contact.lastName || '' }}</h4>
              <div class="contact-phone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {{ contact.phone }}
              </div>
            </div>
          </div>

          <div class="contact-body">
            <div class="info-section">
              <div class="info-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                Label Kelas
              </div>
              <div class="labels-list" v-if="contact.ContactLabel && filteredContactLabels(contact).length">
                <div v-for="label in filteredContactLabels(contact)" :key="label" class="label-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  {{ label }}
                </div>
              </div>
              <div v-else class="no-labels">Belum ada label</div>
            </div>
          </div>

          <div class="contact-footer">
            <button class="btn-edit" @click="editContact(contact)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button class="btn-delete" @click="deleteContact(contact.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Hapus
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h3>{{ q ? 'Tidak Ada Hasil' : 'Belum Ada Kontak' }}</h3>
        <p>{{ q ? 'Tidak ada kontak yang cocok dengan pencarian Anda' : 'Mulai dengan menambahkan kontak baru' }}</p>
      </div>

      <div v-if="meta.totalContacts > 0 || contacts.length > 0" class="pagination">
        <div class="pagination-info">
          Menampilkan <strong>{{ visibleContacts.length }}</strong> dari <strong>{{ meta.totalContacts || contacts.length }}</strong> kontak
        </div>
        <div class="pagination-controls">
          <button class="btn-page" :disabled="page <= 1 || loading" @click="goPrev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Sebelumnya
          </button>
          <div class="page-indicator">
            <span class="current-page">{{ page }}</span>
            <span class="page-separator">/</span>
            <span class="total-pages">{{ meta.totalPages || 1 }}</span>
          </div>
          <button class="btn-page" :disabled="!meta.hasMore || loading" @click="goNext">
            Berikutnya
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <div v-else class="empty-selection-card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
      <h3>Pilih Perangkat</h3>
      <p>Pilih perangkat di atas untuk melihat dan mengelola kontak</p>
    </div>

    <!-- Add/Edit Contact Modal -->
    <div v-if="showAddForm || editingContact" class="modal-overlay" @click="cancelForm">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {{ editingContact ? 'Edit Kontak' : 'Tambah Kontak Baru' }}
          </h3>
          <button class="close-btn" @click="cancelForm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveContact">
          <div class="form-grid">
            <div class="form-group">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Nama Depan *
              </label>
              <input v-model="form.firstName" placeholder="Nama depan" required />
            </div>
            <div class="form-group">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Nama Belakang
              </label>
              <input v-model="form.lastName" placeholder="Nama belakang (opsional)" />
            </div>
            <div class="form-group span-2">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Nomor WhatsApp *
              </label>
              <input 
                v-model="form.phone" 
                type="tel"
                placeholder="628123456789" 
                pattern="628[0-9]{8,12}"
                title="Format: 628xxxxxxxxx (dimulai dengan 628, panjang 11-15 digit)"
                required 
              />
              <small class="help-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Format WhatsApp Indonesia: 628xxxxxxxxx (tanpa +, dimulai dengan 628)
              </small>
            </div>
            <div class="form-group span-2">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                Label Kelas (Nama Kelas)
              </label>
              <input v-model="labelInput" placeholder="Contoh: IND-PP-01-MON-19.00 (pisahkan dengan koma jika lebih dari satu)" />
              <small class="help-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Pisahkan dengan koma (,) untuk menambahkan beberapa label
              </small>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="cancelForm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Batal
            </button>
            <button type="submit" class="btn-submit" :disabled="saving">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? 'Menyimpan...' : 'Simpan Kontak' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <p v-if="msg" class="success-message">{{ msg }}</p>
    <p v-if="err" class="error-message">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { userApi } from '../api/http.js';
import { useToast } from '../composables/useToast.js';

const toast = useToast();

const contacts = ref([]);
const devices = ref([]);
const selectedDeviceId = ref(localStorage.getItem('device_selected_id') || '');
const loading = ref(false);
const saving = ref(false);
const showAddForm = ref(false);
const editingContact = ref(null);
const msg = ref('');
const err = ref('');

// New: Import/Export state
const fileInput = ref(null);
const importBusy = ref(false);
const exportBusy = ref(false);

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  gender: '',
  dob: '',
});
const labelInput = ref('');
const q = ref('');
let searchTimer;

// paging/sorting state
const page = ref(1);
const pageSize = ref(25);
const sortBy = ref('createdAt');
const sortDir = ref('desc');
const meta = ref({ totalContacts: 0, currentPage: 1, totalPages: 1, hasMore: false });

const fetchDevices = async () => {
  try {
    const { data } = await userApi.get('/devices');
    devices.value = Array.isArray(data) ? data : [];
  } catch { devices.value = []; }
};

const onDeviceChange = () => {
  localStorage.setItem('device_selected_id', selectedDeviceId.value);
  page.value = 1; // reset
  loadContacts();
};

const loadContacts = async () => {
  if (!selectedDeviceId.value) {
    console.log('❌ No device selected, cannot load contacts');
    return;
  }
  
  console.log('🔄 Loading contacts for device:', selectedDeviceId.value);
  loading.value = true;
  err.value = '';
  
  try {
    const { data } = await userApi.get('/contacts', {
      params: {
        deviceId: selectedDeviceId.value,
        ...(q.value ? { q: q.value } : {}),
        page: page.value,
        pageSize: pageSize.value,
        sortBy: sortBy.value,
        sortDir: sortDir.value,
      },
    });
    
    console.log('📋 Raw contacts response:', data);
    console.log('📊 Number of contacts received:', Array.isArray(data) ? data.length : 'Not an array');
    
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    contacts.value = list;
    meta.value = Array.isArray(data) ? {
      totalContacts: list.length,
      currentPage: 1,
      totalPages: 1,
      hasMore: false,
    } : (data?.metadata || meta.value);
    
    console.log('✅ Contacts loaded successfully:', contacts.value.length, 'items');
    contacts.value.forEach((contact, index) => {
      console.log(`   ${index + 1}. ${contact.firstName} ${contact.lastName || ''} - ${contact.phone}`);
    });
    
  } catch (e) {
    console.error('❌ Error loading contacts:', e);
    console.error('❌ Error response:', e?.response);
    err.value = e?.response?.data?.message || 'Gagal memuat kontak';
    contacts.value = []; // Reset contacts on error
    meta.value = { totalContacts: 0, currentPage: 1, totalPages: 1, hasMore: false };
  } finally {
    loading.value = false;
  }
};

const filteredContactLabels = (contact) => {
  const names = (contact.ContactLabel || []).map((l) => l.label?.name).filter(Boolean);
  return names.filter((n) => !String(n).startsWith('device_'));
};

// New: computed visibleContacts filtered by query (name/phone/label)
const visibleContacts = computed(() => {
  const term = String(q.value || '').trim().toLowerCase();
  if (!term) return contacts.value;
  return contacts.value.filter((c) => {
    const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const phone = String(c.phone || '').toLowerCase();
    const labels = filteredContactLabels(c).join(' ').toLowerCase();
    return name.includes(term) || phone.includes(term) || labels.includes(term);
  });
});

// Debounced server-side reload on search/sort/pageSize change
watch([q, sortBy, sortDir, pageSize], () => {
  page.value = 1; // reset to first page on criteria change
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadContacts(), 300);
});

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: '',
    dob: '',
  };
  labelInput.value = '';
  editingContact.value = null;
  showAddForm.value = false;
};

const cancelForm = () => {
  resetForm();
  msg.value = '';
  err.value = '';
};

const editContact = (contact) => {
  editingContact.value = contact;
  form.value = {
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    phone: contact.phone || '',
    email: '', // kosongkan email untuk tutor
    gender: '', // kosongkan gender untuk tutor
    dob: '', // kosongkan dob untuk tutor
  };
  // Pre-fill only non-device labels
  labelInput.value = filteredContactLabels(contact).join(', ');
};

// New: Phone number validation function
const validatePhoneNumber = (phone) => {
  // Remove all spaces, dashes, and other non-digit characters
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if number starts with 628 and has proper length (11-15 digits total)
  // 628 + 8-12 digits = 11-15 total digits
  const whatsappPattern = /^628\d{8,12}$/;
  
  return whatsappPattern.test(cleanPhone);
};

// New: Format phone number for display
const formatPhoneNumber = (phone) => {
  return phone.replace(/[\s\-\(\)\+]/g, '');
};

const saveContact = async () => {
  if (!selectedDeviceId.value) {
    toast.error('Pilih perangkat terlebih dahulu');
    return;
  }

  // Validate phone number format
  if (!validatePhoneNumber(form.value.phone)) {
    toast.error('Format nomor tidak valid. Gunakan format WhatsApp Indonesia yang dimulai dengan 628 (contoh: 628123456789)');
    return;
  }
  
  saving.value = true;
  err.value = '';
  msg.value = '';
  
  try {
    const labels = labelInput.value.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      ...form.value,
      phone: formatPhoneNumber(form.value.phone), // Clean the phone number
      // pastikan field opsional tetap kosong seperti permintaan
      email: '',
      gender: '',
      dob: '',
      labels,
      deviceId: selectedDeviceId.value,
    };
    
    console.log('🚀 Sending contact payload:', payload);
    console.log('📱 Selected device ID:', selectedDeviceId.value);
    
    let response;
    if (editingContact.value) {
      response = await userApi.put(`/contacts/${editingContact.value.id}`, payload);
      toast.success('Kontak berhasil diperbarui');
      console.log('✅ Contact updated:', response.data);
    } else {
      response = await userApi.post('/contacts/create', payload);
      toast.success('Kontak berhasil ditambahkan');
      console.log('✅ Contact created:', response.data);
    }
    
    // Reset form immediately
    resetForm();
    
    // Force reload contacts with better timing and error handling
    console.log('🔄 Reloading contacts after save...');
    
    // Try immediate reload first
    await loadContacts();
    
    // If no contacts found, try again after a short delay
    if (contacts.value.length === 0) {
      console.log('⏰ No contacts found, retrying after delay...');
      setTimeout(async () => {
        await loadContacts();
        
        // If still no contacts, try one more time
        if (contacts.value.length === 0) {
          console.log('⏰ Still no contacts, final retry...');
          setTimeout(async () => {
            await loadContacts();
          }, 1000);
        }
      }, 500);
    }
    
  } catch (e) {
    console.error('❌ Contact save error:', e);
    console.error('❌ Error response data:', e?.response?.data);
    console.error('❌ Error status:', e?.response?.status);
    
    const errorMsg = e?.response?.data?.message || e?.message || 'Gagal menyimpan kontak';
    
    if (e?.response?.status === 401) {
      toast.error('Session expired. Silakan login ulang.');
    } else if (e?.response?.status === 403) {
      toast.error('Tidak memiliki izin untuk mengelola kontak. Hubungi admin.');
    } else if (e?.response?.status === 404 && errorMsg.includes('Device')) {
      toast.error('Perangkat tidak ditemukan. Pilih perangkat yang valid.');
    } else if (errorMsg.includes('already exists')) {
      toast.error('Nomor HP sudah terdaftar di perangkat ini.');
    } else {
      toast.error(`Error: ${errorMsg}`);
    }
  } finally {
    saving.value = false;
  }
};

const deleteContact = async (contactId) => {
  if (!confirm('Hapus kontak ini?')) return;
  
  try {
    await userApi.delete('/contacts', { data: { contactIds: [contactId] } });
    toast.success('Kontak berhasil dihapus');
    await loadContacts();
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Gagal menghapus kontak');
  }
};

// New: Import handlers
const triggerImport = () => {
  if (!selectedDeviceId.value) {
    toast.error('Pilih perangkat terlebih dahulu');
    return;
  }
  err.value = '';
  msg.value = '';
  fileInput.value && fileInput.value.click();
};

const onImportFileChange = async (e) => {
  const file = e?.target?.files?.[0];
  if (!file) return;
  const MAX_SIZE_MB = 5; // simple guard
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    toast.error(`Ukuran file melebihi ${MAX_SIZE_MB}MB`);
    e.target.value = '';
    return;
  }

  const defaultGroup = new Date().toISOString().slice(0,10);
  const groupName = (prompt('Nama grup untuk import (opsional):', `IMPORT_${defaultGroup}`) || '').trim();

  importBusy.value = true;
  err.value = '';
  msg.value = '';

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deviceId', selectedDeviceId.value);
    if (groupName) formData.append('groupName', groupName);

    const { data } = await userApi.post('/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const createdCount = Array.isArray(data?.results) ? data.results.length : 0;
    const errorCount = Array.isArray(data?.errors) ? data.errors.length : 0;
    toast.success(`Import selesai. Berhasil: ${createdCount}${errorCount ? `, Gagal: ${errorCount}` : ''}`);

    // reload contacts after import
    await loadContacts();
  } catch (e) {
    console.error('❌ Import error:', e);
    toast.error(e?.response?.data?.message || 'Gagal mengimpor kontak');
  } finally {
    importBusy.value = false;
    if (e?.target) e.target.value = '';
  }
};

// New: Export handler
const exportContactsFile = async () => {
  if (!selectedDeviceId.value) {
    toast.error('Pilih perangkat terlebih dahulu');
    return;
  }
  exportBusy.value = true;
  err.value = '';
  try {
    const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE_URL)
      || ((window.location.port === '5173') ? 'http://localhost:3000' : window.location.origin);
    const url = `${apiBase}/contacts/export-contacts`;

    const response = await userApi.get(url, {
      params: { deviceId: selectedDeviceId.value },
      responseType: 'blob',
    });

    const ct = response.headers?.['content-type'] || '';
    if (typeof ct === 'string' && ct.includes('text/html')) {
      try {
        const txt = await response.data.text();
        console.warn('Unexpected HTML in export response:', txt?.slice(0, 200));
      } catch (_) {}
      throw new Error('Server mengembalikan HTML. Cek konfigurasi URL API.');
    }

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const cd = response.headers?.['content-disposition'] || '';
    const match = /filename\s*=\s*([^;]+)/i.exec(cd);
    const fallback = `Contacts_${new Date().toISOString().slice(0,10)}.xlsx`;
    const filename = match ? decodeURIComponent(match[1].replace(/\"/g, '').trim()) : fallback;

    const urlObj = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(urlObj);

    toast.success('Export berhasil. File sedang diunduh.');
  } catch (e) {
    console.error('❌ Export error:', e);
    toast.error(e?.message || e?.response?.data?.message || 'Gagal mengekspor kontak');
  } finally {
    exportBusy.value = false;
  }
};

const goPrev = () => { if (page.value > 1) { page.value -= 1; loadContacts(); } };
const goNext = () => { if (meta.value.hasMore) { page.value += 1; loadContacts(); } };

onMounted(async () => {
  await fetchDevices();
  if (selectedDeviceId.value) {
    await loadContacts();
  }
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
  margin-bottom: 24px;
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

/* Device Selection Card */
.device-selection-card {
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

.device-selection {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 250px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.form-group label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.form-group input,
.form-group select {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.device-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-add,
.btn-reload,
.btn-import,
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-reload {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
}

.btn-reload:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-import {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-color: #93c5fd;
}

.btn-import:hover:not(:disabled) {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  transform: translateY(-1px);
}

.btn-export {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #15803d;
  border-color: #86efac;
}

.btn-export:hover:not(:disabled) {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  transform: translateY(-1px);
}

.btn-add:disabled,
.btn-reload:disabled,
.btn-import:disabled,
.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add svg,
.btn-reload svg,
.btn-import svg,
.btn-export svg {
  width: 16px;
  height: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* List Card */
.list-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Toolbar Section */
.toolbar-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select,
.sort-dir-select,
.page-size-select {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.filter-select:focus,
.sort-dir-select:focus,
.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sort-dir-select {
  min-width: 100px;
}

.page-size-select {
  min-width: 160px;
}

/* Contacts Grid */
.contacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.contact-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.contact-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 16px;
  align-items: center;
}

.contact-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-avatar svg {
  width: 32px;
  height: 32px;
  color: #1e40af;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-info h4 {
  margin: 0 0 6px 0;
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-phone {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.contact-phone svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.contact-body {
  padding: 20px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-label svg {
  width: 14px;
  height: 14px;
  color: #3b82f6;
}

.labels-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border: 1px solid #a5b4fc;
  transition: all 0.2s ease;
}

.label-chip svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.no-labels {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}

.contact-footer {
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0369a1;
  border-color: #7dd3fc;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.2);
}

.btn-delete {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border-color: #fca5a5;
}

.btn-delete:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.btn-edit svg,
.btn-delete svg {
  width: 16px;
  height: 16px;
}

/* Empty States */
.empty-state,
.empty-selection-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 24px;
}

.empty-state svg,
.empty-selection-card svg {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state h3,
.empty-selection-card h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #475569;
}

.empty-state p,
.empty-selection-card p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  gap: 16px;
}

.pagination-info {
  color: #64748b;
  font-size: 14px;
}

.pagination-info strong {
  color: #1e293b;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-page {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ffffff;
  color: #475569;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-page svg {
  width: 16px;
  height: 16px;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.current-page {
  font-size: 16px;
}

.page-separator {
  opacity: 0.7;
}

.total-pages {
  opacity: 0.9;
}

/* Modal */
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

.modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.modal-header h3 svg {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.close-btn svg {
  width: 18px;
  height: 18px;
  color: #475569;
}

.modal form {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-grid .form-group.span-2 {
  grid-column: span 2;
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

.modal-actions {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel svg,
.btn-submit svg {
  width: 18px;
  height: 18px;
}

/* Messages */
.success-message {
  margin-top: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border: 1px solid #86efac;
  border-radius: 10px;
  font-weight: 500;
}

.error-message {
  margin-top: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fca5a5;
  border-radius: 10px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1200px) {
  .contacts-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

  .device-selection {
    flex-direction: column;
    align-items: stretch;
  }

  .form-group {
    min-width: unset;
  }

  .device-actions {
    flex-direction: column;
  }

  .btn-add,
  .btn-reload,
  .btn-import,
  .btn-export {
    width: 100%;
    justify-content: center;
  }

  .contacts-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
    min-width: unset;
  }

  .filter-group {
    flex-direction: column;
  }

  .filter-select,
  .sort-dir-select,
  .page-size-select {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: space-between;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-grid .form-group.span-2 {
    grid-column: span 1;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
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

  .contact-header {
    padding: 16px;
  }

  .contact-avatar {
    width: 48px;
    height: 48px;
  }

  .contact-avatar svg {
    width: 28px;
    height: 28px;
  }

  .contact-info h4 {
    font-size: 15px;
  }

  .contact-body {
    padding: 16px;
  }
}
</style>