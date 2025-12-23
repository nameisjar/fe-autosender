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
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <!-- Clipboard body -->
            <path
              d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
            />

            <!-- Clipboard top -->
            <rect x="9" y="3" width="6" height="4" rx="1" />

            <!-- Check icon -->
            <path d="M9 12l2 2 4-4" />

            <!-- Text line -->
            <line x1="9" y1="17" x2="15" y2="17" />
          </svg>

          Feedback Bulanan (Algo)
        </h2>
        <p class="subtitle">
          Buat dan kirim feedback bulanan dalam format PDF ke WhatsApp siswa
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="feedback-form">
      <!-- 🆕 Two Column Layout -->
      <div class="form-layout">
        <!-- Left Column -->
        <div class="form-column">
          <!-- Device Selection (Compact) -->
          <div class="card card-compact">
            <div class="card-header card-header-compact">
              <h3 class="card-title">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Device WhatsApp
              </h3>
              <button
                type="button"
                class="btn-refresh-header"
                @click="devicePicker?.loadDevices()"
                :disabled="devicePicker?.loading"
                title="Refresh device list"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ spinning: devicePicker?.loading }"
                >
                  <path
                    d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                  />
                </svg>
                {{ devicePicker?.loading ? "Loading..." : "Refresh" }}
              </button>
            </div>
            <div class="card-body card-body-compact">
              <DevicePicker ref="devicePicker" @device-changed="onDeviceChanged" />
            </div>
          </div>

          <!-- Student & Course Info -->
          <div class="card card-compact">
            <div class="card-header card-header-compact">
              <h3>Informasi Siswa</h3>
            </div>
            <div class="card-body card-body-compact">
              <div class="form-group form-group-compact">
                <label class="form-label"
                  >Nama Siswa <span class="required">*</span></label
                >
                <input
                  v-model="form.studentName"
                  placeholder="Nama siswa"
                  required
                  class="form-input form-input-compact"
                />
              </div>

              <div class="form-grid-2">
                <div class="form-group form-group-compact">
                  <label class="form-label">Kursus <span class="required">*</span></label>
                  <select
                    v-model="form.courseName"
                    required
                    class="form-select form-input-compact"
                    @change="onCourseChange"
                  >
                    <option value="" disabled>Pilih kursus...</option>
                    <option v-for="course in courses" :key="course" :value="course">
                      {{ course }}
                    </option>
                  </select>
                </div>

                <div class="form-group form-group-compact">
                  <label class="form-label"
                    >Bulan Ke <span class="required">*</span></label
                  >
                  <select
                    v-model.number="form.month"
                    required
                    class="form-select form-input-compact"
                    @change="onMonthChange"
                  >
                    <option value="" disabled>Pilih...</option>
                    <option v-for="m in availableMonths" :key="m" :value="m">
                      Bulan {{ m }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Auto-filled Compact -->
              <!-- <div v-if="selectedTemplate" class="auto-filled-compact">
                <div class="auto-info">
                  <span class="auto-label">Level:</span>
                  <span class="auto-value">{{ selectedTemplate.level }}</span>
                </div>
                <div class="auto-info">
                  <span class="auto-label">Code:</span>
                  <span class="auto-value">{{ selectedTemplate.code }}</span>
                </div>
              </div> -->
            </div>
          </div>

          <!-- Links -->
          <div class="card card-compact">
            <div class="card-header card-header-compact">
              <h3>Link YouTube & Referral</h3>
            </div>
            <div class="card-body card-body-compact">
              <div class="form-group form-group-compact">
                <label class="form-label"
                  >Link YouTube <span class="required">*</span></label
                >
                <input
                  v-model="form.youtubeLink"
                  placeholder="https://youtu.be/..."
                  type="url"
                  required
                  class="form-input form-input-compact"
                />
              </div>

              <div class="form-group form-group-compact">
                <label class="form-label"
                  >Link Referral <span class="required">*</span></label
                >
                <input
                  v-model="form.referralLink"
                  placeholder="https://algonova.id/invite?..."
                  type="url"
                  required
                  class="form-input form-input-compact"
                />
              </div>
            </div>
          </div>

          <!-- 🆕 Rating & Report By (dipindah ke kiri bawah) -->
          <div class="card card-compact">
            <div class="card-header card-header-compact">
              <h3>Rating & Laporan</h3>
              <button
                type="button"
                class="btn-clear-data"
                @click="clearSavedData"
                title="Hapus semua data tersimpan"
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
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Clear Data
              </button>
            </div>
            <div class="card-body card-body-compact">
              <div class="form-group form-group-compact">
                <label class="form-label">Rating <span class="required">*</span></label>
                <div class="rating-stars">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ filled: star <= form.rating }"
                    @click="form.rating = star"
                    >★</span
                  >
                </div>
              </div>

              <div class="form-group form-group-compact">
                <label class="form-label"
                  >Laporan Dibuat Oleh <span class="required">*</span></label
                >
                <input
                  v-model="form.reportBy"
                  placeholder="Nama tutor"
                  required
                  class="form-input form-input-compact"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Full Height Comments -->
        <div class="form-column">
          <!-- Tutor Comment (Full Height) -->
          <div class="card card-compact card-full-height">
            <div class="card-header card-header-compact">
              <h3>Pilih Komentar</h3>
              <span class="selected-count-badge"
                >{{ form.selectedComments.length }} / 3</span
              >
            </div>
            <div class="card-body card-body-compact">
              <!-- 🆕 Checkbox Komentar -->
              <div class="comment-checkboxes">
                <!-- Kehadiran -->
                <div class="comment-category">
                  <h4 class="category-title">Kehadiran</h4>
                  <div
                    v-for="comment in commentCategories.kehadiran"
                    :key="comment.id"
                    class="comment-item"
                    :class="{ selected: form.selectedComments.includes(comment.id) }"
                  >
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        :id="comment.id"
                        :value="comment.id"
                        :checked="form.selectedComments.includes(comment.id)"
                        @change="toggleComment(comment.id)"
                        :disabled="
                          !form.selectedComments.includes(comment.id) &&
                          form.selectedComments.length >= 3
                        "
                      />
                      <span class="checkbox-text"
                        >{{
                          replaceNameInComment(
                            comment.text,
                            form.studentName || "Siswa"
                          ).substring(0, 100)
                        }}...</span
                      >
                    </label>
                  </div>
                </div>

                <!-- Keterlibatan & Kesulitan -->
                <div class="comment-category">
                  <h4 class="category-title">Keterlibatan & Kesulitan</h4>
                  <div
                    v-for="comment in commentCategories.keterlibatan"
                    :key="comment.id"
                    class="comment-item"
                    :class="{ selected: form.selectedComments.includes(comment.id) }"
                  >
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        :id="comment.id"
                        :value="comment.id"
                        :checked="form.selectedComments.includes(comment.id)"
                        @change="toggleComment(comment.id)"
                        :disabled="
                          !form.selectedComments.includes(comment.id) &&
                          form.selectedComments.length >= 3
                        "
                      />
                      <span class="checkbox-text"
                        >{{
                          replaceNameInComment(
                            comment.text,
                            form.studentName || "Siswa"
                          ).substring(0, 100)
                        }}...</span
                      >
                    </label>
                  </div>
                </div>

                <!-- Penyelesaian Tugas -->
                <div class="comment-category">
                  <h4 class="category-title">Penyelesaian Tugas</h4>
                  <div
                    v-for="comment in commentCategories.penyelesaian"
                    :key="comment.id"
                    class="comment-item"
                    :class="{ selected: form.selectedComments.includes(comment.id) }"
                  >
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        :id="comment.id"
                        :value="comment.id"
                        :checked="form.selectedComments.includes(comment.id)"
                        @change="toggleComment(comment.id)"
                        :disabled="
                          !form.selectedComments.includes(comment.id) &&
                          form.selectedComments.length >= 3
                        "
                      />
                      <span class="checkbox-text"
                        >{{
                          replaceNameInComment(
                            comment.text,
                            form.studentName || "Siswa"
                          ).substring(0, 100)
                        }}...</span
                      >
                    </label>
                  </div>
                </div>

                <!-- Custom -->
                <div class="comment-category">
                  <h4 class="category-title">Custom</h4>
                  <div
                    v-for="comment in commentCategories.custom"
                    :key="comment.id"
                    class="comment-item"
                    :class="{ selected: form.selectedComments.includes(comment.id) }"
                  >
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        :id="comment.id"
                        :value="comment.id"
                        :checked="form.selectedComments.includes(comment.id)"
                        @change="toggleComment(comment.id)"
                        :disabled="
                          !form.selectedComments.includes(comment.id) &&
                          form.selectedComments.length >= 3
                        "
                      />
                      <div class="custom-textarea-wrapper">
                        <textarea
                          v-model="comment.text"
                          @input="updateCustomComment(comment.id, comment.text)"
                          placeholder="Tulis komentar custom..."
                          class="custom-textarea-inline"
                          rows="1"
                          maxlength="220"
                          :disabled="!form.selectedComments.includes(comment.id)"
                        ></textarea>
                        <div
                          class="custom-char-count"
                          :class="{ 'limit-reached': comment.text.length >= 220 }"
                        >
                          {{ comment.text.length }}/220 karakter
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🆕 Recipients - Full Width Below -->
      <div class="recipients-section">
        <div class="card card-compact">
          <div class="card-header card-header-compact">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Penerima
            </h3>
            <span v-if="recipientsPicker?.recipients?.length > 0" class="badge-count"
              >{{ recipientsPicker.recipients.length }} dipilih</span
            >
          </div>
          <div class="card-body card-body-compact">
            <RecipientsPicker ref="recipientsPicker" />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons-compact">
        <button
          type="button"
          class="btn-preview-compact"
          @click="showPreview = true"
          :disabled="!isFormValid || generating"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>

        <button
          type="submit"
          class="btn-submit-compact"
          :disabled="!isFormValid || sending"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          {{ sending ? "Mengirim..." : "Kirim PDF" }}
        </button>
      </div>

      <!-- Alerts Compact -->
      <div v-if="error" class="alert-compact alert-error">{{ error }}</div>
      <div v-if="success" class="alert-compact alert-success">{{ success }}</div>
    </form>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="modal-overlay" @click="showPreview = false">
      <div class="preview-modal" @click.stop>
        <div class="modal-header">
          <h3>Preview Feedback Bulanan</h3>
          <button class="btn-close" @click="showPreview = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="generating" class="preview-loading">
            <div class="spinner"></div>
            <p>Generating PDF preview...</p>
          </div>

          <!-- PDF Preview -->
          <div v-else-if="previewData" class="pdf-preview-container">
            <MonthlyFeedbackPDFTemplate :data="previewData" ref="pdfTemplate" />
          </div>

          <div v-else class="preview-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>Isi form untuk melihat preview</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showPreview = false">Tutup</button>
          <button
            class="btn-download"
            @click="handleDownloadPDF"
            :disabled="!previewData || generating || sending"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {{ generating ? "Generating..." : "Download PDF" }}
          </button>
          <button
            class="btn-primary btn-send"
            @click="handleGenerateAndSend"
            :disabled="!previewData || generating"
          >
            <div v-if="sending" class="btn-loading">
              <div class="btn-spinner"></div>
              <span>Mengirim ke {{ recipients.length }} penerima...</span>
            </div>
            <template v-else>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
              Kirim Sekarang
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- 🆕 Send Results Modal -->
    <div v-if="showSendResults" class="modal-overlay" @click="showSendResults = false">
      <div class="results-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Hasil Pengiriman
          </h3>
          <button class="btn-close" @click="showSendResults = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body results-body">
          <!-- Summary -->
          <div class="results-summary">
            <div class="summary-item success">
              <div class="summary-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div class="summary-content">
                <span class="summary-value">{{
                  sendResults.filter((r) => r.success).length
                }}</span>
                <span class="summary-label">Berhasil</span>
              </div>
            </div>
            <div class="summary-item failed">
              <div class="summary-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div class="summary-content">
                <span class="summary-value">{{
                  sendResults.filter((r) => !r.success).length
                }}</span>
                <span class="summary-label">Gagal</span>
              </div>
            </div>
          </div>

          <!-- Rate Limit Info -->
          <div v-if="rateLimitInfo" class="rate-limit-info">
            <div class="rate-limit-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Rate Limit Info</span>
            </div>
            <div class="rate-limit-content">
              <div class="rate-limit-item">
                <span class="rate-label">Sisa Kuota:</span>
                <span class="rate-value" :class="{ low: rateLimitInfo.remaining < 10 }">
                  {{ rateLimitInfo.remaining }} / {{ rateLimitInfo.limit }}
                </span>
              </div>
              <div v-if="rateLimitInfo.resetTime" class="rate-limit-item">
                <span class="rate-label">Reset:</span>
                <span class="rate-value">{{
                  formatResetTime(rateLimitInfo.resetTime)
                }}</span>
              </div>
              <div v-if="rateLimitInfo.remaining < 10" class="rate-limit-warning">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span
                  >Kuota hampir habis! Tunggu hingga reset untuk mengirim lebih banyak
                  pesan.</span
                >
              </div>
            </div>
          </div>

          <!-- Results List -->
          <div class="results-list">
            <h4>Detail Pengiriman</h4>
            <div class="results-scroll">
              <div
                v-for="(result, index) in sendResults"
                :key="index"
                class="result-item"
                :class="{ success: result.success, failed: !result.success }"
              >
                <div class="result-icon">
                  <svg
                    v-if="result.success"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <div class="result-content">
                  <span class="result-recipient">{{
                    getRecipientDisplayName(result.recipient)
                  }}</span>
                  <span v-if="!result.success" class="result-error">{{
                    result.error || "Gagal mengirim"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" @click="showSendResults = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { userApi, deviceApi } from "../api/http.js";
import { useToast } from "../composables/useToast.js";
import MonthlyFeedbackPDFTemplate from "../components/MonthlyFeedbackPDFTemplate.vue";
import { getImagesAsBase64 } from "../utils/images.js";
import { normalizePhoneNumber, isValidPhoneNumber } from "../utils/phone.js";
import html2pdf from "html2pdf.js";
import RecipientsPicker from "../components/RecipientsPicker.vue";
import DevicePicker from "../components/DevicePicker.vue";

const toast = useToast();

// Template ref for DevicePicker
const devicePicker = ref(null);

// Template ref for RecipientsPicker
const recipientsPicker = ref(null);

// Computed untuk mendapatkan recipients dari RecipientsPicker
const recipients = computed(() => recipientsPicker.value?.recipients || []);
const recipientLabels = computed(() => recipientsPicker.value?.recipientLabels || {});

// 🆕 Fungsi helper untuk mengubah string menjadi Title Case
const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const form = ref({
  studentName: "",
  courseName: "",
  month: null,
  duration: "",
  youtubeLink: "",
  referralLink: "",
  tutorComment: "",
  recipientPhone: "",
  deviceId: "",
  rating: 5,
  reportBy: "",
  selectedComments: [],
});

const STORAGE_KEYS = {
  STUDENT_NAME: "monthlyFeedback_studentName",
  COURSE_NAME: "monthlyFeedback_courseName",
  MONTH: "monthlyFeedback_month",
  YOUTUBE_LINK: "monthlyFeedback_youtubeLink",
  REFERRAL_LINK: "monthlyFeedback_referralLink",
  REPORT_BY: "monthlyFeedback_reportBy",
  RATING: "monthlyFeedback_rating",
  SELECTED_COMMENTS: "monthlyFeedback_selectedComments",
  CUSTOM_COMMENTS: "monthlyFeedback_customComments",
};

const loadSavedData = () => {
  try {
    const savedStudentName = localStorage.getItem(STORAGE_KEYS.STUDENT_NAME);
    const savedCourseName = localStorage.getItem(STORAGE_KEYS.COURSE_NAME);
    const savedMonth = localStorage.getItem(STORAGE_KEYS.MONTH);
    const savedYoutubeLink = localStorage.getItem(STORAGE_KEYS.YOUTUBE_LINK);
    const savedReferralLink = localStorage.getItem(STORAGE_KEYS.REFERRAL_LINK);
    const savedReportBy = localStorage.getItem(STORAGE_KEYS.REPORT_BY);
    const savedRating = localStorage.getItem(STORAGE_KEYS.RATING);
    const savedSelectedComments = localStorage.getItem(STORAGE_KEYS.SELECTED_COMMENTS);
    const savedCustomComments = localStorage.getItem(STORAGE_KEYS.CUSTOM_COMMENTS);

    if (savedStudentName) form.value.studentName = savedStudentName;
    if (savedCourseName) form.value.courseName = savedCourseName;
    if (savedMonth) form.value.month = parseInt(savedMonth);
    if (savedYoutubeLink) form.value.youtubeLink = savedYoutubeLink;
    if (savedReferralLink) form.value.referralLink = savedReferralLink;
    if (savedReportBy) form.value.reportBy = savedReportBy;
    if (savedRating) form.value.rating = parseInt(savedRating);

    if (savedSelectedComments) {
      try {
        form.value.selectedComments = JSON.parse(savedSelectedComments);
      } catch (e) {}
    }

    if (savedCustomComments) {
      try {
        const customCommentsData = JSON.parse(savedCustomComments);
        commentCategories.value.custom.forEach((comment) => {
          const savedComment = customCommentsData.find((c) => c.id === comment.id);
          if (savedComment && savedComment.text) {
            comment.text = savedComment.text;
          }
        });
      } catch (e) {}
    }
  } catch (e) {}
};

const saveDataToStorage = () => {
  try {
    if (form.value.studentName) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, form.value.studentName);
    }
    if (form.value.courseName) {
      localStorage.setItem(STORAGE_KEYS.COURSE_NAME, form.value.courseName);
    }
    if (form.value.month) {
      localStorage.setItem(STORAGE_KEYS.MONTH, form.value.month.toString());
    }
    if (form.value.youtubeLink) {
      localStorage.setItem(STORAGE_KEYS.YOUTUBE_LINK, form.value.youtubeLink);
    }
    if (form.value.referralLink) {
      localStorage.setItem(STORAGE_KEYS.REFERRAL_LINK, form.value.referralLink);
    }
    if (form.value.reportBy) {
      localStorage.setItem(STORAGE_KEYS.REPORT_BY, form.value.reportBy);
    }
    if (form.value.rating) {
      localStorage.setItem(STORAGE_KEYS.RATING, form.value.rating.toString());
    }

    if (form.value.selectedComments && form.value.selectedComments.length > 0) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_COMMENTS,
        JSON.stringify(form.value.selectedComments)
      );
    }

    const customComments = commentCategories.value.custom
      .filter((comment) => comment.text && comment.text.trim())
      .map((comment) => ({ id: comment.id, text: comment.text }));

    if (customComments.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_COMMENTS, JSON.stringify(customComments));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_COMMENTS);
    }
  } catch (e) {}
};

