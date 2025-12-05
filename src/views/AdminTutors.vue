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
          Kelola Tutor
        </h2>
        <p class="subtitle">Tambah, edit, dan kelola akun tutor</p>
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
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">Total Tutor</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
            <line x1="6" y1="6" x2="6.01" y2="6"/>
            <line x1="6" y1="18" x2="6.01" y2="18"/>
          </svg>
          <div>
            <div class="stat-value">{{ rows.reduce((sum, t) => sum + (t.devices?.length || 0), 0) }}</div>
            <div class="stat-label">Total Device</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <div class="stat-value">{{ rows.filter(t => t.devices?.some(d => d.status === 'open')).length }}</div>
            <div class="stat-label">Device Aktif</div>
          </div>
        </div>
      </div>
    </div>

    <section class="create-card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Tambah Tutor Baru
        </h3>
      </div>
      <form @submit.prevent="createTutor" class="form-grid">
        <div class="form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Nama Lengkap
          </label>
          <input v-model.trim="firstName" placeholder="Masukkan nama lengkap" required />
        </div>
        <div class="form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Email
          </label>
          <input v-model.trim="email" type="email" placeholder="email@example.com" required />
        </div>
        <div class="form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Password
          </label>
          <input v-model="password" type="password" placeholder="Minimal 6 karakter" />
        </div>
        <div class="form-actions">
          <button class="btn-submit" :disabled="loading || !canSubmit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {{ loading ? 'Menyimpan...' : 'Tambah Tutor' }}
          </button>
        </div>
      </form>
      <div class="form-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        Pastikan nama, email valid, dan password minimal 6 karakter
      </div>
      <p v-if="msg" class="success-message">{{ msg }}</p>
      <p v-if="err" class="error-message">{{ err }}</p>
    </section>

    <section class="list-card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Daftar Tutor ({{ total }})
        </h3>
        <button class="btn-reload" @click="loadTutors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Muat Ulang
        </button>
      </div>

      <div class="toolbar-section">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input v-model.trim="search" placeholder="Cari nama atau email..." @input="onSearchInput" />
        </div>
        <select v-model.number="pageSize" @change="onPageSizeChange" class="page-size-select">
          <option :value="10">10 per halaman</option>
          <option :value="25">25 per halaman</option>
          <option :value="50">50 per halaman</option>
          <option :value="100">100 per halaman</option>
        </select>
      </div>

      <div v-if="rows.length" class="table-container">
        <table class="tutors-table">
          <thead>
            <tr>
              <th class="th-avatar">
                <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg> -->
              </th>
              <th class="sortable" @click="setSort('firstName')">
                Nama
                <span v-if="sortBy === 'firstName'" class="sort-icon">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="sortable" @click="setSort('email')">
                Email
                <span v-if="sortBy === 'email'" class="sort-icon">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th>Perangkat</th>
              <th class="sortable" @click="setSort('createdAt')">
                Terdaftar
                <span v-if="sortBy === 'createdAt'" class="sort-icon">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="th-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in rows" :key="u.id">
              <td class="td-avatar">
                <div class="avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </td>
              <td class="td-name">
                <div class="name-cell">
                  <span class="name-primary">{{ u.firstName }} {{ u.lastName || '' }}</span>
                </div>
              </td>
              <td class="td-email">
                <div class="email-cell">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  {{ u.email }}
                </div>
              </td>
              <td class="td-devices">
                <div class="devices-cell">
                  <div v-if="u.devices && u.devices.length" class="devices-list">
                    <span v-for="d in u.devices" :key="d.id" class="device-badge" :class="d.status">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </svg>
                      {{ d.name || 'Device' }}
                    </span>
                  </div>
                  <span v-else class="no-device">Belum ada perangkat</span>
                </div>
              </td>
              <td class="td-date">
                <span class="date-text">{{ new Date(u.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) }}</span>
              </td>
              <td class="td-actions">
                <div class="action-buttons">
                  <button class="btn-edit-table" @click="startEdit(u)" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2 2 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-delete-table" @click="confirmDelete(u)" :disabled="deletingId === u.id" title="Hapus">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h3>Belum Ada Tutor</h3>
        <p>Mulai dengan menambahkan tutor baru di atas</p>
      </div>

      <div v-if="total > 0" class="pagination">
        <div class="pagination-info">
          Menampilkan <strong>{{ startItem }}-{{ endItem }}</strong> dari <strong>{{ total }}</strong> tutor
        </div>
        <div class="pagination-controls">
          <button class="btn-page" :disabled="page <= 1" @click="goToPage(page - 1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Sebelumnya
          </button>
          <div class="page-indicator">
            <span class="current-page">{{ page }}</span>
            <span class="page-separator">/</span>
            <span class="total-pages">{{ totalPages }}</span>
          </div>
          <button class="btn-page" :disabled="page >= totalPages" @click="goToPage(page + 1)">
            Berikutnya
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Edit Mode Modal (outside of list-card) -->
    <div v-if="editingId" class="modal-overlay" @click="cancelEdit">
      <div class="edit-modal" @click.stop>
        <div class="edit-modal-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Tutor
          </h3>
        </div>
        <div class="edit-modal-body">
          <div class="form-group">
            <label>Nama Depan</label>
            <input v-model.trim="ed.firstName" placeholder="Nama depan" />
          </div>
          <div class="form-group">
            <label>Nama Belakang</label>
            <input v-model.trim="ed.lastName" placeholder="Nama belakang" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model.trim="ed.email" type="email" placeholder="Email" />
          </div>
          <div class="form-group">
            <label>Password Baru (opsional)</label>
            <input v-model="ed.password" type="password" placeholder="Kosongkan jika tidak diubah" />
          </div>
        </div>
        <div class="edit-modal-actions">
          <button class="btn-cancel" @click="cancelEdit" :disabled="savingEdit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            Batal
          </button>
          <button class="btn-save" @click="saveEdit" :disabled="savingEdit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ savingEdit ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deletingUser" class="modal-overlay delete-modal-overlay" @click="cancelDelete">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-icon">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        </div>
        
        <div class="delete-modal-content">
          <h3>Hapus Tutor Ini?</h3>
          <p class="delete-warning">Tindakan ini tidak dapat dibatalkan. Kontak akan dihapus secara permanen.</p>
          
          <div class="tutor-preview">
            <div class="preview-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="preview-info">
              <div class="preview-name">{{ deletingUser.firstName }} {{ deletingUser.lastName || '' }}</div>
              <div class="preview-email">{{ deletingUser.email }}</div>
            </div>
          </div>
        </div>

        <div class="delete-modal-actions">
          <button type="button" class="btn-keep" @click="cancelDelete" :disabled="isDeleting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Batal
          </button>
          <button type="button" class="btn-delete-confirm" @click="deleteTutor" :disabled="isDeleting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { userApi } from '../api/http.js';
