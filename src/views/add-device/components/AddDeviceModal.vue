<template>
  <div v-if="modelValue" class="modal-overlay" @click="close">
    <div class="form-modal" @click.stop>
      <div class="modal-header">
        <h3>Tambah Device Baru</h3>
        <button class="btn-close" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="$emit('submit')">
          <div class="form-grid-modal">
            <div class="form-group full">
              <label for="deviceName">Nama Device <span class="required">*</span></label>
              <input
                id="deviceName"
                :value="name"
                @input="$emit('update:name', $event.target.value)"
                type="text"
                placeholder="Contoh: Device Tutor"
                required
                autofocus
              />
              <small class="field-hint">Beri nama yang mudah dikenali untuk device WhatsApp Anda</small>
            </div>

            <div v-if="tutorReachedLimit" class="info-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Tutor hanya bisa memiliki 1 device.</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="close">Batal</button>
            <button type="submit" class="btn-save" :disabled="loading || tutorReachedLimit || !name.trim()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              {{ loading ? 'Menyimpan...' : 'Buat Device' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  name: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  tutorReachedLimit: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "update:name", "submit"]);

const close = () => {
  emit("update:modelValue", false);
};
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

.form-modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.btn-close svg {
  width: 18px;
  height: 18px;
  color: #475569;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-grid-modal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.required {
  color: #dc2626;
}

.form-group input {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
}

.field-hint {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  border-radius: 10px;
  color: #92400e;
  font-size: 13px;
}

.info-box svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #f59e0b;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel,
.btn-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  min-width: 120px;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: 1.5px solid #3b82f6;
}

.btn-save svg,
.btn-cancel svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .form-modal {
    max-width: 95%;
    width: 95%;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
    min-width: unset;
  }
}
</style>
