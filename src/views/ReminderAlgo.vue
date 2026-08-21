<template>
  <div class="wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Reminder (Algo)
        </h2>
        <p class="subtitle">
          Pengiriman akan berulang setiap minggu. Waktu akan dikirim sesuai persis dengan
          input Anda. Bisa digunakan untuk pengingat 1 hari sebelum kelas dan 3 jam
          sebelum kelas.
        </p>
      </div>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="openConfirmation" class="reminder-form" novalidate>
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
                Nama Reminder <span class="required">*</span>
              </label>
              <input
                ref="nameInput"
                v-model.trim="form.name"
                placeholder="Contoh: IND-PS-358-SAT-16.00 {PREM} (H-3)"
                required
                class="form-input"
                :class="{ 'has-error': !!nameError }"
                :aria-invalid="!!nameError"
                aria-describedby="reminder-name-error"
                @blur="nameTouched = true"
              />
              <p v-if="nameError" id="reminder-name-error" class="field-error">{{ nameError }}</p>
            </div>

            <div class="form-group">
              <label class="form-label">
                Jumlah Reminder <span class="required">*</span>
              </label>
              <input
                v-model.number="form.lessons"
                type="number"
                min="1"
                required
                class="form-input"
                placeholder="Jumlah pengulangan"
              />
              <small class="help-text">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Jumlah pengulangan (lesson saat ini - total lesson)
              </small>
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
          </div>

          <div class="form-group">
            <div id="reminder-message-label" class="form-label message-template-label">
              <span class="message-label-title">Pesan <span class="required">*</span></span>
              <div class="template-actions" aria-label="Template pesan reminder">
                <ChatTemplatePicker @select="selectTemplate" />
              </div>
            </div>
            <textarea
              v-model.trim="form.message"
              aria-labelledby="reminder-message-label"
              rows="4"
              placeholder="Tulis pesan reminder yang akan dikirim...&#10;&#10;💡 Gunakan {{siswa}} untuk nama depan penerima (hanya berlaku untuk kontak)"
              required
              class="form-textarea"
            />
            <div class="form-help">{{ form.message.length }} karakter</div>
          </div>
        </div>
      </div>

      <!-- Card 2: Media Upload -->
      <!-- test -->
      <MediaUpload v-model="mediaFile" />

      <!-- Card 3: Recipients - Menggunakan RecipientsPicker -->
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
      <div v-if="msg || err" class="info-section">
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
            <path
              d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-if="loading">Memproses...</span>
          <span v-else>Jadwalkan Reminder</span>
        </button>
      </div>
    </form>

    <BroadcastConfirmationModal
      v-model="showConfirmation"
      title="Konfirmasi Jadwal Reminder"
      confirm-label="Konfirmasi Jadwalkan"
      :items="confirmationItems"
      :loading="loading"
      notice="Reminder akan dikirim setiap minggu sesuai jumlah lesson setelah dikonfirmasi."
      @confirm="confirmSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { deviceApi } from "../api/http.js";
import { useDevices } from "../composables/useDevices.js";
import { useToast } from "../composables/useToast.js";
import ChatTemplatePicker from "../components/ChatTemplatePicker.vue";
import RecipientsPicker from "../components/RecipientsPicker.vue";
import MediaUpload from "../components/MediaUpload.vue";
import BroadcastConfirmationModal from "../components/BroadcastConfirmationModal.vue";
import {
  formatDeviceSummary,
  formatRecipientSelection,
} from "../utils/broadcastConfirmation.js";
import {
  convertToServerTime,
  formatLocalTime,
  isValidDateTime,
  addInterval,
} from "../utils/datetime.js";

const toast = useToast();
const { selectedDeviceId, selectedDevice } = useDevices();

// Template refs
const recipientsPicker = ref(null);

const form = ref({
  name: "",
  message: "",
  lessons: 1,
  delay: 5000,
  schedule: "",
});

const mediaFile = ref(null);

const loading = ref(false);
const msg = ref("");
const err = ref("");
const nameInput = ref(null);
const submitAttempted = ref(false);
const nameTouched = ref(false);
const showConfirmation = ref(false);
const nameError = computed(() =>
  (submitAttempted.value || nameTouched.value) && !form.value.name.trim()
    ? "Nama wajib diisi"
    : ""
);

