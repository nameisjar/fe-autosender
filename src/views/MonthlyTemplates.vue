<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg
            class="header-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M9 13l2 2 4-4" />
            <line x1="9" y1="17" x2="15" y2="17" />
          </svg>
          Templates Bulanan
        </h2>
        <p class="subtitle">Kelola template data bulanan untuk feedback Algorithmics</p>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <div>
            <div class="stat-value">{{ templates.length }}</div>
            <div class="stat-label">Total Templates</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1-3-3h7z" />
          </svg>
          <div>
            <div class="stat-value">{{ courses.length }}</div>
            <div class="stat-label">Total Kursus</div>
          </div>
        </div>
      </div>
    </div>

    <section class="create-card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import Data dari Excel
        </h3>
      </div>

      <div class="import-section">
        <div class="import-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>
            Upload file Excel (.xlsx) dengan format: Nama Course, Code, Bulan Ke, Level,
            Topik Modul, Hasil, Keahlian yang Didapatkan
          </p>
        </div>

        <div class="import-actions">
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls"
            style="display: none"
            @change="onFileChange"
          />
          <button class="btn-import" @click="triggerImport" :disabled="importing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {{ importing ? "Mengimpor..." : "Import Excel" }}
          </button>
          <button
            class="btn-export"
            @click="exportTemplate"
            :disabled="!templates.length"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>
    </section>

    <section class="list-card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            />
            <rect x="8" y="2" width="8" height="4" rx="1" />
          </svg>
          Daftar Templates ({{ templates.length }})
        </h3>
        <button class="btn-reload" @click="loadTemplates" :disabled="loading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
            />
          </svg>
          {{ loading ? "Memuat..." : "Muat Ulang" }}
        </button>
      </div>

      <div class="toolbar-section">
        <div class="filter-group">
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input v-model="searchQuery" placeholder="Cari nama course atau code..." />
          </div>

          <div class="course-filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M7 12h10M10 18h4" />
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
          <button class="btn-collapse" @click="collapseAll" v-if="courses.length">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            Tutup Semua
          </button>
          <button class="btn-expand" @click="expandAll" v-if="courses.length">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            Buka Semua
          </button>
          <button class="btn-add-new" @click="openAddModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Template
          </button>
        </div>
      </div>

      <div class="templates-container" v-if="courses.length">
        <div v-for="course in courses" :key="course" class="course-group">
          <div class="course-header" @click="toggleGroup(course)">
            <div class="header-left">
              <svg
                class="chevron-icon"
                :class="{ open: !collapsed[course] }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <div class="course-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1-3-3h7z" />
                </svg>
              </div>
              <h4>{{ course }}</h4>
              <span class="course-count">{{ grouped[course].length }} template</span>
            </div>
          </div>

          <div class="course-body" v-show="!collapsed[course]">
            <div class="templates-grid">
              <div
                v-for="template in grouped[course]"
                :key="template.id"
                class="template-card"
              >
                <div class="template-header">
                  <div class="month-badge">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Bulan {{ template.month }}
                  </div>
                  <span class="level-badge">{{ template.level }}</span>
                </div>

                <div class="template-body">
                  <div class="template-field">
                    <label>Code:</label>
                    <span>{{ template.code }}</span>
                  </div>
                  <div class="template-field">
                    <label>Topik Modul:</label>
                    <p>{{ template.topicModule }}</p>
                  </div>
                  <div class="template-field">
                    <label>Keahlian yang Didapatkan:</label>
                    <p>{{ template.skillsAcquired }}</p>
                  </div>
                </div>

                <div class="template-footer">
                  <button class="btn-view" @click="viewTemplate(template)">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Lihat Detail
                  </button>
                  <button class="btn-edit" @click="editTemplate(template)">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    class="btn-delete"
                    @click="confirmDelete(template)"
                    :disabled="deleting"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <h3>Belum Ada Template</h3>
        <p>Import data dari Excel untuk menambahkan template</p>
      </div>
    </section>

    <!-- View Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="detail-modal" @click.stop>
        <div class="modal-header">
          <h3>Detail Template</h3>
          <button class="btn-close" @click="closeDetailModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body" v-if="selectedTemplate">
          <div class="detail-row">
            <label>Nama Course:</label>
            <span>{{ selectedTemplate.courseName }}</span>
          </div>
          <div class="detail-row">
            <label>Code:</label>
            <span>{{ selectedTemplate.code }}</span>
          </div>
          <div class="detail-row">
            <label>Bulan Ke:</label>
            <span>{{ selectedTemplate.month }}</span>
          </div>
          <div class="detail-row">
            <label>Level:</label>
            <span>{{ selectedTemplate.level }}</span>
          </div>
          <div class="detail-row full">
            <label>Topik Modul:</label>
            <p>{{ selectedTemplate.topicModule }}</p>
          </div>
          <div class="detail-row full">
            <label>Hasil:</label>
            <p>{{ selectedTemplate.result }}</p>
          </div>
          <div class="detail-row full">
            <label>Keahlian yang Didapatkan:</label>
            <p>{{ selectedTemplate.skillsAcquired }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showFormModal" class="modal-overlay" @click="closeFormModal">
      <div class="form-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? "Edit Template" : "Tambah Template Baru" }}</h3>
          <button class="btn-close" @click="closeFormModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveTemplate">
            <div class="form-grid">
              <div class="form-group">
                <label for="courseName"
                  >Nama Course <span class="required">*</span></label
                >
                <input
                  id="courseName"
                  v-model="formData.courseName"
                  type="text"
                  placeholder="Contoh: Python Start"
                  required
                />
              </div>

              <div class="form-group">
                <label for="code">Code <span class="required">*</span></label>
                <input
                  id="code"
                  v-model="formData.code"
                  type="text"
                  placeholder="Contoh: PS"
                  required
                />
              </div>

              <div class="form-group">
                <label for="month">Bulan Ke <span class="required">*</span></label>
                <input
                  id="month"
                  v-model.number="formData.month"
                  type="number"
                  min="1"
                  max="24"
                  placeholder="1-24"
                  required
                />
              </div>

              <div class="form-group">
                <label for="level">Level <span class="required">*</span></label>
                <input
                  id="level"
                  v-model="formData.level"
                  type="text"
                  placeholder="Contoh: Junior"
                  required
                />
              </div>

              <div class="form-group full">
                <label for="topicModule"
                  >Topik Modul <span class="required">*</span></label
                >
                <textarea
                  id="topicModule"
                  v-model="formData.topicModule"
                  rows="3"
                  placeholder="Masukkan topik modul yang dipelajari..."
                  required
                ></textarea>
              </div>

              <div class="form-group full">
                <label for="result">Hasil <span class="required">*</span></label>
                <textarea
                  id="result"
                  v-model="formData.result"
                  rows="3"
                  placeholder="Masukkan hasil pembelajaran..."
                  required
                ></textarea>
              </div>

              <div class="form-group full">
                <label for="skillsAcquired"
                  >Keahlian yang Didapatkan <span class="required">*</span></label
                >
                <textarea
                  id="skillsAcquired"
                  v-model="formData.skillsAcquired"
                  rows="3"
                  placeholder="Masukkan keahlian yang didapatkan..."
                  required
                ></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeFormModal">
                Batal
              </button>
              <button type="submit" class="btn-save" :disabled="saving">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                  />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {{
                  saving
                    ? "Menyimpan..."
                    : isEditMode
                    ? "Update Template"
                    : "Simpan Template"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay delete-modal-overlay"
      @click="cancelDelete"
    >
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-icon">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>

        <div class="delete-modal-content">
          <h3>Hapus Template Ini?</h3>
          <p class="delete-warning">
            Tindakan ini tidak dapat dibatalkan. Template feedback akan dihapus secara
            permanen.
          </p>

          <div class="template-preview" v-if="templateToDelete">
            <div class="preview-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div class="preview-info">
              <div class="preview-name">
                {{ templateToDelete.courseName }} - Bulan {{ templateToDelete.month }}
              </div>
              <div class="preview-detail">
                {{
                  templateToDelete.topicModule
                    ? templateToDelete.topicModule.substring(0, 50)
                    : ""
                }}{{
                  templateToDelete.topicModule && templateToDelete.topicModule.length > 50
                    ? "..."
                    : ""
                }}
              </div>
            </div>
          </div>
        </div>

        <div class="delete-modal-actions">
          <button
            type="button"
            class="btn-keep"
            @click="cancelDelete"
            :disabled="deleting"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Batal
          </button>
          <button
            type="button"
            class="btn-delete-confirm"
            @click="handleConfirmDelete"
            :disabled="deleting"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
              <path d="M10 11v6M14 11v6" />
            </svg>
            {{ deleting ? "Menghapus..." : "Ya, Hapus Template" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { userApi } from "../api/http.js";
import { useToast } from "../composables/useToast.js";
import { loadXLSX } from "../utils/xlsx-loader.js";

const toast = useToast();

const templates = ref([]);
const searchQuery = ref("");
const selectedCourse = ref("");
const loading = ref(false);
const importing = ref(false);
const deleting = ref(false);
const fileInput = ref(null);
const collapsed = ref({});

// Modal state
const showDetailModal = ref(false);
const selectedTemplate = ref(null);
const showFormModal = ref(false);
const isEditMode = ref(false);
const formData = ref({
  courseName: "",
  code: "",
  month: 1,
  level: "",
  topicModule: "",
  result: "",
  skillsAcquired: "",
});
const saving = ref(false);

const showDeleteModal = ref(false);
const templateToDelete = ref(null);

const filtered = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const courseFilter = selectedCourse.value;
  return templates.value.filter(
    (t) =>
      (!query ||
        t.courseName?.toLowerCase().includes(query) ||
        t.code?.toLowerCase().includes(query)) &&
      (!courseFilter || t.courseName === courseFilter)
  );
});

const grouped = computed(() => {
  const map = {};
  for (const t of filtered.value) {
    const course = t.courseName || "Unknown";
    (map[course] ||= []).push(t);
  }
  Object.keys(map).forEach((k) =>
    map[k].sort((a, b) => Number(a.month) - Number(b.month))
  );
  return map;
});

const courses = computed(() => Object.keys(grouped.value).sort());
const allCourses = computed(() =>
  [...new Set(templates.value.map((t) => t.courseName))].sort()
);

const toggleGroup = (course) => {
  collapsed.value[course] = !collapsed.value[course];
};

const collapseAll = () => {
  for (const course of courses.value) {
    collapsed.value[course] = true;
  }
};

const expandAll = () => {
  for (const course of courses.value) {
    collapsed.value[course] = false;
  }
};

const loadTemplates = async () => {
  loading.value = true;
  try {
    const { data } = await userApi.get("/algorithmics/monthly-templates");
    templates.value = data.templates || [];
    collapsed.value = {};
  } catch (e) {
    toast.error(e?.response?.data?.message || "Gagal memuat templates");
  } finally {
    loading.value = false;
  }
};

const triggerImport = () => {
  fileInput.value?.click();
};

const onFileChange = async (e) => {
  const file = e?.target?.files?.[0];
  if (!file) return;

  if (!/\.xlsx?$/i.test(file.name)) {
    toast.error("Pilih file Excel (.xlsx)");
    e.target.value = "";
    return;
  }

  importing.value = true;
  try {
    const XLSX = await loadXLSX();
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Skip header row
        const dataRows = rows.slice(1).filter((row) => row.length > 0);

        // PERBAIKAN: Sesuaikan urutan kolom dengan export
        // Export: Nama Course, Code, Bulan Ke, Level, Topik Modul, Hasil, Keahlian yang Didapatkan
        const importData = dataRows.map((row) => ({
          courseName: row[0] || "", // Nama Course
          code: row[1] || "", // Code
          month: Number(row[2]) || 1, // Bulan Ke
          level: row[3] || "", // Level
          topicModule: row[4] || "", // Topik Modul
          result: row[5] || "", // Hasil
          skillsAcquired: row[6] || "", // Keahlian yang Didapatkan
        }));

        // Send to backend
        await userApi.post("/algorithmics/monthly-templates/import", {
          templates: importData,
        });
        toast.success(`Berhasil mengimport ${importData.length} template`);
        await loadTemplates();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Gagal mengimport data");
      } finally {
        importing.value = false;
        if (fileInput.value) fileInput.value.value = "";
      }
    };

    reader.onerror = () => {
      toast.error("Gagal membaca file");
      importing.value = false;
      if (fileInput.value) fileInput.value.value = "";
    };

    reader.readAsBinaryString(file);
  } catch (e) {
    toast.error("Gagal memuat library Excel");
    importing.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
};

const exportTemplate = async () => {
  try {
    const XLSX = await loadXLSX();
    const rows = [
      [
        "Nama Course",
        "Code",
        "Bulan Ke",
        "Level",
        "Topik Modul",
        "Hasil",
        "Keahlian yang Didapatkan",
      ],
    ];

    for (const t of templates.value) {
      rows.push([
        t.courseName,
        t.code,
        t.month,
        t.level,
        t.topicModule,
        t.result,
        t.skillsAcquired,
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Templates");
    XLSX.writeFile(wb, "monthly-templates.xlsx");
    toast.success("File berhasil diekspor");
  } catch (e) {
    toast.error("Gagal mengekspor file");
  }
};

const viewTemplate = (template) => {
  selectedTemplate.value = template;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedTemplate.value = null;
};

const openAddModal = () => {
  isEditMode.value = false;
  formData.value = {
    courseName: "",
    code: "",
    month: 1,
    level: "",
    topicModule: "",
    result: "",
    skillsAcquired: "",
  };
  showFormModal.value = true;
};

const editTemplate = (template) => {
  isEditMode.value = true;
  formData.value = { ...template };
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  formData.value = {
    courseName: "",
    code: "",
    month: 1,
    level: "",
    topicModule: "",
    result: "",
    skillsAcquired: "",
  };
};

const saveTemplate = async () => {
  saving.value = true;
  try {
    if (isEditMode.value) {
      await userApi.put(
        `/algorithmics/monthly-templates/${formData.value.id}`,
        formData.value
      );
      toast.success("Template berhasil diperbarui");
    } else {
      await userApi.post("/algorithmics/monthly-templates", formData.value);
      toast.success("Template berhasil ditambahkan");
    }
    await loadTemplates();
    closeFormModal();
  } catch (e) {
    toast.error(e?.response?.data?.message || "Gagal menyimpan template");
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (template) => {
  templateToDelete.value = template;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  templateToDelete.value = null;
};

const handleConfirmDelete = async () => {
  if (!templateToDelete.value) return;

  deleting.value = true;
  try {
    await userApi.delete(`/algorithmics/monthly-templates/${templateToDelete.value.id}`);
    toast.success("Template berhasil dihapus");
    await loadTemplates();
    cancelDelete();
  } catch (e) {
    toast.error(e?.response?.data?.message || "Gagal menghapus template");
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  loadTemplates();
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
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* Cards */
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
}

.btn-reload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reload svg {
  width: 18px;
  height: 18px;
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
  padding: 12px 10px;
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

.btn-collapse,
.btn-expand,
.btn-add-new {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-collapse,
.btn-expand {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-collapse:hover,
.btn-expand:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-add-new {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-add-new:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-collapse svg,
.btn-expand svg,
.btn-add-new svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.month-badge svg {
  width: 14px;
  height: 14px;
}

.level-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.template-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-field label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.template-field span {
  display: block;
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}

.template-field p {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
  max-height: 100px;
  overflow-y: auto;
}

.template-footer {
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  gap: 8px;
}

.btn-view,
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

.btn-view {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0369a1;
  border-color: #7dd3fc;
}

.btn-view:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  transform: translateY(-1px);
}

.btn-edit {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-color: #fcd34d;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
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

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-view svg,
.btn-edit svg,
.btn-delete svg {
  width: 14px;
  height: 14px;
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

.detail-modal,
.form-modal,
.delete-modal {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.detail-row {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-row.full {
  grid-column: 1 / -1;
}

.detail-row label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-row span {
  display: block;
  color: #1e293b;
  font-size: 15px;
  font-weight: 500;
}

.detail-row p {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-save {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save svg {
  width: 18px;
  height: 18px;
}

/* Delete Modal */
.delete-modal-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle svg {
  width: 32px;
  height: 32px;
  color: #dc2626;
}

.delete-modal-content {
  text-align: center;
  padding: 24px;
}

.delete-modal-content h3 {
  margin: 16px 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.delete-warning {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.template-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.preview-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-icon svg {
  width: 20px;
  height: 20px;
  color: #1e40af;
}

.preview-info {
  text-align: left;
}

.preview-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.preview-detail {
  font-size: 13px;
  color: #64748b;
}

.delete-modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-keep,
.btn-delete-confirm {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-keep {
  background: #f1f5f9;
  color: #475569;
}

.btn-keep:hover {
  background: #e2e8f0;
}

.btn-delete-confirm {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  color: #ffffff;
}

.btn-delete-confirm:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-keep svg,
.btn-delete-confirm svg {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .wrapper {
    padding: 0 16px;
  }

  .import-section {
    flex-direction: column;
    align-items: stretch;
  }

  .import-info {
    min-width: unset;
  }

  .import-actions {
    width: 100%;
  }

  .btn-import,
  .btn-export {
    flex: 1;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```
