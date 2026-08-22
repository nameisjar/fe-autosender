<template>
  <div class="wrapper custom-feedback-page">
    <header class="page-header">
      <div>
        <h1>Feedback Bulanan (Algo Custom)</h1>
        <p>Tempel nama dari Google Sheets, atur feedback per siswa, lalu download PDF tanpa mengirim WhatsApp.</p>
      </div>
      <div class="header-badge">Download only</div>
    </header>

    <section class="panel defaults-panel">
      <div class="panel-heading">
        <div>
          <h2>Pengaturan Default</h2>
          <p>Isi nilai default, lalu pilih kelompok pengaturan yang ingin diterapkan.</p>
        </div>
      </div>

      <div class="defaults-sections">
        <section class="defaults-group">
          <div class="defaults-group-heading">
            <div>
              <strong>Default Feedback</strong>
              <span>Course, bulan, dan video proyek siswa.</span>
            </div>
            <button
              class="btn btn-secondary apply-feedback-defaults"
              type="button"
              :disabled="students.length === 0"
              @click="applyFeedbackDefaults"
            >
              Terapkan Feedback ke {{ selectedIds.length ? `${selectedIds.length} siswa` : "semua siswa" }}
            </button>
          </div>
          <div class="defaults-grid feedback-defaults-grid">
            <label>
              <span>Course <b>*</b></span>
              <select
                v-model="defaults.courseName"
                class="default-course"
                :disabled="templatesLoading"
                @focus="ensureCoursesLoaded"
                @change="normalizeDefaultMonth"
              >
                <option value="">Pilih course...</option>
                <option v-if="templatesLoading" value="" disabled>Memuat course...</option>
                <option v-else-if="courses.length === 0" value="" disabled>Course tidak ditemukan</option>
                <option v-for="course in courses" :key="course" :value="course">{{ course }}</option>
              </select>
            </label>
            <label>
              <span>Bulan <b>*</b></span>
              <select v-model.number="defaults.month" class="default-month" :disabled="!defaults.courseName">
                <option :value="null">Pilih bulan...</option>
                <option v-for="month in monthsForCourse(defaults.courseName)" :key="month" :value="month">
                  {{ month }}
                </option>
              </select>
            </label>
            <label>
              <span>Link YouTube <b>*</b></span>
              <input v-model.trim="defaults.youtubeLink" class="default-youtube" type="url" placeholder="https://youtu.be/..." />
            </label>
          </div>
        </section>

        <section class="defaults-group identity-defaults-group">
          <div class="defaults-group-heading">
            <div>
              <strong>Identitas Laporan & Referral</strong>
              <span>Nama pembuat laporan dan tautan referral tutor.</span>
            </div>
            <button
              class="btn btn-secondary apply-identity-defaults"
              type="button"
              :disabled="students.length === 0"
              @click="applyIdentityDefaults"
            >
              Terapkan Identitas ke {{ selectedIds.length ? `${selectedIds.length} siswa` : "semua siswa" }}
            </button>
          </div>
          <div class="defaults-grid identity-defaults-grid">
            <label>
              <span>Laporan dibuat oleh <b>*</b></span>
              <input v-model.trim="defaults.reportBy" class="default-report-by" placeholder="Nama tutor" />
            </label>
            <label>
              <span>Link Referral <b>*</b></span>
              <input v-model.trim="defaults.referralLink" class="default-referral" type="url" placeholder="https://algonova.id/invite?..." />
            </label>
          </div>
        </section>
      </div>
    </section>

    <section class="panel paste-panel">
      <div class="panel-heading">
        <div>
          <h2>Tempel Nama Siswa</h2>
          <p>Salin satu kolom nama dari Google Sheets. Setiap baris akan menjadi satu siswa.</p>
        </div>
        <span class="student-count">{{ students.length }} siswa</span>
      </div>
      <div class="paste-layout">
        <textarea
          v-model="pastedNames"
          rows="5"
          placeholder="Mathew Enrico&#10;Yuri Yuri&#10;Jayantikayalavira Zalba"
          @paste="handlePaste"
        ></textarea>
        <div class="paste-actions">
          <button class="btn btn-primary" type="button" :disabled="!pastedNames.trim()" @click="addPastedNames">
            Tambahkan Nama
          </button>
          <button class="btn btn-secondary" type="button" :disabled="!pastedNames" @click="pastedNames = ''">
            Bersihkan
          </button>
          <small>Jika beberapa kolom ikut tersalin, aplikasi hanya memakai kolom pertama sebagai nama.</small>
        </div>
      </div>
    </section>

    <section class="panel table-panel">
      <div class="panel-heading table-heading">
        <div>
          <h2>Data Feedback Siswa</h2>
          <p>Komentar bersifat opsional. Pilih maksimal 3 komentar untuk setiap siswa.</p>
        </div>
        <div class="validation-summary" :class="{ valid: students.length && invalidCount === 0 }">
          <button
            v-if="templatesError || (!templatesLoading && courses.length === 0)"
            class="btn-reload-course"
            type="button"
            :disabled="templatesLoading"
            @click="loadTemplates"
          >
            Muat ulang course
          </button>
          <span v-else-if="templatesLoading">Memuat course...</span>
          <span>{{ validCount }} siap</span>
          <span v-if="invalidCount">{{ invalidCount }} belum lengkap</span>
        </div>
      </div>

      <div v-if="students.length === 0" class="empty-state">
        <div class="empty-icon">＋</div>
        <strong>Belum ada siswa</strong>
        <span>Tempel nama dari Google Sheets untuk mulai membuat tabel.</span>
      </div>

      <div v-else class="sheet-wrap">
        <table class="feedback-sheet">
          <thead>
            <tr>
              <th class="select-column">
                <input type="checkbox" :checked="allSelected" @change="toggleAll" aria-label="Pilih semua siswa" />
              </th>
              <th class="number-column">No.</th>
              <th class="name-column">Nama Siswa</th>
              <th>Course</th>
              <th>Bulan</th>
              <th>Rating</th>
              <th>Komentar</th>
              <th>Link YouTube</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in students" :key="student.id" :class="{ 'row-invalid': rowErrors(student).length }">
              <td class="select-column">
                <input v-model="selectedIds" type="checkbox" :value="student.id" :aria-label="`Pilih ${student.studentName}`" />
              </td>
              <td class="number-column">{{ index + 1 }}</td>
              <td class="name-column">
                <input v-model.trim="student.studentName" class="cell-input name-input" placeholder="Nama siswa" />
              </td>
              <td>
                <select
                  v-model="student.courseName"
                  class="cell-select course-select"
                  :disabled="templatesLoading"
                  @focus="ensureCoursesLoaded"
                  @change="normalizeStudentMonth(student)"
                >
                  <option value="">Pilih course...</option>
                  <option v-if="templatesLoading" value="" disabled>Memuat course...</option>
                  <option v-else-if="courses.length === 0" value="" disabled>Course tidak ditemukan</option>
                  <option v-for="course in courses" :key="course" :value="course">{{ course }}</option>
                </select>
              </td>
              <td>
                <select v-model.number="student.month" class="cell-select month-select" :disabled="!student.courseName">
                  <option :value="null">Pilih...</option>
                  <option v-for="month in monthsForCourse(student.courseName)" :key="month" :value="month">
                    {{ month }}
                  </option>
                </select>
              </td>
              <td>
                <select v-model.number="student.rating" class="cell-select rating-select">
                  <option v-for="rating in 5" :key="rating" :value="rating">{{ rating }} bintang</option>
                </select>
              </td>
              <td class="comments-cell">
                <button class="comment-summary-button" type="button" @click="openCommentModal(student)">
                  <span class="comment-summary-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
                      <path d="M8 9h8M8 13h5" />
                    </svg>
                  </span>
                  <span>
                    <strong>{{ commentSelectionCount(student) ? `${commentSelectionCount(student)}/3 komentar` : "Pilih komentar" }}</strong>
                    <small>{{ commentSelectionSummary(student) }}</small>
                  </span>
                </button>
              </td>
              <td><input v-model.trim="student.youtubeLink" class="cell-input link-input" type="url" placeholder="https://youtu.be/..." /></td>
              <td class="status-cell" @click.stop>
                <span v-if="rowErrors(student).length === 0" class="status-pill ready">Siap</span>
                <template v-else>
                  <button
                    class="status-pill incomplete"
                    type="button"
                    :aria-expanded="expandedStatusId === student.id"
                    @click="toggleStatusDetails(student.id)"
                  >
                    Belum lengkap ({{ rowErrors(student).length }})
                  </button>
                  <div v-if="expandedStatusId === student.id" class="status-popover">
                    <strong>Data yang belum lengkap:</strong>
                    <ul>
                      <li v-for="missing in rowErrors(student)" :key="missing">{{ missing }}</li>
                    </ul>
                  </div>
                </template>
              </td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" type="button" title="Preview PDF" :disabled="rowErrors(student).length > 0" @click="openPreview(student)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button class="icon-btn" type="button" title="Salin caption" @click="copyCaption(student)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                  <button class="icon-btn" type="button" title="Salin komentar tutor" @click="copyTutorFeedback(student)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      <path d="M12 13h5M12 16h4" />
                    </svg>
                  </button>
                  <button class="icon-btn danger" type="button" title="Hapus siswa" @click="removeStudent(student.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="students.length" class="table-footer">
        <button class="btn btn-danger-ghost" type="button" :disabled="selectedIds.length === 0" @click="removeSelected">
          Hapus {{ selectedIds.length || "siswa terpilih" }}
        </button>
        <div class="download-actions">
          <button class="btn btn-secondary" type="button" :disabled="!firstValidStudent || generating" @click="openPreview(firstValidStudent)">
            Preview Pertama
          </button>
          <button class="btn btn-primary" type="button" :disabled="invalidCount > 0 || students.length === 0 || generating" @click="downloadAll">
            <span v-if="generating" class="spinner"></span>
            {{ generating ? `Membuat ${students.length} PDF...` : `Download Semua (${students.length})` }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="commentModalStudent" class="modal-backdrop" @click.self="closeCommentModal">
      <section class="comment-modal" role="dialog" aria-modal="true" :aria-label="`Pilih komentar ${commentModalStudent.studentName}`">
        <header class="comment-modal-header">
          <div>
            <h2>Pilih Komentar</h2>
            <p>{{ commentModalStudent.studentName || "Siswa" }}</p>
          </div>
          <div class="comment-modal-header-actions">
            <span class="comment-limit-badge" :class="{ full: commentDraftCount >= MAX_COMMENTS }">
              {{ commentDraftCount }} / {{ MAX_COMMENTS }}
            </span>
            <button class="modal-close" type="button" @click="closeCommentModal" aria-label="Tutup pilihan komentar">×</button>
          </div>
        </header>

        <div class="comment-modal-scroll">
          <p class="comment-modal-help">
            Pilih maksimal 3 komentar bawaan atau custom. Nama siswa akan disesuaikan otomatis pada PDF.
          </p>

          <section v-for="category in commentCategoryList" :key="category.key" class="comment-picker-category">
            <h3>{{ category.label }}</h3>
            <label
              v-for="(comment, index) in commentCategories[category.key]"
              :key="commentId(category.key, index)"
              class="comment-option"
              :class="{ selected: isDraftCommentSelected(commentId(category.key, index)) }"
            >
              <input
                type="checkbox"
                :checked="isDraftCommentSelected(commentId(category.key, index))"
                :disabled="isDraftCommentDisabled(commentId(category.key, index))"
                @change="toggleDraftComment(commentId(category.key, index))"
              />
              <span>{{ replaceStudentName(comment, commentModalStudent.studentName || "Siswa") }}</span>
            </label>
          </section>

          <section class="comment-picker-category custom-comments-section">
            <div class="custom-comments-heading">
              <div>
                <h3>KOMENTAR CUSTOM</h3>
                <p>Maksimal 250 karakter per komentar. Gunakan <code v-text="'{{firstname}}'"></code> untuk nama siswa.</p>
              </div>
              <button
                class="btn btn-secondary add-custom-comment"
                type="button"
                :disabled="commentDraftCount >= MAX_COMMENTS || commentDraft.customComments.length >= MAX_COMMENTS"
                @click="addDraftCustomComment"
              >
                + Tambah Custom
              </button>
            </div>

            <div v-if="commentDraft.customComments.length" class="custom-comment-list">
              <div v-for="(comment, index) in commentDraft.customComments" :key="comment.id" class="custom-comment-editor">
                <div class="custom-comment-editor-heading">
                  <strong>Komentar custom {{ index + 1 }}</strong>
                  <button type="button" @click="removeDraftCustomComment(comment.id)">Hapus</button>
                </div>
                <textarea
                  v-model="comment.text"
                  rows="3"
                  maxlength="250"
                  placeholder="Tulis komentar custom untuk siswa ini..."
                ></textarea>
                <small>{{ comment.text.length }}/250 karakter</small>
              </div>
            </div>
            <div v-else class="custom-comments-empty">Belum ada komentar custom.</div>
          </section>
        </div>

        <footer class="comment-modal-footer">
          <button class="btn btn-danger-ghost" type="button" :disabled="commentDraftCount === 0" @click="clearDraftComments">
            Hapus Semua Pilihan
          </button>
          <div>
            <button class="btn btn-secondary" type="button" @click="closeCommentModal">Batal</button>
            <button class="btn btn-primary" type="button" @click="saveCommentModal">Simpan Komentar</button>
          </div>
        </footer>
      </section>
    </div>

    <div v-if="previewStudent" class="modal-backdrop" @click.self="closePreview">
      <section class="preview-modal" role="dialog" aria-modal="true" aria-label="Preview feedback siswa">
        <header>
          <div>
            <h2>Preview — {{ previewStudent.studentName }}</h2>
            <p>{{ previewStudent.courseName }} · Bulan {{ previewStudent.month }}</p>
          </div>
          <button class="modal-close" type="button" @click="closePreview" aria-label="Tutup preview">×</button>
        </header>
        <div class="preview-scroll">
          <MonthlyFeedbackPDFTemplate v-if="previewData" :data="previewData" />
        </div>
        <footer>
          <button class="btn btn-secondary" type="button" @click="closePreview">Tutup</button>
          <button class="btn btn-primary" type="button" :disabled="downloadingSingle" @click="downloadSingle(previewStudent)">
            <span v-if="downloadingSingle" class="spinner"></span>
            {{ downloadingSingle ? "Membuat PDF..." : "Download PDF" }}
          </button>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { userApi } from "../api/http.js";
import { useToast } from "../composables/useToast.js";
import MonthlyFeedbackPDFTemplate from "../components/MonthlyFeedbackPDFTemplate.vue";
import { buildMonthlyFeedbackCaption } from "../utils/monthlyFeedbackCaption.js";

const toast = useToast();
let rowSequence = 0;

const commentCategories = {
  kehadiran: [
    "M. Alghifari Setyawan selalu hadir di setiap sesi pelajaran dan menunjukkan antusiasme yang tinggi. Kami sangat menghargai kehadirannya yang konsisten, ini adalah langkah penting dalam proses belajarnya. Terus semangat, ya!",
    "M. Alghifari Setyawan mengikuti 3 dari 4 sesi pelajaran bulan ini. Kehadirannya cukup baik, dan meskipun ada satu sesi yang terlewat, M. Alghifari Setyawan tetap mengikuti materi dengan baik. Kami yakin kehadiran yang lebih konsisten akan membuat belajarnya lebih maksimal!",
    "M. Alghifari Setyawan hanya hadir di 2 dari 4 sesi bulan ini. Kami melihat kehadiran yang tidak konsisten mulai mempengaruhi kemajuan belajar. Akan lebih baik jika M. Alghifari Setyawan bisa hadir lebih teratur agar tidak tertinggal materi.",
    "M. Alghifari Setyawan hadir hanya di 1 dari 4 sesi pelajaran bulan ini. Kami khawatir ini bisa mempengaruhi pemahaman materi yang diajarkan. Jika memungkinkan, mari kita diskusikan bagaimana agar M. Alghifari Setyawan bisa lebih rutin mengikuti pelajaran.",
    "M. Alghifari Setyawan tidak hadir di seluruh sesi pelajaran bulan ini. Kami ingin membantu agar M. Alghifari Setyawan bisa kembali mengikuti pelajaran dengan lebih baik. Kami akan menghubungi Anda untuk membahas solusi yang tepat.",
  ],
  keterlibatan: [
    "M. Alghifari Setyawan sangat terlibat dalam setiap sesi, aktif berpartisipasi dalam diskusi, dan tidak ragu mengajukan pertanyaan yang mendalam. M. Alghifari Setyawan selalu menunjukkan kemajuan yang baik dan memahami materi dengan cepat. Saya sering memberikan tantangan tambahan untuk membantu M. Alghifari Setyawan terus berkembang dan belajar lebih jauh.",
    "M. Alghifari Setyawan cukup fokus di kelas meskipun jarang bertanya. Namun, M. Alghifari Setyawan selalu memperhatikan dengan baik dan mengikuti instruksi dengan seksama. Mungkin dengan lebih banyak berpartisipasi dalam diskusi, M. Alghifari Setyawan bisa meningkatkan pemahaman materi. Secara keseluruhan, M. Alghifari Setyawan sudah menunjukkan perkembangan yang positif.",
    "M. Alghifari Setyawan cenderung lebih diam di kelas dan jarang terlibat dalam diskusi. Kami menyarankan agar M. Alghifari Setyawan lebih terbuka untuk bertanya atau berinteraksi sehingga bisa lebih mudah memahami materi. Jika ada kendala tertentu, kami siap membantu agar suasana kelas lebih nyaman untuk belajar.",
    "M. Alghifari Setyawan tampak mengalami kesulitan dalam mengikuti pelajaran terakhir. Kurangnya fokus menyebabkan M. Alghifari Setyawan tidak sepenuhnya menangkap materi. Kami menyarankan agar M. Alghifari Setyawan lebih terlibat aktif dalam kelas agar pemahaman terhadap pelajaran meningkat. Jika Anda memerlukan bantuan atau rekaman kelas, kami siap memberikan dukungan tambahan.",
  ],
  penyelesaian: [
    "M. Alghifari Setyawan telah berhasil menyelesaikan semua tugas dengan sangat baik. Pemahamannya terhadap materi sangat jelas, dan M. Alghifari Setyawan mampu menyelesaikan setiap tugas tepat waktu. Senang sekali melihat kemajuannya yang terus meningkat. Terus lanjutkan usaha ini, ya!",
    "M. Alghifari Setyawan berhasil menyelesaikan sebagian besar tugas dengan baik, namun ada beberapa area yang memerlukan sedikit perbaikan. Dengan latihan tambahan dan perhatian lebih, M. Alghifari Setyawan pasti akan bisa meningkatkan kualitas tugas-tugasnya dan mencapai hasil yang lebih baik lagi.",
    "M. Alghifari Setyawan tampaknya menghadapi beberapa tantangan dalam menyelesaikan tugas kali ini. Sangat penting bagi M. Alghifari Setyawan untuk meluangkan lebih banyak waktu dalam berlatih agar pemahamannya terhadap materi semakin kuat. Kami berharap M. Alghifari Setyawan bisa mengejar ketinggalan. Jika ada kesulitan, jangan ragu untuk menghubungi saya, saya siap membantu.",
  ],
};

const MAX_COMMENTS = 3;
const commentCategoryList = [
  { key: "kehadiran", label: "KEHADIRAN" },
  { key: "keterlibatan", label: "KETERLIBATAN & KESULITAN" },
  { key: "penyelesaian", label: "PENYELESAIAN TUGAS" },
];
const commentId = (categoryKey, index) => `${categoryKey}:${index}`;

const templates = ref([]);
const students = ref([]);
const selectedIds = ref([]);
const pastedNames = ref("");
const previewStudent = ref(null);
const generating = ref(false);
const downloadingSingle = ref(false);
const templatesLoading = ref(false);
const templatesError = ref("");
const expandedStatusId = ref(null);
const commentModalStudentId = ref(null);
const commentDraft = ref({ selectedComments: [], customComments: [] });
let customCommentSequence = 0;
const defaults = ref({
  courseName: "",
  month: null,
  youtubeLink: "",
  referralLink: "",
  reportBy: "",
});

const courses = computed(() =>
  [...new Set(templates.value.map((template) => template.courseName).filter(Boolean))].sort(),
);

const monthsForCourse = (courseName) =>
  templates.value
    .filter((template) => template.courseName === courseName)
    .map((template) => Number(template.month))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

const normalizeStudentMonth = (student) => {
  if (!monthsForCourse(student.courseName).includes(Number(student.month))) student.month = null;
};

const normalizeDefaultMonth = () => {
  if (!monthsForCourse(defaults.value.courseName).includes(Number(defaults.value.month))) {
    defaults.value.month = null;
  }
};

const normalizeLoadedDefaults = () => {
  if (defaults.value.courseName && !courses.value.includes(defaults.value.courseName)) {
    defaults.value.courseName = "";
    defaults.value.month = null;
    return;
  }
  if (defaults.value.courseName) normalizeDefaultMonth();
};

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const rowErrors = (student) => {
  const errors = [];
  if (!student.studentName?.trim()) errors.push("Nama belum diisi");
  if (!student.courseName) errors.push("Course belum dipilih");
  if (!student.month) errors.push("Bulan belum dipilih");
  if (!isHttpUrl(student.youtubeLink)) errors.push("Link YouTube belum valid");
  if (!isHttpUrl(student.referralLink)) errors.push("Link referral belum valid");
  if (!student.reportBy?.trim()) errors.push("Nama tutor belum diisi");
  return errors;
};

const validCount = computed(() => students.value.filter((student) => rowErrors(student).length === 0).length);
const invalidCount = computed(() => students.value.length - validCount.value);
const firstValidStudent = computed(() => students.value.find((student) => rowErrors(student).length === 0) || null);
const allSelected = computed(() => students.value.length > 0 && selectedIds.value.length === students.value.length);
const commentModalStudent = computed(() =>
  students.value.find((student) => student.id === commentModalStudentId.value) || null,
);
const commentDraftCount = computed(() =>
  commentDraft.value.selectedComments.length + commentDraft.value.customComments.length,
);

const newStudent = (studentName) => ({
  id: `custom-feedback-${Date.now()}-${++rowSequence}`,
  studentName: studentName.trim(),
  courseName: defaults.value.courseName,
  month: defaults.value.month,
  selectedComments: [],
  customComments: [],
  youtubeLink: defaults.value.youtubeLink,
  referralLink: defaults.value.referralLink,
  reportBy: defaults.value.reportBy,
  rating: 5,
});

const parseNames = (value) =>
  value
    .split(/\r?\n/)
    .map((line) => line.split("\t")[0].trim())
    .filter(Boolean);

const addPastedNames = () => {
  const existingNames = new Set(students.value.map((item) => item.studentName.toLocaleLowerCase("id-ID")));
  const names = parseNames(pastedNames.value);
  let skipped = 0;

  names.forEach((name) => {
    const normalized = name.toLocaleLowerCase("id-ID");
    if (existingNames.has(normalized)) {
      skipped += 1;
      return;
    }
    existingNames.add(normalized);
    students.value.push(newStudent(name));
  });

  pastedNames.value = "";
  if (names.length - skipped > 0) toast.success(`${names.length - skipped} siswa berhasil ditambahkan`);
  if (skipped > 0) toast.warning(`${skipped} nama duplikat dilewati`);
};

const handlePaste = () => {
  window.setTimeout(() => {
    if (parseNames(pastedNames.value).length > 1) addPastedNames();
  }, 0);
};

const defaultTargets = () => {
  const targetIds = selectedIds.value.length ? new Set(selectedIds.value) : null;
  const targets = targetIds
    ? students.value.filter((student) => targetIds.has(student.id))
    : students.value;
  return { targets, count: targets.length };
};

const applyFeedbackDefaults = () => {
  const { targets, count } = defaultTargets();
  targets.forEach((student) => {
    student.courseName = defaults.value.courseName;
    student.month = defaults.value.month;
    student.youtubeLink = defaults.value.youtubeLink;
  });
  toast.success(`Default feedback diterapkan ke ${count} siswa`);
};

const applyIdentityDefaults = () => {
  const { targets, count } = defaultTargets();
  targets.forEach((student) => {
    student.referralLink = defaults.value.referralLink;
    student.reportBy = defaults.value.reportBy;
  });
  toast.success(`Identitas laporan diterapkan ke ${count} siswa`);
};

const toggleAll = (event) => {
  selectedIds.value = event.target.checked ? students.value.map((student) => student.id) : [];
};

const toggleStatusDetails = (studentId) => {
  expandedStatusId.value = expandedStatusId.value === studentId ? null : studentId;
};

const normalizedStudentComments = (student) => {
  const selectedComments = Array.isArray(student?.selectedComments)
    ? student.selectedComments.filter((id) => typeof id === "string")
    : [
        student?.attendance ? commentId("kehadiran", Number(student.attendance) - 1) : null,
        student?.engagement ? commentId("keterlibatan", Number(student.engagement) - 1) : null,
        student?.completion ? commentId("penyelesaian", Number(student.completion) - 1) : null,
      ].filter(Boolean);
  const customComments = Array.isArray(student?.customComments)
    ? student.customComments
        .map((comment) => ({
          id: String(comment?.id || `custom-${Date.now()}-${++customCommentSequence}`),
          text: String(comment?.text || "").slice(0, 250),
        }))
        .filter((comment) => comment.text.trim())
    : student?.customComment?.trim()
      ? [{
          id: `custom-${Date.now()}-${++customCommentSequence}`,
          text: String(student.customComment).slice(0, 250),
        }]
      : [];

  const availableSlots = Math.max(0, MAX_COMMENTS - selectedComments.length);
  return {
    selectedComments: selectedComments.slice(0, MAX_COMMENTS),
    customComments: customComments.slice(0, availableSlots),
  };
};

const commentSelectionCount = (student) => {
  const normalized = normalizedStudentComments(student);
  return normalized.selectedComments.length + normalized.customComments.length;
};

const commentSelectionSummary = (student) => {
  const normalized = normalizedStudentComments(student);
  if (!normalized.selectedComments.length && !normalized.customComments.length) {
    return "Belum ada komentar";
  }
  const categoryLabels = commentCategoryList
    .filter((category) => normalized.selectedComments.some((id) => id.startsWith(`${category.key}:`)))
    .map((category) => category.label.replace(" & KESULITAN", ""));
  if (normalized.customComments.length) categoryLabels.push(`${normalized.customComments.length} custom`);
  return categoryLabels.join(" · ");
};

const openCommentModal = (student) => {
  const normalized = normalizedStudentComments(student);
  commentModalStudentId.value = student.id;
  commentDraft.value = {
    selectedComments: [...normalized.selectedComments],
    customComments: normalized.customComments.map((comment) => ({ ...comment })),
  };
};

const closeCommentModal = () => {
  commentModalStudentId.value = null;
  commentDraft.value = { selectedComments: [], customComments: [] };
};

const isDraftCommentSelected = (id) => commentDraft.value.selectedComments.includes(id);
const isDraftCommentDisabled = (id) =>
  !isDraftCommentSelected(id) && commentDraftCount.value >= MAX_COMMENTS;

const toggleDraftComment = (id) => {
  const index = commentDraft.value.selectedComments.indexOf(id);
  if (index >= 0) {
    commentDraft.value.selectedComments.splice(index, 1);
    return;
  }
  if (commentDraftCount.value >= MAX_COMMENTS) {
    toast.warning(`Maksimal ${MAX_COMMENTS} komentar untuk setiap siswa`);
    return;
  }
  commentDraft.value.selectedComments.push(id);
};

const addDraftCustomComment = () => {
  if (commentDraftCount.value >= MAX_COMMENTS) {
    toast.warning(`Maksimal ${MAX_COMMENTS} komentar untuk setiap siswa`);
    return;
  }
  commentDraft.value.customComments.push({
    id: `custom-${Date.now()}-${++customCommentSequence}`,
    text: "",
  });
};

const removeDraftCustomComment = (id) => {
  commentDraft.value.customComments = commentDraft.value.customComments.filter(
    (comment) => comment.id !== id,
  );
};

const clearDraftComments = () => {
  commentDraft.value = { selectedComments: [], customComments: [] };
};

const saveCommentModal = () => {
  const student = commentModalStudent.value;
  if (!student) return;
  const hasEmptyCustom = commentDraft.value.customComments.some((comment) => !comment.text.trim());
  if (hasEmptyCustom) {
    toast.warning("Isi komentar custom atau hapus kolom yang masih kosong");
    return;
  }
  student.selectedComments = [...commentDraft.value.selectedComments];
  student.customComments = commentDraft.value.customComments.map((comment) => ({
    id: comment.id,
    text: comment.text.trim(),
  }));
  student.attendance = null;
  student.engagement = null;
  student.completion = null;
  student.customComment = "";
  toast.success(`Komentar ${student.studentName || "siswa"} berhasil disimpan`);
  closeCommentModal();
};

const closeStatusDetails = () => {
  expandedStatusId.value = null;
};

const handleStatusEscape = (event) => {
  if (event.key !== "Escape") return;
  if (commentModalStudent.value) closeCommentModal();
  else closeStatusDetails();
};

const removeStudent = (id) => {
  students.value = students.value.filter((student) => student.id !== id);
  selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id);
  if (previewStudent.value?.id === id) previewStudent.value = null;
  if (commentModalStudentId.value === id) closeCommentModal();
};