function selectTemplate(template) {
  form.value.message = template.message || "";
  toast.success(`Template “${template.title}” berhasil diterapkan`);
}

const estimatedCount = computed(() => {
  return Number(form.value.lessons || 1);
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
  if (!selectedDeviceId.value) return "Pilih device terlebih dahulu";
  if (!form.value.name) return "Nama wajib diisi";
  if (!form.value.message) return "Pesan wajib diisi";
  if (!form.value.lessons || Number(form.value.lessons) <= 0)
    return "Jumlah lesson minimal 1";
  if (!form.value.schedule) return "Tanggal mulai wajib diisi";
  if (!isValidDateTime(form.value.schedule)) return "Format tanggal mulai tidak valid";

  const recipients = recipientsPicker.value?.recipients || [];
  if (recipients.length === 0) return "Minimal satu penerima";
  const hasAll = recipients.includes("all");
  const hasLabel = recipients.some((r) => r.startsWith("label"));
  if (hasAll && hasLabel) return "Tidak boleh mencampur all dan label_* dalam penerima";
  return "";
});

const confirmationItems = computed(() => [
  { label: "Nama", value: form.value.name },
  { label: "Device", value: formatDeviceSummary(selectedDevice.value) },
  {
    label: "Penerima",
    value: formatRecipientSelection(recipientsPicker.value?.recipients || []),
  },
  { label: "Mulai", value: formatLocalTime(convertToServerTime(form.value.schedule)) },
  { label: "Estimasi kirim", value: `${estimatedCount.value} kali` },
  { label: "Perkiraan selesai", value: lastDate.value || "-" },
  { label: "Lampiran", value: mediaFile.value?.name || "Tanpa lampiran" },
]);

const openConfirmation = () => {
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
  if (selectedDevice.value && !selectedDevice.value.isConnected) {
    toast.error("Device tidak terhubung. Hubungkan kembali WhatsApp atau pilih device lain.");
    return;
  }
  showConfirmation.value = true;
};

const confirmSubmit = async () => {
  if (loading.value) return;
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

    if (!mediaFile.value) {
      const payload = {
        name: form.value.name,
        message: form.value.message,
        lessons: form.value.lessons,
        delay: form.value.delay ?? 5000,
        schedule: scheduleISO,
        recipients: recipients,
        deviceId,
      };
      await deviceApi.post("/messages/broadcasts/reminder-algo", payload);
    } else {
      const fd = new FormData();
      fd.append("name", form.value.name);
      fd.append("message", form.value.message);
      fd.append("lessons", String(form.value.lessons));
      fd.append("delay", String(form.value.delay ?? 5000));
      fd.append("schedule", scheduleISO);
      fd.append("deviceId", deviceId);
      recipients.forEach((r) => fd.append("recipients", r));
      fd.append("media", mediaFile.value);
      await deviceApi.post("/messages/broadcasts/reminder-algo", fd);
    }

    toast.success("Jadwal reminder berhasil dibuat");
    form.value.name = "";
    form.value.message = "";
    form.value.lessons = 1;
    form.value.delay = 5000;
    form.value.schedule = "";
    recipientsPicker.value?.resetRecipients();
    mediaFile.value = null;
    submitAttempted.value = false;
    nameTouched.value = false;
    showConfirmation.value = false;
  } catch (e) {
    const errorMsg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Gagal mengirim reminder berkala. Pastikan WhatsApp sudah terhubung";
    toast.error(errorMsg);
  } finally {
    loading.value = false;
  }
};

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
.reminder-form {
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

/* Button Refresh Header */
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
.badge-optional {
  padding: 6px 12px;
  background: var(--theme-gradient-info);
  color: #4338ca;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #a5b4fc;
}

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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

.message-template-label {
  flex-wrap: wrap;
}

.message-label-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.template-actions {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 8px;
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

.help-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--theme-text-muted);
  margin-top: 4px;
  font-style: normal;
}

.help-text svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: var(--theme-text-muted);
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

  .upload-label {
    padding: 32px 20px;
  }

  .form-actions {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .wrapper {
    padding: 0 12px;
  }

  .header-content h2 {
    font-size: 20px;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .reminder-form {
    gap: 16px;
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

  .message-template-label {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .template-actions {
    display: block;
    width: 100%;
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
