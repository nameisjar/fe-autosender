<template>
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
      <div
        class="upload-zone"
        :class="{
          'is-dragover': isDragOver,
          'has-media': modelValue,
          'is-empty': !modelValue,
        }"
        @drop.prevent="onDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @dragend.prevent="isDragOver = false"
        @click="!modelValue && triggerFileInput()"
      >
        <input
          ref="fileInput"
          type="file"
          @change="onFile"
          :accept="acceptTypes"
          hidden
        />

        <!-- Empty State -->
        <div v-if="!modelValue" class="upload-empty">
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
            <p class="upload-subtitle">
              Mendukung: Gambar, Video, Audio, dan Dokumen
            </p>
          </div>
          <button type="button" class="btn-upload" @click.stop="triggerFileInput">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Pilih File
          </button>
        </div>

        <!-- File Preview -->
        <div v-else class="media-preview-wrapper">
          <!-- Image Preview -->
          <div v-if="isImage" class="media-preview image-preview">
            <img :src="mediaPreview" alt="Preview" />
            <div class="preview-overlay">
              <button type="button" class="btn-change" @click.stop="triggerFileInput">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0-2 2h14a2 2 0 0 0 2-2v-7"
                  />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Ganti
              </button>
              <button type="button" class="btn-remove" @click.stop="removeMedia">
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
              <p class="doc-size">{{ formatFileSize(modelValue.size) }}</p>
            </div>
            <div class="doc-actions">
              <button
                type="button"
                class="btn-icon"
                @click.stop="triggerFileInput"
                title="Ganti file"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0-2 2h14a2 2 0 0 0 2-2v-7"
                  />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                type="button"
                class="btn-icon btn-icon-danger"
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
import { ref, computed } from "vue";
import { useToast } from "../composables/useToast.js";

const props = defineProps({
  modelValue: {
    type: [File, null],
    default: null,
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024, // 10MB
  },
  acceptTypes: {
    type: String,
    default: ".png,.jpg,.jpeg,.webp,.gif,.mp4,.mp3,.wav,.pdf,.doc,.docx,.xls,.xlsx,.txt",
  },
});

const emit = defineEmits(["update:modelValue"]);

const toast = useToast();
const isDragOver = ref(false);
const fileInput = ref(null);
const mediaPreview = ref("");

const isImage = computed(() => props.modelValue?.type?.startsWith("image"));
const mediaName = computed(() => props.modelValue?.name || "");

function triggerFileInput() {
  if (props.modelValue) return;
  fileInput.value?.click();
}

function onDrop(e) {
  isDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    handleFile(file);
  }
}

function onFile(e) {
  const file = e.target.files?.[0];
  if (file) {
    handleFile(file);
  }
}

function handleFile(file) {
  if (file.size > props.maxSize) {
    toast.error(
      `Ukuran file terlalu besar. Maksimal ${formatFileSize(props.maxSize)}, file Anda ${formatFileSize(file.size)}`
    );
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    return;
  }

  emit("update:modelValue", file);
  if (file.type?.startsWith("image")) {
    mediaPreview.value = URL.createObjectURL(file);
  } else {
    mediaPreview.value = "";
  }
}

function removeMedia() {
  emit("update:modelValue", null);
  mediaPreview.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
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
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(to right, #f8fafc, #ffffff);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
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

.badge-optional {
  padding: 6px 12px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #64748b;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #cbd5e1;
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.upload-zone.is-empty {
  padding: 48px 32px;
  cursor: pointer;
}

.upload-zone.is-empty:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-zone.is-dragover {
  border-color: #3b82f6;
  background: #dbeafe;
  transform: scale(1.01);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.upload-zone.has-media {
  padding: 0;
  border-style: solid;
  background: white;
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
  color: #1e293b;
  margin: 0 0 6px 0;
}

.upload-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.btn-upload {
  padding: 10px 20px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
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
  background: #f8fafc;
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
  background: white;
  color: #475569;
  border: none;
}

.btn-change:hover {
  background: #f1f5f9;
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

.document-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
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

.doc-size {
  font-size: 13px;
  color: #64748b;
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
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f8fafc;
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.btn-icon-danger:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
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
}
</style>
