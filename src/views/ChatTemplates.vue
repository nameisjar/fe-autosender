<template>
  <div class="wrapper chat-templates-page">
    <header class="page-header">
      <div>
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 8h8M8 12h5" />
          </svg>
          Custom Template Chat
        </h2>
        <p>Simpan pesan yang sering digunakan dan pilih langsung dari Inbox.</p>
      </div>
      <div class="page-actions">
        <button class="btn-secondary" type="button" :disabled="downloadingFormat" @click="downloadFormat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
          </svg>
          {{ downloadingFormat ? 'Menyiapkan...' : 'Download Format' }}
        </button>
        <button class="btn-secondary btn-import-action" type="button" :disabled="readingImport" @click="openImportPicker">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {{ readingImport ? 'Membaca...' : 'Import XLSX' }}
        </button>
        <button class="btn-secondary btn-export-action" type="button" :disabled="exporting" @click="exportTemplates">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {{ exporting ? 'Mengekspor...' : 'Export XLSX' }}
        </button>
        <button class="btn-primary" type="button" @click="openCreate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Template
        </button>
        <input
          ref="importInput"
          class="visually-hidden"
          type="file"
          accept=".xlsx,.xls"
          @change="handleImportFile"
        />
      </div>
    </header>

    <section class="content-card">
      <div class="toolbar">
        <label class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="search" type="search" placeholder="Cari judul atau isi template..." />
        </label>
        <div class="toolbar-actions">
          <label class="page-size-control">
            <span>Tampilkan</span>
            <select v-model.number="pageSize" aria-label="Jumlah template per halaman">
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="48">48</option>
            </select>
          </label>
          <button class="btn-secondary" type="button" :disabled="loadingChatTemplates" @click="refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" />
            </svg>
            {{ loadingChatTemplates ? 'Memuat...' : 'Muat Ulang' }}
          </button>
        </div>
      </div>

      <div class="variable-note">
        <strong>Variabel nama kontak:</strong>
        gunakan <code v-pre>{{siswa}}</code>. Variabel akan diganti dengan nama depan kontak saat template dipilih di Inbox.
      </div>

      <div v-if="loadingChatTemplates && !chatTemplates.length" class="empty-state">
        <div class="spinner"></div>
        <p>Memuat template chat...</p>
      </div>
      <div v-else-if="chatTemplatesError && !chatTemplates.length" class="empty-state error-state">
        <h3>Template belum dapat dimuat</h3>
        <p>{{ chatTemplatesError }}</p>
        <button class="btn-secondary" type="button" @click="refresh">Coba Lagi</button>
      </div>
      <div v-else-if="!filteredTemplates.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h3>{{ search ? 'Template tidak ditemukan' : 'Belum ada template chat' }}</h3>
        <p>{{ search ? 'Coba gunakan kata kunci lain.' : 'Buat template pertama untuk digunakan dari Inbox.' }}</p>
      </div>
      <div v-else class="template-grid">
        <article v-for="template in paginatedTemplates" :key="template.id" class="template-card">
          <div class="template-card-header">
            <h3>{{ template.title }}</h3>
            <span v-if="hasStudentVariable(template.message)" class="variable-badge"><span v-pre>{{siswa}}</span></span>
          </div>
          <p class="message-preview">{{ template.message }}</p>
          <footer>
            <span>Diperbarui {{ formatDate(template.updatedAt) }}</span>
            <div class="card-actions">
              <button type="button" class="btn-icon edit" title="Edit template" @click="openEdit(template)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button type="button" class="btn-icon delete" title="Hapus template" @click="requestDelete(template)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
                </svg>
              </button>
            </div>
          </footer>
        </article>
      </div>

      <nav v-if="filteredTemplates.length" class="pagination" aria-label="Pagination template chat">
        <span class="pagination-summary">
          Menampilkan {{ paginationStart }}&ndash;{{ paginationEnd }} dari {{ filteredTemplates.length }} template
        </span>
        <div class="pagination-controls">
          <button
            type="button"
            class="page-button page-navigation"
            :disabled="currentPage === 1"
            aria-label="Halaman sebelumnya"
            @click="currentPage--"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Sebelumnya</span>
          </button>
          <button
            v-for="pageNumber in visiblePageNumbers"
            :key="pageNumber"
            type="button"
            class="page-button page-number"
            :class="{ active: pageNumber === currentPage }"
            :aria-current="pageNumber === currentPage ? 'page' : undefined"
            :aria-label="`Halaman ${pageNumber}`"
            @click="currentPage = pageNumber"
          >
            {{ pageNumber }}
          </button>
          <button
            type="button"
            class="page-button page-navigation"
            :disabled="currentPage === totalPages"
            aria-label="Halaman berikutnya"
            @click="currentPage++"
          >
            <span>Berikutnya</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </nav>
    </section>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <form class="template-modal" @submit.prevent="save">
        <header>
          <div>
            <h3>{{ editingTemplate ? 'Edit Template Chat' : 'Tambah Template Chat' }}</h3>
            <p>Template hanya dapat dilihat dan dikelola oleh akun Anda.</p>
          </div>
          <button type="button" class="btn-close" aria-label="Tutup" @click="closeForm">×</button>
        </header>
        <div class="modal-body">
          <label>
            <span>Judul <strong>*</strong></span>
            <input v-model.trim="form.title" maxlength="128" required placeholder="Contoh: Konfirmasi Extra Class" />
            <small>{{ form.title.length }}/128 karakter</small>
          </label>
          <label>
            <span>Isi pesan <strong>*</strong></span>
            <textarea v-model="form.message" rows="10" maxlength="10000" required placeholder="Tulis isi template chat..."></textarea>
            <small>{{ form.message.length }}/10.000 karakter · Gunakan <code v-pre>{{siswa}}</code> untuk nama depan kontak.</small>
          </label>
        </div>
        <footer class="modal-actions">
          <button type="button" class="btn-secondary" :disabled="saving" @click="closeForm">Batal</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Menyimpan...' : editingTemplate ? 'Simpan Perubahan' : 'Simpan Template' }}
          </button>
        </footer>
      </form>
    </div>

    <div v-if="templateToDelete" class="modal-overlay" @click.self="templateToDelete = null">
      <div class="confirm-modal">
        <h3>Hapus template?</h3>
        <p>Template <strong>{{ templateToDelete.title }}</strong> akan dihapus permanen.</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" :disabled="deleting" @click="templateToDelete = null">Batal</button>
          <button type="button" class="btn-danger" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Menghapus...' : 'Hapus Template' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="importPreview" class="modal-overlay" @click.self="closeImportPreview">
      <div class="import-modal">
        <header class="import-modal-header">
          <div>
            <h3>Preview Import Template</h3>
            <p>{{ importPreview.fileName }}</p>
          </div>
          <button type="button" class="btn-close" aria-label="Tutup" :disabled="importing" @click="closeImportPreview">×</button>
        </header>
        <div class="import-modal-body">
          <div class="import-summary">
            <div><strong>{{ importPreview.summary.total }}</strong><span>Total baris</span></div>
            <div><strong>{{ importPreview.summary.create }}</strong><span>Template baru</span></div>
            <div><strong>{{ importPreview.summary.update }}</strong><span>Diperbarui</span></div>
            <div><strong>{{ importPreview.summary.unchanged || 0 }}</strong><span>Tanpa perubahan</span></div>
          </div>
          <div v-if="importPreview.errors.length" class="import-validation error">
            <strong>{{ importPreview.errors.length }} masalah ditemukan</strong>
            <p>Perbaiki file Excel, lalu import kembali. Belum ada data yang disimpan.</p>
            <ul>
              <li v-for="(error, index) in importPreview.errors.slice(0, 20)" :key="`${error.rowNumber}-${index}`">
                {{ error.rowNumber ? `Baris ${error.rowNumber}: ` : '' }}{{ error.message }}
              </li>
            </ul>
            <small v-if="importPreview.errors.length > 20">
              Dan {{ importPreview.errors.length - 20 }} masalah lainnya.
            </small>
          </div>
          <div v-else class="import-validation success">
            <strong>File siap diimport</strong>
            <p>Template lama diperbarui berdasarkan template_id. ID kosong akan dibuat sebagai template baru.</p>
          </div>
          <p class="import-note">Menghapus baris dari Excel tidak akan menghapus template di aplikasi.</p>
        </div>
        <footer class="modal-actions import-modal-actions">
          <button type="button" class="btn-secondary" :disabled="importing" @click="closeImportPreview">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="importing || importPreview.errors.length > 0"
            @click="confirmImport"
          >
            {{ importing ? 'Mengimport...' : 'Import Sekarang' }}
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useChatTemplates } from '../composables/useChatTemplates.js';
import { useToast } from '../composables/useToast.js';
import { hasStudentVariable } from '../utils/chatTemplate.js';
import {
  downloadChatTemplateWorkbook,
  readChatTemplateWorkbook,
} from '../utils/chatTemplateWorkbook.js';

