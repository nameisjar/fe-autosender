<template>
  <div
    class="card"
    :class="{ 'is-compact': compact, 'is-embedded': embedded }"
  >
    <div v-if="!embedded" class="card-header">
      <h3 class="card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Media
      </h3>
      <div class="header-right">
        <div
          class="info-badge"
          title="PNG, JPG, JPEG, WebP, GIF, MP4, MP3, WAV, PDF, DOC, DOCX, XLS, XLSX, TXT"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <!-- batang i -->
            <line x1="12" y1="11" x2="12" y2="16" />
            <!-- titik i -->
            <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <span class="badge-optional">Opsional</span>
      </div>
    </div>
    <div class="card-body">
      <div
        class="upload-zone"
        :class="{
          'is-dragover': isDragOver,
          'has-media': hasMedia,
          'is-empty': !hasMedia && !removed,
          'is-disabled': disabled,
        }"
        @drop.prevent="onDrop"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="isDragOver = false"
        @dragend.prevent="isDragOver = false"
        @click="!hasMedia && !removed && triggerFileInput()"
      >
        <input
          ref="fileInput"
          type="file"
          @change="onFile"
          :accept="acceptTypes"
          :disabled="disabled"
          hidden
        />

        <!-- Empty State -->
        <div v-if="!hasMedia && !removed" class="upload-empty">
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
            <p class="upload-title">
              {{
                isDragOver
                  ? "Lepaskan file di sini"
                  : "Drag & Drop file atau klik untuk upload"
              }}
            </p>
            <p class="upload-subtitle">Mendukung: Gambar, Video, Audio, dan Dokumen</p>
          </div>
          <button
            type="button"
            class="btn-upload"
            :disabled="disabled"
            @click.stop="triggerFileInput"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Pilih File
          </button>
        </div>

        <div v-else-if="removed" class="removed-preview">
          <div>
            <strong>Media akan dihapus</strong>
            <span>Perubahan diterapkan setelah disimpan.</span>
          </div>
          <button type="button" :disabled="disabled" @click.stop="restoreExisting">
            Urungkan
          </button>
        </div>

        <!-- File Preview -->
        <div v-else class="media-preview-wrapper">
          <!-- Image Preview -->
          <div v-if="isImage" class="media-preview image-preview">
            <img :src="currentPreview" :alt="displayName || 'Preview media'" />
            <span v-if="displayName" class="preview-file-name" :title="displayName">
              {{ displayName }}
            </span>
            <div class="preview-overlay">
              <button
                type="button"
                class="btn-change"
                :disabled="disabled"
                @click.stop="triggerFileInput"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0-2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Ganti
              </button>
              <button
                type="button"
                class="btn-remove"
                :disabled="disabled"
                @click.stop="removeMedia"
              >
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
                Hapus
              </button>
            </div>
          </div>

          <!-- Document Preview -->
          <div v-else class="media-preview document-preview">
            <div class="doc-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div class="doc-details">
              <p class="doc-name">{{ displayName }}</p>
              <p class="doc-size">
                {{ modelValue ? formatFileSize(modelValue.size) : "Media saat ini" }}
              </p>
            </div>
            <div class="doc-actions">
              <button
                type="button"
                class="btn-icon"
                :disabled="disabled"
                @click.stop="triggerFileInput"
                title="Ganti file"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0-2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                type="button"
                class="btn-icon btn-icon-danger"
                :disabled="disabled"
                @click.stop="removeMedia"
                title="Hapus file"
              >
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useToast } from "../composables/useToast.js";

const props = defineProps({
  modelValue: {
    type: [File, null],
    default: null,
  },
  maxSize: {
    type: Number,
    default: 25 * 1024 * 1024,
  },
  acceptTypes: {
    type: String,
    default: ".png,.jpg,.jpeg,.webp,.gif,.mp4,.mp3,.wav,.pdf,.doc,.docx,.xls,.xlsx,.txt",
  },
  existingUrl: {
    type: String,
    default: "",
  },
  existingName: {
    type: String,
    default: "",
  },
  compact: {
    type: Boolean,
    default: false,
  },
  embedded: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  removed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "remove-existing", "restore-existing"]);

