<template>
  <div class="wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Broadcast Pesan
        </h2>
        <p class="subtitle">Kirim pesan ke banyak penerima sekaligus dengan mudah</p>
      </div>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="submit" class="broadcast-form" novalidate>
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
                Nama Broadcast <span class="required">*</span>
              </label>
              <input
                ref="nameInput"
                v-model.trim="form.name"
                placeholder="Contoh: Extra Class (Fulan)"
                required
                class="form-input"
                :class="{ 'has-error': !!nameError }"
                :aria-invalid="!!nameError"
                aria-describedby="broadcast-name-error"
                @blur="nameTouched = true"
              />
              <p v-if="nameError" id="broadcast-name-error" class="field-error">{{ nameError }}</p>
            </div>

            <div class="form-group">
              <label class="form-label">
                Jadwal Kirim <span class="optional">(Opsional)</span>
              </label>
              <input v-model="form.schedule" type="datetime-local" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <div id="broadcast-message-label" class="form-label message-template-label">
              <span class="message-label-title">Pesan <span class="required">*</span></span>
              <div class="template-actions" aria-label="Template pesan broadcast">
                <ChatTemplatePicker @select="selectTemplate" />
              </div>
            </div>
            <textarea
              v-model.trim="form.message"
              aria-labelledby="broadcast-message-label"
              rows="4"
              placeholder="Tulis pesan yang akan dikirim ke semua penerima...&#10;&#10;💡 Gunakan {{siswa}} untuk nama depan penerima (hanya berlaku untuk kontak)"
              required
              class="form-textarea"
            />
            <div class="form-help">
              {{ form.message.length }} karakter
              <span v-if="form.schedule">
                • Dijadwalkan:
                {{ formatLocalTime(convertToServerTime(form.schedule)) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Media Upload -->
      <MediaUpload v-model="mediaFile" />

      <!-- Card 3: Recipients -->
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

      <!-- Alerts -->
      <div v-if="msg || err" class="alert-section">
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
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span v-if="loading">Memproses...</span>
          <span v-else>{{
            form.schedule ? "Jadwalkan Broadcast" : "Kirim Sekarang"
          }}</span>
        </button>
      </div>
    </form>
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
import {
  convertToServerTime,
  formatLocalTime,
  isValidDateTime,
} from "../utils/datetime.js";

const toast = useToast();
const { selectedDeviceId, selectedDevice, loadDevices } = useDevices();

// Template ref for RecipientsPicker
const recipientsPicker = ref(null);

const form = ref({
  name: "",
  delay: 5000,
  message: "",
  schedule: "",
});

function selectTemplate(template) {
  form.value.message = template.message || "";
  toast.success(`Template “${template.title}” berhasil diterapkan`);
}

const mediaFile = ref(null);

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

const validationError = computed(() => {
  if (!selectedDeviceId.value) return "Pilih device terlebih dahulu";
  if (!form.value.name) return "Nama wajib diisi";
  if (!form.value.message) return "Pesan wajib diisi";

  const recipients = recipientsPicker.value?.recipients || [];
  if (recipients.length === 0) return "Minimal satu penerima";

  if (form.value.schedule && !isValidDateTime(form.value.schedule)) {
    return "Format jadwal tidak valid";
  }

  const hasAll = recipients.includes("all");
  const hasLabel = recipients.some((r) => String(r).startsWith("label"));
  if (hasAll && hasLabel) return "Tidak boleh mencampur all dan label_* dalam penerima";
  return "";
});

async function submit() {
  // 🔒 Extra safety: Prevent double submit
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
    const deviceId = selectedDeviceId.value;
    if (!deviceId) {
      loading.value = false;
      return;
    }

    if (
      selectedDevice.value &&
      !selectedDevice.value.isConnected
    ) {
      toast.error(
        "Device tidak terhubung. Silakan pilih device lain atau hubungkan kembali WhatsApp."
      );
      loading.value = false;
      return;
    }

    const payloadDelay = form.value.delay ?? 5000;
    const scheduleISO = form.value.schedule
      ? convertToServerTime(form.value.schedule)
      : undefined;

    const recipients = recipientsPicker.value?.recipients || [];

    if (!mediaFile.value) {
      await deviceApi.post("/messages/broadcasts", {
        name: form.value.name,
        message: form.value.message,
        delay: payloadDelay,
        schedule: scheduleISO,
        recipients: recipients,
      });
    } else {
      const fd = new FormData();
      fd.append("name", form.value.name);
      fd.append("message", form.value.message);
      fd.append("delay", String(payloadDelay));
      if (scheduleISO) fd.append("schedule", scheduleISO);
      recipients.forEach((r) => fd.append("recipients", r));
      fd.append("media", mediaFile.value);
      await deviceApi.post("/messages/broadcasts", fd);
    }

    toast.success(
      "Broadcast berhasil " + (form.value.schedule ? "dijadwalkan" : "dikirim")
    );
    form.value.name = "";
    form.value.message = "";
    form.value.delay = 5000;
    form.value.schedule = "";
    recipientsPicker.value?.resetRecipients();
    mediaFile.value = null;
    submitAttempted.value = false;
    nameTouched.value = false;
  } catch (e) {
    console.error("Broadcast error:", e);

    const errorMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message;

    if (
      errorMsg?.includes("Session not found") ||
      errorMsg?.includes("unauthorized") ||
      e?.response?.status === 401
    ) {
      toast.error(
        "Session WhatsApp tidak ditemukan. Device perlu di-pairing ulang atau pilih device lain yang aktif."
      );
      await loadDevices({ force: true });
    } else {
      toast.error(
        errorMsg || "Gagal mengirim broadcast. Pastikan WhatsApp sudah terhubung"
      );
    }
  } finally {
    loading.value = false;
  }
}

watch(selectedDeviceId, (deviceId, previousDeviceId) => {
  if (!previousDeviceId || String(deviceId) === String(previousDeviceId)) return;
  recipientsPicker.value?.resetRecipients();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* Base Styles - Konsisten dengan menu lain */
.wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Page Header - Konsisten dengan Contacts */
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
}

/* Form */
.broadcast-form {
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

.optional {
  color: var(--theme-text-muted);
  font-weight: 400;
}

.form-input,
.form-textarea {
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
.form-textarea:focus {
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

/* Alerts */
.alert-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

  .broadcast-form {
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

  .form-group,
  .form-row {
    min-width: 0;
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
  .form-textarea {
    min-width: 0;
    font-size: 16px;
  }

  .form-help {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
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
