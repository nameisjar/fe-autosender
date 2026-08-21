<template>
  <div class="wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Broadcast Berulang
        </h2>
        <p class="subtitle">
          Jadwalkan pengiriman pesan yang berulang secara otomatis berdasarkan interval
          waktu yang Anda tentukan. Waktu akan dikirim sesuai persis dengan input Anda.
        </p>
      </div>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="submit" class="reminder-form">
      <!-- Card 1: Basic Info -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
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
                v-model.trim="form.name"
                placeholder="Contoh: Pengingat kelas mingguan"
                required
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <div id="recurring-message-label" class="form-label message-template-label">
              <span class="message-label-title">Pesan <span class="required">*</span></span>
              <div class="template-actions" aria-label="Template pesan broadcast berulang">
                <ChatTemplatePicker @select="selectTemplate" />
              </div>
            </div>
            <textarea
              v-model.trim="form.message"
              aria-labelledby="recurring-message-label"
              rows="4"
              placeholder="Tulis pesan yang akan dikirim secara berulang...&#10;&#10;💡 Gunakan {{siswa}} untuk nama depan penerima (hanya berlaku untuk kontak)"
              required
              class="form-textarea"
            />
            <div class="form-help">{{ form.message.length }} karakter</div>
          </div>
        </div>
      </div>

      <!-- Card 2: Schedule Settings -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Pengaturan Jadwal
          </h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                Jenis Pengulangan <span class="required">*</span>
              </label>
              <select v-model="form.recurrence" required class="form-select">
                <option value="minute">Per Menit</option>
                <option value="hourly">Per Jam</option>
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label"> Interval <span class="required">*</span> </label>
              <input
                v-model.number="form.interval"
                type="number"
                min="1"
                required
                class="form-input"
                placeholder="Contoh: 1"
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
                Setiap berapa
                {{
                  form.recurrence === "minute"
                    ? "menit"
                    : form.recurrence === "hourly"
                    ? "jam"
                    : form.recurrence === "daily"
                    ? "hari"
                    : form.recurrence === "weekly"
                    ? "minggu"
                    : "bulan"
                }}
              </small>
            </div>

            <div class="form-group">
              <label class="form-label">
                Tanggal Mulai <span class="required">*</span>
              </label>
              <input
                v-model="form.startDate"
                type="datetime-local"
                required
                class="form-input"
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
                Waktu akan dikirim sesuai persis dengan input Anda
              </small>
            </div>

            <div class="form-group">
              <label class="form-label">
                Tanggal Selesai <span class="required">*</span>
              </label>
              <input
                v-model="form.endDate"
                type="datetime-local"
                required
                class="form-input"
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
                Jadwal terakhir sebelum waktu ini
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Media Upload -->
      <MediaUpload v-model="mediaFile" />

      <!-- Card 4: Recipients -->
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
            </div>
          </div>
        </div>

        <div v-if="validationError" class="alert alert-error">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="7" x2="12" y2="14" />
            <circle cx="12" cy="17" r="0.6" />
          </svg>

          {{ validationError }}
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
        <button type="submit" class="btn-submit" :disabled="loading || !!validationError">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span v-if="loading">Memproses...</span>
          <span v-else>Jadwalkan Broadcast</span>
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
  isValidDateTime,
  calculateEstimatedCount,
} from "../utils/datetime.js";

const toast = useToast();
const { selectedDeviceId } = useDevices();

// Template refs
const recipientsPicker = ref(null);

const form = ref({
  name: "",
  message: "",
  delay: 5000,
  recurrence: "daily",
  interval: 1,
  startDate: "",
  endDate: "",
});

const mediaFile = ref(null);

const loading = ref(false);
const msg = ref("");
const err = ref("");

function selectTemplate(template) {
  form.value.message = template.message || "";
  toast.success(`Template “${template.title}” berhasil diterapkan`);
}

const validationError = computed(() => {
  if (!selectedDeviceId.value) return "Pilih device terlebih dahulu";
  if (!form.value.name) return "Nama wajib diisi";
  if (!form.value.message) return "Pesan wajib diisi";
  if (!form.value.startDate || !form.value.endDate) return "Rentang tanggal wajib diisi";
  if (!isValidDateTime(form.value.startDate) || !isValidDateTime(form.value.endDate)) {
    return "Format tanggal tidak valid";
  }
  const start = new Date(form.value.startDate);
  const end = new Date(form.value.endDate);
  if (start > end) return "Tanggal mulai harus sebelum tanggal selesai";
  if (!form.value.interval || Number(form.value.interval) <= 0)
    return "Interval harus lebih dari 0";

  const recipients = recipientsPicker.value?.recipients || [];
  if (recipients.length === 0) return "Minimal satu penerima";
  const hasAll = recipients.includes("all");
  const hasLabel = recipients.some((r) => r.startsWith("label"));
  if (hasAll && hasLabel) return "Tidak boleh mencampur all dan label_* dalam penerima";
  return "";
});