const clearSavedData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    form.value.studentName = "";
    form.value.courseName = "";
    form.value.month = null;
    form.value.youtubeLink = "";
    form.value.referralLink = "";
    form.value.reportBy = "";
    form.value.rating = 5;
    form.value.selectedComments = [];
    commentCategories.value.custom.forEach((comment) => {
      comment.text = "";
    });
    toast.success("Data tersimpan berhasil dihapus");
  } catch (e) {}
};

watch(() => form.value.studentName, saveDataToStorage);
watch(() => form.value.courseName, saveDataToStorage);
watch(() => form.value.month, saveDataToStorage);
watch(() => form.value.youtubeLink, saveDataToStorage);
watch(() => form.value.referralLink, saveDataToStorage);
watch(() => form.value.reportBy, saveDataToStorage);
watch(() => form.value.rating, saveDataToStorage);
watch(() => form.value.selectedComments, saveDataToStorage, { deep: true });

const commentCategories = ref({
  kehadiran: [
    {
      id: "kehadiran_1",
      text:
        "M. Alghifari Setyawan selalu hadir di setiap sesi pelajaran dan menunjukkan antusiasme yang tinggi. Kami sangat menghargai kehadirannya yang konsisten, ini adalah langkah penting dalam proses belajarnya. Terus semangat, ya!",
    },
    {
      id: "kehadiran_2",
      text:
        "M. Alghifari Setyawan mengikuti 3 dari 4 sesi pelajaran bulan ini. Kehadirannya cukup baik, dan meskipun ada satu sesi yang terlewat, M. Alghifari Setyawan tetap mengikuti materi dengan baik. Kami yakin kehadiran yang lebih konsisten akan membuat belajarnya lebih maksimal!",
    },
    {
      id: "kehadiran_3",
      text:
        "M. Alghifari Setyawan hanya hadir di 2 dari 4 sesi bulan ini. Kami melihat kehadiran yang tidak konsisten mulai mempengaruhi kemajuan belajar. Akan lebih baik jika M. Alghifari Setyawan bisa hadir lebih teratur agar tidak tertinggal materi.",
    },
    {
      id: "kehadiran_4",
      text:
        "M. Alghifari Setyawan hadir hanya di 1 dari 4 sesi pelajaran bulan ini. Kami khawatir ini bisa mempengaruhi pemahaman materi yang diajarkan. Jika memungkinkan, mari kita diskusikan bagaimana agar M. Alghifari Setyawan bisa lebih rutin mengikuti pelajaran.",
    },
    {
      id: "kehadiran_5",
      text:
        "M. Alghifari Setyawan tidak hadir di seluruh sesi pelajaran bulan ini. Kami ingin membantu agar M. Alghifari Setyawan bisa kembali mengikuti pelajaran dengan lebih baik. Kami akan menghubungi Anda untuk membahas solusi yang tepat.",
    },
  ],
  keterlibatan: [
    {
      id: "keterlibatan_1",
      text:
        "M. Alghifari Setyawan sangat terlibat dalam setiap sesi, aktif berpartisipasi dalam diskusi, dan tidak ragu mengajukan pertanyaan yang mendalam. M. Alghifari Setyawan selalu menunjukkan kemajuan yang baik dan memahami materi dengan cepat. Saya sering memberikan tantangan tambahan untuk membantu M. Alghifari Setyawan terus berkembang dan belajar lebih jauh.",
    },
    {
      id: "keterlibatan_2",
      text:
        "M. Alghifari Setyawan cukup fokus di kelas meskipun jarang bertanya. Namun, M. Alghifari Setyawan selalu memperhatikan dengan baik dan mengikuti instruksi dengan seksama. Mungkin dengan lebih banyak berpartisipasi dalam diskusi, M. Alghifari Setyawan bisa meningkatkan pemahaman materi. Secara keseluruhan, M. Alghifari Setyawan sudah menunjukkan perkembangan yang positif.",
    },
    {
      id: "keterlibatan_3",
      text:
        "M. Alghifari Setyawan cenderung lebih diam di kelas dan jarang terlibat dalam diskusi. Kami menyarankan agar M. Alghifari Setyawan lebih terbuka untuk bertanya atau berinteraksi sehingga bisa lebih mudah memahami materi. Jika ada kendala tertentu, kami siap membantu agar suasana kelas lebih nyaman untuk belajar.",
    },
    {
      id: "keterlibatan_4",
      text:
        "M. Alghifari Setyawan tampak mengalami kesulitan dalam mengikuti pelajaran terakhir. Kurangnya fokus menyebabkan M. Alghifari Setyawan tidak sepenuhnya menangkap materi. Kami menyarankan agar M. Alghifari Setyawan lebih terlibat aktif dalam kelas agar pemahaman terhadap pelajaran meningkat. Jika Anda memerlukan bantuan atau rekaman kelas, kami siap memberikan dukungan tambahan.",
    },
  ],
  penyelesaian: [
    {
      id: "penyelesaian_1",
      text:
        "M. Alghifari Setyawan telah berhasil menyelesaikan semua tugas dengan sangat baik. Pemahamannya terhadap materi sangat jelas, dan M. Alghifari Setyawan mampu menyelesaikan setiap tugas tepat waktu. Senang sekali melihat kemajuannya yang terus meningkat. Terus lanjutkan usaha ini, ya!",
    },
    {
      id: "penyelesaian_2",
      text:
        "M. Alghifari Setyawan berhasil menyelesaikan sebagian besar tugas dengan baik, namun ada beberapa area yang memerlukan sedikit perbaikan. Dengan latihan tambahan dan perhatian lebih, M. Alghifari Setyawan pasti akan bisa meningkatkan kualitas tugas-tugasnya dan mencapai hasil yang lebih baik lagi.",
    },
    {
      id: "penyelesaian_3",
      text:
        "M. Alghifari Setyawan tampaknya menghadapi beberapa tantangan dalam menyelesaikan tugas kali ini. Sangat penting bagi M. Alghifari Setyawan untuk meluangkan lebih banyak waktu dalam berlatih agar pemahamannya terhadap materi semakin kuat. Kami berharap M. Alghifari Setyawan bisa mengejar ketinggalan. Jika ada kesulitan, jangan ragu untuk menghubungi saya, saya siap membantu.",
    },
  ],
  custom: [
    {
      id: "custom_1",
      text: "",
      isCustom: true,
    },
    {
      id: "custom_2",
      text: "",
      isCustom: true,
    },
  ],
});