const toast = useToast();
const {
  chatTemplates,
  loadingChatTemplates,
  chatTemplatesError,
  loadChatTemplates,
  createChatTemplate,
  updateChatTemplate,
  deleteChatTemplate,
  importChatTemplates,
} = useChatTemplates();
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(12);
const showForm = ref(false);
const editingTemplate = ref(null);
const templateToDelete = ref(null);
const saving = ref(false);
const deleting = ref(false);
const importInput = ref(null);
const readingImport = ref(false);
const importing = ref(false);
const exporting = ref(false);
const downloadingFormat = ref(false);
const importPreview = ref(null);
const form = reactive({ title: '', message: '' });

const filteredTemplates = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('id-ID');
  if (!query) return chatTemplates.value;
  return chatTemplates.value.filter((template) =>
    `${template.title} ${template.message}`.toLocaleLowerCase('id-ID').includes(query),
  );
});

const totalPages = computed(() => Math.max(
  1,
  Math.ceil(filteredTemplates.value.length / pageSize.value),
));
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredTemplates.value.slice(start, start + pageSize.value);
});
const paginationStart = computed(() => (
  filteredTemplates.value.length ? (currentPage.value - 1) * pageSize.value + 1 : 0
));
const paginationEnd = computed(() => Math.min(
  currentPage.value * pageSize.value,
  filteredTemplates.value.length,
));
const visiblePageNumbers = computed(() => {
  const count = Math.min(5, totalPages.value);
  const maxStart = Math.max(1, totalPages.value - count + 1);
  const start = Math.min(
    Math.max(1, currentPage.value - Math.floor(count / 2)),
    maxStart,
  );
  return Array.from({ length: count }, (_, index) => start + index);
});