const removeSelected = () => {
  const ids = new Set(selectedIds.value);
  students.value = students.value.filter((student) => !ids.has(student.id));
  selectedIds.value = [];
};

const writeClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard tidak tersedia");
};

const copyCaption = async (student) => {
  if (!student.studentName?.trim()) {
    toast.warning("Isi nama siswa sebelum menyalin caption");
    return;
  }
  if (!student.reportBy?.trim()) {
    toast.warning("Isi nama tutor sebelum menyalin caption");
    return;
  }

  try {
    await writeClipboard(buildMonthlyFeedbackCaption(student));
    toast.success(`Caption ${student.studentName} berhasil disalin`);
  } catch {
    toast.error("Caption gagal disalin");
  }
};

const selectedTemplate = (student) =>
  templates.value.find(
    (template) => template.courseName === student.courseName && Number(template.month) === Number(student.month),
  );

const replaceStudentName = (text, studentName) =>
  String(text || "")
    .replace(/M\. Alghifari Setyawan/g, studentName)
    .replace(/\{\{firstname\}\}/gi, studentName);

const feedbackText = (student) => {
  const normalized = normalizedStudentComments(student);
  const comments = normalized.selectedComments
    .map((id) => {
      const [categoryKey, rawIndex] = String(id).split(":");
      return commentCategories[categoryKey]?.[Number(rawIndex)] || "";
    })
    .filter(Boolean)
    .map((comment) => replaceStudentName(comment, student.studentName));

  normalized.customComments.forEach((comment) => {
    if (comment.text.trim()) {
      comments.push(replaceStudentName(comment.text.trim(), student.studentName));
    }
  });
  return comments.join("\n\n");
};