const replaceNameInComment = (text, studentName) => {
  const formattedName = toTitleCase(studentName);
  return text.replace(/M\. Alghifari Setyawan/g, formattedName);
};

const formattedStudentName = computed(() => {
  return toTitleCase(form.value.studentName);
});

const formattedReportBy = computed(() => {
  return toTitleCase(form.value.reportBy);
});

const selectedCommentsText = computed(() => {
  if (!form.value.selectedComments || form.value.selectedComments.length === 0) {
    return "";
  }

  const selectedIds = form.value.selectedComments.slice(0, 3);
  const comments = [];

  Object.values(commentCategories.value).forEach((category) => {
    category.forEach((comment) => {
      if (selectedIds.includes(comment.id)) {
        const text = comment.isCustom
          ? comment.text
          : replaceNameInComment(comment.text, formattedStudentName.value || "Siswa");
        if (text) {
          comments.push(text);
        }
      }
    });
  });

  return comments.join("\n\n");
});

const toggleComment = (commentId) => {
  const index = form.value.selectedComments.indexOf(commentId);
  if (index > -1) {
    form.value.selectedComments.splice(index, 1);
  } else {
    if (form.value.selectedComments.length < 3) {
      form.value.selectedComments.push(commentId);
    } else {
      toast.warning("Maksimal 3 komentar yang bisa dipilih");
    }
  }
};