const estimatedCount = computed(() => {
  return calculateEstimatedCount(
    form.value.startDate,
    form.value.endDate,
    form.value.recurrence,
    form.value.interval
  );
});

async function submit() {
  // 🔒 Extra safety: Prevent double submit
  if (loading.value) return;
  
  msg.value = "";
  err.value = "";
  if (validationError.value) {
    toast.error(validationError.value);
    return;
  }

  loading.value = true;
  try {
    const deviceId = selectedDeviceId.value;
    if (!deviceId) {
      toast.error("Device tidak ditemukan atau belum login WhatsApp");
      loading.value = false;
      return;
    }

    const startDateISO = convertToServerTime(form.value.startDate);
    const endDateISO = convertToServerTime(form.value.endDate);
    const recipients = recipientsPicker.value?.recipients || [];

    if (!mediaFile.value) {
      await deviceApi.post("/messages/broadcasts/scheduled", {
        name: form.value.name,
        message: form.value.message,
        delay: form.value.delay ?? 5000,
        recurrence: form.value.recurrence,
        interval: form.value.interval,
        startDate: startDateISO,
        endDate: endDateISO,
        recipients: recipients,
        deviceId,
      });
    } else {
      const fd = new FormData();
      fd.append("name", form.value.name);
      fd.append("message", form.value.message);
      fd.append("delay", String(form.value.delay ?? 5000));
      fd.append("recurrence", form.value.recurrence);
      fd.append("interval", String(form.value.interval));
      fd.append("startDate", startDateISO);
      fd.append("endDate", endDateISO);
      fd.append("deviceId", deviceId);
      recipients.forEach((r) => fd.append("recipients", r));
      fd.append("media", mediaFile.value);

      await deviceApi.post("/messages/broadcasts/scheduled", fd);
    }

    toast.success("Jadwal broadcast berulang berhasil dibuat");
    form.value.name = "";
    form.value.message = "";
    form.value.delay = 5000;
    form.value.interval = 1;
    form.value.recurrence = "daily";
    form.value.startDate = "";
    form.value.endDate = "";
    recipientsPicker.value?.resetRecipients();
    mediaFile.value = null;
  } catch (e) {
    toast.error(
      e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Gagal membuat jadwal broadcast berulang. Pastikan WhatsApp sudah terhubung"
    );
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

.device-info-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--theme-gradient-surface);
  border: 1.5px solid var(--theme-border);
  border-radius: 10px;
  margin-bottom: 16px;
}

.device-avatar-compact {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-avatar-compact svg {
  width: 20px;
  height: 20px;
  color: white;
}

.device-avatar-compact.online {
  background: linear-gradient(135deg, #86efac 0%, #4ade80 100%);
}

.device-info-text {
  flex: 1;
  min-width: 0;
}

.device-name-compact {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-phone-inline {
  font-size: 14px;
  color: var(--theme-text-muted);
  font-weight: 500;
}

.device-status-compact {
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
}

.device-status-compact.online {
  color: #059669;
}

.btn-change-compact {
  padding: 6px 12px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  color: var(--theme-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-change-compact:hover {
  background: var(--theme-surface-soft);
  border-color: var(--theme-border-strong);
}

.device-list-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: var(--theme-text-muted);
  font-size: 14px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid var(--theme-border);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.device-empty {
  padding: 24px;
  text-align: center;
  color: var(--theme-text-muted);
  font-size: 14px;
}

.device-empty p {
  margin: 0;
}

.device-item-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  font-size: 13px;
  font-weight: 500;
  color: var(--theme-text);
}

.device-item-compact:hover {
  background: var(--theme-surface-soft);
  border-color: #3b82f6;
}

.device-item-compact.online {
  border-color: var(--theme-success-border);
}

.device-item-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: #10b981;
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
  min-width: 0;
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
    width: 100%;
  }

  .form-input,
  .form-textarea,
  .form-select {
    min-width: 0;
    font-size: 16px;
  }
}
</style>
