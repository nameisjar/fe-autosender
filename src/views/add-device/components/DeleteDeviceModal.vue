<template>
  <div v-if="modelValue" class="modal-overlay delete-modal-overlay" @click="$emit('cancel')">
    <div class="delete-modal" @click.stop>
      <div class="delete-modal-icon">
        <div class="icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
      </div>

      <div class="delete-modal-content">
        <h3>Hapus Device Ini?</h3>
        <p class="delete-warning">
          Tindakan ini tidak dapat dibatalkan. Device dan semua koneksi WhatsApp-nya akan dihapus
          secara permanen.
        </p>

        <div class="device-preview" v-if="device">
          <div class="preview-icon" :class="statusClass(device.status)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <div class="preview-info">
            <div class="preview-name">{{ device.name }}</div>
            <div class="preview-status">
              <span class="status-dot" :class="statusClass(device.status)"></span>
              {{ humanStatus(device.status) }}
            </div>
          </div>
        </div>
      </div>

      <div class="delete-modal-actions">
        <button type="button" class="btn-keep" @click="$emit('cancel')" :disabled="deleting">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          Batal
        </button>
        <button type="button" class="btn-delete-confirm" @click="$emit('confirm')" :disabled="deleting">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
            <path d="M10 11v6M14 11v6" />
          </svg>
          {{ deleting ? 'Menghapus...' : 'Ya, Hapus Device' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  device: { type: Object, default: null },
  deleting: { type: Boolean, default: false },
  humanStatus: { type: Function, required: true },
  statusClass: { type: Function, required: true },
});

defineEmits(["confirm", "cancel", "update:modelValue"]);
</script>

<style scoped>
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
}

.delete-modal {
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 32px;
  text-align: center;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.icon-circle svg {
  width: 40px;
  height: 40px;
  color: #dc2626;
}

.delete-modal-content h3 {
  margin: 20px 0 12px 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.delete-warning {
  margin: 0 0 24px 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.device-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: left;
}

.preview-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-icon svg {
  width: 24px;
  height: 24px;
  color: #1e40af;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.preview-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-keep,
.btn-delete-confirm {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.btn-keep {
  background: #f1f5f9;
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-delete-confirm {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff;
}

.btn-keep svg,
.btn-delete-confirm svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .delete-modal {
    padding: 24px;
    max-width: 90%;
  }

  .delete-modal-actions {
    flex-direction: column;
  }
}
</style>