const updateCustomComment = (commentId, text) => {
  const category = commentCategories.value.custom;
  const comment = category.find((c) => c.id === commentId);
  if (comment) {
    comment.text = text;
    saveDataToStorage();
  }
};

const templates = ref([]);
const courses = ref([]);
const showPreview = ref(false);
const generating = ref(false);
const sending = ref(false);
const error = ref("");
const success = ref("");

const sendResults = ref([]);
const showSendResults = ref(false);
const rateLimitInfo = ref(null);
const savedRecipientLabels = ref({});

const selectedTemplate = computed(() => {
  if (!form.value.courseName || !form.value.month) return null;
  return templates.value.find(
    (t) =>
      t.courseName === form.value.courseName &&
      Number(t.month) === Number(form.value.month)
  );
});

const availableMonths = computed(() => {
  if (!form.value.courseName) return [];
  return templates.value
    .filter((t) => t.courseName === form.value.courseName)
    .map((t) => Number(t.month))
    .sort((a, b) => a - b);
});

const getRecipientDisplayName = (recipient) => {
  if (savedRecipientLabels.value[recipient]) {
    return savedRecipientLabels.value[recipient];
  }
  if (recipientLabels.value[recipient]) {
    return recipientLabels.value[recipient];
  }
  if (recipient && recipient.includes("@g.us")) {
    return `Grup: ${recipient.replace("@g.us", "")}`;
  }
  if (recipient && recipient.startsWith("label_")) {
    return `Label: ${recipient.replace("label_", "")}`;
  }
  return recipient;
};