import { useToast } from '../composables/useToast.js';

const toast = useToast();

const rows = ref([]);
const firstName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const deletingId = ref('');
const msg = ref('');
const err = ref('');

// list state
const search = ref('');
const page = ref(1);
const pageSize = ref(10);
const sortBy = ref('createdAt');
const sortDir = ref('desc'); // 'asc' | 'desc'
const total = ref(0);
const totalPages = computed(() => (total.value && pageSize.value ? Math.max(1, Math.ceil(total.value / pageSize.value)) : 1));
const startItem = computed(() => (rows.value.length ? (page.value - 1) * pageSize.value + 1 : 0));
const endItem = computed(() => (rows.value.length ? (page.value - 1) * pageSize.value + rows.value.length : 0));

const emailRe = /^(?:[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+)@(?:[a-zA-Z0-9.-]+)$/;
const canSubmit = computed(() => {
  const fn = (firstName.value || '').trim();
  const em = (email.value || '').trim();
  return fn.length > 0 && em.length > 3 && emailRe.test(em);
});

watch([firstName, email, password], () => { msg.value = ''; err.value = ''; });

let searchTmr = null;
const onSearchInput = () => {
  page.value = 1;
  if (searchTmr) clearTimeout(searchTmr);
  searchTmr = setTimeout(() => {
    loadTutors();
  }, 350);
};

const setSort = (col) => {
  if (sortBy.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = col;
    sortDir.value = 'asc';
  }
  page.value = 1;
  loadTutors();
};

const onPageSizeChange = () => {
  page.value = 1;
  loadTutors();
};

const goToPage = (p) => {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
  loadTutors();
};

const loadTutors = async () => {
  err.value = '';
  try {
    const params = {
      search: (search.value || '').trim() || undefined,
      page: page.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      sortDir: sortDir.value,
    };
    const { data } = await userApi.get('/tutors', { params });
    if (data && data.data && Array.isArray(data.data)) {
      rows.value = data.data;
      const m = data.metadata || {};
      total.value = Number(m.total || 0);
    } else if (Array.isArray(data)) {
      rows.value = data;
      total.value = data.length;
    } else {
      rows.value = [];
      total.value = 0;
    }
  } catch (e) {
    err.value = e?.response?.data?.message || e?.message || 'Gagal memuat daftar tutor';
  }
};

const createTutor = async () => {
  msg.value = '';
  err.value = '';
  const body = { firstName: (firstName.value || '').trim(), email: (email.value || '').trim().toLowerCase() };
  if (!canSubmit.value) {
    toast.error('Nama dan email harus diisi dengan benar');
    return;
  }
  if (password.value) body.password = password.value;

  loading.value = true;
  try {
    await userApi.post('/tutors', body);
    toast.success('Tutor berhasil dibuat');
    firstName.value = '';
    email.value = '';
    password.value = '';
    page.value = 1;
    await loadTutors();
  } catch (e) {
    const status = e?.response?.status;
    if (status === 409) toast.error('Email sudah terdaftar');
    else toast.error((e && e.response && e.response.data && e.response.data.message) || 'Gagal menambah tutor');
  } finally {
    loading.value = false;
  }
};

const editingId = ref('');
const savingEdit = ref(false);
const ed = ref({ firstName: '', lastName: '', email: '', password: '' });

// Delete confirmation modal
const deletingUser = ref(null);
const isDeleting = ref(false);

const startEdit = (u) => {
  editingId.value = u.id;
  ed.value = { firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', password: '' };
  msg.value = '';
  err.value = '';
};
const cancelEdit = () => { editingId.value = ''; ed.value = { firstName: '', lastName: '', email: '', password: '' }; };

const saveEdit = async () => {
  if (!editingId.value) return;
  savingEdit.value = true;
  msg.value = '';
  err.value = '';
  try {
    // 1) Update name
    await userApi.patch(`/users/${encodeURIComponent(editingId.value)}`, { firstName: ed.value.firstName, lastName: ed.value.lastName });
    // 2) Update email if changed
    const newEmail = (ed.value.email || '').trim().toLowerCase();
    if (newEmail && newEmail !== (rows.value.find(u => u.id === editingId.value)?.email || '').toLowerCase()) {
      await userApi.patch(`/users/change-email/${encodeURIComponent(editingId.value)}`, { email: newEmail });
    }
    // 3) Update password if provided
    const newPwd = ed.value.password || '';
    if (newPwd) {
      if (newPwd.length < 6) throw new Error('Password minimal 6 karakter');
      await userApi.patch(`/users/change-password/${encodeURIComponent(editingId.value)}`, { password: newPwd });
    }
    toast.success('Akun tutor berhasil diperbarui');
    editingId.value = '';
    ed.value = { firstName: '', lastName: '', email: '', password: '' };
    await loadTutors();
  } catch (e) {
    const m = e?.response?.data?.message || e?.message || 'Gagal menyimpan perubahan';
    toast.error(m);
  } finally {
    savingEdit.value = false;
  }
};

const confirmDelete = (u) => {
  if (!u?.id) return;
  deletingUser.value = u;
  msg.value = '';
  err.value = '';
};

const cancelDelete = () => {
  deletingUser.value = null;
};

const deleteTutor = async () => {
  if (!deletingUser.value?.id) return;
  const userId = deletingUser.value.id;
  
  isDeleting.value = true;
  try {
    await userApi.delete(`/users/${encodeURIComponent(userId)}/delete`);
    toast.success('Akun tutor berhasil dihapus');
    deletingUser.value = null;
    page.value = 1;
    await loadTutors();
  } catch (e) {
    toast.error((e && e.response && e.response.data && e.response.data.message) || 'Gagal menghapus akun tutor');
  } finally {
    isDeleting.value = false;
  }
};

onMounted(loadTutors);

// small component for sort indicator
const SortIcon = {
  props: { active: Boolean, dir: String },
  template: `<span v-if="active" class="sort-icon">{{ dir === 'asc' ? '▲' : '▼' }}</span>`
};
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

/* Create Card */
.create-card {
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

.btn-reload:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-reload svg {
  width: 18px;
  height: 18px;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.form-group input {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  align-items: flex-end;
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
  width: 100%;
  justify-content: center;
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
}

.search-box {
  flex: 1;
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

.page-size-select {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  min-width: 160px;
}

.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Table */
.table-container {
  overflow-x: auto;
}

.tutors-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.tutors-table th,
.tutors-table td {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  color: #475569;
}

.tutors-table th {
  background: #f8fafc;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.tutors-table td {
  border-bottom: 1px solid #f1f5f9;
}

.tutors-table th.sortable {
  cursor: pointer;
}

.tutors-table th.sortable:hover {
  color: #3b82f6;
}

.sort-icon {
  margin-left: 6px;
  font-size: 12px;
  color: #3b82f6;
}

.th-avatar {
  width: 50px;
}

.td-avatar .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.td-avatar .avatar svg {
  width: 24px;
  height: 24px;
  color: #1e40af;
}

.td-name .name-primary {
  font-weight: 600;
  color: #1e293b;
}

.td-email .email-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.td-email .email-cell svg {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.td-devices .devices-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.device-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

.device-badge svg {
  width: 14px;
  height: 14px;
}

.device-badge.open {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.device-badge.close,
.device-badge.closed {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

.device-badge.connecting {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-color: #fcd34d;
}

.no-device {
  color: #64748b;
  font-size: 13px;
}

.td-date .date-text {
  font-size: 13px;
  color: #475569;
}

.td-actions .action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-edit-table,
.btn-delete-table {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit-table {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.btn-edit-table:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-delete-table {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.btn-delete-table:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.btn-edit-table svg {
  width: 18px;
  height: 18px;
  color: #1e40af;
}

.btn-delete-table svg {
  width: 18px;
  height: 18px;
  color: #dc2626;
}

.btn-delete-table:disabled {
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
  margin-bottom: 24px;
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

/* Responsive */
@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-actions {
    grid-column: span 2;
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    grid-column: span 1;
  }

  .toolbar-section {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .page-size-select {
    width: 100%;
  }

  .card-header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .btn-reload {
    width: 100%;
    justify-content: center;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: space-between;
  }

  .table-container {
    overflow-x: auto;
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
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.edit-modal {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.edit-modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.edit-modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.edit-modal-header h3 svg {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.edit-modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edit-modal-actions {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  background: #f8fafc;
}

.btn-save,
.btn-cancel {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #ffffff;
  color: #475569;
  border-color: #cbd5e1;
}

.btn-cancel:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save svg,
.btn-cancel svg {
  width: 18px;
  height: 18px;
}

/* Delete Modal */
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
  animation: pulse 0.5s ease-out;
}

@keyframes pulse {
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

.delete-modal-content {
  padding: 0;
  text-align: center;
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

.tutor-preview {
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

.tutor-preview:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.preview-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-avatar svg {
  width: 24px;
  height: 24px;
  color: #1e40af;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.preview-email {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 0;
  background: transparent;
  border: none;
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