const copyTutorFeedback = async (student) => {
  const text = feedbackText(student).trim();
  if (!text) {
    toast.warning(`Belum ada komentar untuk ${student.studentName || "siswa"}`);
    return;
  }
  try {
    await writeClipboard(text);
    toast.success(`Komentar ${student.studentName || "siswa"} berhasil disalin`);
  } catch {
    toast.error("Komentar tutor gagal disalin");
  }
};

const buildPayload = (student) => {
  const template = selectedTemplate(student);
  return {
    studentName: student.studentName,
    courseName: student.courseName,
    month: Number(student.month),
    duration: `Bulan ke-${student.month}`,
    level: template?.level || "",
    code: template?.code || "",
    topicModule: template?.topicModule || "",
    result: template?.result || "",
    skillsAcquired: template?.skillsAcquired || "",
    youtubeLink: student.youtubeLink,
    referralLink: student.referralLink,
    tutorComment: feedbackText(student),
    selectedComments: feedbackText(student),
    rating: Number(student.rating) || 5,
    reportBy: student.reportBy,
  };
};

const previewData = computed(() => (previewStudent.value ? buildPayload(previewStudent.value) : null));

const openPreview = (student) => {
  if (!student || rowErrors(student).length) return;
  previewStudent.value = student;
};
const closePreview = () => { previewStudent.value = null; };