watch([search, pageSize], () => {
  currentPage.value = 1;
});

watch(totalPages, (lastPage) => {
  if (currentPage.value > lastPage) currentPage.value = lastPage;
});

const apiError = (error, fallback) => error?.response?.data?.message || error?.message || fallback;
const formatDate = (value) => new Intl.DateTimeFormat('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric',
}).format(new Date(value));

function openCreate() {
  editingTemplate.value = null;
  Object.assign(form, { title: '', message: '' });
  showForm.value = true;
}

function openEdit(template) {
  editingTemplate.value = template;
  Object.assign(form, { title: template.title, message: template.message });
  showForm.value = true;
}

function closeForm() {
  if (saving.value) return;
  showForm.value = false;
  editingTemplate.value = null;
}

async function save() {
  if (!form.title.trim() || !form.message.trim() || saving.value) return;
  saving.value = true;
  try {
    const payload = { title: form.title.trim(), message: form.message.trim() };
    if (editingTemplate.value) {
      await updateChatTemplate(editingTemplate.value.id, payload);
      toast.success('Template chat berhasil diperbarui');
    } else {
      await createChatTemplate(payload);
      toast.success('Template chat berhasil dibuat');
    }
    currentPage.value = 1;
    closeForm();
    showForm.value = false;
  } catch (error) {
    toast.error(apiError(error, 'Gagal menyimpan template chat'));
  } finally {
    saving.value = false;
  }
}

function requestDelete(template) {
  templateToDelete.value = template;
}

async function confirmDelete() {
  if (!templateToDelete.value || deleting.value) return;
  deleting.value = true;
  try {
    await deleteChatTemplate(templateToDelete.value.id);
    toast.success('Template chat berhasil dihapus');
    templateToDelete.value = null;
  } catch (error) {
    toast.error(apiError(error, 'Gagal menghapus template chat'));
  } finally {
    deleting.value = false;
  }
}

