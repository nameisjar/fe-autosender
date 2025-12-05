<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
            <polyline points="10 9 9 9 8 9" stroke="currentColor" stroke-width="2"/>
          </svg>
          Template Feedback
        </h2>
        <p class="subtitle">Kelola template pesan feedback untuk berbagai course</p>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <div>
            <div class="stat-value">{{ feedbacks.length }}</div>
            <div class="stat-label">Total Template</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1-3-3h7z"/>
          </svg>
          <div>
            <div class="stat-value">{{ courses.length }}</div>
            <div class="stat-label">Total Course</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <div>
            <div class="stat-value">{{ mostLessons }}</div>
            <div class="stat-label">Max Lesson</div>
          </div>
        </div>
      </div>
    </div>

    <section class="create-card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import Data dari Excel
        </h3>
      </div>
      
      <div class="import-section">
        <div class="import-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p>Upload file CSV atau XLSX dengan format: Course Name, Lesson, Message</p>
        </div>
        
        <div class="import-actions">
          <input ref="tplFileInput" type="file" accept=".csv,text/csv,.xlsx,.xls" style="display:none" @change="onTplImportFileChange" />
          <button class="btn-import" @click="triggerTplImport" :disabled="!isAdmin || importBusy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ importBusy ? 'Mengimpor...' : 'Import XLSX' }}
          </button>
          <button class="btn-export" @click="exportXLSX" :disabled="!feedbacks.length">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export XLSX
          </button>
        </div>
      </div>
    </section>

    <section class="list-card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Daftar Template ({{ feedbacks.length }})
        </h3>
        <button class="btn-reload" @click="loadFeedbacks" :disabled="loading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          {{ loading ? 'Memuat...' : 'Muat Ulang' }}
        </button>
      </div>

      <div class="toolbar-section">
        <div class="filter-group">
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input v-model="fbFilter" placeholder="Cari nama course..." />
          </div>
          
          <div class="course-filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M7 12h10M10 18h4"/>
            </svg>
            <select v-model="selectedCourse">
              <option value="">Semua Course</option>
              <option v-for="course in allCourses" :key="course" :value="course">
                {{ course }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-action collapse" @click="collapseAll" v-if="courses.length">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 14 10 14 10 20"/>
              <polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            Tutup Semua
          </button>
          <button class="btn-action expand" @click="expandAll" v-if="courses.length">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            Buka Semua
          </button>
          <button class="btn-add-new" @click="openAddModal" v-if="isAdmin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Template
          </button>
        </div>
      </div>

      <div class="templates-container" v-if="courses.length">
        <div v-for="c in courses" :key="c" class="course-group">
          <div class="course-header" @click="toggleGroup(c)">
            <div class="header-left">
              <svg class="chevron-icon" :class="{ open: !collapsed[c] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <div class="course-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1-3-3h7z"/>
                </svg>
              </div>
              <h4>{{ c }}</h4>
              <span class="course-count">{{ grouped[c].length }} template</span>
            </div>
          </div>

          <div class="course-body" v-show="!collapsed[c]">
            <div class="templates-grid">
              <div v-for="t in grouped[c]" :key="t.id" class="template-card">
                <div class="template-header">
                  <div class="lesson-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    Lesson {{ t.lesson }}
                  </div>
                </div>
                <div class="template-body">
                  <div class="message-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Pesan Template
                  </div>
                  <div class="message-preview">{{ t.message }}</div>
                </div>
                <div class="template-footer" v-if="isAdmin">
                  <button class="btn-edit" @click="startEditInline(t)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button class="btn-delete" @click="deleteFeedback(t)" :disabled="submitting">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    {{ submitting ? 'Menghapus...' : 'Hapus' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <h3>Belum Ada Template</h3>
        <p>Mulai dengan menambahkan template feedback baru</p>
      </div>
    </section>

    <!-- Add/Edit Modal -->
    <div v-if="showFormModal" class="modal-overlay" @click="closeFormModal">
      <div class="form-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit Template' : 'Tambah Template Baru' }}</h3>
          <button class="btn-close" @click="closeFormModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveTemplate">
            <div class="form-grid-modal">
              <div class="form-group">
                <label for="courseName">Nama Course <span class="required">*</span></label>
                <input 
                  id="courseName" 
                  v-model="formData.courseName" 
                  type="text" 
                  placeholder="Contoh: Algorithmics" 
                  required
                />
              </div>

              <div class="form-group">
                <label for="lesson">Lesson <span class="required">*</span></label>
                <input 
                  id="lesson" 
                  v-model.number="formData.lesson" 
                  type="number" 
                  min="1" 
                  placeholder="1" 
                  required
                />
              </div>

              <div class="form-group full">
                <label for="message">Pesan Template <span class="required">*</span></label>
                <textarea 
                  id="message" 
                  v-model="formData.message" 
                  rows="5" 
                  placeholder="Tulis pesan feedback di sini... (Gunakan enter untuk baris baru)" 
                  required
                ></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeFormModal">
                Batal
              </button>
              <button type="submit" class="btn-save" :disabled="saving">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {{ saving ? 'Menyimpan...' : (isEditMode ? 'Update Template' : 'Simpan Template') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

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
          <h3>Hapus Template Ini?</h3>
          <p class="delete-warning">Tindakan ini tidak dapat dibatalkan. Template feedback akan dihapus secara permanen.</p>
          
          <div class="template-preview" v-if="templateToDelete">
            <div class="preview-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="preview-info">
              <div class="preview-name">{{ templateToDelete.courseName }} - Lesson {{ templateToDelete.lesson }}</div>
              <div class="preview-detail">{{ templateToDelete.message.substring(0, 50) }}{{ templateToDelete.message.length > 50 ? '...' : '' }}</div>
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
          <button type="button" class="btn-delete-confirm" @click="handleConfirmDelete" :disabled="deleting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus Template' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Import Confirmation Modal -->
    <div v-if="showImportModal" class="modal-overlay import-modal-overlay" @click="cancelImport">
      <div class="import-modal" @click.stop>
        <div class="import-modal-icon">
          <div class="icon-circle-import">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
        </div>
        
        <div class="import-modal-content">
          <h3>Ganti Semua Data Template?</h3>
          <p class="import-description">File yang diimport akan mengganti semua template yang ada. Pilih "Tambah" untuk menambahkan tanpa menghapus data lama, atau "Ganti Semua" untuk replace.</p>
          
          <div class="file-preview" v-if="selectedImportFile">
            <div class="preview-icon-file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="file-info">
              <div class="file-name">{{ selectedImportFile.name }}</div>
              <div class="file-size">{{ (selectedImportFile.size / 1024).toFixed(2) }} KB</div>
            </div>
          </div>
        </div>

        <div class="import-modal-actions">
          <button type="button" class="btn-cancel-import" @click="cancelImport" :disabled="importBusy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            Batal
          </button>
          <button type="button" class="btn-append-import" @click="() => { importReplaceMode = false; confirmImport(); }" :disabled="importBusy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {{ importBusy && !importReplaceMode ? 'Menambah...' : 'Tambah' }}
          </button>
          <button type="button" class="btn-import-confirm" @click="() => { importReplaceMode = true; confirmImport(); }" :disabled="importBusy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ importBusy && importReplaceMode ? 'Mengganti...' : 'Ganti Semua' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { userApi } from '../api/http.js';
import { useAuthStore } from '../stores/auth.js';
import { useToast } from '../composables/useToast.js';
import { loadXLSX } from '../utils/xlsx-loader.js';

const toast = useToast();

const auth = useAuthStore();
onMounted(() => auth.fetchMe());
const isAdmin = computed(() => auth.isAdmin);

const feedbacks = ref([]);
const fbFilter = ref('');
const selectedCourse = ref('');
const fb = ref({ courseName: '', lesson: 1, message: '' });
const ed = ref({ id: '', courseName: '', lesson: 1, message: '' });
const editId = ref('');
const loading = ref(false);
const submitting = ref(false);
const msg = ref('');
const err = ref('');

// Delete confirmation modal state
const showDeleteModal = ref(false);
const templateToDelete = ref(null);
const deleting = ref(false);

// Import modal state
const showImportModal = ref(false);
const importReplaceMode = ref(false);
const selectedImportFile = ref(null);

// Import state for Templates
const tplFileInput = ref(null);
const importBusy = ref(false);

// grouping & UI state
const grouped = computed(() => {
  const map = {};
  const arr = Array.isArray(feedbacks.value) ? feedbacks.value.slice() : [];
  const filter = (fbFilter.value || '').trim().toLowerCase();
  const courseFilter = selectedCourse.value;
  
  for (const t of arr) {
    const course = t.courseName || '';
    if (filter && !course.toLowerCase().includes(filter)) continue;
    if (courseFilter && course !== courseFilter) continue;
    (map[course] ||= []).push(t);
  }
  Object.keys(map).forEach((k) => map[k].sort((a, b) => Number(a.lesson) - Number(b.lesson)));
  return map;
});

const courses = computed(() => Object.keys(grouped.value).sort((a, b) => a.localeCompare(b)));
const allCourses = computed(() => [...new Set(feedbacks.value.map(t => t.courseName))].sort());
const collapsed = ref({});
const toggleGroup = (c) => { collapsed.value[c] = !collapsed.value[c]; };
const expandAll = () => { courses.value.forEach((c) => (collapsed.value[c] = false)); };
const collapseAll = () => { courses.value.forEach((c) => (collapsed.value[c] = true)); };

const mostLessons = computed(() => {
  let max = 0;
  for (const c of courses.value) {
    const lessons = grouped.value[c].map(t => t.lesson);
    max = Math.max(max, ...lessons);
  }
  return max;
});

const loadFeedbacks = async () => {
  loading.value = true;
  err.value = '';
  try {
    console.log('🔍 Loading templates...');
    
    if (fbFilter.value) {
      const { data } = await userApi.get(`/course/feedback/${encodeURIComponent(fbFilter.value)}`);
      feedbacks.value = data.feedbacks || [];
    } else {
      const { data } = await userApi.get('/course/feedbacks');
      feedbacks.value = data.feedbacks || [];
    }
    
    console.log('✅ Templates loaded:', feedbacks.value.length);
    collapsed.value = {};
  } catch (e) {
    console.error('❌ Error loading templates:', e);
    toast.error(e?.response?.data?.message || e?.message || 'Gagal memuat template');
  } finally {
    loading.value = false;
  }
};

const createFeedback = async () => {
  submitting.value = true;
  msg.value = '';
  err.value = '';
  try {
    await userApi.post('/course/feedback', fb.value);
    fb.value = { courseName: '', lesson: 1, message: '' };
    toast.success('Template berhasil ditambahkan');
    await loadFeedbacks();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal menambah template');
  } finally {
    submitting.value = false;
  }
};

// inline edit helpers
const startEditInline = (t) => {
  // Open modal in edit mode
  isEditMode.value = true;
  formData.value = { 
    id: t.id, 
    courseName: t.courseName, 
    lesson: t.lesson, 
    message: t.message 
  };
  showFormModal.value = true;
};

const startEdit = (t) => startEditInline(t);
const cancelEdit = () => { editId.value = ''; };
const saveEdit = async () => {
  if (!editId.value) return;
  submitting.value = true;
  msg.value = '';
  err.value = '';
  try {
    await userApi.put(`/course/feedback/${encodeURIComponent(editId.value)}`, { courseName: ed.value.courseName, lesson: ed.value.lesson, message: ed.value.message });
    toast.success('Template berhasil diperbarui');
    editId.value = '';
    await loadFeedbacks();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal memperbarui template');
  } finally {
    submitting.value = false;
  }
};

const deleteFeedback = (t) => {
  // Show custom delete modal instead of browser confirm
  templateToDelete.value = t;
  showDeleteModal.value = true;
};

// Confirm delete action
const handleConfirmDelete = async () => {
  if (!templateToDelete.value) return;
  
  deleting.value = true;
  msg.value = '';
  err.value = '';
  
  try {
    await userApi.delete(`/course/feedback/${encodeURIComponent(templateToDelete.value.id)}`);
    toast.success('Template berhasil dihapus');
    
    // Close modal
    showDeleteModal.value = false;
    templateToDelete.value = null;
    
    // Reload templates
    await loadFeedbacks();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal menghapus template');
  } finally {
    deleting.value = false;
  }
};

// Cancel delete action
const cancelDelete = () => {
  showDeleteModal.value = false;
  templateToDelete.value = null;
};

// XLSX export for visible data
const exportXLSX = async () => {
  try {
    // Load XLSX library dinamis hanya saat diperlukan
    // toast.info('Memuat library Excel...');
    const XLSX = await loadXLSX();
    
    const rows = [];
    rows.push(['Course Name', 'Lesson', 'Message']);
    for (const c of courses.value) {
      for (const t of grouped.value[c]) {
        rows.push([t.courseName, String(t.lesson ?? ''), t.message ?? '']);
      }
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Feedback Templates');
    XLSX.writeFile(wb, 'feedback-templates.xlsx');
    toast.success('File XLSX berhasil diekspor');
  } catch (e) {
    toast.error(e?.message || 'Gagal mengekspor file XLSX');
  }
};

// CSV/XLSX import for Templates (admin)
const triggerTplImport = () => {
  if (!isAdmin.value) {
    toast.error('Hanya admin yang dapat mengimpor template');
    return;
  }
  err.value = '';
  msg.value = '';
  tplFileInput.value && tplFileInput.value.click();
};

const onTplImportFileChange = async (e) => {
  const file = e?.target?.files?.[0];
  if (!file) return;
  if (!/\.csv$|\.xlsx$/i.test(file.name)) {
    toast.error('Pilih file CSV atau XLSX');
    e.target.value = '';
    return;
  }

  // Show modern import modal instead of browser confirm
  selectedImportFile.value = file;
  importReplaceMode.value = false; // Default to append mode
  showImportModal.value = true;
};

// Confirm import action
const confirmImport = async () => {
  if (!selectedImportFile.value) return;

  importBusy.value = true;
  err.value = '';
  msg.value = '';

  try {
    const form = new FormData();
    form.append('file', selectedImportFile.value);
    await userApi.post(`/course/feedback/import`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { replace: importReplaceMode.value },
    });
    toast.success(`Import template berhasil${importReplaceMode.value ? ' (replace)' : ' (append)'}`);
    await loadFeedbacks();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal mengimpor template');
  } finally {
    importBusy.value = false;
    showImportModal.value = false;
    selectedImportFile.value = null;
    if (tplFileInput.value) tplFileInput.value.value = '';
  }
};

// Cancel import action
const cancelImport = () => {
  showImportModal.value = false;
  selectedImportFile.value = null;
  importReplaceMode.value = false;
  if (tplFileInput.value) tplFileInput.value.value = '';
};

// Add/Edit Modal State
const showFormModal = ref(false);
const isEditMode = ref(false);
const formData = ref({ courseName: '', lesson: 1, message: '' });
const saving = ref(false);

const openAddModal = () => {
  isEditMode.value = false;
  formData.value = { courseName: '', lesson: 1, message: '' };
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
};

const saveTemplate = async () => {
  saving.value = true;
  try {
    if (isEditMode.value) {
      await userApi.put(`/course/feedback/${encodeURIComponent(formData.value.id)}`, {
        courseName: formData.value.courseName,
        lesson: formData.value.lesson,
        message: formData.value.message
      });
      toast.success('Template berhasil diperbarui');
    } else {
      await userApi.post('/course/feedback', formData.value);
      toast.success('Template berhasil ditambahkan');
    }
    await loadFeedbacks();
    closeFormModal();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal menyimpan template');
  } finally {
    saving.value = false;
  }
};

loadFeedbacks();
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

/* Create Card & List Card */
.create-card,
.list-card {
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
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reload:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-reload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reload svg {
  width: 18px;
  height: 18px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.compact {
  max-width: 150px;
}

.form-group.full-width {
  grid-column: 1 / -1;
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
.form-group textarea {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  line-height: 1.5;
  white-space: pre-wrap;
}

.form-actions {
  display: flex;
  align-items: flex-end;
  grid-column: 1 / -1;
  justify-content: flex-end;
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
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

.btn-submit svg {
  width: 18px;
  height: 18px;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  color: #0c4a6e;
  font-size: 13px;
  margin-top: 8px;
}

.form-hint svg {
  width: 18px;
  height: 18px;
  color: #0284c7;
  flex-shrink: 0;
}

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

/* Admin Only Card */
.admin-only-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1.5px solid #fcd34d;
  border-radius: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.admin-only-card svg {
  width: 48px;
  height: 48px;
  color: #92400e;
  margin-bottom: 12px;
}

.admin-only-card p {
  margin: 0;
  color: #92400e;
  font-weight: 600;
  font-size: 15px;
}

/* Toolbar Section */
.toolbar-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
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

.course-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-filter svg {
  width: 20px;
  height: 20px;
  color: #94a3b8;
}

.course-filter select {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.course-filter select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action svg {
  width: 18px;
  height: 18px;
}

.btn-action.collapse,
.btn-action.expand {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
}

.btn-action.collapse:hover:not(:disabled),
.btn-action.expand:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-action.export {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #15803d;
  border-color: #86efac;
}

.btn-action.export:hover:not(:disabled) {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(21, 128, 61, 0.2);
}

.btn-action.import {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-color: #93c5fd;
}

.btn-action.import:hover:not(:disabled) {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
}

.btn-add-new {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-add-new svg {
  width: 18px;
  height: 18px;
}

.btn-add-new:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-add-new:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Import Section */
.import-section {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.import-info {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  min-width: 300px;
}

.import-info svg {
  width: 24px;
  height: 24px;
  color: #0284c7;
  flex-shrink: 0;
}

.import-info p {
  margin: 0;
  color: #0c4a6e;
  font-size: 13px;
  line-height: 1.5;
}

.import-actions {
  display: flex;
  gap: 12px;
}

.btn-import,
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-import {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-import:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-export {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-import:disabled,
.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-import svg,
.btn-export svg {
  width: 18px;
  height: 18px;
}

/* Form Modal */
.form-modal {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #e2e8f0;
}

.btn-close svg {
  width: 18px;
  height: 18px;
  color: #475569;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-grid-modal {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-grid-modal .form-group {
  display: flex;
  flex-direction: column;
}

.form-grid-modal .form-group.full {
  grid-column: 1 / -1;
}

.form-grid-modal .form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.form-grid-modal .form-group .required {
  color: #dc2626;
}

.form-grid-modal .form-group input,
.form-grid-modal .form-group textarea {
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-grid-modal .form-group input:focus,
.form-grid-modal .form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-grid-modal .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.form-grid-modal .btn-cancel,
.form-grid-modal .btn-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  justify-content: center;
}

.form-grid-modal .btn-cancel {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.form-grid-modal .btn-cancel:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-grid-modal .btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.form-grid-modal .btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.form-grid-modal .btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-grid-modal .btn-save svg {
  width: 18px;
  height: 18px;
}

/* Templates Container */
.templates-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.course-group {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.course-group:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.course-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.course-header:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chevron-icon {
  width: 20px;
  height: 20px;
  color: #64748b;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron-icon.open {
  transform: rotate(90deg);
}

.course-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.course-icon svg {
  width: 20px;
  height: 20px;
  color: #1e40af;
}

.header-left h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
}

.course-count {
  padding: 4px 10px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.course-body {
  padding: 20px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.template-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.template-header {
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.lesson-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border: 1px solid #a5b4fc;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.lesson-badge svg {
  width: 14px;
  height: 14px;
}

.template-body {
  padding: 16px;
}

.message-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.message-label svg {
  width: 14px;
  height: 14px;
  color: #3b82f6;
}

.message-preview {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 150px;
  overflow-y: auto;
}

.template-footer {
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1.5px solid;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
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
}

.btn-delete {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border-color: #fca5a5;
}

.btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-1px);
}

.btn-edit svg,
.btn-delete svg {
  width: 14px;
  height: 14px;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Edit Mode */
.edit-mode {
  padding: 16px;
}

.edit-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.edit-header svg {
  width: 18px;
  height: 18px;
  color: #3b82f6;
}

.edit-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.edit-form .form-group label {
  font-size: 12px;
}

.edit-form .form-group input,
.edit-form .form-group textarea {
  font-size: 13px;
  padding: 10px 12px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.btn-save,
.btn-cancel {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1.5px solid;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
  transform: translateY(-1px);
}

.btn-cancel {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
}

.btn-cancel:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-save svg,
.btn-cancel svg {
  width: 14px;
  height: 14px;
}

.btn-save:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1200px) {
  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.compact {
    max-width: 100%;
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

  .templates-grid {
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

  .action-buttons {
    width: 100%;
    justify-content: stretch;
  }

  .btn-action {
    flex: 1;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    justify-content: stretch;
  }

  .btn-submit {
    width: 100%;
    justify-content: center;
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

  .course-header {
    padding: 16px;
  }

  .course-icon {
    width: 36px;
    height: 36px;
  }

  .course-icon svg {
    width: 18px;
    height: 18px;
  }

  .header-left h4 {
    font-size: 15px;
  }

  .course-body {
    padding: 16px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
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

.template-preview {
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

.template-preview:hover {
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

.preview-detail {
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  line-height: 1.4;
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

/* Import Modal */
.import-modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.import-modal {
  background: white;
  border-radius: 20px;
  max-width: 520px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 32px;
  text-align: center;
  animation: slideUp 0.3s ease-out;
}

.import-modal-icon {
  margin-bottom: 20px;
  animation: pulse-icon 0.5s ease-out;
}

.icon-circle-import {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.icon-circle-import::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  opacity: 0.3;
  animation: ripple 1.5s infinite;
}

.icon-circle-import svg {
  width: 40px;
  height: 40px;
  color: #1e40af;
  position: relative;
  z-index: 1;
}

.import-modal-content h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.import-description {
  margin: 0 0 24px 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.file-preview {
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

.file-preview:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.preview-icon-file {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-icon-file svg {
  width: 24px;
  height: 24px;
  color: #1e40af;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.import-modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.btn-cancel-import,
.btn-append-import,
.btn-import-confirm {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel-import {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-cancel-import:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-append-import {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border: 1.5px solid #86efac;
  box-shadow: 0 2px 8px rgba(21, 128, 61, 0.2);
}

.btn-append-import:hover:not(:disabled) {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(21, 128, 61, 0.3);
}

.btn-import-confirm {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-import-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-import-confirm:disabled,
.btn-append-import:disabled,
.btn-cancel-import:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel-import svg,
.btn-append-import svg,
.btn-import-confirm svg {
  width: 16px;
  height: 16px;
}

/* Responsive for Import Modal */
@media (max-width: 768px) {
  .import-modal {
    padding: 24px;
    max-width: 90%;
  }

  .icon-circle-import {
    width: 72px;
    height: 72px;
  }

  .icon-circle-import svg {
    width: 36px;
    height: 36px;
  }

  .import-modal-content h3 {
    font-size: 20px;
  }

  .import-modal-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-cancel-import,
  .btn-append-import,
  .btn-import-confirm {
    width: 100%;
  }
}
</style>