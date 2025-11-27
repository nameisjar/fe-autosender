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
                Nama Feedback <span class="required">*</span>
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

          <!-- Message Preview -->
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loadingGroups }">
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loadingLabels }">
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
import { useToast } from '../composables/useToast.js';
import { 
  convertToServerTime, 
  formatLocalTime, 
  isValidDateTime,
  addInterval 
} from '../utils/datetime.js';

const toast = useToast();

// Pastikan deviceId tersedia/tersimpan sebelum memuat label/kontak
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
      if (current.apiKey) localStorage.setItem('device_api_key', current.apiKey);
      return current.id || '';
    }
  } catch (_) {}
  return '';
};

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
  await Promise.allSettled([loadTemplates(), loadGroups(), loadContacts(), loadLabels()]);
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
    
    const deviceId = await ensureDeviceId();
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
      deviceId, // pass deviceId required by backend
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
.feedback-form {
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

.form-label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
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

.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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