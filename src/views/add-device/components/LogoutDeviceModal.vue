<template>
  <div v-if="modelValue" class="modal-overlay" @click="$emit('cancel')">
    <div class="logout-modal" @click.stop>
      <div class="logout-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        </svg>
      </div>

      <h3>Logout WhatsApp?</h3>
      <p class="logout-description">
        Session akan diputus dari WhatsApp asli. Device dan seluruh data aplikasi tetap disimpan,
        tetapi Anda harus scan QR lagi untuk menghubungkannya kembali.
      </p>

      <div v-if="device" class="device-preview">
        <div class="preview-info">
          <strong>{{ device.name }}</strong>
          <span>{{ device.phone || 'Nomor WhatsApp tidak tersedia' }}</span>
        </div>
        <span class="status-badge" :class="statusClass(device)">
          {{ humanStatus(device) }}
        </span>
      </div>

      <div class="retained-data">
        Riwayat pesan, kontak, broadcast, jadwal, dan assignment tidak akan dihapus.
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-cancel" :disabled="loggingOut" @click="$emit('cancel')">
          Batal
        </button>
        <button
          type="button"
          class="btn-confirm-logout"
          :disabled="loggingOut"
          @click="$emit('confirm')"
        >
          <svg v-if="loggingOut" class="spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          {{ loggingOut ? 'Memutuskan...' : 'Ya, Logout WhatsApp' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  device: { type: Object, default: null },
  loggingOut: { type: Boolean, default: false },
  humanStatus: { type: Function, required: true },
  statusClass: { type: Function, required: true },
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(4px);
}

.logout-modal {
  width: min(100%, 500px);
  padding: 30px;
  border: 1px solid var(--theme-border);
  border-radius: 20px;
  background: var(--theme-surface);
  color: var(--theme-text);
  text-align: center;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.3);
}

.logout-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--theme-warning-soft);
  color: var(--theme-warning-text);
}

.logout-icon svg {
  width: 34px;
  height: 34px;
}

h3 {
  margin: 18px 0 10px;
  font-size: 22px;
}

.logout-description {
  margin: 0 0 20px;
  color: var(--theme-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.device-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface-soft);
  text-align: left;
}

.preview-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-info strong,
.preview-info span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-info span {
  color: var(--theme-text-muted);
  font-size: 12px;
}

.status-badge {
  flex-shrink: 0;
  padding: 5px 10px;
  border: 1px solid var(--theme-border);
  border-radius: 999px;
  color: var(--theme-text-secondary);
  font-size: 11px;
  font-weight: 700;
}

.status-badge.is-open {
  border-color: var(--theme-success-border);
  background: var(--theme-success-soft);
  color: var(--theme-success-text);
}

.retained-data {
  margin-top: 14px;
  padding: 11px 13px;
  border: 1px solid var(--theme-info-border);
  border-radius: 10px;
  background: var(--theme-info-soft);
  color: var(--theme-info-text);
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}

.btn-cancel,
.btn-confirm-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel {
  border: 1px solid var(--theme-border);
  background: var(--theme-surface-soft);
  color: var(--theme-text-secondary);
}

.btn-confirm-logout {
  border: 1px solid var(--theme-warning-border);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm-logout svg {
  width: 16px;
  height: 16px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 540px) {
  .logout-modal { padding: 24px 18px; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
}
</style>
