<template>
  <div class="wrapper">
    <h2>Kelola Tutor</h2>

    <section class="create card">
      <h3>Tambah Tutor</h3>
      <form @submit.prevent="createTutor" class="form-inline">
        <label class="field">
          <span>Nama</span>
          <input v-model.trim="firstName" placeholder="Nama" required />
        </label>
        <label class="field">
          <span>Email</span>
          <input v-model.trim="email" type="email" placeholder="Email" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input v-model="password" type="password" placeholder="Password" />
        </label>
        <button class="btn primary" :disabled="loading || !canSubmit">{{ loading ? 'Menyimpan...' : 'Tambah' }}</button>
      </form>
      <small class="hint">Isi nama, email, dan password yang valid</small>
      <p v-if="msg" class="success">{{ msg }}</p>
      <p v-if="err" class="error">{{ err }}</p>
    </section>

    <section class="list card">
      <h3>Daftar Tutor</h3>
      <div class="tools toolbar">
        <input v-model.trim="search" placeholder="Cari nama/email..." @input="onSearchInput" />
        <select v-model.number="pageSize" @change="onPageSizeChange">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <div class="spacer"></div>
        <button class="btn outline" @click="loadTutors">Muat Ulang</button>
      </div>

      <div class="table-wrap">
        <table v-if="rows.length">
          <thead>
            <tr>
              <th @click="setSort('firstName')" class="sortable">
                Nama
                <SortIcon :active="sortBy === 'firstName'" :dir="sortDir" />
              </th>
              <th @click="setSort('email')" class="sortable">
                Email
                <SortIcon :active="sortBy === 'email'" :dir="sortDir" />
              </th>
              <th>Devices</th>
              <th @click="setSort('createdAt')" class="sortable">
                Dibuat
                <SortIcon :active="sortBy === 'createdAt'" :dir="sortDir" />
              </th>
              <th style="width:220px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in rows" :key="u.id">
              <template v-if="editingId === u.id">
                <td>
                  <input v-model.trim="ed.firstName" placeholder="First name" style="width:120px" />
                  <input v-model.trim="ed.lastName" placeholder="Last name" style="width:120px; margin-left:6px" />
                </td>
                <td>
                  <input v-model.trim="ed.email" type="email" placeholder="Email" style="width:220px" />
                </td>
                <td>
                  <input v-model="ed.password" type="password" placeholder="Password baru" style="width:180px" />
                </td>
                <td>{{ new Date(u.createdAt).toLocaleString() }}</td>
                <td>
                  <button class="btn small" @click="saveEdit(u)" :disabled="savingEdit">{{ savingEdit ? 'Menyimpan...' : 'Simpan' }}</button>
                  <button class="btn small" @click="cancelEdit" :disabled="savingEdit">Batal</button>
                </td>
              </template>
              <template v-else>
                <td>{{ u.firstName }} {{ u.lastName || '' }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <ul>
                    <li v-for="d in (u.devices || [])" :key="d.id">{{ d.name }} — {{ d.status }}</li>
                  </ul>
                </td>
                <td>{{ new Date(u.createdAt).toLocaleString() }}</td>
                <td>
                  <button class="btn small" @click="startEdit(u)">Edit</button>
                  <button class="btn small danger" @click="deleteTutor(u)" :disabled="deletingId === u.id">
                    {{ deletingId === u.id ? 'Menghapus...' : 'Hapus Akun' }}
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">Belum ada tutor.</p>
      </div>

      <div v-if="total > 0" class="pagination">
        <div>Menampilkan {{ startItem }}-{{ endItem }} dari {{ total }}</div>
        <div class="pager">
          <button class="btn" :disabled="page <= 1" @click="goToPage(page - 1)">Sebelumnya</button>
          <span>Halaman {{ page }} / {{ totalPages }}</span>
          <button class="btn" :disabled="page >= totalPages" @click="goToPage(page + 1)">Berikutnya</button>
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
.wrapper { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.card { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 1px 2px rgba(16,24,40,0.04); padding: 12px; margin-top: 16px; }

.form-inline { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field > span { font-size: 12px; color: #667085; }
.field input { height: 36px; padding: 6px 10px; border: 1px solid #d8dde6; border-radius: 8px; background: #fff; }

.toolbar { display:flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
.toolbar input, .toolbar select { padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
.toolbar .spacer { flex: 1; }

.table-wrap { overflow: auto; border: 1px solid #eee; border-radius: 12px; }
 table { width: 100%; border-collapse: collapse; margin-top: 8px; }
 thead th { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
 th, td { border-bottom: 1px solid #f0f0f0; padding: 8px 10px; text-align: left; vertical-align: top; }
 th.sortable { cursor: pointer; user-select: none; }
 .sort-icon { font-size: 10px; margin-left: 4px; color: #555; }

.btn { height: 36px; padding: 0 12px; border: 1px solid #d0d5dd; background: #f9fafb; border-radius: 8px; cursor: pointer; font-weight: 500; }
.btn.small { height: 30px; padding: 0 10px; font-size: 13px; }
.btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
.btn.outline { background: #fff; }
.btn.danger { background: #e74c3c; border-color: #e74c3c; color: #fff; }
.btn:disabled { opacity: .7; cursor: default; }

.hint { display:block; color:#666; margin-top: 6px; }
.success { color:#070 }
.error { color:#c00 }
.pagination { display:flex; align-items:center; justify-content: space-between; margin-top: 10px; }
.pager { display:flex; align-items:center; gap: 8px; }
.empty { text-align: center; color: #777; padding: 18px; }

@media (max-width: 1000px) { .toolbar .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) { .toolbar .filters { grid-template-columns: 1fr; } }

@media (max-width: 768px) {
  .wrapper {
    padding: 0 12px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  .card {
    padding: 10px;
    border-radius: 8px;
  }
  
  .form-inline {
    flex-direction: column;
  }
  
  .form-inline .field {
    width: 100%;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar input,
  .toolbar select {
    width: 100%;
  }
  
  .table-wrap {
    border-radius: 8px;
  }
  
  table {
    font-size: 13px;
    min-width: 600px;
  }
  
  th, td {
    padding: 6px 8px;
  }
}

@media (max-width: 480px) {
  h2 {
    font-size: 18px;
  }
  
  .card {
    padding: 8px;
  }
  
  .field input,
  .field select {
    font-size: 14px;
  }
  
  .btn {
    height: 34px;
    font-size: 13px;
  }
  
  .btn.small {
    height: 28px;
    font-size: 12px;
  }
  
  table {
    font-size: 12px;
  }
}
</style>