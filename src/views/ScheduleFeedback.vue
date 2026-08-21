<template>
  <div class="wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" />
            <circle cx="12" cy="10" r="1" />
            <circle cx="15" cy="10" r="1" />
          </svg>
          Feedback Berulang (Algo)
        </h2>
        <p class="subtitle">
          Pengiriman akan berulang tiap minggu untuk setiap lesson. Waktu akan dikirim
          sesuai persis dengan input Anda.
        </p>
      </div>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="submit" class="feedback-form" novalidate>
      <!-- Card 1: Basic Info -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0-2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
                ref="nameInput"
                v-model.trim="form.name"
                placeholder="Contoh: IND-PS-358-SAT-16.00 {PREM}"
                required
                class="form-input"
                :class="{ 'has-error': !!nameError }"
                :aria-invalid="!!nameError"
                aria-describedby="feedback-name-error"
                @blur="nameTouched = true"
              />
              <p v-if="nameError" id="feedback-name-error" class="field-error">{{ nameError }}</p>
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

            <div class="form-group">
              <label class="form-label"> Course <span class="required">*</span> </label>
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
                <option value="" disabled>
                  {{
                    form.courseName ? "Pilih lesson..." : "Pilih course terlebih dahulu"
                  }}
                </option>
                <option
                  v-for="lessonNum in availableLessons"
                  :key="lessonNum"
                  :value="lessonNum"
                >
                  Lesson {{ lessonNum }}
                </option>
              </select>
            </div>
          </div>

          <!-- Message Preview - Full Width Below -->
          <div v-if="previewMessage" class="form-group preview-section">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview Pesan - Lesson {{ form.startLesson }}
            </label>
            <div class="message-preview">
              <pre>{{ previewMessage }}</pre>
            </div>
          </div>

          <div
            v-else-if="form.courseName && form.startLesson"
            class="form-group preview-section"
          >
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Preview Pesan
            </label>
            <div class="message-preview no-preview">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>
                Tidak ada template untuk Lesson {{ form.startLesson }} di course "{{
                  form.courseName
                }}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Recipients -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Penerima
          </h3>
          <span class="badge-count" v-if="recipientsPicker?.recipients?.length > 0"
            >{{ recipientsPicker.recipients.length }} dipilih</span
          >
        </div>
        <div class="card-body">
          <RecipientsPicker ref="recipientsPicker" />
        </div>
      </div>

      <!-- Info & Alerts -->
      <div class="info-section">
        <div class="info-card">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="10" x2="12" y2="16" />
            <circle cx="12" cy="7" r="0.6" />
          </svg>

          <div class="info-content">
            <div class="info-text">
              Estimasi kirim: <strong>{{ estimatedCount }}</strong> kali
              <span v-if="lastDate">
                — Perkiraan selesai: <strong>{{ lastDate }}</strong></span
              >
            </div>
          </div>
        </div>

        <div v-if="msg" class="alert alert-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ msg }}
        </div>

        <div v-if="err" class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {{ err }}
        </div>
      </div>

      <!-- Submit Button -->
      <div class="form-actions">
        <button type="submit" class="btn-submit" :disabled="loading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span v-if="loading">Memproses...</span>
          <span v-else>Jadwalkan Feedback</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { deviceApi, userApi } from "../api/http.js";
import { useDevices } from "../composables/useDevices.js";
import { useToast } from "../composables/useToast.js";
import RecipientsPicker from "../components/RecipientsPicker.vue";
import {
  convertToServerTime,
  formatLocalTime,
  isValidDateTime,
  addInterval,
} from "../utils/datetime.js";

const toast = useToast();
const { selectedDeviceId } = useDevices();

// Template ref for RecipientsPicker
const recipientsPicker = ref(null);

const form = ref({
  name: "",
  courseName: "",
  startLesson: 1,
  delay: 5000,
  schedule: "",
});

const loading = ref(false);
const msg = ref("");
const err = ref("");
const nameInput = ref(null);
const submitAttempted = ref(false);
const nameTouched = ref(false);
const nameError = computed(() =>
  (submitAttempted.value || nameTouched.value) && !form.value.name.trim()
    ? "Nama wajib diisi"
    : ""
);

// Course dropdown from templates
const templates = ref([]);
const courseOptions = ref([]);