const safeFilePart = (value) =>
  String(value || "Siswa")
    .replace(/[<>:"/\\|?*]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 80) || "Siswa";

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

const extractApiError = async (error) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed.message || "Gagal membuat feedback";
    } catch { return "Gagal membuat feedback"; }
  }
  return data?.message || error?.message || "Gagal membuat feedback";
};

const downloadSingle = async (student) => {
  if (!student || rowErrors(student).length) return;
  downloadingSingle.value = true;
  try {
    const response = await userApi.post(
      "/algorithmics/monthly-feedback/custom/download",
      { students: [buildPayload(student)], format: "pdf" },
      { responseType: "blob" },
    );
    downloadBlob(
      response.data,
      `Feedback_${safeFilePart(student.studentName)}_${safeFilePart(student.courseName)}_Bulan${student.month}.pdf`,
    );
    toast.success(`PDF ${student.studentName} berhasil didownload`);
  } catch (error) {
    toast.error(await extractApiError(error));
  } finally {
    downloadingSingle.value = false;
  }
};

const downloadAll = async () => {
  if (!students.value.length || invalidCount.value > 0) {
    toast.error("Lengkapi seluruh baris sebelum download semua PDF");
    return;
  }
  generating.value = true;
  try {
    const response = await userApi.post(
      "/algorithmics/monthly-feedback/custom/download",
      { students: students.value.map(buildPayload), format: "zip" },
      { responseType: "blob" },
    );
    downloadBlob(response.data, `Feedback_Bulanan_Custom_${new Date().toISOString().slice(0, 10)}.zip`);
    toast.success(`${students.value.length} feedback selesai diproses`);
  } catch (error) {
    toast.error(await extractApiError(error));
  } finally {
    generating.value = false;
  }
};