function openImportPicker() {
  if (readingImport.value || importing.value) return;
  importInput.value?.click();
}

async function handleImportFile(event) {
  const input = event?.target;
  const file = input?.files?.[0];
  if (!file) return;
  if (!/\.xlsx?$/i.test(file.name)) {
    toast.error('Pilih file Excel dengan format .xlsx atau .xls');
    input.value = '';
    return;
  }

  readingImport.value = true;
  try {
    const rows = await readChatTemplateWorkbook(file);
    const preview = await importChatTemplates(rows, { dryRun: true });
    importPreview.value = {
      fileName: file.name,
      rows,
      summary: preview?.summary || {
        total: rows.length, create: 0, update: 0, unchanged: 0,
      },
      errors: Array.isArray(preview?.errors) ? preview.errors : [],
    };
  } catch (error) {
    toast.error(apiError(error, 'Gagal membaca file template chat'));
  } finally {
    readingImport.value = false;
    input.value = '';
  }
}

function closeImportPreview() {
  if (importing.value) return;
  importPreview.value = null;
}

async function confirmImport() {
  if (!importPreview.value || importPreview.value.errors.length || importing.value) return;
  importing.value = true;
  try {
    const result = await importChatTemplates(importPreview.value.rows);
    const created = Number(result?.summary?.create || 0);
    const updated = Number(result?.summary?.update || 0);
    const unchanged = Number(result?.summary?.unchanged || 0);
    toast.success(`Import selesai: ${created} baru, ${updated} diperbarui, ${unchanged} tanpa perubahan`);
    importPreview.value = null;
    search.value = '';
    currentPage.value = 1;
  } catch (error) {
    const validationErrors = error?.response?.data?.errors;
    if (Array.isArray(validationErrors) && validationErrors.length) {
      importPreview.value.errors = validationErrors;
      importPreview.value.summary = error?.response?.data?.summary || importPreview.value.summary;
    }
    toast.error(apiError(error, 'Gagal mengimport template chat'));
  } finally {
    importing.value = false;
  }
}

async function exportTemplates() {
  if (exporting.value) return;
  exporting.value = true;
  try {
    await downloadChatTemplateWorkbook(chatTemplates.value);
    toast.success('Template chat berhasil diexport');
  } catch (error) {
    toast.error(error?.message || 'Gagal mengekspor template chat');
  } finally {
    exporting.value = false;
  }
}

async function downloadFormat() {
  if (downloadingFormat.value) return;
  downloadingFormat.value = true;
  try {
    await downloadChatTemplateWorkbook([], { empty: true });
  } catch (error) {
    toast.error(error?.message || 'Gagal menyiapkan format Excel');
  } finally {
    downloadingFormat.value = false;
  }
}

async function refresh() {
  try {
    await loadChatTemplates({ force: true });
  } catch (error) {
    toast.error(apiError(error, 'Gagal memuat template chat'));
  }
}

onMounted(() => refresh());
</script>

