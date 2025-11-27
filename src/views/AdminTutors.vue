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

      <div class="tutors-grid" v-if="rows.length">
        <div v-for="u in rows" :key="u.id" class="tutor-card">
          <template v-if="editingId === u.id">
            <div class="edit-mode">
              <div class="edit-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <h4>Edit Tutor</h4>
              </div>
              <div class="edit-form">
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
              <div class="edit-actions">
                <button class="btn-save" @click="saveEdit(u)" :disabled="savingEdit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {{ savingEdit ? 'Menyimpan...' : 'Simpan' }}
                </button>
                <button class="btn-cancel" @click="cancelEdit" :disabled="savingEdit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Batal
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="tutor-header">
              <div class="tutor-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="tutor-info">
                <h4>{{ u.firstName }} {{ u.lastName || '' }}</h4>
                <div class="tutor-email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  {{ u.email }}
                </div>
              </div>
            </div>

            <div class="tutor-body">
              <div class="info-section">
                <div class="info-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                    <line x1="6" y1="6" x2="6.01" y2="6"/>
                    <line x1="6" y1="18" x2="6.01" y2="18"/>
                  </svg>
                  Perangkat
                </div>
                <div class="devices-list" v-if="u.devices && u.devices.length">
                  <div v-for="d in u.devices" :key="d.id" class="device-chip" :class="d.status">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                    <span>{{ d.name || 'Device' }}</span>
                    <span class="device-status">{{ d.status }}</span>
                  </div>
                </div>
                <div v-else class="no-devices">Belum ada perangkat</div>
              </div>

              <div class="info-section">
                <div class="info-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Dibuat
                </div>
                <div class="created-date">{{ new Date(u.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) }}</div>
              </div>
            </div>

            <div class="tutor-footer">
              <button class="btn-edit" @click="startEdit(u)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
              <button class="btn-delete" @click="deleteTutor(u)" :disabled="deletingId === u.id">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                {{ deletingId === u.id ? 'Menghapus...' : 'Hapus Akun' }}
              </button>
            </div>
          </template>
        </div>
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

const deleteTutor = async (u) => {
  if (!u?.id) return;
  if (!window.confirm(`Hapus akun tutor ${u.firstName}? Tindakan ini tidak dapat dibatalkan.`)) return;
  msg.value = '';
  err.value = '';
  deletingId.value = u.id;
  try {
    await userApi.delete(`/users/${encodeURIComponent(u.id)}/delete`);
    toast.success('Akun tutor berhasil dihapus');
    page.value = 1;
    await loadTutors();
  } catch (e) {
    toast.error((e && e.response && e.response.data && e.response.data.message) || 'Gagal menghapus akun tutor');
  } finally {
    deletingId.value = '';
  }
};

const editingId = ref('');
const savingEdit = ref(false);
const ed = ref({ firstName: '', lastName: '', email: '', password: '' });

const startEdit = (u) => {
  editingId.value = u.id;
  ed.value = { firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', password: '' };
  msg.value = '';
  err.value = '';
};
const cancelEdit = () => { editingId.value = ''; ed.value = { firstName: '', lastName: '', email: '', password: '' }; };

const saveEdit = async (u) => {
  if (!u?.id) return;
  savingEdit.value = true;
  msg.value = '';
  err.value = '';
  try {
    // 1) Update name
    await userApi.patch(`/users/${encodeURIComponent(u.id)}`, { firstName: ed.value.firstName, lastName: ed.value.lastName });
    // 2) Update email if changed
    const newEmail = (ed.value.email || '').trim().toLowerCase();
    if (newEmail && newEmail !== (u.email || '').toLowerCase()) {
      await userApi.patch(`/users/change-email/${encodeURIComponent(u.id)}`, { email: newEmail });
    }
    // 3) Update password if provided
    const newPwd = ed.value.password || '';
    if (newPwd) {
      if (newPwd.length < 6) throw new Error('Password minimal 6 karakter');
      await userApi.patch(`/users/change-password/${encodeURIComponent(u.id)}`, { password: newPwd });
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

/* Tutors Grid */
.tutors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.tutor-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.tutor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.tutor-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 16px;
  align-items: center;
}

.tutor-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tutor-avatar svg {
  width: 32px;
  height: 32px;
  color: #1e40af;
}

.tutor-info {
  flex: 1;
  min-width: 0;
}

.tutor-info h4 {
  margin: 0 0 6px 0;
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tutor-email {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.tutor-email svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.tutor-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.devices-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.device-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.2s ease;
}

.device-chip svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.device-chip.open {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.device-chip.close,
.device-chip.closed {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

.device-chip.connecting {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-color: #fcd34d;
}

.device-status {
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  text-transform: capitalize;
}

.no-devices {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}

.created-date {
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 13px;
}

.tutor-footer {
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

.btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.btn-edit svg,
.btn-delete svg {
  width: 16px;
  height: 16px;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Edit Mode */
.edit-mode {
  padding: 20px;
}

.edit-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.edit-header svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.edit-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.edit-actions {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.btn-save,
.btn-cancel {
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

.btn-save {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(21, 128, 61, 0.2);
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
  width: 16px;
  height: 16px;
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
  .tutors-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }

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

  .tutors-grid {
    grid-template-columns: 1fr;
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

  .tutor-card {
    border-radius: 12px;
  }

  .tutor-header {
    padding: 16px;
  }

  .tutor-avatar {
    width: 48px;
    height: 48px;
  }

  .tutor-avatar svg {
    width: 28px;
    height: 28px;
  }

  .tutor-info h4 {
    font-size: 15px;
  }

  .tutor-body {
    padding: 16px;
  }
}
</style>