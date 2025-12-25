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
    <form @submit.prevent="submit" class="broadcast-form">
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
                v-model.trim="form.name"
                placeholder="Contoh: Extra Class (Fulan)"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                Jadwal Kirim <span class="optional">(Opsional)</span>
              </label>
              <input v-model="form.schedule" type="datetime-local" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              Pesan <span class="required">*</span>
              <button
                type="button"
                class="badge-template"
                @click="applyTemplate('offer-ec')"
                title="Klik untuk mengisi template penawaran Extra Class"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Offer EC
              </button>
              <button
                type="button"
                class="badge-template badge-template-reminder"
                @click="applyTemplate('reminder-ec')"
                title="Klik untuk mengisi template pengingat Extra Class"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Reminder EC
              </button>
              <button
                type="button"
                class="badge-template badge-template-warning"
                @click="applyTemplate('reminder-class')"
                title="Klik untuk mengisi template pengingat siswa belum bergabung ke kelas"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Reminder Class
              </button>
              <button
                type="button"
                class="badge-template badge-template-graduation"
                @click="applyTemplate('invit-grad')"
                title="Klik untuk mengisi template undangan Graduation"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Invit Grad
              </button>
            </label>
            <textarea
              v-model.trim="form.message"
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
      <div v-if="validationError || msg || err" class="alert-section">
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
import { ref, computed, onMounted, watch } from "vue";
import { deviceApi } from "../api/http.js";
import { useToast } from "../composables/useToast.js";
import RecipientsPicker from "../components/RecipientsPicker.vue";
import DevicePicker from "../components/DevicePicker.vue";
import MediaUpload from "../components/MediaUpload.vue";
import {
  convertToServerTime,
  formatLocalTime,
  isValidDateTime,
} from "../utils/datetime.js";

const toast = useToast();

// Template ref for DevicePicker
const devicePicker = ref(null);

// Template ref for RecipientsPicker
const recipientsPicker = ref(null);

// Message templates
const messageTemplates = {
  "offer-ec": `Selamat pagi Ayah/Bunda, mohon maaf mengganggu waktunya. Saya ingin menginformasikan bahwa sebagai pengganti pertemuan sebelumnya, {{siswa}} telah saya daftarkan ke kelas tambahan atau Extra Class (EC), yang akan diadakan pada hari Minggu pukul 08.00 WIB. Apakah {{siswa}} dapat mengikuti kelas pada waktu tersebut? Terima kasih atas perhatian dan kerjasamanya. 🙏`,
  "reminder-ec": `Selamat pagi Ayah/Bunda, mohon maaf mengganggu waktunya. Sebagai pengingat, kelas tambahan atau Extra Class (EC) untuk {{siswa}} akan segera dimulai hari ini pukul 08.00 WIB. Mohon bantuan Ayah/Bunda untuk mengingatkan {{siswa}} agar dapat segera bergabung ke Zoom tepat waktu. Terima kasih atas perhatian dan kerja samanya. 🙏`,
  "reminder-class": `Selamat pagi Ayah/Bunda, mohon maaf mengganggu. Saya ingin menginformasikan bahwa hingga saat ini {{siswa}} belum bergabung ke kelas yang sedang berlangsung. Mohon bantuan Ayah/Bunda untuk mengingatkan {{siswa}} agar dapat segera bergabung ke Zoom. Terima kasih atas perhatian dan kerja samanya. 🙏`,
  "invit-grad": `Selamat pagi Ayah/Bunda,

Dengan hormat, kami mengundang Ayah/Bunda untuk menghadiri Acara Graduation (to next level) sebagai bentuk apresiasi atas proses belajar yang telah diikuti oleh {{siswa}}.

Acara Graduation akan dilaksanakan pada:
📅 Hari/Tanggal: Sabtu, 15 Juni 2025
⏰ Waktu: 09.00 WIB – selesai
💻 Tempat: Zoom Meeting

Acara ini bertujuan untuk merayakan pencapaian siswa selama mengikuti pembelajaran serta memberikan pengalaman berharga bagi mereka.

Kami sangat berharap kehadiran Ayah/Bunda untuk mendampingi {{siswa}} dalam momen spesial ini.

Terima kasih atas perhatian dan kerja sama Ayah/Bunda. 🙏`,
};

// Apply template to message textarea
function applyTemplate(templateId) {
  const template = messageTemplates[templateId];
  if (template) {
    form.value.message = template;
    toast.success(
      "Template berhasil diterapkan! Variabel {{siswa}} akan diganti dengan nama depan kontak saat pengiriman."
    );
  }
}

const form = ref({
  name: "",
  delay: 5000,
  message: "",
  schedule: "",
});

const mediaFile = ref(null);

const loading = ref(false);
const msg = ref("");
const err = ref("");

const validationError = computed(() => {
  if (!devicePicker.value?.selectedDeviceId) return "Pilih device terlebih dahulu";
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
      loading.value = false;
      return;
    }

    if (
      devicePicker.value?.selectedDevice &&
      !devicePicker.value?.selectedDevice.isConnected
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
      await devicePicker.value?.loadDevices();
    } else {
      toast.error(
        errorMsg || "Gagal mengirim broadcast. Pastikan WhatsApp sudah terhubung"
      );
    }
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

.optional {
  color: #94a3b8;
  font-weight: 400;
}

/* Template Badge */
.badge-template {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  margin-left: 8px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge-template:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
}

.badge-template:active {
  transform: translateY(0);
}

.badge-template svg {
  width: 12px;
  height: 12px;
}

/* Reminder EC badge variant - blue/cyan color */
.badge-template-reminder {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0369a1;
  border: 1px solid #38bdf8;
}

.badge-template-reminder:hover {
  background: linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%);
  box-shadow: 0 2px 6px rgba(56, 189, 248, 0.3);
}

/* Reminder Class badge variant - orange/red for urgency */
.badge-template-warning {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #b91c1c;
  border: 1px solid #f87171;
}

.badge-template-warning:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  box-shadow: 0 2px 6px rgba(248, 113, 113, 0.3);
}

/* Graduation badge variant - purple/violet for celebration */
.badge-template-graduation {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #7c3aed;
  border: 1px solid #a78bfa;
}

.badge-template-graduation:hover {
  background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
  box-shadow: 0 2px 6px rgba(167, 139, 250, 0.3);
}

.form-input,
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
.form-textarea:focus {
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
