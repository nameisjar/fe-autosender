<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="confirmation-overlay"
      @click.self="cancel"
    >
      <section
        class="confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="broadcast-confirmation-title"
      >
        <header class="confirmation-header">
          <div class="confirmation-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22 2 11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="m22 2-7 20-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            </svg>
          </div>
          <div>
            <h3 id="broadcast-confirmation-title">{{ title }}</h3>
            <p>Periksa kembali detail berikut sebelum diproses.</p>
          </div>
          <button
            type="button"
            class="close-button"
            :disabled="loading"
            aria-label="Tutup konfirmasi"
            @click="cancel"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </header>

        <dl class="confirmation-summary">
          <div v-for="item in items" :key="item.label" class="summary-row">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value || "-" }}</dd>
          </div>
        </dl>

        <div v-if="notice" class="confirmation-notice">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
            <path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>{{ notice }}</span>
        </div>

        <footer class="confirmation-actions">
          <button type="button" class="secondary-button" :disabled="loading" @click="cancel">
            Periksa Lagi
          </button>
          <button
            ref="confirmButton"
            type="button"
            class="primary-button"
            :disabled="loading"
            @click="$emit('confirm')"
          >
            <span v-if="loading" class="button-spinner" aria-hidden="true"></span>
            {{ loading ? "Memproses..." : confirmLabel }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "Konfirmasi Pengiriman" },
  confirmLabel: { type: String, default: "Konfirmasi Kirim" },
  items: { type: Array, default: () => [] },
  notice: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "confirm"]);
const confirmButton = ref(null);

function cancel() {
  if (props.loading) return;
  emit("update:modelValue", false);
}

function handleKeydown(event) {
  if (event.key === "Escape" && props.modelValue) cancel();
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) return;
    await nextTick();
    confirmButton.value?.focus();
  }
);

onMounted(() => document.addEventListener("keydown", handleKeydown));
onUnmounted(() => document.removeEventListener("keydown", handleKeydown));
</script>

<style scoped>
.confirmation-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(4px);
}

.confirmation-modal {
  width: min(520px, 100%);
  max-height: min(760px, calc(100dvh - 32px));
  overflow-y: auto;
  border: 1px solid var(--theme-border);
  border-radius: 18px;
  background: var(--theme-surface);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.36);
}

.confirmation-header {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 36px;
  gap: 12px;
  padding: 20px;
  align-items: center;
  border-bottom: 1px solid var(--theme-border);
}

.confirmation-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: var(--theme-accent-soft);
  color: var(--theme-accent);
}

.confirmation-icon svg {
  width: 21px;
  height: 21px;
}

.confirmation-header h3 {
  margin: 0;
  color: var(--theme-text);
  font-size: 18px;
}

.confirmation-header p {
  margin: 4px 0 0;
  color: var(--theme-text-muted);
  font-size: 12px;
}

.close-button {
  display: grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
  cursor: pointer;
}

.close-button:hover:not(:disabled) {
  background: var(--theme-surface-hover);
  color: var(--theme-text);
}

.close-button svg {
  width: 18px;
  height: 18px;
}

.confirmation-summary {
  margin: 0;
  padding: 10px 20px;
}

.summary-row {
  display: grid;
  grid-template-columns: minmax(110px, 0.75fr) minmax(0, 1.5fr);
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid var(--theme-border);
}

.summary-row:last-child {
  border-bottom: 0;
}

.summary-row dt {
  color: var(--theme-text-muted);
  font-size: 12px;
}

.summary-row dd {
  margin: 0;
  color: var(--theme-text);
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
  text-align: right;
}

.confirmation-notice {
  display: flex;
  gap: 9px;
  margin: 0 20px 16px;
  padding: 11px 12px;
  border: 1px solid var(--theme-info-border);
  border-radius: 9px;
  background: var(--theme-info-soft);
  color: var(--theme-info-text);
  font-size: 12px;
  line-height: 1.45;
}

.confirmation-notice svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.confirmation-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--theme-border);
}

.confirmation-actions button {
  min-height: 42px;
  padding: 10px 14px;
  border-radius: 9px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
}

.secondary-button {
  border: 1px solid var(--theme-border);
  background: var(--theme-surface-soft);
  color: var(--theme-text-secondary);
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.confirmation-actions button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.button-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: confirmation-spin 0.7s linear infinite;
}

@keyframes confirmation-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 560px) {
  .confirmation-overlay {
    align-items: end;
    padding: 0;
  }

  .confirmation-modal {
    width: 100%;
    max-height: 92dvh;
    border-radius: 18px 18px 0 0;
  }

  .confirmation-header {
    padding: 16px;
  }

  .confirmation-summary {
    padding: 8px 16px;
  }

  .summary-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .summary-row dd {
    text-align: left;
  }

  .confirmation-notice {
    margin-right: 16px;
    margin-left: 16px;
  }

  .confirmation-actions {
    padding: 14px 16px max(16px, env(safe-area-inset-bottom));
  }
}
</style>
