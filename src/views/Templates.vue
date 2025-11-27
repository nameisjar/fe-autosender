<template>
  <div class="wrapper">
    <h2>Template Feedback</h2>

    <section class="tpl">
      <!-- <h3>Kelola Template Feedback</h3> -->
      <div v-if="isAdmin" class="form card">
        <div class="form-row">
          <label class="field field-course">
            <span>Course name</span>
            <input v-model="fb.courseName" placeholder="Course name" />
          </label>
          <label class="field field-lesson">
            <span>Lesson</span>
            <input v-model.number="fb.lesson" type="number" min="1" placeholder="1" />
          </label>
        </div>
        <div class="form-row">
          <label class="field field-message">
            <span>Message</span>
            <textarea 
              v-model="fb.message" 
              placeholder="Tulis pesan feedback di sini..."
              rows="4"
            ></textarea>
          </label>
        </div>
        <div class="form-actions">
          <button class="btn primary" @click="createFeedback" :disabled="submitting">{{ submitting ? 'Menyimpan...' : 'Tambah' }}</button>
        </div>
      </div>
      <div v-else class="hint">Hanya admin yang dapat mengelola template feedback.</div>

      <div class="toolbar card">
        <div class="filters">
          <div class="field grow">
            <label>Filter course</label>
            <input v-model="fbFilter" placeholder="Filter course" />
          </div>
        </div>
        <div class="actions">
          <button class="btn outline" @click="loadFeedbacks" :disabled="loading">{{ loading ? 'Memuat...' : 'Muat' }}</button>
          <button class="btn" @click="expandAll">Buka Semua</button>
          <button class="btn" @click="collapseAll">Tutup Semua</button>
          <button class="btn" @click="exportXLSX" :disabled="!feedbacks.length">Export XLSX</button>
          <button class="btn" @click="triggerTplImport" :disabled="!isAdmin || importBusy">{{ importBusy ? 'Mengimpor...' : 'Import CSV/XLSX' }}</button>
          <input ref="tplFileInput" type="file" accept=".csv,text/csv,.xlsx,.xls" style="display:none" @change="onTplImportFileChange" />
        </div>
      </div>

      <div class="groups" v-if="courses.length">
        <div class="group card" v-for="c in courses" :key="c">
          <div class="group-header" @click="toggleGroup(c)">
            <div class="title">
              <span class="caret" :class="{ open: !collapsed[c] }">▸</span>
              <strong>{{ c }}</strong>
              <span class="dim"> ({{ grouped[c].length }} items)</span>
            </div>
          </div>
          <div class="group-body" v-show="!collapsed[c]">
            <div class="table-wrap">
              <table class="tbl">
                <thead>
                  <tr>
                    <th style="width:90px">Lesson</th>
                    <th>Message</th>
                    <th v-if="isAdmin" style="width:160px">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in grouped[c]" :key="t.id">
                    <template v-if="editId === t.id">
                      <td><input type="number" v-model.number="ed.lesson" min="1" style="width:80px" /></td>
                      <td>
                        <textarea 
                          v-model="ed.message" 
                          placeholder="Message" 
                          class="full" 
                          rows="3"
                          style="resize: vertical; white-space: pre-wrap;"
                        ></textarea>
                      </td>
                      <td v-if="isAdmin">
                        <button class="btn small" @click="saveEdit" :disabled="submitting">Simpan</button>
                        <button class="btn small" @click="cancelEdit" :disabled="submitting">Batal</button>
                      </td>
                    </template>
                    <template v-else>
                      <td>Lesson {{ t.lesson }}</td>
                      <td class="text message-preview">
                        <div class="message-content">{{ t.message }}</div>
                      </td>
                      <td v-if="isAdmin">
                        <button class="btn small" @click="startEditInline(t)">Edit</button>
                        <button class="btn small danger" @click="deleteFeedback(t)" :disabled="submitting">Hapus</button>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="hint">Tidak ada template.</div>

      <p v-if="msg" class="success">{{ msg }}</p>
      <p v-if="err" class="error">{{ err }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { userApi } from '../api/http.js';
import { useAuthStore } from '../stores/auth.js';
import { useToast } from '../composables/useToast.js';

const toast = useToast();

const auth = useAuthStore();
onMounted(() => auth.fetchMe());
const isAdmin = computed(() => auth.isAdmin);

const feedbacks = ref([]);
const fbFilter = ref('');
const fb = ref({ courseName: '', lesson: 1, message: '' });
const ed = ref({ id: '', courseName: '', lesson: 1, message: '' });
const editId = ref('');
const loading = ref(false);
const submitting = ref(false);
const msg = ref('');
const err = ref('');

// Import state for Templates
const tplFileInput = ref(null);
const importBusy = ref(false);

// grouping & UI state
const grouped = computed(() => {
  const map = {};
  const arr = Array.isArray(feedbacks.value) ? feedbacks.value.slice() : [];
  const filter = (fbFilter.value || '').trim().toLowerCase();
  for (const t of arr) {
    const course = t.courseName || '';
    if (filter && !course.toLowerCase().includes(filter)) continue;
    (map[course] ||= []).push(t);
  }
  Object.keys(map).forEach((k) => map[k].sort((a, b) => Number(a.lesson) - Number(b.lesson)));
  return map;
});
const courses = computed(() => Object.keys(grouped.value).sort((a, b) => a.localeCompare(b)));
const collapsed = ref({});
const toggleGroup = (c) => { collapsed.value[c] = !collapsed.value[c]; };
const expandAll = () => { courses.value.forEach((c) => (collapsed.value[c] = false)); };
const collapseAll = () => { courses.value.forEach((c) => (collapsed.value[c] = true)); };

const loadFeedbacks = async () => {
  loading.value = true;
  err.value = '';
  try {
    if (fbFilter.value) {
      const { data } = await userApi.get(`/algorithmics/feedback/${encodeURIComponent(fbFilter.value)}`);
      feedbacks.value = data.feedbacks || [];
    } else {
      const { data } = await userApi.get('/algorithmics/feedbacks');
      feedbacks.value = data.feedbacks || [];
    }
    collapsed.value = {};
  } catch (e) {
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
    await userApi.post('/algorithmics/feedback', fb.value);
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
  editId.value = t.id;
  ed.value = { id: t.id, courseName: t.courseName, lesson: t.lesson, message: t.message };
};
const startEdit = (t) => startEditInline(t);
const cancelEdit = () => { editId.value = ''; };
const saveEdit = async () => {
  if (!editId.value) return;
  submitting.value = true;
  msg.value = '';
  err.value = '';
  try {
    await userApi.put(`/algorithmics/feedback/${encodeURIComponent(editId.value)}`, { courseName: ed.value.courseName, lesson: ed.value.lesson, message: ed.value.message });
    toast.success('Template berhasil diperbarui');
    editId.value = '';
    await loadFeedbacks();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal memperbarui template');
  } finally {
    submitting.value = false;
  }
};

const deleteFeedback = async (t) => {
  if (!window.confirm('Hapus template ini?')) return;
  submitting.value = true;
  msg.value = '';
  err.value = '';
  try {
    await userApi.delete(`/algorithmics/feedback/${encodeURIComponent(t.id)}`);
    toast.success('Template berhasil dihapus');
    await loadFeedbacks();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal menghapus template');
  } finally {
    submitting.value = false;
  }
};

// XLSX export for visible data
const exportXLSX = () => {
  try {
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
    toast.error('Gagal mengekspor file XLSX');
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

  const replace = window.confirm('Ganti semua data template dengan file ini? Pilih Cancel untuk menambah (append).');
  importBusy.value = true;
  err.value = '';
  msg.value = '';
  try {
    const form = new FormData();
    form.append('file', file);
    await userApi.post(`/algorithmics/feedback/import`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { replace },
    });
    toast.success(`Import template berhasil${replace ? ' (replace)' : ' (append)'}`);
    await loadFeedbacks();
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal mengimpor template');
  } finally {
    importBusy.value = false;
    if (e?.target) e.target.value = '';
  }
};

loadFeedbacks();
</script>

<style scoped>
.wrapper { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.tpl { margin-top: 16px; }

.card { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 1px 2px rgba(16,24,40,0.04); padding: 12px; }
.form-inline { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.grow { min-width: 240px; flex: 1; }
.field span, .field label { font-size: 12px; color: #667085; }
.field input, .field select { height: 36px; padding: 6px 10px; border: 1px solid #d8dde6; border-radius: 8px; background: #fff; }

.toolbar { display:flex; justify-content: space-between; align-items: flex-end; gap: 10px; margin: 12px 0; flex-wrap: wrap; }
.toolbar .filters { display: grid; grid-template-columns: repeat(6, minmax(140px, 1fr)); gap: 10px; flex: 1 1 600px; }
.toolbar .actions { display:flex; gap:8px; }

.btn { height: 36px; padding: 0 12px; border: 1px solid #d0d5dd; background: #f9fafb; border-radius: 8px; cursor: pointer; font-weight: 500; }
.btn.small { height: 30px; padding: 0 10px; font-size: 13px; }
.btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
.btn.outline { background: #fff; }
.btn.danger { background: #e74c3c; border-color: #e74c3c; color: #fff; }

.hint { color:#666; margin: 6px 0; }
.success { color: #0a0; margin-top: 8px; }
.error { color: #c00; margin-top: 8px; }

.groups { margin-top: 8px; display: flex; flex-direction: column; gap: 10px; }
.group { overflow: hidden; }
.group-header { background: #f8fafc; padding: 10px 12px; cursor: pointer; display:flex; align-items:center; }
.group-header .title { display:flex; align-items:center; gap:8px; }
.caret { display:inline-block; transition: transform .15s ease; }
.caret.open { transform: rotate(90deg); }
.group-body { padding: 8px 12px 12px; }
.table-wrap { overflow:auto; border-radius: 8px; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl thead th { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
.tbl th, .tbl td { border-bottom: 1px solid #f0f0f0; padding: 8px; text-align: left; vertical-align: top; }
.tbl .text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 680px; }
.tbl input.full { width: 100%; }

/* Message content styling for better WhatsApp format preservation */
.message-preview {
  white-space: normal !important;
  max-width: 400px;
  overflow: visible !important;
  text-overflow: initial !important;
}

.message-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  max-height: 120px;
  overflow-y: auto;
}

/* Textarea styling for better input experience */
.field textarea {
  padding: 8px 10px;
  border: 1px solid #d8dde6;
  border-radius: 8px;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.4;
  min-height: 80px;
}

.tbl textarea.full {
  width: 100%;
  min-height: 60px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Form layout styling to match the image */
.form {
  margin-bottom: 20px;
}

.form-row {
  display: flex; 
  gap: 16px;
  margin-bottom: 16px;
}

.form-row:last-of-type {
  margin-bottom: 12px;
}

.field-course {
  flex: 1;
  max-width: 300px;
}

.field-lesson {
  flex: 0 0 120px;
}

.field-message {
  flex: 1;
}

.field-message textarea {
  width: 100%;
  resize: vertical;
  min-height: 100px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
  white-space: pre-wrap;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Responsive design for smaller screens */
@media (max-width: 1024px) {
  .toolbar .filters {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .toolbar .actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .wrapper {
    padding: 0 12px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  .card {
    padding: 10px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar .filters {
    grid-template-columns: 1fr;
  }
  
  .toolbar .actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .toolbar .actions button {
    flex: 1;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .field-course,
  .field-lesson {
    max-width: 100%;
  }
  
  .table-wrap {
    border-radius: 8px;
  }
  
  .tbl {
    font-size: 13px;
    min-width: 600px;
  }
  
  .tbl th,
  .tbl td {
    padding: 6px 8px;
  }
  
  .message-preview {
    max-width: 300px;
  }
  
  .message-content {
    max-height: 100px;
    font-size: 13px;
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
  .field textarea,
  .field select {
    padding: 6px 8px;
    font-size: 13px;
  }
  
  .btn {
    height: 34px;
    font-size: 13px;
  }
  
  .btn.small {
    height: 28px;
    font-size: 12px;
  }
  
  .toolbar .actions {
    flex-direction: column;
  }
  
  .toolbar .actions button {
    width: 100%;
  }
  
  .tbl {
    font-size: 12px;
  }
  
  .message-preview {
    max-width: 200px;
  }
  
  .message-content {
    font-size: 12px;
  }
  
  .group-header {
    padding: 8px 10px;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .field-course,
  .field-lesson {
    flex: 1;
  }
}

@media (max-width: 800px) {
  .toolbar .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .message-preview { max-width: 250px; }
}
</style>