const toast = useToast();
const isDragOver = ref(false);
const fileInput = ref(null);
const mediaPreview = ref("");

const hasExisting = computed(() => Boolean(props.existingUrl) && !props.removed);
const hasMedia = computed(() => Boolean(props.modelValue) || hasExisting.value);
const displayName = computed(
  () => props.modelValue?.name || props.existingName || "Media terjadwal"
);
const isImage = computed(() => {
  if (props.modelValue) return props.modelValue.type?.startsWith("image/");
  return /\.(avif|gif|jpe?g|png|webp)(?:$|[?#])/i.test(
    props.existingName || props.existingUrl
  );
});
const currentPreview = computed(() => mediaPreview.value || props.existingUrl);

function releasePreview() {
  if (mediaPreview.value) URL.revokeObjectURL(mediaPreview.value);
  mediaPreview.value = "";
}

watch(
  () => props.modelValue,
  (file) => {
    releasePreview();
    if (file?.type?.startsWith("image/")) {
      mediaPreview.value = URL.createObjectURL(file);
    }
  },
  { immediate: true }
);

onBeforeUnmount(releasePreview);

function triggerFileInput() {
  if (props.disabled) return;
  if (fileInput.value) fileInput.value.value = "";
  fileInput.value?.click();
}

function onDragOver() {
  if (!props.disabled) isDragOver.value = true;
}

function onDrop(e) {
  isDragOver.value = false;
  if (props.disabled) return;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    handleFile(file);
  }
}

function onFile(e) {
  if (props.disabled) return;
  const file = e.target.files?.[0];
  if (file) {
    handleFile(file);
  }
}

function handleFile(file) {
  if (file.size > props.maxSize) {
    toast.error(
      `Ukuran file terlalu besar. Maksimal ${formatFileSize(
        props.maxSize
      )}, file Anda ${formatFileSize(file.size)}`
    );
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    return;
  }

  if (!isAcceptedFile(file)) {
    toast.error("Jenis file tidak didukung");
    if (fileInput.value) fileInput.value.value = "";
    return;
  }

  emit("update:modelValue", file);
}

