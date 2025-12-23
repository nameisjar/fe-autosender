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
      <!-- Card 0: Device Selection -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Pilih Device WhatsApp
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
        <div class="card-body">
          <DevicePicker ref="devicePicker" @device-changed="onDeviceChanged" />
        </div>
      </div>

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
            <label class="form-label"> Pesan <span class="required">*</span> </label>
            <textarea
              v-model.trim="form.message"
              rows="4"
              placeholder="Tulis pesan yang akan dikirim secara berulang..."
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
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Media
          </h3>
          <span class="badge-optional">Opsional</span>
        </div>
        <div class="card-body">
          <div class="upload-section">
            <input
              type="file"
              @change="onFile"
              :accept="acceptTypes"
              class="file-input"
              id="media-upload"
            />
            <label v-if="!mediaFile" for="media-upload" class="upload-label">
              <div class="upload-icon-wrapper">
                <svg
                  class="upload-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div class="upload-text">
                <p class="upload-title">Klik untuk upload media</p>
                <p class="upload-subtitle">
                  Mendukung: Gambar, Video, Audio, dan Dokumen
                </p>
              </div>
            </label>

            <!-- Media Preview -->
            <div v-else class="media-preview-section">
              <!-- Image Preview -->
              <div v-if="isImage" class="media-preview image-preview">
                <img :src="mediaPreview" alt="Preview" />
              </div>

              <!-- Document Preview -->
              <div v-else class="media-preview document-preview">
                <div class="doc-icon-wrapper">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2h12a2 2 0 0 0 2-2V8z"
                    />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div class="doc-details">
                  <p class="doc-name">{{ mediaName }}</p>
                </div>
              </div>

              <button type="button" class="btn-remove-media" @click="removeMedia">
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
                Hapus Media
              </button>
            </div>
          </div>
        </div>
      </div>

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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div class="info-content">
            <div class="info-text">
              Estimasi kirim: <strong>{{ estimatedCount }}</strong> kali
            </div>
          </div>
        </div>

        <div v-if="validationError" class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
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
import { ref, computed } from "vue";
import { deviceApi } from "../api/http.js";
import { useToast } from "../composables/useToast.js";
import RecipientsPicker from "../components/RecipientsPicker.vue";
import DevicePicker from "../components/DevicePicker.vue";
import {
  convertToServerTime,
  isValidDateTime,
  calculateEstimatedCount,
} from "../utils/datetime.js";

const toast = useToast();

// Template refs
const devicePicker = ref(null);
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
const mediaPreview = ref("");

const acceptTypes =
  ".png,.jpg,.jpeg,.webp,.gif,.mp4,.mp3,.wav,.pdf,.doc,.docx,.xls,.xlsx,.txt";

const isImage = computed(
  () => mediaFile.value && mediaFile.value.type?.startsWith("image")
);
const mediaName = computed(() => mediaFile.value?.name || "");

const loading = ref(false);
const msg = ref("");
const err = ref("");

function onFile(e) {
  const file = e.target.files?.[0];
  mediaFile.value = file || null;
  if (file && file.type?.startsWith("image")) {
    mediaPreview.value = URL.createObjectURL(file);
  } else {
    mediaPreview.value = "";
  }
}

function removeMedia() {
  mediaFile.value = null;
  mediaPreview.value = "";
  const input = document.getElementById("media-upload");
  if (input) input.value = "";
}

const validationError = computed(() => {
  if (!devicePicker.value?.selectedDeviceId) return "Pilih device terlebih dahulu";
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
  msg.value = "";
  err.value = "";
  if (validationError.value) {
    toast.error(validationError.value);
    return;
  }

  loading.value = true;
  try {
    const deviceId = devicePicker.value?.selectedDeviceId;
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
    mediaPreview.value = "";
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

function onDeviceChanged() {
  recipientsPicker.value?.resetRecipients();
  toast.success(
    "Device berhasil diganti. Data kontak, grup, dan label telah di-refresh."
  );
}
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
  color: #1e293b;
}

.header-content h2 svg {
  width: 32px;
  height: 32px;
  color: #3b82f6;
  stroke-width: 2.5;
}

.subtitle {
  margin: 0;
  color: #64748b;
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
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: visible;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
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

.device-info-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1.5px solid #e2e8f0;
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
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-phone-inline {
  font-size: 14px;
  color: #64748b;
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
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-change-compact:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
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
  color: #64748b;
  font-size: 14px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.device-empty {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
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
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.device-item-compact:hover {
  background: #f8fafc;
  border-color: #3b82f6;
}

.device-item-compact.online {
  border-color: #86efac;
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
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #a5b4fc;
}

.badge-count {
  padding: 6px 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #93c5fd;
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
  color: #475569;
  font-size: 13px;
}

.required {
  color: #ef4444;
}

.form-input,
.form-textarea,
.form-select {
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
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
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
  color: #64748b;
  font-size: 13px;
}

.help-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
  font-style: normal;
}

.help-text svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: #94a3b8;
}

/* Upload Section */
.upload-section {
  position: relative;
}

.file-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 48px 32px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.upload-label:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.upload-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.upload-text {
  text-align: center;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.upload-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Media Preview Section */
.media-preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-preview {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  min-height: 200px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  display: block;
}

.document-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
}

.doc-icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-icon-wrapper svg {
  width: 32px;
  height: 32px;
  color: #1e40af;
}

.doc-details {
  flex: 1;
  min-width: 0;
}

.doc-name {
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}

.btn-remove-media {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border: 1.5px solid #fca5a5;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-remove-media:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #f87171;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.btn-remove-media svg {
  width: 18px;
  height: 18px;
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
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #93c5fd;
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
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.alert-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

/* Form Actions */
.form-actions {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
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
    padding: 14px 16px;
  }

  .card-body {
    padding: 16px;
  }
}
</style>
