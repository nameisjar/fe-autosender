<template>
  <div class="card-header-section">
    <h3>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path
          d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
        />
        <path
          d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
        />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
      Pairing WhatsApp (QR Code)
    </h3>
  </div>

  <div class="toolbar">
    <div class="filters">
      <div class="field">
        <label>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          Pilih Device
        </label>
        <select :value="deviceId" @change="$emit('update:deviceId', $event.target.value)">
          <option value="" disabled>Pilih device</option>
          <option v-for="d in devices" :key="d.id" :value="String(d.id)">
            {{ d.name }} - {{ humanStatus(d.status) }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>&nbsp;</label>
        <div class="row-btns">
          <button
            v-if="selectedStatus !== 'open'"
            class="btn primary"
            @click="$emit('startPairing')"
            :disabled="!deviceId || pairingLoading || (isTutor && tutorHasConnectedDevice)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {{ pairingLoading ? 'Menunggu QR...' : 'Mulai Pairing' }}
          </button>

          <button
            v-else-if="!isTutor"
            class="btn outline"
            @click="$emit('selectNextDisconnectedDevice')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
              />
            </svg>
            Pairing Device Lain
          </button>

          <button
            v-if="controllerActive && selectedStatus !== 'open'"
            class="btn outline"
            @click="$emit('stopPairing')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
            Hentikan
          </button>
        </div>
      </div>
    </div>
  </div>

  <p class="hint">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
    Scan QR dari WhatsApp di ponsel Anda. Jika sudah terhubung, jangan lupa untuk di-refresh.
  </p>

  <div v-if="selectedStatus === 'open'" class="connection-success">
    <div class="success-icon-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    </div>
    <div class="success-content">
      <h4>✅ WhatsApp Berhasil Terhubung!</h4>
      <p>
        Device <strong>{{ selectedDevice?.name }}</strong> sudah siap digunakan untuk mengirim pesan
        dan broadcast.
      </p>
    </div>
  </div>

  <template v-else>
    <div v-if="pairingLoading && !apiError && !qr" class="status-bar status-bar-connecting">
      <div class="status-spinner"></div>
      <span class="status-message">{{ statusText || 'Menghubungkan ke WhatsApp...' }}</span>
    </div>

    <div v-else-if="apiError && !qr" class="status-bar status-bar-error">
      <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="status-message">{{ apiError }}</span>
      <button v-if="!pairingLoading" @click="$emit('quickRetryPairing')" class="status-retry-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Generate Ulang
      </button>
    </div>

    <div v-if="waitingDisconnect" class="status-bar status-bar-waiting">
      <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span class="status-message"
        >Menunggu status terputus... (<strong>{{ disconnectCountdown }}s</strong>)</span
      >
    </div>

    <div v-if="qr && selectedStatus !== 'open'" class="qr-section">
      <h3 class="qr-main-title">Tautkan dengan WhatsApp</h3>
      <div class="qr-layout">
        <div class="qr-instructions-side">
          <div class="instruction-item">
            <div class="instruction-number">1</div>
            <div class="instruction-content">
              <span class="instruction-text">Buka <strong>WhatsApp</strong> di ponsel</span>
            </div>
          </div>
          <div class="instruction-item">
            <div class="instruction-number">2</div>
            <div class="instruction-content">
              <span class="instruction-text"
                >Ketuk <strong>Menu</strong> <span class="instruction-icon">⋮</span> atau
                <strong>Setelan</strong> <span class="instruction-icon">⚙</span> dan pilih
                <strong>Perangkat Tertaut</strong></span
              >
            </div>
          </div>
          <div class="instruction-item">
            <div class="instruction-number">3</div>
            <div class="instruction-content">
              <span class="instruction-text">Ketuk <strong>Tautkan Perangkat</strong></span>
            </div>
          </div>
          <div class="instruction-item">
            <div class="instruction-number">4</div>
            <div class="instruction-content">
              <span class="instruction-text"
                >Arahkan ponsel ke layar ini untuk <strong>memindai kode QR</strong></span
              >
            </div>
          </div>

          <!-- Timer info removed per request -->
          <!-- <div v-if="!qrExpired" class="timer-info" :class="{ 'timer-warning': qrTimeLeft <= 10 }"> ... </div> -->
        </div>

        <div class="qr-code-side">
          <div class="qr-box" :class="{ 'qr-expired': qrExpired }">
            <img :src="qr" alt="QR Code" @error="$emit('qrImageError')" />

            <div v-if="qrExpired" class="qr-expired-overlay" @click="$emit('quickRetryPairing')">
              <div class="reload-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <p class="reload-text">Klik untuk muat ulang kode QR</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="asciiQr && selectedStatus !== 'open'" class="qr-ascii">
      <h4>QR Code (Text Format)</h4>
      <pre>{{ asciiQr }}</pre>
    </div>

    <div
      v-else-if="pairingLoading && !apiError && !qr && selectedStatus !== 'open'"
      class="loading-qr"
    >
      <div class="spinner-large"></div>
      <p>Menunggu QR Code dari server...</p>
      <small>Proses ini membutuhkan waktu beberapa detik</small>
    </div>
  </template>
</template>

<script setup>
const props = defineProps({
  deviceId: { type: String, default: "" },
  devices: { type: Array, default: () => [] },
  selectedDevice: { type: Object, default: null },
  selectedStatus: { type: String, default: "" },

  isTutor: { type: Boolean, default: false },
  tutorHasConnectedDevice: { type: Boolean, default: false },

  pairingLoading: { type: Boolean, default: false },
  apiError: { type: String, default: "" },
  statusText: { type: String, default: "" },

  qr: { type: String, default: "" },
  asciiQr: { type: String, default: "" },
  qrExpired: { type: Boolean, default: false },
  qrTimeLeft: { type: Number, default: 60 },

  waitingDisconnect: { type: Boolean, default: false },
  disconnectCountdown: { type: Number, default: 0 },

  controllerActive: { type: Boolean, default: false },

  // single source of truth for label mapping
  humanStatus: { type: Function, required: true },
});

defineEmits([
  "update:deviceId",
  "startPairing",
  "stopPairing",
  "quickRetryPairing",
  "selectNextDisconnectedDevice",
  "qrImageError",
]);
</script>

<style scoped>
/* Keep necessary styles for the pairing panel. */
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

.toolbar {
  margin-bottom: 16px;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 250px;
}

.field label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.field label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.field select {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.field select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.row-btns {
  display: flex;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn.outline {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
}

.btn.outline:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  margin-top: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.hint svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #3b82f6;
}

.connection-success {
  margin: 20px 0;
  padding: 24px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #34d399;
  border-radius: 16px;
  display: flex;
  gap: 20px;
  box-shadow: 0 4px 16px rgba(52, 211, 153, 0.2);
}

.success-icon-box {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.success-icon-box svg {
  width: 32px;
  height: 32px;
  color: #ffffff;
}

.success-content {
  flex: 1;
}

.success-content h4 {
  margin: 0 0 8px 0;
  color: #065f46;
  font-size: 18px;
  font-weight: 700;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0;
  border: 1.5px solid;
}

.status-bar .status-icon,
.status-bar .status-spinner {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.status-bar .status-message {
  flex: 1;
}

.status-bar-connecting {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #93c5fd;
  color: #1e40af;
}

.status-bar-connecting .status-spinner {
  border: 2.5px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.status-bar-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
  color: #991b1b;
}

.status-bar-waiting {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
  color: #92400e;
}

.status-retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: white;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.status-retry-btn svg {
  width: 14px;
  height: 14px;
}

.qr-section {
  margin: 32px 0;
}

.qr-main-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 32px 0;
}

.qr-layout {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto;
}

.qr-instructions-side {
  flex: 1;
  max-width: 450px;
}

.instruction-item {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: flex-start;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.instruction-number {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.instruction-text {
  font-size: 15px;
  color: #475569;
  line-height: 1.7;
}

.instruction-icon {
  display: inline-block;
  padding: 2px 6px;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

/* Timer styles kept unused; can be removed later if desired */

.qr-code-side {
  flex: 0 0 auto;
}

.qr-box {
  position: relative;
  display: inline-block;
  padding: 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.qr-box img {
  width: 280px;
  height: 280px;
  display: block;
  border-radius: 8px;
}

.qr-box.qr-expired img {
  filter: grayscale(100%) opacity(0.3);
}

.qr-expired-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  cursor: pointer;
}

.reload-icon-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.reload-icon-circle svg {
  width: 40px;
  height: 40px;
  color: white;
}

.reload-text {
  font-size: 15px;
  font-weight: 600;
  color: #475569;
  margin: 0;
  text-align: center;
}

.loading-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  margin-bottom: 20px;
  animation: spin 0.8s linear infinite;
}

.qr-ascii {
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin: 20px 0;
}

.qr-ascii pre {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  line-height: 1.2;
  color: #1e293b;
  overflow-x: auto;
  white-space: pre;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .qr-layout {
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .row-btns {
    flex-direction: column;
  }

  .row-btns button {
    width: 100%;
  }
}
</style>