function removeMedia() {
  if (props.disabled) return;
  if (props.modelValue) {
    emit("update:modelValue", null);
  } else if (hasExisting.value) {
    emit("remove-existing");
  }
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function restoreExisting() {
  if (!props.disabled) emit("restore-existing");
}

function isAcceptedFile(file) {
  const accepted = props.acceptTypes
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (!accepted.length) return true;

  const fileName = String(file.name || "").toLowerCase();
  const fileType = String(file.type || "").toLowerCase();
  return accepted.some((rule) => {
    if (rule.startsWith(".")) return fileName.endsWith(rule);
    if (rule.endsWith("/*")) return fileType.startsWith(rule.slice(0, -1));
    return fileType === rule;
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
</script>

<style scoped>
.card {
  background: var(--theme-surface);
  border-radius: 16px;
  border: 1px solid var(--theme-border);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card.is-embedded {
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.card.is-embedded .card-body {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--theme-border);
  background: var(--theme-gradient-surface);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 700;
  color: var(--theme-text);
  margin: 0;
}

.card-title svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.card-body {
  padding: 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-badge {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-gradient-info);
  border: 1px solid var(--theme-info-border);
  border-radius: 50%;
  cursor: help;
  transition: all 0.2s;
}

.info-badge:hover {
  transform: scale(1.1);
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
}

.info-badge svg {
  width: 16px;
  height: 16px;
  color: #1e40af;
}

.badge-optional {
  padding: 6px 12px;
  background: var(--theme-gradient-neutral);
  color: var(--theme-text-muted);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--theme-border-strong);
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed var(--theme-border-strong);
  border-radius: 12px;
  transition: all 0.3s ease;
  background: var(--theme-surface-soft);
  position: relative;
  overflow: hidden;
}

.upload-zone.is-empty {
  padding: 48px 32px;
  cursor: pointer;
}

.upload-zone.is-empty:hover {
  border-color: #3b82f6;
  background: var(--theme-info-soft);
}

.upload-zone.is-dragover {
  border-color: #3b82f6;
  background: var(--theme-info-soft);
  transform: scale(1.01);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.upload-zone.is-disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.upload-zone.has-media {
  padding: 0;
  border-style: solid;
  background: var(--theme-surface);
}

.upload-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
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
  color: var(--theme-text);
  margin: 0 0 6px 0;
}

.upload-subtitle {
  font-size: 14px;
  color: var(--theme-text-muted);
  margin: 0;
}

.btn-upload {
  padding: 10px 20px;
  background: var(--theme-surface);
  border: 1.5px solid var(--theme-border);
  border-radius: 10px;
  color: var(--theme-text-secondary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-upload:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: var(--theme-surface-soft);
}

.btn-upload svg {
  width: 18px;
  height: 18px;
}

/* Media Preview */
.media-preview-wrapper {
  position: relative;
}

.media-preview {
  position: relative;
  padding: 20px;
  border-radius: 12px;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  min-height: 200px;
  overflow: hidden;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  display: block;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 12px;
}

.preview-file-name {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
  max-width: calc(100% - 24px);
  overflow: hidden;
  padding: 5px 9px;
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.78);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-preview:hover .preview-overlay {
  opacity: 1;
}

.btn-change,
.btn-remove {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-change {
  background: var(--theme-surface);
  color: var(--theme-text-secondary);
  border: none;
}

.btn-change:hover {
  background: var(--theme-surface-soft);
}

.btn-remove {
  background: #ef4444;
  color: white;
  border: none;
}

.btn-remove:hover {
  background: #dc2626;
}

.btn-change svg,
.btn-remove svg {
  width: 16px;
  height: 16px;
}

.btn-change:disabled,
.btn-remove:disabled,
.btn-upload:disabled,
.btn-icon:disabled,
.removed-preview button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.document-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--theme-surface-soft);
  border: 1px solid var(--theme-border);
}

.doc-icon-wrapper {
  width: 56px;
  height: 56px;
  background: var(--theme-gradient-info);
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
  color: var(--theme-text);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}

.doc-size {
  font-size: 13px;
  color: var(--theme-text-muted);
  margin: 4px 0 0 0;
}

.doc-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid var(--theme-border);
  background: var(--theme-surface);
  color: var(--theme-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: var(--theme-surface-soft);
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.btn-icon-danger:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: var(--theme-danger-soft);
}

.removed-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--theme-danger-border);
  border-radius: 10px;
  background: var(--theme-danger-soft);
  color: var(--theme-danger-text);
}

.removed-preview > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.removed-preview span {
  color: var(--theme-text-muted);
  font-size: 12px;
}

.removed-preview button {
  border: 0;
  background: transparent;
  color: inherit;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.card.is-compact .upload-zone.is-empty {
  padding: 24px 18px;
}

.card.is-compact .upload-empty {
  gap: 12px;
}

.card.is-compact .upload-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.card.is-compact .upload-icon {
  width: 24px;
  height: 24px;
}

.card.is-compact .image-preview {
  min-height: 160px;
  padding: 12px;
}

.card.is-compact .image-preview img {
  max-height: 220px;
}

.card.is-compact .media-preview.document-preview {
  padding: 14px;
}

@media (max-width: 640px) {
  .upload-zone.is-empty {
    padding: 32px 20px;
  }

  .upload-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }

  .upload-icon {
    width: 24px;
    height: 24px;
  }

  .upload-title {
    font-size: 14px;
  }

  .upload-subtitle {
    font-size: 12px;
  }

  .card.is-compact .upload-zone.is-empty {
    padding: 20px 14px;
  }

  .card.is-compact .image-preview {
    min-height: 140px;
  }

  .removed-preview {
    align-items: stretch;
    flex-direction: column;
  }

  .document-preview {
    align-items: flex-start;
  }
}

@media (hover: none) {
  .image-preview .preview-overlay {
    align-items: flex-end;
    padding-bottom: 14px;
    background: linear-gradient(transparent 45%, rgba(0, 0, 0, 0.72));
    opacity: 1;
  }
}
</style>