const loadTemplates = async () => {
  if (templatesLoading.value) return;
  templatesLoading.value = true;
  templatesError.value = "";
  try {
    const { data } = await userApi.get("/algorithmics/monthly-templates");
    const rawTemplates = Array.isArray(data)
      ? data
      : Array.isArray(data?.templates)
        ? data.templates
        : Array.isArray(data?.data?.templates)
          ? data.data.templates
          : Array.isArray(data?.data)
            ? data.data
            : [];

    templates.value = rawTemplates
      .map((template) => ({
        ...template,
        courseName: String(template.courseName ?? template.course_name ?? "").trim(),
        month: Number(template.month ?? template.month_number),
      }))
      .filter((template) => template.courseName && Number.isFinite(template.month));

    normalizeLoadedDefaults();

    if (templates.value.length === 0) {
      templatesError.value = "Template course belum tersedia";
      toast.warning(templatesError.value);
    }
  } catch (error) {
    templates.value = [];
    templatesError.value = error?.response?.data?.message || "Gagal memuat template course";
    toast.error("Gagal memuat template course");
  } finally {
    templatesLoading.value = false;
  }
};

const ensureCoursesLoaded = () => {
  if (!templatesLoading.value && courses.value.length === 0) loadTemplates();
};

watch(defaults, (value) => {
  localStorage.setItem("monthlyFeedbackCustom_defaults", JSON.stringify(value));
}, { deep: true });

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem("monthlyFeedbackCustom_defaults") || "null");
    if (saved) {
      defaults.value = {
        courseName: String(saved.courseName || ""),
        month: Number(saved.month) || null,
        youtubeLink: String(saved.youtubeLink || ""),
        reportBy: String(saved.reportBy || ""),
        referralLink: String(saved.referralLink || ""),
      };
    }
  } catch {}
  loadTemplates();
  document.addEventListener("click", closeStatusDetails);
  document.addEventListener("keydown", handleStatusEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeStatusDetails);
  document.removeEventListener("keydown", handleStatusEscape);
});
</script>