const isFormValid = computed(() => {
  const deviceId = devicePicker.value?.selectedDeviceId;
  return (
    form.value.studentName &&
    form.value.courseName &&
    form.value.month &&
    form.value.youtubeLink &&
    form.value.referralLink &&
    form.value.rating &&
    form.value.reportBy &&
    form.value.selectedComments.length > 0 &&
    recipients.value.length > 0 &&
    deviceId &&
    selectedTemplate.value
  );
});

const previewData = computed(() => {
  if (!isFormValid.value || !selectedTemplate.value) return null;

  const durationText = form.value.duration || "Bulan ke-" + form.value.month;

  return {
    studentName: formattedStudentName.value,
    courseName: form.value.courseName,
    month: form.value.month,
    duration: durationText,
    level: selectedTemplate.value.level,
    code: selectedTemplate.value.code,
    topicModule: selectedTemplate.value.topicModule,
    result: selectedTemplate.value.result,
    skillsAcquired: selectedTemplate.value.skillsAcquired,
    youtubeLink: form.value.youtubeLink,
    referralLink: form.value.referralLink,
    tutorComment: form.value.tutorComment,
    recipients: recipients.value,
    rating: form.value.rating,
    reportBy: formattedReportBy.value,
    selectedComments: selectedCommentsText.value,
  };
});