const extractCourseOptions = (items) => {
  const set = new Set((items || []).map((t) => t.courseName).filter(Boolean));
  courseOptions.value = Array.from(set).sort();
};

const loadTemplates = async () => {
  try {
    // Fetch all pages to get complete data (backend defaults to 100 per page)
    const PAGE_SIZE = 500;
    let page = 1;
    let allFeedbacks = [];
    let hasMore = true;

    while (hasMore) {
      const { data } = await userApi.get("/course/feedbacks", {
        params: { page, pageSize: PAGE_SIZE },
      });
      const items = data.feedbacks || [];
      allFeedbacks = allFeedbacks.concat(items);

      const meta = data.meta;
      if (meta && meta.totalPages) {
        hasMore = page < meta.totalPages;
      } else {
        hasMore = items.length === PAGE_SIZE;
      }
      page++;
    }

    templates.value = allFeedbacks;
    extractCourseOptions(templates.value);
  } catch (e) {
    const errorMsg = e?.response?.data?.message || e?.message || "Gagal memuat templates";
    toast.error("Gagal memuat templates: " + errorMsg);
    templates.value = [];
    courseOptions.value = [];
  }
};

onMounted(async () => {
  await Promise.allSettled([loadTemplates()]);
});

// Estimation helpers
const lessonsForCourse = computed(() => {
  if (!form.value.courseName) return [];
  return (templates.value || [])
    .filter((t) => t.courseName === form.value.courseName)
    .sort((a, b) => Number(a.lesson) - Number(b.lesson));
});

const availableLessons = computed(() => {
  if (!form.value.courseName) return [];
  const lessons = lessonsForCourse.value.map((t) => Number(t.lesson));
  return lessons.length > 0 ? lessons : [];
});

watch(
  () => form.value.courseName,
  (newCourse) => {
    if (newCourse) {
      const lessons = availableLessons.value;
      form.value.startLesson = lessons.length > 0 ? lessons[0] : 1;
    } else {
      form.value.startLesson = 1;
    }
  }
);

const estimatedCount = computed(() => {
  const start = Number(form.value.startLesson || 1);
  const list = lessonsForCourse.value.filter((t) => Number(t.lesson) >= start);
  return list.length || 0;
});

const lastDate = computed(() => {
  try {
    if (!form.value.schedule || !estimatedCount.value) return "";
    if (!isValidDateTime(form.value.schedule)) return "";

    const start = new Date(form.value.schedule);
    const weeks = Math.max(estimatedCount.value - 1, 0);
    const last = addInterval(start, "weekly", weeks);

    return formatLocalTime(last.toISOString());
  } catch {
    return "";
  }
});

const validationError = computed(() => {
  if (!form.value.name) return "Nama wajib diisi";
  if (!form.value.courseName) return "Course wajib dipilih";
  if (!form.value.startLesson || Number(form.value.startLesson) <= 0)
    return "Start lesson minimal 1";
  if (!form.value.schedule) return "Tanggal mulai wajib diisi";
  if (!isValidDateTime(form.value.schedule)) return "Format tanggal mulai tidak valid";

  const recipients = recipientsPicker.value?.recipients || [];
  if (recipients.length === 0) return "Minimal satu penerima";
  const hasAll = recipients.includes("all");
  const hasLabel = recipients.some((r) => r.startsWith("label"));
  if (hasAll && hasLabel) return "Tidak boleh mencampur all dan label_* dalam penerima";
  return "";
});

const submit = async () => {
  if (loading.value) return;
  submitAttempted.value = true;
  nameTouched.value = true;
  msg.value = "";
  err.value = "";
  if (validationError.value) {
    if (nameError.value) nameInput.value?.focus();
    else toast.error(validationError.value);
    return;
  }
  loading.value = true;
  try {
    const scheduleISO = convertToServerTime(form.value.schedule);
    const deviceId = selectedDeviceId.value;
    if (!deviceId) {
      toast.error("Device tidak ditemukan atau belum login");
      loading.value = false;
      return;
    }

    const recipients = recipientsPicker.value?.recipients || [];

    const payload = {
      name: form.value.name,
      courseName: form.value.courseName,
      startLesson: form.value.startLesson,
      delay: form.value.delay ?? 5000,
      schedule: scheduleISO,
      recipients: recipients,
      deviceId,
    };
    await deviceApi.post("/messages/broadcasts/feedback", payload);
    toast.success("Jadwal feedback berhasil dibuat");
    form.value.name = "";
    form.value.courseName = "";
    form.value.startLesson = 1;
    form.value.delay = 5000;
    form.value.schedule = "";
    recipientsPicker.value?.resetRecipients();
    submitAttempted.value = false;
    nameTouched.value = false;
  } catch (e) {
    const errorMsg =
      "Gagal membuat jadwal feedback. Pastikan WhatsApp sudah terhubung" ||
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message;
    toast.error(errorMsg);
  } finally {
    loading.value = false;
  }
};