<style scoped>
.chat-templates-page { padding: 28px; color: var(--theme-text); }
.page-header, .toolbar, .template-card footer, .template-card-header, .template-modal header, .modal-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.page-header { margin-bottom: 22px; align-items: flex-start; }
.page-header h2 { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 26px; }
.page-header h2 svg { width: 28px; color: var(--theme-accent); }
.page-header p, .template-modal header p { margin: 7px 0 0; color: var(--theme-text-muted); }
.page-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 9px; }
.visually-hidden { position: fixed; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none; }
.content-card, .template-modal, .confirm-modal, .import-modal { background: var(--theme-surface); border: 1px solid var(--theme-border); border-radius: 18px; box-shadow: var(--theme-shadow); }
.content-card { padding: 22px; }
.toolbar { margin-bottom: 16px; }
.toolbar-actions { display: flex; align-items: center; gap: 10px; }
.page-size-control { min-height: 44px; display: flex; align-items: center; gap: 9px; padding: 0 11px 0 14px; border: 1px solid var(--theme-border); border-radius: 11px; background: var(--theme-surface-soft); color: var(--theme-text-muted); font-size: 13px; font-weight: 600; }
.page-size-control select { min-width: 62px; height: 32px; border: 1px solid var(--theme-border); border-radius: 8px; outline: none; background: var(--theme-input); color: var(--theme-text); padding: 0 8px; font: inherit; font-weight: 700; }
.search-box { flex: 1; min-width: 0; max-width: 720px; display: flex; align-items: center; gap: 10px; padding: 0 14px; border: 1px solid var(--theme-border); border-radius: 12px; background: var(--theme-input); }
.search-box svg { width: 21px; color: var(--theme-text-muted); }
.search-box input { width: 100%; height: 46px; border: 0; outline: 0; background: transparent; color: var(--theme-text); font: inherit; }
.btn-primary, .btn-secondary, .btn-danger { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 11px; padding: 0 17px; font-weight: 700; cursor: pointer; }
.btn-primary { border: 1px solid var(--theme-accent); background: var(--theme-accent); color: white; }
.btn-secondary { border: 1px solid var(--theme-border); background: var(--theme-surface-elevated); color: var(--theme-text); }
.btn-import-action, .btn-export-action { padding-inline: 20px; border-radius: 10px; font-weight: 600; transition: all .2s ease; }
.btn-import-action { border-color: transparent; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; box-shadow: 0 2px 8px rgba(59, 130, 246, .3); }
.btn-import-action:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, .4); }
.btn-export-action { border-color: transparent; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; box-shadow: 0 2px 8px rgba(16, 185, 129, .3); }
.btn-export-action:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, .4); }
.btn-danger { border: 1px solid #b91c1c; background: #dc2626; color: white; }
button:disabled { opacity: .55; cursor: not-allowed; }
.btn-primary svg, .btn-secondary svg { width: 19px; }
.variable-note { padding: 13px 15px; margin-bottom: 20px; border: 1px solid var(--theme-info-border); border-radius: 12px; background: var(--theme-info-soft); color: var(--theme-info-text); }
code, .variable-badge { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 16px; }
.template-card { min-width: 0; padding: 18px; border: 1px solid var(--theme-border); border-radius: 14px; background: var(--theme-surface-elevated); }
.template-card h3 { margin: 0; font-size: 17px; overflow-wrap: anywhere; }
.variable-badge { flex: none; padding: 4px 8px; border-radius: 999px; color: var(--theme-accent); background: var(--theme-accent-soft); font-size: 12px; font-weight: 700; }
.message-preview { min-height: 112px; max-height: 190px; margin: 15px 0; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--theme-text-secondary); line-height: 1.55; }
.template-card footer { padding-top: 13px; border-top: 1px solid var(--theme-border); color: var(--theme-text-muted); font-size: 12px; }
.pagination { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--theme-border); }
.pagination-summary { color: var(--theme-text-muted); font-size: 13px; }
.pagination-controls { display: flex; align-items: center; gap: 7px; }
.page-button { min-width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--theme-border); border-radius: 9px; background: var(--theme-surface-soft); color: var(--theme-text-secondary); font-weight: 700; cursor: pointer; transition: border-color .18s ease, background .18s ease, color .18s ease; }
.page-button:hover:not(:disabled) { border-color: var(--theme-info-border); background: var(--theme-info-soft); color: var(--theme-accent); }
.page-button.active { border-color: #2563eb; background: #2563eb; color: #ffffff; }
.page-button:disabled { opacity: .45; cursor: not-allowed; }
.page-navigation { padding: 0 12px; }
.page-navigation svg { width: 16px; height: 16px; }
.card-actions { display: flex; gap: 7px; }
.btn-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 10px; cursor: pointer; }
.btn-icon svg { width: 18px; }
.btn-icon.edit { border: 1px solid var(--theme-info-border); background: var(--theme-accent-soft); color: var(--theme-accent); }
.btn-icon.delete { border: 1px solid var(--theme-danger-border); background: var(--theme-danger-soft); color: var(--theme-danger-text); }
.empty-state { min-height: 310px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--theme-text-muted); }
.empty-state > svg { width: 56px; }
.empty-state h3 { margin: 14px 0 0; color: var(--theme-text); }
.empty-state p { margin: 7px 0 15px; }
.spinner { width: 34px; height: 34px; border: 3px solid var(--theme-border); border-top-color: var(--theme-accent); border-radius: 50%; animation: spin .8s linear infinite; }
.modal-overlay { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 20px; background: rgba(2, 6, 23, .72); }
.template-modal { width: min(700px, 100%); max-height: calc(100dvh - 40px); overflow: auto; }
.template-modal header { padding: 20px 22px; border-bottom: 1px solid var(--theme-border); align-items: flex-start; }
.template-modal h3, .confirm-modal h3 { margin: 0; }
.btn-close { width: 38px; height: 38px; border: 1px solid var(--theme-border); border-radius: 10px; background: var(--theme-surface-elevated); color: var(--theme-text); font-size: 25px; cursor: pointer; }
.modal-body { display: grid; gap: 19px; padding: 22px; }
.modal-body label { display: grid; gap: 8px; font-weight: 700; }
.modal-body input, .modal-body textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--theme-border); border-radius: 11px; background: var(--theme-input); color: var(--theme-text); padding: 12px 14px; font: inherit; resize: vertical; }
.modal-body small { color: var(--theme-text-muted); font-weight: 400; }
.modal-body strong { color: var(--theme-danger-text); }
.template-modal > .modal-actions { padding: 17px 22px; border-top: 1px solid var(--theme-border); justify-content: flex-end; }
.confirm-modal { width: min(430px, 100%); padding: 24px; }
.confirm-modal p { color: var(--theme-text-secondary); line-height: 1.5; }
.confirm-modal .modal-actions { justify-content: flex-end; margin-top: 22px; }
.import-modal { width: min(720px, 100%); max-height: calc(100dvh - 40px); overflow: auto; }
.import-modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 22px; border-bottom: 1px solid var(--theme-border); }
.import-modal-header h3 { margin: 0; }
.import-modal-header p { margin: 6px 0 0; color: var(--theme-text-muted); overflow-wrap: anywhere; }
.import-modal-body { display: grid; gap: 16px; padding: 22px; }
.import-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 11px; }
.import-summary > div { display: grid; gap: 4px; padding: 15px; border: 1px solid var(--theme-border); border-radius: 12px; background: var(--theme-surface-soft); }
.import-summary strong { color: var(--theme-text); font-size: 24px; }
.import-summary span { color: var(--theme-text-muted); font-size: 12px; font-weight: 700; }
.import-validation { padding: 15px 16px; border: 1px solid; border-radius: 12px; line-height: 1.5; }
.import-validation p { margin: 5px 0 0; }
.import-validation ul { max-height: 220px; margin: 12px 0 0; padding-left: 20px; overflow: auto; }
.import-validation.error { border-color: var(--theme-danger-border); background: var(--theme-danger-soft); color: var(--theme-danger-text); }
.import-validation.success { border-color: var(--theme-success-border); background: var(--theme-success-soft); color: var(--theme-success-text); }
.import-note { margin: 0; color: var(--theme-text-muted); font-size: 13px; }
.import-modal-actions { justify-content: flex-end; padding: 17px 22px; border-top: 1px solid var(--theme-border); }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 700px) {
  .chat-templates-page { padding: 16px 12px 30px; }
  .page-header, .toolbar { align-items: stretch; flex-direction: column; }
  .page-actions { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }
  .page-actions button, .toolbar .btn-secondary { width: 100%; }
  .toolbar-actions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .page-size-control { justify-content: space-between; }
  .content-card { padding: 14px; border-radius: 14px; }
  .template-grid { grid-template-columns: 1fr; }
  .pagination { align-items: stretch; flex-direction: column; }
  .pagination-summary { text-align: center; }
  .pagination-controls { justify-content: center; }
  .page-navigation span { display: none; }
  .page-navigation { min-width: 40px; padding: 0 8px; }
  .modal-overlay { align-items: end; padding: 0; }
  .template-modal, .confirm-modal, .import-modal { width: 100%; max-height: 92dvh; border-radius: 20px 20px 0 0; }
  .template-modal > .modal-actions, .confirm-modal .modal-actions, .import-modal-actions { display: grid; grid-template-columns: 1fr 1fr; }
  .import-summary { grid-template-columns: 1fr; }
}
@media (max-width: 430px) {
  .page-actions { grid-template-columns: 1fr; }
}
</style>
