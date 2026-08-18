<template>
  <button
    type="button"
    class="btn-template-picker"
    :class="{ active: showPicker }"
    @click="openPicker"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 8h8M8 12h5" />
    </svg>
    {{ buttonLabel }}
  </button>

  <Teleport to="body">
    <div
      v-if="showPicker"
      class="chat-template-select-backdrop"
      role="presentation"
      @click="closePicker"
    >
      <section
        class="chat-template-select-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Pilih template chat"
        @click.stop
      >
        <header class="chat-template-select-header">
          <div>
            <h3>Pilih Template Chat</h3>
            <p>Template akan mengisi kolom pesan dan tetap dapat diedit.</p>
          </div>
          <button type="button" aria-label="Tutup pemilih template" @click="closePicker">
            ×
          </button>
        </header>

        <label class="chat-template-select-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Cari judul atau isi template..."
            autocomplete="off"
          />
        </label>

        <div v-if="loadingChatTemplates" class="chat-template-select-state">
          <span class="chat-template-select-spinner"></span>
          Memuat template...
        </div>
        <div v-else-if="pickerError" class="chat-template-select-state error">
          <span>{{ pickerError }}</span>
          <button type="button" @click="retryLoad">Coba Lagi</button>
        </div>
        <div v-else-if="!filteredTemplates.length" class="chat-template-select-state">
          <span>{{ search ? "Template tidak ditemukan." : "Belum ada template chat." }}</span>
          <router-link to="/chat-templates" @click="closePicker">Kelola Template</router-link>
        </div>
        <div v-else class="chat-template-select-list">
          <button
            v-for="template in filteredTemplates"
            :key="template.id"
            type="button"
            class="chat-template-select-item"
            @click="selectTemplate(template)"
          >
            <span class="chat-template-select-item-title">
              <strong>{{ template.title }}</strong>
              <code v-if="hasStudentVariable(template.message)">
                <span v-pre>{{siswa}}</span>
              </code>
            </span>
            <span>{{ template.message }}</span>
          </button>
        </div>

        <footer class="chat-template-select-footer">
          <router-link to="/chat-templates" @click="closePicker">
            Kelola Custom Template Chat
          </router-link>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from "vue";
import { useChatTemplates } from "../composables/useChatTemplates.js";
import { hasStudentVariable } from "../utils/chatTemplate.js";

defineProps({
  buttonLabel: {
    type: String,
    default: "Pilih Template",
  },
});

const emit = defineEmits(["select"]);
const showPicker = ref(false);
const search = ref("");
const pickerError = ref("");
const { chatTemplates, loadingChatTemplates, loadChatTemplates } = useChatTemplates();

const filteredTemplates = computed(() => {
  const query = search.value.trim().toLocaleLowerCase("id-ID");
  if (!query) return chatTemplates.value;

  return chatTemplates.value.filter((template) =>
    `${template.title || ""} ${template.message || ""}`
      .toLocaleLowerCase("id-ID")
      .includes(query)
  );
});

async function loadTemplates(force = false) {
  pickerError.value = "";
  try {
    await loadChatTemplates({ force });
  } catch (error) {
    pickerError.value =
      error?.response?.data?.message || error?.message || "Gagal memuat template chat";
  }
}

function openPicker() {
  showPicker.value = true;
  void loadTemplates(false);
}

function closePicker() {
  showPicker.value = false;
  search.value = "";
}

function retryLoad() {
  void loadTemplates(true);
}

function selectTemplate(template) {
  emit("select", template);
  closePicker();
}
</script>

<style scoped>
.btn-template-picker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 12px;
  border: 1px solid var(--theme-info-border);
  border-radius: 8px;
  background: var(--theme-info-soft);
  color: var(--theme-accent);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.btn-template-picker:hover,
.btn-template-picker.active {
  border-color: var(--theme-accent);
  background: var(--theme-accent-soft);
  transform: translateY(-1px);
}

.btn-template-picker:active {
  transform: translateY(0);
}

.btn-template-picker svg {
  width: 15px;
  height: 15px;
}

.chat-template-select-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(2, 6, 23, 0.55);
}

.chat-template-select-modal {
  width: min(680px, 100%);
  max-height: min(680px, calc(100dvh - 40px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--theme-border);
  border-radius: 18px;
  background: var(--theme-surface);
  color: var(--theme-text);
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.38);
}

.chat-template-select-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--theme-border);
}

.chat-template-select-header h3 {
  margin: 0;
  color: var(--theme-text);
  font-size: 18px;
}

.chat-template-select-header p {
  margin: 5px 0 0;
  color: var(--theme-text-muted);
  font-size: 12px;
}

.chat-template-select-header > button {
  width: 34px;
  height: 34px;
  flex: none;
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
  font-size: 23px;
  line-height: 1;
  cursor: pointer;
}

.chat-template-select-search {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 14px 16px;
  padding: 0 12px;
  border: 1px solid var(--theme-border);
  border-radius: 11px;
  background: var(--theme-input);
}

.chat-template-select-search svg {
  width: 19px;
  flex: none;
  color: var(--theme-text-muted);
}

.chat-template-select-search input {
  width: 100%;
  min-width: 0;
  height: 44px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--theme-text);
  font: inherit;
}

.chat-template-select-list {
  min-height: 0;
  padding: 0 12px 12px;
  overflow-y: auto;
}

.chat-template-select-item {
  width: 100%;
  display: block;
  min-height: 64px;
  padding: 13px 14px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--theme-text);
  text-align: left;
  cursor: pointer;
}

.chat-template-select-item:hover {
  background: var(--theme-surface-hover);
}

.chat-template-select-item-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.chat-template-select-item-title strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-template-select-item-title code {
  flex: none;
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--theme-accent-soft);
  color: var(--theme-accent);
  font-size: 10px;
}

.chat-template-select-item > span:last-child {
  display: -webkit-box;
  overflow: hidden;
  color: var(--theme-text-muted);
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-wrap;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.chat-template-select-state {
  min-height: 190px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 22px;
  color: var(--theme-text-muted);
  text-align: center;
}

.chat-template-select-state.error {
  color: var(--theme-danger-text);
}

.chat-template-select-state button,
.chat-template-select-state a,
.chat-template-select-footer a {
  border: 0;
  background: transparent;
  color: var(--theme-accent);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.chat-template-select-spinner {
  width: 29px;
  height: 29px;
  border: 3px solid var(--theme-border);
  border-top-color: var(--theme-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.chat-template-select-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--theme-border);
  background: var(--theme-surface-soft);
  text-align: center;
  font-size: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .btn-template-picker {
    width: 100%;
    min-height: 44px;
  }

  .chat-template-select-backdrop {
    place-items: end center;
    padding: 0;
  }

  .chat-template-select-modal {
    width: 100%;
    max-height: min(82dvh, 680px);
    padding-bottom: env(safe-area-inset-bottom, 0);
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 20px 20px 0 0;
  }

  .chat-template-select-header {
    padding: 16px 16px 13px;
  }

  .chat-template-select-search {
    margin: 12px;
  }
}
</style>