const previewMessage = computed(() => {
  if (!form.value.courseName || !form.value.startLesson) return "";
  const template = templates.value.find(
    (t) =>
      t.courseName === form.value.courseName &&
      Number(t.lesson) === Number(form.value.startLesson)
  );
  return template?.message || "";
});

watch(selectedDeviceId, (deviceId, previousDeviceId) => {
  if (!previousDeviceId || String(deviceId) === String(previousDeviceId)) return;
  recipientsPicker.value?.resetRecipients();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

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
  color: var(--theme-text);
}

.header-content h2 svg {
  width: 32px;
  height: 32px;
  color: #3b82f6;
  stroke-width: 2.5;
}

.subtitle {
  margin: 0;
  color: var(--theme-text-muted);
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
  background: var(--theme-surface);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--theme-border);
  overflow: visible;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--theme-border);
  background: var(--theme-gradient-surface);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-text);
  margin: 0;
}

.card-title svg {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

.card-body {
  padding: 24px;
  overflow: visible;
}

/* Device Selector Styles */
.btn-refresh-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--theme-gradient-neutral);
  border: 1.5px solid var(--theme-border-strong);
  border-radius: 10px;
  color: var(--theme-text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh-header:hover:not(:disabled) {
  background: var(--theme-gradient-neutral-hover);
  transform: translateY(-1px);
}

.btn-refresh-header:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh-header svg {
  width: 16px;
  height: 16px;
}

/* Badges */
.badge-count {
  padding: 6px 12px;
  background: var(--theme-gradient-info);
  color: #1e40af;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--theme-info-border);
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  color: var(--theme-text-secondary);
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
  border: 1.5px solid var(--theme-border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: var(--theme-surface-soft);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: var(--theme-surface);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--theme-surface-soft);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.form-help {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--theme-text-muted);
  font-size: 13px;
}

/* Message Preview */
.preview-section {
  margin-top: 8px;
}

.message-preview {
  padding: 16px;
  background: var(--theme-surface-soft);
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.message-preview pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: var(--theme-text-secondary);
}

.message-preview.no-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--theme-gradient-warning);
  border-color: var(--theme-warning-border);
}

.message-preview.no-preview svg {
  width: 24px;
  height: 24px;
  color: var(--theme-warning-text);
  flex-shrink: 0;
}

.message-preview.no-preview p {
  margin: 0;
  color: var(--theme-warning-text);
  font-size: 14px;
  font-weight: 500;
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
  background: var(--theme-gradient-info);
  border: 1px solid var(--theme-info-border);
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
  background: var(--theme-gradient-success);
  color: var(--theme-success-text);
  border-color: var(--theme-success-border);
}

.alert-error {
  background: var(--theme-gradient-danger);
  color: var(--theme-danger-text);
  border-color: var(--theme-danger-border);
}

/* Form Actions */
.form-actions {
  background: var(--theme-surface);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--theme-border);
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
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 10px;
    padding: 14px 16px;
  }

  .card-title {
    min-width: 0;
    line-height: 1.35;
  }

  .btn-refresh-header {
    width: 100%;
    min-height: 44px;
    justify-content: center;
  }

  .card-body {
    min-width: 0;
    padding: 14px;
  }

  .form-input,
  .form-textarea,
  .form-select {
    min-width: 0;
    font-size: 16px;
  }
}

.form-input.has-error {
  border-color: var(--theme-danger-border);
  box-shadow: 0 0 0 3px var(--theme-danger-soft);
}

.field-error {
  margin: 6px 0 0;
  color: var(--theme-danger-text);
  font-size: 12px;
  font-weight: 500;
}
</style>
```