const formatResetTime = (resetTime) => {
  if (!resetTime) return "-";
  try {
    const date = new Date(resetTime);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return resetTime;
  }
};

const loadTemplates = async () => {
  try {
    const { data } = await userApi.get("/algorithmics/monthly-templates");
    templates.value = data.templates || [];

    const uniqueCourses = [...new Set(templates.value.map((t) => t.courseName))].sort();
    courses.value = uniqueCourses;
  } catch (e) {
    toast.error("Gagal memuat templates");
  }
};

const onCourseChange = () => {
  form.value.month = null;
};

const onMonthChange = () => {
  if (!form.value.duration && form.value.month) {
    form.value.duration = "Bulan ke-" + form.value.month;
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error("Mohon lengkapi semua field yang diperlukan");
    return;
  }

  showPreview.value = true;
};

const handleGenerateAndSend = async () => {
  if (!previewData.value) return;

  const deviceId = devicePicker.value?.selectedDeviceId;
  if (!deviceId) {
    error.value = "Silakan pilih device WhatsApp terlebih dahulu";
    toast.error("Silakan pilih device WhatsApp terlebih dahulu");
    return;
  }

  if (recipients.value.length === 0) {
    error.value = "Silakan pilih minimal satu penerima";
    toast.error("Silakan pilih minimal satu penerima");
    return;
  }

  error.value = "";
  success.value = "";
  sending.value = true;

  sendResults.value = [];
  rateLimitInfo.value = null;

  savedRecipientLabels.value = { ...recipientLabels.value };

  try {
    const payload = {
      studentName: formattedStudentName.value,
      courseName: previewData.value.courseName,
      month: Number(previewData.value.month),
      duration: previewData.value.duration,
      level: previewData.value.level,
      code: previewData.value.code,
      topicModule: previewData.value.topicModule,
      result: previewData.value.result,
      skillsAcquired: previewData.value.skillsAcquired,
      youtubeLink: previewData.value.youtubeLink,
      referralLink: previewData.value.referralLink,
      tutorComment: selectedCommentsText.value,
      recipients: recipients.value,
      // deviceId tidak perlu - sudah dari token deviceApi
      rating: previewData.value.rating,
      reportBy: previewData.value.reportBy,
    };

    const { data } = await deviceApi.post("/messages/monthly-feedback/send", payload);

    if (data.results && Array.isArray(data.results)) {
      sendResults.value = data.results.map((r) => ({
        recipient: r.recipient,
        success: r.status === "success",
        error: r.error,
      }));
    } else {
      sendResults.value = recipients.value.map((r) => ({
        recipient: r,
        success: true,
      }));
    }

    const successCount = sendResults.value.filter((r) => r.success).length;
    const failedCount = sendResults.value.filter((r) => !r.success).length;

    if (data.rateLimit) {
      rateLimitInfo.value = data.rateLimit;
    }

    if (failedCount === 0) {
      success.value = `Feedback bulanan berhasil dikirim ke ${successCount} penerima!`;
      toast.success(`Feedback bulanan berhasil dikirim ke ${successCount} penerima!`);
    } else {
      success.value = `Terkirim: ${successCount}, Gagal: ${failedCount}`;
      toast.warning(`Terkirim: ${successCount}, Gagal: ${failedCount}`);
    }

    showSendResults.value = true;

    form.value.duration = "";
    recipientsPicker.value?.resetRecipients();

    showPreview.value = false;
  } catch (e) {
    const errorMsg =
      e?.response?.data?.message || e?.message || "Gagal mengirim feedback";
    error.value = errorMsg;
    toast.error(errorMsg);

    if (e?.response?.data?.rateLimit) {
      rateLimitInfo.value = e.response.data.rateLimit;
    }

    if (e?.response?.data?.results && Array.isArray(e.response.data.results)) {
      sendResults.value = e.response.data.results.map((r) => ({
        recipient: r.recipient,
        success: r.status === "success",
        error: r.error,
      }));
      showSendResults.value = true;
    }
  } finally {
    sending.value = false;
  }
};

const pdfTemplate = ref(null);