<style scoped>
.custom-feedback-page { width: 100%; max-width: none; min-width: 0; margin: 0; padding: 0; box-sizing: border-box; color: var(--text-primary, #182033); }
.page-header, .panel-heading, .table-footer, .preview-modal > header, .preview-modal > footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { margin: 0 0 8px; font-size: 28px; line-height: 1.25; }
.page-header p, .panel-heading p { margin: 0; color: var(--text-secondary, #6b7890); }
.header-badge { padding: 8px 13px; color: #0c8f61; background: rgba(16, 185, 129, .12); border: 1px solid rgba(16, 185, 129, .35); border-radius: 999px; font-weight: 700; white-space: nowrap; }
.panel { margin-bottom: 22px; background: var(--card-bg, #fff); border: 1px solid var(--border-color, #dbe2ee); border-radius: 18px; overflow: hidden; }
.panel-heading { padding: 20px 22px; border-bottom: 1px solid var(--border-color, #dbe2ee); }
.panel-heading h2 { margin: 0 0 5px; font-size: 20px; }
.defaults-sections { display: grid; gap: 18px; padding: 22px; }
.defaults-group { overflow: hidden; background: var(--input-bg, #f7f9fc); border: 1px solid var(--border-color, #dbe2ee); border-radius: 14px; }
.defaults-group-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; border-bottom: 1px solid var(--border-color, #dbe2ee); }
.defaults-group-heading > div { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.defaults-group-heading .btn { flex-shrink: 0; min-height: 36px; padding: 0 12px; font-size: 12px; }
.defaults-group-heading strong { font-size: 14px; color: var(--text-primary, #182033); }
.defaults-group-heading span { color: var(--text-secondary, #6b7890); font-size: 12px; }
.defaults-grid { display: grid; grid-template-columns: repeat(3, minmax(220px, 1fr)); gap: 16px; padding: 16px; }
.identity-defaults-grid { grid-template-columns: repeat(2, minmax(220px, 1fr)); }
.defaults-grid label { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.defaults-grid label span { font-weight: 700; font-size: 13px; }
.defaults-grid b { color: #ef4444; }
input, select, textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--border-color, #ccd6e5); border-radius: 10px; background: var(--input-bg, #fff); color: var(--text-primary, #182033); font: inherit; }
.defaults-grid input, .defaults-grid select { min-height: 45px; padding: 0 13px; }
.paste-layout { display: grid; grid-template-columns: minmax(0, 1fr) 240px; gap: 18px; padding: 22px; }
.paste-layout textarea { min-height: 128px; padding: 14px; resize: vertical; line-height: 1.6; }
.paste-actions { display: flex; flex-direction: column; gap: 10px; }
.paste-actions small { color: var(--text-secondary, #6b7890); line-height: 1.5; }
.student-count { padding: 7px 11px; background: rgba(59, 130, 246, .12); color: #3b82f6; border-radius: 999px; font-weight: 700; }
.btn { min-height: 42px; padding: 0 16px; border: 1px solid transparent; border-radius: 10px; font: inherit; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-primary { background: #3478f6; color: #fff; box-shadow: 0 6px 16px rgba(52, 120, 246, .2); }
.btn-secondary { background: var(--input-bg, #f7f9fc); color: var(--text-primary, #182033); border-color: var(--border-color, #ccd6e5); }
.btn-danger-ghost { color: #ef4444; background: rgba(239, 68, 68, .08); border-color: rgba(239, 68, 68, .3); }
.validation-summary { display: flex; gap: 8px; flex-wrap: wrap; }
.validation-summary span { padding: 6px 10px; border-radius: 999px; color: #d97706; background: rgba(245, 158, 11, .12); font-size: 13px; font-weight: 700; }
.validation-summary.valid span { color: #059669; background: rgba(16, 185, 129, .12); }
.btn-reload-course { padding: 6px 10px; border: 1px solid rgba(59, 130, 246, .35); border-radius: 999px; background: rgba(59, 130, 246, .12); color: #3b82f6; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.btn-reload-course:disabled { opacity: .55; cursor: wait; }
.empty-state { display: flex; min-height: 230px; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: var(--text-secondary, #6b7890); }
.empty-icon { display: grid; place-items: center; width: 52px; height: 52px; color: #3478f6; background: rgba(59, 130, 246, .12); border-radius: 14px; font-size: 30px; }
.sheet-wrap { overflow: auto; max-height: 62vh; }
.feedback-sheet { width: 100%; min-width: 1320px; border-collapse: separate; border-spacing: 0; font-size: 13px; }
.feedback-sheet th { position: sticky; top: 0; z-index: 3; padding: 12px 10px; text-align: left; white-space: nowrap; color: var(--text-primary, #182033); background: var(--table-header-bg, #f0f4fa); border-bottom: 1px solid var(--border-color, #dbe2ee); }
.feedback-sheet td { padding: 9px 8px; vertical-align: top; border-bottom: 1px solid var(--border-color, #e3e8f1); background: var(--card-bg, #fff); }
.feedback-sheet tr.row-invalid td { background: rgba(245, 158, 11, .025); }
.select-column { width: 38px; text-align: center !important; }
.select-column input { width: 17px; height: 17px; accent-color: #3478f6; }
.number-column { width: 42px; text-align: center !important; }
.name-column { position: sticky; left: 0; z-index: 2; min-width: 210px; box-shadow: 1px 0 var(--border-color, #dbe2ee); }
thead .name-column { z-index: 4; }
.cell-input, .cell-select, .cell-textarea { min-height: 38px; padding: 7px 9px; }
.cell-textarea { min-width: 220px; resize: vertical; }
.name-input { min-width: 195px; font-weight: 700; }
.course-select { min-width: 210px; }
.month-select { min-width: 86px; }
.rating-select { min-width: 110px; }
.comments-cell { min-width: 230px; }
.comment-summary-button { width: 100%; min-width: 215px; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid var(--border-color, #ccd6e5); border-radius: 10px; background: var(--input-bg, #f7f9fc); color: var(--text-primary, #182033); text-align: left; cursor: pointer; }
.comment-summary-button:hover { border-color: #3478f6; background: rgba(52, 120, 246, .08); }
.comment-summary-button > span:last-child { min-width: 0; display: grid; gap: 2px; }
.comment-summary-button strong, .comment-summary-button small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.comment-summary-button strong { font-size: 12px; }
.comment-summary-button small { max-width: 170px; color: var(--text-secondary, #6b7890); font-size: 11px; }
.comment-summary-icon { flex: 0 0 30px; width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; background: rgba(52, 120, 246, .13); color: #3478f6; }
.comment-summary-icon svg { width: 17px; height: 17px; }
.link-input { min-width: 230px; }
.status-pill { display: inline-flex; border: 0; border-radius: 999px; padding: 6px 9px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.status-pill.ready { color: #059669; background: rgba(16, 185, 129, .12); }
.status-pill.incomplete { color: #d97706; background: rgba(245, 158, 11, .13); cursor: pointer; }
.status-cell { position: relative; min-width: 145px; }
.status-popover { position: absolute; z-index: 8; top: calc(100% - 4px); right: 8px; width: 250px; padding: 12px 14px; border: 1px solid var(--border-color, #ccd6e5); border-radius: 10px; background: var(--card-bg, #fff); color: var(--text-primary, #182033); box-shadow: 0 12px 30px rgba(0, 0, 0, .18); }
.status-popover strong { display: block; margin-bottom: 7px; font-size: 12px; }
.status-popover ul { margin: 0; padding-left: 18px; color: var(--text-secondary, #6b7890); line-height: 1.55; }
.row-actions { display: flex; min-width: 204px; gap: 6px; }
.icon-btn { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid var(--border-color, #ccd6e5); border-radius: 9px; background: var(--input-bg, #f7f9fc); color: #3478f6; cursor: pointer; }
.icon-btn:disabled { opacity: .35; cursor: not-allowed; }
.icon-btn.danger { color: #ef4444; }
.icon-btn svg { width: 17px; height: 17px; }
.table-footer { padding: 16px 22px; }
.download-actions { display: flex; gap: 10px; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, .35); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(3, 10, 25, .76); backdrop-filter: blur(4px); }
.preview-modal { width: min(920px, 96vw); max-height: 94vh; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg, #fff); border: 1px solid var(--border-color, #dbe2ee); border-radius: 18px; box-shadow: 0 24px 80px rgba(0, 0, 0, .35); }
.preview-modal > header, .preview-modal > footer { padding: 16px 20px; flex: 0 0 auto; }
.preview-modal > header { border-bottom: 1px solid var(--border-color, #dbe2ee); }
.preview-modal > footer { border-top: 1px solid var(--border-color, #dbe2ee); justify-content: flex-end; }
.preview-modal h2 { margin: 0 0 3px; font-size: 19px; }
.preview-modal p { margin: 0; color: var(--text-secondary, #6b7890); }
.modal-close { width: 38px; height: 38px; border: 1px solid var(--border-color, #ccd6e5); border-radius: 10px; background: transparent; color: var(--text-primary, #182033); font-size: 25px; cursor: pointer; }
.preview-scroll { overflow: auto; padding: 18px; background: #d7deea; }
.preview-scroll :deep(.pdf-template) { margin: 0 auto; transform-origin: top center; box-shadow: 0 10px 35px rgba(0,0,0,.22); }

.comment-modal { width: min(920px, 96vw); max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg, #fff); border: 1px solid var(--border-color, #dbe2ee); border-radius: 18px; box-shadow: 0 24px 80px rgba(0, 0, 0, .38); }
.comment-modal-header, .comment-modal-footer { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; }
.comment-modal-header { border-bottom: 1px solid var(--border-color, #dbe2ee); }
.comment-modal-header h2 { margin: 0 0 3px; font-size: 19px; }
.comment-modal-header p { margin: 0; color: var(--text-secondary, #6b7890); }
.comment-modal-header-actions { display: flex; align-items: center; gap: 10px; }
.comment-limit-badge { min-width: 54px; padding: 7px 10px; border-radius: 9px; background: rgba(52, 120, 246, .14); color: #3478f6; font-weight: 800; text-align: center; }
.comment-limit-badge.full { background: rgba(245, 158, 11, .14); color: #d97706; }
.comment-modal-scroll { overflow-y: auto; padding: 18px 20px 22px; }
.comment-modal-help { margin: 0 0 16px; padding: 11px 13px; border: 1px solid rgba(52, 120, 246, .25); border-radius: 10px; background: rgba(52, 120, 246, .08); color: var(--text-secondary, #6b7890); font-size: 13px; line-height: 1.5; }
.comment-picker-category { margin-bottom: 18px; padding: 12px; border: 1px solid var(--border-color, #dbe2ee); border-radius: 13px; background: var(--input-bg, #f7f9fc); }
.comment-picker-category:last-child { margin-bottom: 0; }
.comment-picker-category h3 { margin: 0 0 9px; color: var(--text-primary, #182033); font-size: 12px; letter-spacing: .02em; }
.comment-option { display: grid; grid-template-columns: 20px minmax(0, 1fr); align-items: start; gap: 9px; margin-top: 7px; padding: 10px 11px; border: 1px solid var(--border-color, #dbe2ee); border-radius: 9px; background: var(--card-bg, #fff); color: var(--text-primary, #182033); cursor: pointer; line-height: 1.45; }
.comment-option:hover { border-color: rgba(52, 120, 246, .55); }
.comment-option.selected { border-color: #3478f6; background: rgba(52, 120, 246, .1); }
.comment-option:has(input:disabled) { opacity: .5; cursor: not-allowed; }
.comment-option input { width: 17px; height: 17px; margin: 1px 0 0; accent-color: #3478f6; }
.comment-option span { min-width: 0; font-size: 12px; }
.custom-comments-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.custom-comments-heading h3 { margin-bottom: 3px; }
.custom-comments-heading p { margin: 0; color: var(--text-secondary, #6b7890); font-size: 11px; }
.custom-comments-heading code { color: #d97706; }
.add-custom-comment { min-height: 34px; flex-shrink: 0; padding: 0 11px; font-size: 11px; }
.custom-comment-list { display: grid; gap: 10px; margin-top: 12px; }
.custom-comment-editor { padding: 11px; border: 1px solid var(--border-color, #dbe2ee); border-radius: 10px; background: var(--card-bg, #fff); }
.custom-comment-editor-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
.custom-comment-editor-heading strong { font-size: 12px; }
.custom-comment-editor-heading button { border: 0; background: transparent; color: #ef4444; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
.custom-comment-editor textarea { min-height: 76px; padding: 10px; resize: vertical; line-height: 1.45; }
.custom-comment-editor > small { display: block; margin-top: 5px; color: var(--text-secondary, #6b7890); font-size: 10px; text-align: right; }
.custom-comments-empty { margin-top: 12px; padding: 16px; border: 1px dashed var(--border-color, #dbe2ee); border-radius: 9px; color: var(--text-secondary, #6b7890); font-size: 12px; text-align: center; }
.comment-modal-footer { border-top: 1px solid var(--border-color, #dbe2ee); }
.comment-modal-footer > div { display: flex; gap: 9px; }

html.dark .custom-feedback-page, html[data-theme="dark"] .custom-feedback-page, :global(body.dark) .custom-feedback-page { --card-bg: #18263b; --input-bg: #111d30; --table-header-bg: #1e2e46; --border-color: #334661; --text-primary: #f5f7fb; --text-secondary: #aebbd0; }

@media (max-width: 1100px) {
  .defaults-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .custom-feedback-page { padding: 0; }
  .page-header, .panel-heading, .table-footer { align-items: stretch; flex-direction: column; }
  .header-badge { align-self: flex-start; }
  .defaults-grid { grid-template-columns: 1fr; }
  .defaults-group-heading { align-items: stretch; flex-direction: column; }
  .defaults-group-heading .btn { width: 100%; }
  .paste-layout { grid-template-columns: 1fr; }
  .download-actions { display: grid; grid-template-columns: 1fr; }
  .table-footer .btn { width: 100%; }
  .preview-modal { max-height: 96vh; }
  .comment-modal { max-height: 96vh; }
  .comment-modal-header, .comment-modal-footer { align-items: stretch; }
  .comment-modal-footer { flex-direction: column-reverse; }
  .comment-modal-footer > div { display: grid; grid-template-columns: 1fr 1fr; }
  .custom-comments-heading { align-items: stretch; flex-direction: column; }
  .add-custom-comment { width: 100%; }
  .preview-scroll { padding: 8px; }
  .preview-scroll :deep(.pdf-template) { transform: scale(.48); width: 210mm; margin-bottom: -52%; }
}
</style>