const handleDownloadPDF = async () => {
  if (!previewData.value || !pdfTemplate.value) return;

  generating.value = true;
  
  // 🔧 Create a separate container for PDF rendering
  let pdfContainer = null;
  
  try {
    // 🔧 Clone the element and append to a visible but off-screen container
    const originalElement = pdfTemplate.value.$el;
    pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-render-container';
    pdfContainer.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 794px;
      z-index: -9999;
      background: white;
      visibility: visible;
      opacity: 1;
    `;
    document.body.appendChild(pdfContainer);
    
    // 🔧 Clone and append to container
    const element = originalElement.cloneNode(true);
    element.style.cssText = `
      width: 794px;
      background: white;
      display: block;
    `;
    pdfContainer.appendChild(element);
    
    // 🔧 Copy all styles from original to clone (including scoped styles)
    const copyComputedStyles = (source, target) => {
      const sourceStyles = window.getComputedStyle(source);
      for (let i = 0; i < sourceStyles.length; i++) {
        const prop = sourceStyles[i];
        try {
          target.style.setProperty(prop, sourceStyles.getPropertyValue(prop));
        } catch (e) {}
      }
    };
    
    // Apply computed styles to all elements
    const sourceElements = originalElement.querySelectorAll('*');
    const targetElements = element.querySelectorAll('*');
    sourceElements.forEach((src, idx) => {
      if (targetElements[idx]) {
        copyComputedStyles(src, targetElements[idx]);
      }
    });
    copyComputedStyles(originalElement, element);

    // Wait for styles to apply
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 🔧 Get dimensions after styles are applied
    const elementWidth = element.offsetWidth || 794;
    const elementHeight = element.scrollHeight || element.offsetHeight || 1123;
    
    console.log('PDF dimensions:', { elementWidth, elementHeight });
    
    const studentNameClean = formattedStudentName.value.replace(/\s+/g, "_");
    const monthNum = previewData.value.month;
    const fileName = "Feedback_" + studentNameClean + "_Bulan" + monthNum + ".pdf";

    const opt = {
      margin: 0,
      filename: fileName,
      image: {
        type: "jpeg",
        quality: 0.95,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
        scrollX: 0,
        width: elementWidth,
        height: elementHeight,
        windowWidth: elementWidth,
        windowHeight: elementHeight,
      },
      jsPDF: {
        unit: "px",
        format: [elementWidth, elementHeight],
        orientation: "portrait",
        compress: true,
        hotfixes: ["px_scaling"],
      },
      pagebreak: {
        mode: ["avoid-all"],
      },
    };

    await html2pdf().set(opt).from(element).save();
    
    toast.success("PDF berhasil didownload!");
  } catch (e) {
    console.error('PDF generation error:', e);
    toast.error("Gagal generate PDF: " + (e.message || "Unknown error"));
  } finally {
    // 🔧 Cleanup: remove the PDF container
    if (pdfContainer && pdfContainer.parentNode) {
      pdfContainer.parentNode.removeChild(pdfContainer);
    }
    generating.value = false;
  }
};

const onDeviceChanged = () => {
  recipientsPicker.value?.resetRecipients();
  toast.success(
    "Device berhasil diganti. Data kontak, grup, dan label telah di-refresh."
  );
};

onMounted(async () => {
  loadSavedData();
  loadTemplates();
});
</script>

<style scoped>
/* Base Styles */
.wrapper {
  max-width: 1200px;
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

/* Form */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card */
.card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: visible;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3,
.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.card-header h3 svg,
.card-title svg {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

.step-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.card-body {
  padding: 24px;
  overflow: visible;
}

/* Button Refresh Header */
.btn-refresh-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh-header:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
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

.btn-refresh-header svg.spinning {
  animation: spin 1s linear infinite;
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #475569;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
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
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  line-height: 1.6;
}

.char-count {
  font-size: 12px;
  color: #94a3b8;
  text-align: right;
}

.form-help {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.form-help svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Auto-filled Section */
.auto-filled-section {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
}

.auto-filled-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #0c4a6e;
  font-size: 13px;
  font-weight: 600;
}

.auto-filled-header svg {
  width: 16px;
  height: 16px;
}

.auto-filled-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.auto-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auto-field.full {
  grid-column: 1 / -1;
}

.auto-field label {
  font-size: 11px;
  font-weight: 600;
  color: #075985;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auto-field span {
  color: #0c4a6e;
  font-weight: 500;
}

.auto-field p {
  margin: 0;
  color: #0c4a6e;
  font-size: 13px;
  line-height: 1.6;
}

/* Action Section */
.action-section {
  display: flex;
  gap: 12px;
}

.btn-preview,
.btn-submit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-preview {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-preview:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-2px);
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-preview:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-preview svg,
.btn-submit svg {
  width: 20px;
  height: 20px;
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

.preview-modal {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
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
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
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
  transition: all 0.2s;
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
  padding: 0;
  overflow-y: auto;
  flex: 1;
  background: #f8fafc;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* PDF Preview Container */
.pdf-preview-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item label,
.preview-field label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-item span {
  color: #1e293b;
  font-weight: 500;
  font-size: 14px;
}

.preview-field {
  margin-bottom: 12px;
}

.preview-field p {
  margin: 4px 0 0 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.preview-feedback {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #334155;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.preview-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 10px;
  color: #0369a1;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.preview-link:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  transform: translateX(4px);
}

.preview-link svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  gap: 16px;
}

.preview-empty svg {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
}

.preview-empty p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8fafc;
}

.btn-secondary,
.btn-download,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-download {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-download:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary svg,
.btn-download svg,
.btn-primary svg {
  width: 16px;
  height: 16px;
}

/* Two Column Layout */
.form-layout {
  display: grid;
  grid-template-columns: 38fr 62fr;
  gap: 20px;
  align-items: start;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Full Height Card for Comments */
.card-full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-full-height .card-body-compact {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-full-height .comment-checkboxes {
  flex: 1;
  max-height: none;
}

/* Selected Count Badge */
.selected-count-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* Recipients Section - Full Width */
.recipients-section {
  width: 100%;
  margin-top: 4px;
}

/* Compact Card Styles */
.card-compact {
  margin-bottom: 0;
}

.card-header-compact {
  padding: 14px 18px;
}

.card-header-compact h3 {
  font-size: 15px;
  font-weight: 600;
}

.card-header-compact h3 svg,
.card-header-compact .card-title svg {
  width: 18px;
  height: 18px;
}

.card-body-compact {
  padding: 16px 18px;
}

.badge-count-compact {
  padding: 4px 10px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* Compact Form Elements */
.form-group-compact {
  margin-bottom: 12px;
}

.form-group-compact:last-child {
  margin-bottom: 0;
}

.form-input-compact {
  padding: 10px 12px;
  font-size: 13px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.char-count-compact {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
  margin-top: 4px;
}

/* Auto-filled Compact */
.auto-info {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.auto-label {
  font-weight: 600;
  color: #075985;
  min-width: 50px;
}

.auto-value {
  color: #0c4a6e;
  font-weight: 500;
}

/* Action Buttons Compact */
.action-buttons-compact {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn-preview-compact,
.btn-submit-compact {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview-compact {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-preview-compact:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-submit-compact {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-submit-compact:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-preview-compact:disabled,
.btn-submit-compact:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-preview-compact svg,
.btn-submit-compact svg {
  width: 16px;
  height: 16px;
}

/* Alert Compact */
.alert-compact {
  padding: 10px 14px;
  border-radius: 8px;
}

.alert-compact.alert-success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.alert-compact.alert-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

/* Rating Stars */
.rating-stars {
  display: flex;
  gap: 8px;
  align-items: center;
}

.rating-stars .star {
  font-size: 32px;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  pointer-events: auto;
}

.rating-stars .star.filled {
  color: #fbbf24;
  text-shadow: 0 2px 6px rgba(251, 191, 36, 0.35);
}

.rating-stars .star:hover {
  text-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
}

/* Selected Count */
.selected-count {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

/* Comment Checkboxes */
.comment-checkboxes {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
}

.comment-category {
  margin-bottom: 12px;
}

.comment-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
  padding-bottom: 4px;
  border-bottom: 1.5px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comment-item {
  margin-bottom: 6px;
  padding: 8px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s;
}

.comment-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-item.selected {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  width: 100%;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: #3b82f6;
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-text {
  flex: 1;
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}

.comment-item.selected .checkbox-text {
  color: #1e40af;
  font-weight: 500;
}

/* Custom Comment */
.custom-textarea-inline {
  flex: 1;
  font-size: 12px;
  padding: 6px 8px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  resize: vertical;
  transition: all 0.2s;
}

.custom-textarea-inline:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-textarea-inline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
}

.custom-textarea-inline::placeholder {
  font-size: 11px;
  color: #94a3b8;
}

/* Custom Textarea Wrapper */
.custom-textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.custom-char-count {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
}

.custom-char-count.limit-reached {
  color: #ef4444;
}

/* Badge Count (untuk header recipients) */
.badge-count {
  padding: 6px 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #93c5fd;
}

/* Clear Data Button */
.btn-clear-data {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-clear-data:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-clear-data svg {
  width: 14px;
  height: 14px;
}

/* Button Send with Loading */
.btn-send {
  position: relative;
  min-width: 160px;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.btn-loading span {
  font-size: 14px;
  font-weight: 600;
}

/* Results Modal */
.results-modal {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.results-modal .modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
}

.results-modal .modal-header h3 svg {
  width: 24px;
  height: 24px;
  color: #10b981;
}

.results-body {
  padding: 24px;
  overflow-y: auto;
}

/* Results Summary */
.results-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
}

.summary-item.success {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.summary-item.failed {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-item.success .summary-icon {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.summary-item.failed .summary-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.summary-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.summary-item.success .summary-value {
  color: #15803d;
}

.summary-item.failed .summary-value {
  color: #991b1b;
}

.summary-label {
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
}

.summary-item.success .summary-label {
  color: #166534;
}

.summary-item.failed .summary-label {
  color: #b91c1c;
}

/* Rate Limit Info */
.rate-limit-info {
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
}

.rate-limit-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 12px;
}

.rate-limit-header svg {
  width: 18px;
  height: 18px;
  color: #0284c7;
}

.rate-limit-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rate-limit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
}

.rate-label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.rate-value {
  font-size: 14px;
  font-weight: 700;
  color: #0c4a6e;
}

.rate-value.low {
  color: #dc2626;
}

.rate-limit-warning {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  border-radius: 8px;
}

.rate-limit-warning svg {
  width: 20px;
  height: 20px;
  color: #d97706;
  flex-shrink: 0;
  margin-top: 2px;
}

.rate-limit-warning span {
  font-size: 13px;
  color: #92400e;
  font-weight: 500;
  line-height: 1.5;
}

/* Results List */
.results-list {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.results-list h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.results-scroll {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.result-item.success {
  border-left: 4px solid #22c55e;
}

.result-item.failed {
  border-left: 4px solid #ef4444;
}

.result-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-item.success .result-icon {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.result-item.failed .result-icon {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.result-icon svg {
  width: 14px;
  height: 14px;
}

.result-item.success .result-icon svg {
  color: #16a34a;
}

.result-item.failed .result-icon svg {
  color: #dc2626;
}

.result-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.result-recipient {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-error {
  font-size: 12px;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .wrapper {
    padding: 0 16px;
  }

  .form-layout {
    grid-template-columns: 1fr !important;
  }

  .form-row,
  .auto-filled-grid,
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .action-section {
    flex-direction: column;
  }

  .preview-modal {
    width: 95%;
    max-height: 95vh;
  }

  .rating-stars .star {
    font-size: 28px;
  }

  .comment-checkboxes {
    max-height: 300px;
  }

  .results-summary {
    grid-template-columns: 1fr;
  }

  .results-modal {
    width: 95%;
    max-height: 90vh;
  }

  .results-scroll {
    max-height: 150px;
  }
}
</style>
