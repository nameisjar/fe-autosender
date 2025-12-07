<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg
            class="header-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <!-- Clipboard dengan checklist untuk feedback -->
            <path
              d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
            />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12l2 2 4-4" />
            <line x1="9" y1="17" x2="15" y2="17" />
          </svg>
          Feedback Bulanan (Algo)
        </h2>
        <p class="subtitle">
          Buat dan kirim feedback bulanan dalam format PDF ke WhatsApp siswa
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="feedback-form">
      <!-- 🆕 Two Column Layout -->
      <div class="form-layout">
        <!-- Left Column -->
        <div class="form-column">
          <!-- Device Selection (Compact) -->
          <div class="card card-compact">
            <div class="card-header card-header-compact">
              <h3 class="card-title">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Device WhatsApp
              </h3>
            </div>
            <div class="card-body card-body-compact">
              <!-- Device Info Card Compact -->
              <div v-if="selectedDevice && !showDeviceList" class="device-info-compact">
                <div
                  class="device-avatar-compact"
                  :class="{ online: selectedDevice.isConnected }"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <div class="device-info-text">
                  <div class="device-name-compact">
                    {{ selectedDevice.name || "Unknown" }}
                  </div>
                  <div
                    class="device-status-compact"
                    :class="{ online: selectedDevice.isConnected }"
                  >
                    {{ selectedDevice.isConnected ? "● Online" : "● Offline" }}
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-change-compact"
                  @click="showDeviceList = true"
                >
                  Ganti
                </button>
              </div>

              <!-- Device List Compact -->
              <div v-if="!selectedDevice || showDeviceList" class="device-list-compact">
                <div v-if="loadingDevices" class="device-loading">
                  <div class="spinner-small"></div>
                  <span>Memuat devices...</span>
                </div>
                <div v-else-if="availableDevices.length === 0" class="device-empty">
                  <p>Tidak ada device tersedia</p>
                </div>
                <button
                  v-else
                  v-for="device in availableDevices"
                  :key="device.id"
                  type="button"
                  class="device-item-compact"
                  :class="{ online: device.isConnected }"
                  @click="handleSelectDevice(device.id)"
                >
                  <span>{{ device.name }}</span>
                  <span class="status-dot" :class="{ online: device.isConnected }"></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Student & Course Info -->
          <div class="card card-compact">
            <div class="card-header card-header-compact">
              <h3>Informasi Siswa</h3>
            </div>
            <div class="card-body card-body-compact">
              <div class="form-group form-group-compact">
                <label class="form-label"
                  >Nama Siswa <span class="required">*</span></label
                >
                <input
                  v-model="form.studentName"
                  placeholder="Nama siswa"
                  required
                  class="form-input form-input-compact"
                />
              </div>

              <div class="form-grid-2">
                <div class="form-group form-group-compact">
                  <label class="form-label">Kursus <span class="required">*</span></label>
                  <select
                    v-model="form.courseName"
                    required
                    class="form-select form-input-compact"
                    @change="onCourseChange"
                  >
                    <option value="" disabled>Pilih kursus...</option>
                    <option v-for="course in courses" :key="course" :value="course">
                      {{ course }}
                    </option>
                  </select>
                </div>

                <div class="form-group form-group-compact">
                  <label class="form-label"
                    >Bulan Ke <span class="required">*</span></label
                  >
                  <select
                    v-model.number="form.month"
                    required
                    class="form-select form-input-compact"
                    @change="onMonthChange"
                  >
                    <option value="" disabled>Pilih...</option>
                    <option v-for="m in availableMonths" :key="m" :value="m">
                      Bulan {{ m }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Auto-filled Compact -->
              <!-- <div v-if="selectedTemplate" class="auto-filled-compact">
                <div class="auto-info">
                  <span class="auto-label">Level:</span>
                  <span class="auto-value">{{ selectedTemplate.level }}</span>
                </div>
                <div class="auto-info">
                  <span class="auto-label">Code:</span>
                  <span class="auto-value">{{ selectedTemplate.code }}</span>
                </div>
              </div> -->
            </div>
          </div>

          <!-- Links -->
          <div class="card card-compact">
            <div class="card-header card-header-compact">
              <h3>Link YouTube & Referral</h3>
            </div>
            <div class="card-body card-body-compact">
              <div class="form-group form-group-compact">
                <label class="form-label"
                  >Link YouTube <span class="required">*</span></label
                >
                <input
                  v-model="form.youtubeLink"
                  placeholder="https://youtu.be/..."
                  type="url"
                  required
                  class="form-input form-input-compact"
                />
              </div>

              <div class="form-group form-group-compact">
                <label class="form-label"
                  >Link Referral <span class="required">*</span></label
                >
                <input
                  v-model="form.referralLink"
                  placeholder="https://algonova.id/invite?..."
                  type="url"
                  required
                  class="form-input form-input-compact"
                />
              </div>
            </div>
          </div>

          <!-- 🆕 Rating & Report By (dipindah ke kiri bawah) -->
          <div class="card card-compact">
            <div class="card-header card-header-compact">
              <h3>Rating & Laporan</h3>
              <button
                type="button"
                class="btn-clear-data"
                @click="clearSavedData"
                title="Hapus semua data tersimpan"
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
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Clear Data
              </button>
            </div>
            <div class="card-body card-body-compact">
              <div class="form-group form-group-compact">
                <label class="form-label">Rating <span class="required">*</span></label>
                <div class="rating-stars">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ filled: star <= form.rating }"
                    @click="form.rating = star"
                    >★</span
                  >
                </div>
              </div>

              <div class="form-group form-group-compact">
                <label class="form-label"
                  >Laporan Dibuat Oleh <span class="required">*</span></label
                >
                <input
                  v-model="form.reportBy"
                  placeholder="Nama tutor"
                  required
                  class="form-input form-input-compact"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Full Height Comments -->
        <div class="form-column">
          <!-- Tutor Comment (Full Height) -->
          <div class="card card-compact card-full-height">
            <div class="card-header card-header-compact">
              <h3>Pilih Komentar</h3>
              <span class="selected-count-badge"
                >{{ form.selectedComments.length }} / 3</span
              >
            </div>
            <div class="card-body card-body-compact">
              <!-- 🆕 Checkbox Komentar -->
              <div class="comment-checkboxes">
                <!-- Kehadiran -->
                <div class="comment-category">
                  <h4 class="category-title">Kehadiran</h4>
                  <div
                    v-for="comment in commentCategories.kehadiran"
                    :key="comment.id"
                    class="comment-item"
                    :class="{ selected: form.selectedComments.includes(comment.id) }"
                  >
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        :id="comment.id"
                        :value="comment.id"
                        :checked="form.selectedComments.includes(comment.id)"
                        @change="toggleComment(comment.id)"
                        :disabled="
                          !form.selectedComments.includes(comment.id) &&
                          form.selectedComments.length >= 3
                        "
                      />
                      <span class="checkbox-text"
                        >{{
                          replaceNameInComment(
                            comment.text,
                            form.studentName || "Siswa"
                          ).substring(0, 100)
                        }}...</span
                      >
                    </label>
                  </div>
                </div>

                <!-- Keterlibatan & Kesulitan -->
                <div class="comment-category">
                  <h4 class="category-title">Keterlibatan & Kesulitan</h4>
                  <div
                    v-for="comment in commentCategories.keterlibatan"
                    :key="comment.id"
                    class="comment-item"
                    :class="{ selected: form.selectedComments.includes(comment.id) }"
                  >
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        :id="comment.id"
                        :value="comment.id"
                        :checked="form.selectedComments.includes(comment.id)"
                        @change="toggleComment(comment.id)"
                        :disabled="
                          !form.selectedComments.includes(comment.id) &&
                          form.selectedComments.length >= 3
                        "
                      />
                      <span class="checkbox-text"
                        >{{
                          replaceNameInComment(
                            comment.text,
                            form.studentName || "Siswa"
                          ).substring(0, 100)
                        }}...</span
                      >
                    </label>
                  </div>
                </div>

                <!-- Penyelesaian Tugas -->
                <div class="comment-category">
                  <h4 class="category-title">Penyelesaian Tugas</h4>
                  <div
                    v-for="comment in commentCategories.penyelesaian"
                    :key="comment.id"
                    class="comment-item"
                    :class="{ selected: form.selectedComments.includes(comment.id) }"
                  >
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        :id="comment.id"
                        :value="comment.id"
                        :checked="form.selectedComments.includes(comment.id)"
                        @change="toggleComment(comment.id)"
                        :disabled="
                          !form.selectedComments.includes(comment.id) &&
                          form.selectedComments.length >= 3
                        "
                      />
                      <span class="checkbox-text"
                        >{{
                          replaceNameInComment(
                            comment.text,
                            form.studentName || "Siswa"
                          ).substring(0, 100)
                        }}...</span
                      >
                    </label>
                  </div>
                </div>

                <!-- Custom -->
                <div class="comment-category">
                  <h4 class="category-title">Custom</h4>
                  <div
                    v-for="comment in commentCategories.custom"
                    :key="comment.id"
                    class="comment-item"
                    :class="{ selected: form.selectedComments.includes(comment.id) }"
                  >
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        :id="comment.id"
                        :value="comment.id"
                        :checked="form.selectedComments.includes(comment.id)"
                        @change="toggleComment(comment.id)"
                        :disabled="
                          !form.selectedComments.includes(comment.id) &&
                          form.selectedComments.length >= 3
                        "
                      />
                      <div class="custom-textarea-wrapper">
                        <textarea
                          v-model="comment.text"
                          @input="updateCustomComment(comment.id, comment.text)"
                          placeholder="Tulis komentar custom..."
                          class="custom-textarea-inline"
                          rows="1"
                          maxlength="220"
                          :disabled="!form.selectedComments.includes(comment.id)"
                        ></textarea>
                        <div
                          class="custom-char-count"
                          :class="{ 'limit-reached': comment.text.length >= 220 }"
                        >
                          {{ comment.text.length }}/220 karakter
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🆕 Recipients - Full Width Below -->
      <div class="recipients-section">
        <div class="card card-compact">
          <div class="card-header card-header-compact">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Penerima
            </h3>
            <span v-if="recipients.length > 0" class="badge-count"
              >{{ recipients.length }} dipilih</span
            >
          </div>
          <div class="card-body card-body-compact">
            <!-- Selected Recipients -->
            <div v-if="recipients.length > 0" class="selected-recipients">
              <div class="recipients-chips">
                <span v-for="(r, i) in recipients" :key="r + i" class="recipient-chip">
                  <span class="chip-label">{{ chipLabel(r) }}</span>
                  <button type="button" class="chip-close" @click="removeRecipient(i)">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>

            <!-- Add Recipients Tabs -->
            <div class="recipient-tabs">
              <button
                type="button"
                class="recipient-tab"
                :class="{ active: activeTab === 'manual' }"
                @click="activeTab = 'manual'"
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
                Manual
              </button>
              <button
                type="button"
                class="recipient-tab"
                :class="{ active: activeTab === 'contacts' }"
                @click="activeTab = 'contacts'"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Kontak
              </button>
              <button
                type="button"
                class="recipient-tab"
                :class="{ active: activeTab === 'groups' }"
                @click="activeTab = 'groups'"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>

                Grup
              </button>
              <button
                type="button"
                class="recipient-tab"
                :class="{ active: activeTab === 'labels' }"
                @click="activeTab = 'labels'"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                  />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Label
              </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
              <!-- Manual Tab -->
              <div v-show="activeTab === 'manual'" class="tab-pane">
                <div class="input-with-button">
                  <input
                    v-model="recipientInput"
                    @keydown.enter.prevent="addRecipientsFromInput"
                    placeholder="628123456789 (pisahkan dengan koma untuk banyak nomor)"
                    class="form-input"
                  />
                  <button
                    type="button"
                    class="btn-primary"
                    @click="addRecipientsFromInput"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tambah
                  </button>
                </div>
              </div>

              <!-- Contacts Tab -->
              <div v-show="activeTab === 'contacts'" class="tab-pane">
                <div class="input-with-button">
                  <select v-model="selectedContactId" class="form-select">
                    <option value="" disabled>Pilih kontak...</option>
                    <option v-for="c in contacts" :key="c.id" :value="c.phone">
                      {{ contactDisplay(c) }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn-primary"
                    @click="addSelectedContact"
                    :disabled="!selectedContactId"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tambah
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="loadContacts"
                    :disabled="loadingContacts"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      :class="{ spinning: loadingContacts }"
                    >
                      <path
                        d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Groups Tab -->
              <div v-show="activeTab === 'groups'" class="tab-pane">
                <div class="input-with-button">
                  <select v-model="selectedGroupId" class="form-select">
                    <option value="" disabled>Pilih grup...</option>
                    <option v-for="g in groups" :key="g.value" :value="g.value">
                      {{ g.label }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn-primary"
                    @click="addSelectedGroup"
                    :disabled="!selectedGroupId"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tambah
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="loadGroups"
                    :disabled="loadingGroups"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      :class="{ spinning: loadingGroups }"
                    >
                      <path
                        d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Labels Tab -->
              <div v-show="activeTab === 'labels'" class="tab-pane">
                <div class="input-with-button">
                  <select v-model="selectedLabelValue" class="form-select">
                    <option value="" disabled>Pilih label...</option>
                    <option v-for="l in labels" :key="l.value" :value="l.value">
                      {{ l.label }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn-primary"
                    @click="addSelectedLabel"
                    :disabled="!selectedLabelValue"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tambah
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="loadLabels"
                    :disabled="loadingLabels"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      :class="{ spinning: loadingLabels }"
                    >
                      <path
                        d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons-compact">
        <button
          type="button"
          class="btn-preview-compact"
          @click="showPreview = true"
          :disabled="!isFormValid || generating"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>

        <button
          type="submit"
          class="btn-submit-compact"
          :disabled="!isFormValid || sending"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          {{ sending ? "Mengirim..." : "Kirim PDF" }}
        </button>
      </div>

      <!-- Alerts Compact -->
      <div v-if="error" class="alert-compact alert-error">{{ error }}</div>
      <div v-if="success" class="alert-compact alert-success">{{ success }}</div>
    </form>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="modal-overlay" @click="showPreview = false">
      <div class="preview-modal" @click.stop>
        <div class="modal-header">
          <h3>Preview Feedback Bulanan</h3>
          <button class="btn-close" @click="showPreview = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="generating" class="preview-loading">
            <div class="spinner"></div>
            <p>Generating PDF preview...</p>
          </div>

          <!-- PDF Preview -->
          <div v-else-if="previewData" class="pdf-preview-container">
            <MonthlyFeedbackPDFTemplate :data="previewData" ref="pdfTemplate" />
          </div>

          <div v-else class="preview-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>Isi form untuk melihat preview</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showPreview = false">Tutup</button>
          <button
            class="btn-download"
            @click="handleDownloadPDF"
            :disabled="!previewData || generating"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {{ generating ? "Generating..." : "Download PDF" }}
          </button>
          <button
            class="btn-primary"
            @click="handleGenerateAndSend"
            :disabled="!previewData || sending"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            {{ sending ? "Mengirim..." : "Kirim Sekarang" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { userApi } from "../api/http.js";
import { useToast } from "../composables/useToast.js";
import { useDevices } from "../composables/useDevices.js";
import { useGroups } from "../composables/useGroups.js";
import MonthlyFeedbackPDFTemplate from "../components/MonthlyFeedbackPDFTemplate.vue";
import { getImagesAsBase64 } from "../utils/images.js";
import html2pdf from "html2pdf.js";

const toast = useToast();

// 🆕 Fungsi helper untuk mengubah string menjadi Title Case
const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// 🆕 Use device composable
const {
  selectedDeviceId,
  selectedDevice,
  availableDevices,
  loading: loadingDevices,
  loadDevices,
  selectDevice,
} = useDevices();

const form = ref({
  studentName: "",
  courseName: "",
  month: null,
  duration: "",
  youtubeLink: "",
  referralLink: "",
  tutorComment: "",
  recipientPhone: "",
  deviceId: "",
  // 🆕 New fields
  rating: 5, // Default 5 bintang
  reportBy: "", // Laporan dibuat oleh
  selectedComments: [], // Array untuk menyimpan checkbox yang dipilih
});

// 🆕 LocalStorage keys (PINDAH KE SINI - setelah form didefinisikan)
const STORAGE_KEYS = {
  STUDENT_NAME: "monthlyFeedback_studentName",
  COURSE_NAME: "monthlyFeedback_courseName",
  MONTH: "monthlyFeedback_month",
  YOUTUBE_LINK: "monthlyFeedback_youtubeLink",
  REFERRAL_LINK: "monthlyFeedback_referralLink",
  REPORT_BY: "monthlyFeedback_reportBy",
  RATING: "monthlyFeedback_rating",
  SELECTED_COMMENTS: "monthlyFeedback_selectedComments",
  CUSTOM_COMMENTS: "monthlyFeedback_customComments", // 🔥 TAMBAH: Key untuk menyimpan teks custom comments
};

// 🆕 Fungsi untuk load data dari localStorage
const loadSavedData = () => {
  try {
    const savedStudentName = localStorage.getItem(STORAGE_KEYS.STUDENT_NAME);
    const savedCourseName = localStorage.getItem(STORAGE_KEYS.COURSE_NAME);
    const savedMonth = localStorage.getItem(STORAGE_KEYS.MONTH);
    const savedYoutubeLink = localStorage.getItem(STORAGE_KEYS.YOUTUBE_LINK);
    const savedReferralLink = localStorage.getItem(STORAGE_KEYS.REFERRAL_LINK);
    const savedReportBy = localStorage.getItem(STORAGE_KEYS.REPORT_BY);
    const savedRating = localStorage.getItem(STORAGE_KEYS.RATING);
    const savedSelectedComments = localStorage.getItem(STORAGE_KEYS.SELECTED_COMMENTS);
    const savedCustomComments = localStorage.getItem(STORAGE_KEYS.CUSTOM_COMMENTS); // 🔥 TAMBAH: Load custom comments

    if (savedStudentName) form.value.studentName = savedStudentName;
    if (savedCourseName) form.value.courseName = savedCourseName;
    if (savedMonth) form.value.month = parseInt(savedMonth);
    if (savedYoutubeLink) form.value.youtubeLink = savedYoutubeLink;
    if (savedReferralLink) form.value.referralLink = savedReferralLink;
    if (savedReportBy) form.value.reportBy = savedReportBy;
    if (savedRating) form.value.rating = parseInt(savedRating);

    // Load selected comments
    if (savedSelectedComments) {
      try {
        form.value.selectedComments = JSON.parse(savedSelectedComments);
      } catch (e) {
        // console.error("Error parsing saved selected comments:", e);
      }
    }

    // 🔥 TAMBAH: Load custom comments text
    if (savedCustomComments) {
      try {
        const customCommentsData = JSON.parse(savedCustomComments);
        // Restore teks custom comments ke commentCategories
        commentCategories.value.custom.forEach((comment) => {
          const savedComment = customCommentsData.find((c) => c.id === comment.id);
          if (savedComment && savedComment.text) {
            comment.text = savedComment.text;
          }
        });
      } catch (e) {
        // console.error("Error parsing saved custom comments:", e);
      }
    }
  } catch (e) {
    // console.error("Error loading saved data:", e);
  }
};

// 🆕 Fungsi untuk save data ke localStorage
const saveDataToStorage = () => {
  try {
    if (form.value.studentName) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, form.value.studentName);
    }
    if (form.value.courseName) {
      localStorage.setItem(STORAGE_KEYS.COURSE_NAME, form.value.courseName);
    }
    if (form.value.month) {
      localStorage.setItem(STORAGE_KEYS.MONTH, form.value.month.toString());
    }
    if (form.value.youtubeLink) {
      localStorage.setItem(STORAGE_KEYS.YOUTUBE_LINK, form.value.youtubeLink);
    }
    if (form.value.referralLink) {
      localStorage.setItem(STORAGE_KEYS.REFERRAL_LINK, form.value.referralLink);
    }
    if (form.value.reportBy) {
      localStorage.setItem(STORAGE_KEYS.REPORT_BY, form.value.reportBy);
    }
    if (form.value.rating) {
      localStorage.setItem(STORAGE_KEYS.RATING, form.value.rating.toString());
    }

    // Save selected comments
    if (form.value.selectedComments && form.value.selectedComments.length > 0) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_COMMENTS,
        JSON.stringify(form.value.selectedComments)
      );
    }

    // 🔥 TAMBAH: Save custom comments text ke localStorage
    const customComments = commentCategories.value.custom
      .filter((comment) => comment.text && comment.text.trim()) // Hanya simpan yang ada isinya
      .map((comment) => ({ id: comment.id, text: comment.text }));

    if (customComments.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_COMMENTS, JSON.stringify(customComments));
    } else {
      // Hapus dari localStorage jika tidak ada custom comments
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_COMMENTS);
    }
  } catch (e) {
    // console.error("Error saving data:", e);
  }
};

// 🆕 Fungsi untuk clear saved data
const clearSavedData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    form.value.studentName = "";
    form.value.courseName = "";
    form.value.month = null;
    form.value.youtubeLink = "";
    form.value.referralLink = "";
    form.value.reportBy = "";
    form.value.rating = 5;
    form.value.selectedComments = [];
    // Reset custom comments text
    commentCategories.value.custom.forEach((comment) => {
      comment.text = "";
    });
    toast.success("Data tersimpan berhasil dihapus");
  } catch (e) {
    // console.error("Error clearing saved data:", e);
  }
};

// 🆕 Watch untuk auto-save saat user mengisi form (PINDAH KE SINI)
watch(() => form.value.studentName, saveDataToStorage);
watch(() => form.value.courseName, saveDataToStorage);
watch(() => form.value.month, saveDataToStorage);
watch(() => form.value.youtubeLink, saveDataToStorage);
watch(() => form.value.referralLink, saveDataToStorage);
watch(() => form.value.reportBy, saveDataToStorage);
watch(() => form.value.rating, saveDataToStorage);
watch(() => form.value.selectedComments, saveDataToStorage, { deep: true });

// 🆕 Computed untuk device list (devices yang tidak dipilih)
const otherDevices = computed(() => {
  if (!selectedDeviceId.value) {
    return availableDevices.value;
  }
  // Jika hanya ada 1 device dan sudah dipilih, jangan tampilkan list
  if (availableDevices.value.length === 1) {
    return [];
  }
  // Tampilkan devices lain yang tidak dipilih
  return availableDevices.value.filter((d) => d.id !== selectedDeviceId.value);
});

// 🆕 Fungsi untuk handle select device
const handleSelectDevice = (deviceId) => {
  selectDevice(deviceId);
  form.value.deviceId = deviceId;
  showDeviceList.value = false; // Hide device list after selection
};

// 🆕 Fungsi untuk handle change device
const handleChangeDevice = () => {
  selectDevice(null);
  form.value.deviceId = "";
  showDeviceList.value = true; // Show device list when changing device
};

// 🆕 Data checkbox komentar
const commentCategories = ref({
  kehadiran: [
    {
      id: "kehadiran_1",
      text:
        "M. Alghifari Setyawan selalu hadir di setiap sesi pelajaran dan menunjukkan antusiasme yang tinggi. Kami sangat menghargai kehadirannya yang konsisten, ini adalah langkah penting dalam proses belajarnya. Terus semangat, ya!",
    },
    {
      id: "kehadiran_2",
      text:
        "M. Alghifari Setyawan mengikuti 3 dari 4 sesi pelajaran bulan ini. Kehadirannya cukup baik, dan meskipun ada satu sesi yang terlewat, M. Alghifari Setyawan tetap mengikuti materi dengan baik. Kami yakin kehadiran yang lebih konsisten akan membuat belajarnya lebih maksimal!",
    },
    {
      id: "kehadiran_3",
      text:
        "M. Alghifari Setyawan hanya hadir di 2 dari 4 sesi bulan ini. Kami melihat kehadiran yang tidak konsisten mulai mempengaruhi kemajuan belajar. Akan lebih baik jika M. Alghifari Setyawan bisa hadir lebih teratur agar tidak tertinggal materi.",
    },
    {
      id: "kehadiran_4",
      text:
        "M. Alghifari Setyawan hadir hanya di 1 dari 4 sesi pelajaran bulan ini. Kami khawatir ini bisa mempengaruhi pemahaman materi yang diajarkan. Jika memungkinkan, mari kita diskusikan bagaimana agar M. Alghifari Setyawan bisa lebih rutin mengikuti pelajaran.",
    },
    {
      id: "kehadiran_5",
      text:
        "M. Alghifari Setyawan tidak hadir di seluruh sesi pelajaran bulan ini. Kami ingin membantu agar M. Alghifari Setyawan bisa kembali mengikuti pelajaran dengan lebih baik. Kami akan menghubungi Anda untuk membahas solusi yang tepat.",
    },
  ],
  keterlibatan: [
    {
      id: "keterlibatan_1",
      text:
        "M. Alghifari Setyawan sangat terlibat dalam setiap sesi, aktif berpartisipasi dalam diskusi, dan tidak ragu mengajukan pertanyaan yang mendalam. M. Alghifari Setyawan selalu menunjukkan kemajuan yang baik dan memahami materi dengan cepat. Saya sering memberikan tantangan tambahan untuk membantu M. Alghifari Setyawan terus berkembang dan belajar lebih jauh.",
    },
    {
      id: "keterlibatan_2",
      text:
        "M. Alghifari Setyawan cukup fokus di kelas meskipun jarang bertanya. Namun, M. Alghifari Setyawan selalu memperhatikan dengan baik dan mengikuti instruksi dengan seksama. Mungkin dengan lebih banyak berpartisipasi dalam diskusi, M. Alghifari Setyawan bisa meningkatkan pemahaman materi. Secara keseluruhan, M. Alghifari Setyawan sudah menunjukkan perkembangan yang positif.",
    },
    {
      id: "keterlibatan_3",
      text:
        "M. Alghifari Setyawan cenderung lebih diam di kelas dan jarang terlibat dalam diskusi. Kami menyarankan agar M. Alghifari Setyawan lebih terbuka untuk bertanya atau berinteraksi sehingga bisa lebih mudah memahami materi. Jika ada kendala tertentu, kami siap membantu agar suasana kelas lebih nyaman untuk belajar.",
    },
    {
      id: "keterlibatan_4",
      text:
        "M. Alghifari Setyawan tampak mengalami kesulitan dalam mengikuti pelajaran terakhir. Kurangnya fokus menyebabkan M. Alghifari Setyawan tidak sepenuhnya menangkap materi. Kami menyarankan agar M. Alghifari Setyawan lebih terlibat aktif dalam kelas agar pemahaman terhadap pelajaran meningkat. Jika Anda memerlukan bantuan atau rekaman kelas, kami siap memberikan dukungan tambahan.",
    },
  ],
  penyelesaian: [
    {
      id: "penyelesaian_1",
      text:
        "M. Alghifari Setyawan telah berhasil menyelesaikan semua tugas dengan sangat baik. Pemahamannya terhadap materi sangat jelas, dan M. Alghifari Setyawan mampu menyelesaikan setiap tugas tepat waktu. Senang sekali melihat kemajuannya yang terus meningkat. Terus lanjutkan usaha ini, ya!",
    },
    {
      id: "penyelesaian_2",
      text:
        "M. Alghifari Setyawan berhasil menyelesaikan sebagian besar tugas dengan baik, namun ada beberapa area yang memerlukan sedikit perbaikan. Dengan latihan tambahan dan perhatian lebih, M. Alghifari Setyawan pasti akan bisa meningkatkan kualitas tugas-tugasnya dan mencapai hasil yang lebih baik lagi.",
    },
    {
      id: "penyelesaian_3",
      text:
        "M. Alghifari Setyawan tampaknya menghadapi beberapa tantangan dalam menyelesaikan tugas kali ini. Sangat penting bagi M. Alghifari Setyawan untuk meluangkan lebih banyak waktu dalam berlatih agar pemahamannya terhadap materi semakin kuat. Kami berharap M. Alghifari Setyawan bisa mengejar ketinggalan. Jika ada kesulitan, jangan ragu untuk menghubungi saya, saya siap membantu.",
    },
  ],
  custom: [
    {
      id: "custom_1",
      text: "",
      isCustom: true,
    },
    {
      id: "custom_2",
      text: "",
      isCustom: true,
    },
  ],
});

// 🆕 Helper untuk replace nama di komentar
const replaceNameInComment = (text, studentName) => {
  // Replace placeholder nama dengan nama siswa yang sebenarnya (Title Case)
  const formattedName = toTitleCase(studentName);
  return text.replace(/M\. Alghifari Setyawan/g, formattedName);
};

// 🆕 Computed untuk nama siswa yang sudah diformat
const formattedStudentName = computed(() => {
  return toTitleCase(form.value.studentName);
});

// 🆕 Computed untuk reportBy yang sudah diformat (Title Case)
const formattedReportBy = computed(() => {
  return toTitleCase(form.value.reportBy);
});

// 🆕 Computed untuk mendapatkan komentar yang dipilih dengan nama yang sudah diganti
const selectedCommentsText = computed(() => {
  if (!form.value.selectedComments || form.value.selectedComments.length === 0) {
    return "";
  }

  // Ambil maksimal 3 komentar pertama
  const selectedIds = form.value.selectedComments.slice(0, 3);
  const comments = [];

  // Loop semua kategori untuk mencari komentar yang dipilih
  Object.values(commentCategories.value).forEach((category) => {
    category.forEach((comment) => {
      if (selectedIds.includes(comment.id)) {
        const text = comment.isCustom
          ? comment.text
          : replaceNameInComment(comment.text, formattedStudentName.value || "Siswa");
        if (text) {
          comments.push(text);
        }
      }
    });
  });

  return comments.join("\n\n");
});

// 🆕 Toggle checkbox
const toggleComment = (commentId) => {
  const index = form.value.selectedComments.indexOf(commentId);
  if (index > -1) {
    // Remove if already selected
    form.value.selectedComments.splice(index, 1);
  } else {
    // Add if not selected (max 3)
    if (form.value.selectedComments.length < 3) {
      form.value.selectedComments.push(commentId);
    } else {
      toast.warning("Maksimal 3 komentar yang bisa dipilih");
    }
  }
};

// 🆕 Update custom comment text
const updateCustomComment = (commentId, text) => {
  const category = commentCategories.value.custom;
  const comment = category.find((c) => c.id === commentId);
  if (comment) {
    comment.text = text;
    // 🔥 TAMBAH: Panggil saveDataToStorage() agar teks tersimpan ke localStorage
    saveDataToStorage();
  }
};

const templates = ref([]);
const courses = ref([]);
const showPreview = ref(false);
const generating = ref(false);
const sending = ref(false);
const error = ref("");
const success = ref("");

// 🆕 Recipient management
const recipients = ref([]);
const activeTab = ref("manual");
const recipientInput = ref("");
const recipientLabels = ref({});

// 🆕 Contacts
const contacts = ref([]);
const selectedContactId = ref("");
const loadingContacts = ref(false);

// 🆕 Groups
const { groups, loadingGroups, loadGroups, ensureFullGroupJid } = useGroups();
const selectedGroupId = ref("");

// 🆕 Labels
const labels = ref([]);
const selectedLabelValue = ref("");
const loadingLabels = ref(false);

const selectedTemplate = computed(() => {
  if (!form.value.courseName || !form.value.month) return null;
  return templates.value.find(
    (t) =>
      t.courseName === form.value.courseName &&
      Number(t.month) === Number(form.value.month) // 🔥 FIX: gunakan form.value.month bukan t.month
  );
});

const availableMonths = computed(() => {
  if (!form.value.courseName) return [];
  return templates.value
    .filter((t) => t.courseName === form.value.courseName)
    .map((t) => Number(t.month))
    .sort((a, b) => a - b);
});

// 🆕 Helper functions untuk recipients
const chipLabel = (r) => recipientLabels.value[r] || r;

const isValidPhoneNumber = (phone) => {
  const cleaned = String(phone).replace(/\D/g, "");
  if (!cleaned.startsWith("62")) return false;
  if (cleaned.length < 10 || cleaned.length > 15) return false;
  return true;
};

const addRecipientsFromInput = () => {
  if (!recipientInput.value) return;

  const items = recipientInput.value
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const validNumbers = [];
  const invalidNumbers = [];

  items.forEach((item) => {
    if (isValidPhoneNumber(item)) {
      validNumbers.push(item);
    } else {
      invalidNumbers.push(item);
    }
  });

  if (validNumbers.length > 0) {
    const set = new Set([...recipients.value, ...validNumbers]);
    recipients.value = Array.from(set);
  }

  if (validNumbers.length > 0 && invalidNumbers.length > 0) {
    toast.success(`${validNumbers.length} nomor berhasil ditambahkan`);
    toast.error(
      `${invalidNumbers.length} nomor tidak valid: ${invalidNumbers.join(", ")}`
    );
  } else if (validNumbers.length > 0) {
    toast.success(`${validNumbers.length} nomor berhasil ditambahkan`);
  } else if (invalidNumbers.length > 0) {
    toast.error(
      `Nomor tidak valid: ${invalidNumbers.join(
        ", "
      )}. Format harus: 62xxx (minimal 10 digit)`
    );
  }

  recipientInput.value = "";
};

const removeRecipient = (index) => {
  recipients.value.splice(index, 1);
};

const contactLabelNames = (c) => {
  try {
    const arr = (c?.ContactLabel || [])
      .map((x) => x?.label?.name)
      .filter((n) => n && !String(n).startsWith("device_"));
    return arr.join(", ");
  } catch {
    return "";
  }
};

const contactDisplay = (c) => {
  const name = `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.phone || "-";
  const labelNames = contactLabelNames(c);
  return labelNames ? `${name} (${c.phone}) - [${labelNames}]` : `${name} (${c.phone})`;
};

const loadContacts = async () => {
  try {
    loadingContacts.value = true;
    const deviceId = selectedDeviceId.value || localStorage.getItem("device_selected_id");
    const res = await userApi.get("/contacts", { params: deviceId ? { deviceId } : {} });
    contacts.value = Array.isArray(res?.data) ? res.data : [];
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || "Gagal memuat kontak");
  } finally {
    loadingContacts.value = false;
  }
};

const addSelectedContact = () => {
  if (!selectedContactId.value) return;
  if (!recipients.value.includes(selectedContactId.value)) {
    recipients.value.push(selectedContactId.value);
    const found = contacts.value.find((c) => c.phone === selectedContactId.value);
    if (found) {
      const labelNames = contactLabelNames(found);
      const firstName = found.firstName || "";
      const lastName = found.lastName || "";
      const labelPart = labelNames ? ` [${labelNames}]` : "";
      recipientLabels.value[
        selectedContactId.value
      ] = `Kontak: ${firstName} ${lastName}${labelPart}`;
    }
  }
  selectedContactId.value = "";
};

const addSelectedGroup = async () => {
  if (!selectedGroupId.value) return;

  const groupValue = selectedGroupId.value;

  if (!recipients.value.includes(groupValue)) {
    recipients.value.push(groupValue);
    const found = groups.value.find((g) => g.value === groupValue);
    if (found) {
      recipientLabels.value[groupValue] = "Group: " + found.label;
    }
  }
  selectedGroupId.value = "";
};

const mapLabels = (items) => {
  const arr = Array.isArray(items) ? items : [];
  return arr
    .map((it) => {
      if (typeof it === "string") {
        const name = it;
        return { value: "label_" + name, label: name };
      }
      const name = it.name || it.label || it.title || "";
      const slug = it.slug || "";
      const value = "label_" + (slug || name);
      return name ? { value, label: name } : null;
    })
    .filter(Boolean);
};

const deriveLabelsFromContacts = () => {
  const names = new Set();
  (contacts.value || []).forEach((c) => {
    (c.ContactLabel || []).forEach((cl) => {
      const n = cl?.label?.name;
      if (n && !String(n).startsWith("device_")) names.add(n);
    });
  });
  return Array.from(names);
};

const loadLabels = async () => {
  try {
    loadingLabels.value = true;
    const deviceId = selectedDeviceId.value || localStorage.getItem("device_selected_id");
    const res = await userApi.get("/contacts/labels", {
      params: deviceId ? { deviceId } : {},
    });
    const data = res?.data;
    let list = Array.isArray(data?.labels)
      ? data.labels
      : Array.isArray(data)
      ? data
      : [];
    if (!Array.isArray(list) || list.length === 0) {
      if (!contacts.value || contacts.value.length === 0) {
        await loadContacts();
      }
      list = deriveLabelsFromContacts();
    }
    labels.value = mapLabels(list);
  } catch (_) {
    if (!contacts.value || contacts.value.length === 0) {
      await loadContacts().catch(() => {});
    }
    const list = deriveLabelsFromContacts();
    labels.value = mapLabels(list);
  } finally {
    loadingLabels.value = false;
  }
};

const addSelectedLabel = () => {
  if (!selectedLabelValue.value) return;
  const val = selectedLabelValue.value;
  if (!recipients.value.includes(val)) {
    recipients.value.push(val);
    const found = labels.value.find((l) => l.value === val);
    if (found) {
      recipientLabels.value[val] = "Label: " + found.label;
    }
  }
  selectedLabelValue.value = "";
};

const isFormValid = computed(() => {
  return (
    form.value.studentName &&
    form.value.courseName &&
    form.value.month &&
    form.value.youtubeLink &&
    form.value.referralLink &&
    form.value.rating &&
    form.value.reportBy &&
    form.value.selectedComments.length > 0 && // 🔥 Ganti validasi dari tutorComment ke selectedComments
    recipients.value.length > 0 &&
    selectedDeviceId.value &&
    selectedTemplate.value
  );
});

const previewData = computed(() => {
  if (!isFormValid.value || !selectedTemplate.value) return null;

  const durationText = form.value.duration || "Bulan ke-" + form.value.month;

  return {
    studentName: formattedStudentName.value, // 🔥 Gunakan nama yang sudah diformat
    courseName: form.value.courseName,
    month: form.value.month,
    duration: durationText,
    level: selectedTemplate.value.level,
    code: selectedTemplate.value.code,
    topicModule: selectedTemplate.value.topicModule,
    result: selectedTemplate.value.result,
    skillsAcquired: selectedTemplate.value.skillsAcquired,
    youtubeLink: form.value.youtubeLink,
    referralLink: form.value.referralLink,
    tutorComment: form.value.tutorComment,
    recipients: recipients.value,
    rating: form.value.rating,
    reportBy: formattedReportBy.value, // 🔥 UPDATE: Gunakan reportBy yang sudah diformat (Title Case)
    selectedComments: selectedCommentsText.value,
  };
});

const loadTemplates = async () => {
  try {
    const { data } = await userApi.get("/algorithmics/monthly-templates");
    templates.value = data.templates || [];

    // Extract unique courses
    const uniqueCourses = [...new Set(templates.value.map((t) => t.courseName))].sort();
    courses.value = uniqueCourses;
  } catch (e) {
    toast.error("Gagal memuat templates");
  }
};

const onCourseChange = () => {
  form.value.month = null;
};

const onMonthChange = () => {
  // Auto-fill duration jika kosong
  if (!form.value.duration && form.value.month) {
    form.value.duration = "Bulan ke-" + form.value.month;
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error("Mohon lengkapi semua field yang diperlukan");
    return;
  }

  // Generate preview dulu
  showPreview.value = true;
};

const handleGenerateAndSend = async () => {
  if (!previewData.value) return;

  // Validasi device
  if (!form.value.deviceId) {
    error.value = "Silakan pilih device WhatsApp terlebih dahulu";
    toast.error("Silakan pilih device WhatsApp terlebih dahulu");
    return;
  }

  // 🆕 Validasi recipients
  if (recipients.value.length === 0) {
    error.value = "Silakan tambahkan minimal satu penerima";
    toast.error("Silakan tambahkan minimal satu penerima");
    return;
  }

  error.value = "";
  success.value = "";
  sending.value = true;

  try {
    // 🔥 FIX: Gunakan selectedCommentsText sebagai tutorComment agar backend bisa memproses
    const payload = {
      studentName: formattedStudentName.value, // 🔥 Gunakan nama yang sudah diformat
      courseName: previewData.value.courseName,
      month: Number(previewData.value.month),
      duration: previewData.value.duration,
      level: previewData.value.level,
      code: previewData.value.code,
      topicModule: previewData.value.topicModule,
      result: previewData.value.result,
      skillsAcquired: previewData.value.skillsAcquired,
      youtubeLink: previewData.value.youtubeLink,
      referralLink: previewData.value.referralLink,
      tutorComment: selectedCommentsText.value, // 🔥 FIX: Kirim komentar gabungan dari checkbox
      recipients: recipients.value,
      deviceId: form.value.deviceId,
      rating: previewData.value.rating,
      reportBy: previewData.value.reportBy,
    };

    // console.log('Sending payload:', payload);

    const { data } = await userApi.post("/algorithmics/monthly-feedback/send", payload);

    const recipientCount = recipients.value.length;
    success.value =
      "Feedback bulanan berhasil dikirim ke " + recipientCount + " penerima!";
    toast.success(
      "Feedback bulanan berhasil dikirim ke " + recipientCount + " penerima!"
    );

    // 🔥 PERBAIKAN: Reset HANYA data yang perlu di-reset (nama siswa, bulan, komentar)
    // Data tersimpan (courseName, youtubeLink, referralLink, reportBy, rating) TETAP ADA
    // form.value.studentName = '';
    form.value.duration = "";
    // form.value.selectedComments = []; // 🆕 Uncommenting to reset selected comments
    // form.value.tutorComment = '';

    // Reset custom comment text
    // commentCategories.value.custom.forEach(comment => {
    //   comment.text = '';
    // }); // 🆕 Uncommenting to reset custom comments

    // 🆕 Reset recipients
    recipients.value = [];
    recipientLabels.value = {};

    showPreview.value = false;
  } catch (e) {
    // console.error("Error sending feedback:", e);
    const errorMsg =
      e?.response?.data?.message || e?.message || "Gagal mengirim feedback";
    error.value = errorMsg;
    toast.error(errorMsg);
  } finally {
    sending.value = false;
  }
};

const pdfTemplate = ref(null);

const handleDownloadPDF = async () => {
  if (!previewData.value || !pdfTemplate.value) return;

  generating.value = true;
  try {
    // Clone the template element
    const element = pdfTemplate.value.$el.cloneNode(true);

    // Wait for images to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Replace all images with base64 (using PNG for transparency support)
    const images = element.querySelectorAll("img");
    const imagePromises = Array.from(images).map(async (img) => {
      try {
        const src = img.src || img.getAttribute("src");
        if (!src) return;

        return new Promise((resolve) => {
          const tempImg = new Image();
          tempImg.crossOrigin = "Anonymous";

          tempImg.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = tempImg.naturalWidth || tempImg.width;
              canvas.height = tempImg.naturalHeight || tempImg.height;

              if (canvas.width === 0 || canvas.height === 0) {
                // console.warn("Invalid image dimensions:", src);
                resolve();
                return;
              }

              const ctx = canvas.getContext("2d");

              // Set transparent background instead of white/black
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              // Draw image
              ctx.drawImage(tempImg, 0, 0);

              // Use PNG for icons (supports transparency), JPEG for photos
              const isIcon =
                img.classList.contains("icon-img") ||
                img.classList.contains("icon-img-small") ||
                img.classList.contains("icon-img-inline") || // 🔥 TAMBAH: Deteksi icon-img-inline (icon kado)
                img.classList.contains("icon-img-2");
              const base64 = isIcon
                ? canvas.toDataURL("image/png", 1.0)
                : canvas.toDataURL("image/jpeg", 0.95);

              img.src = base64;
              img.setAttribute("src", base64);
              img.style.display = "block";
              img.style.visibility = "visible";
              img.style.background = "transparent";
              resolve();
            } catch (error) {
              // console.error("Error converting image:", error);
              resolve();
            }
          };

          tempImg.onerror = () => {
            // console.warn("Failed to load image:", src);
            resolve();
          };

          tempImg.src = src;
        });
      } catch (error) {
        // console.error("Error processing image:", error);
      }
    });

    await Promise.all(imagePromises);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const studentNameClean = formattedStudentName.value.replace(/\s+/g, "_"); // 🔥 Gunakan nama yang sudah diformat
    const monthNum = previewData.value.month;
    const fileName = "Feedback_" + studentNameClean + "_Bulan" + monthNum + ".pdf";

    const opt = {
      margin: 0,
      filename: fileName,
      image: {
        type: "jpeg",
        quality: 0.95,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#ffffff",
        scrollY: 0,
        scrollX: 0,
        windowWidth: 794,
        windowHeight: 1123,
        onclone: (clonedDoc) => {
          const clonedImages = clonedDoc.querySelectorAll("img");
          clonedImages.forEach((img) => {
            img.style.display = "block";
            img.style.visibility = "visible";
            img.style.background = "transparent";
          });
        },
      },
      jsPDF: {
        unit: "px",
        format: [794, 1123],
        orientation: "portrait",
        compress: true,
        hotfixes: ["px_scaling"],
      },
      pagebreak: {
        mode: "avoid-all",
      },
    };

    await html2pdf().set(opt).from(element).save();
    toast.success("PDF berhasil didownload!");
  } catch (e) {
    // console.error("Error generating PDF:", e);
    toast.error("Gagal generate PDF: " + (e.message || "Unknown error"));
  } finally {
    generating.value = false;
  }
};

const showDeviceList = ref(false);

onMounted(async () => {
  await Promise.allSettled([
    loadTemplates(),
    loadDevices(),
    loadGroups(),
    loadContacts(),
    loadLabels(),
  ]);

  // 🆕 Load saved data from localStorage
  loadSavedData();

  // Auto-select device if available
  if (selectedDeviceId.value) {
    form.value.deviceId = selectedDeviceId.value;
  }
});

// Watch for device changes
watch(selectedDeviceId, (newDeviceId) => {
  if (newDeviceId) {
    form.value.deviceId = newDeviceId;
  }
});

// 🆕 Watch selectedDeviceId untuk auto-refresh data ketika device berubah
watch(selectedDeviceId, async (newDeviceId, oldDeviceId) => {
  if (newDeviceId && oldDeviceId && newDeviceId !== oldDeviceId) {
    // ✅ Dispatch custom event untuk Dashboard.vue
    window.dispatchEvent(new Event("deviceChanged"));

    // Clear recipients ketika ganti device
    recipients.value = [];
    recipientLabels.value = {};
    selectedContactId.value = "";
    selectedGroupId.value = "";
    selectedLabelValue.value = "";

    // Auto-refresh semua data (termasuk GROUPS!)
    await Promise.allSettled([
      loadGroups({ force: true }), // 🔥 Tambahkan force: true untuk memaksa reload
      loadContacts(),
      loadLabels(),
    ]);

    toast.success(
      "Device berhasil diganti. Data grup, kontak, dan label telah di-refresh."
    );
  }
});
</script>

<style scoped>
/* Base Styles */
.wrapper {
  max-width: 1200px;
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

.header-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

/* Form */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card */
.card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3,
.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.card-header h3 svg,
.card-title svg {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

.step-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.card-body {
  padding: 24px;
}

/* 🆕 Device Selector Styles */
/* Button Refresh Header */
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

.btn-refresh-header svg.spinning {
  animation: spin 1s linear infinite;
}

/* Device Info Card */
.device-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 2px solid;
  transition: all 0.3s;
}

.device-info-card.connected {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.device-info-card.disconnected {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
}

.device-avatar {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.device-info-card.connected .device-avatar {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.device-info-card.disconnected .device-avatar {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.device-avatar svg {
  width: 32px;
  height: 32px;
  color: white;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #ef4444;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-indicator.online {
  background: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.device-details {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #dc2626;
  font-weight: 500;
}

.device-status.online {
  color: #059669;
}

.device-status svg {
  width: 8px;
  height: 8px;
}

.device-divider {
  color: #cbd5e1;
}

.device-id {
  color: #64748b;
}

.btn-change-device {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-change-device:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-change-device svg {
  width: 16px;
  height: 16px;
}

/* Device Selector Empty State */
.device-selector-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  margin-bottom: 24px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
  color: #4338ca;
}

.empty-text {
  text-align: center;
}

.empty-text h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.empty-text p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Device List */
.device-list {
  margin-top: 24px;
}

.device-list .form-label {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.device-item:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.device-item.active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
}

.device-item.connected {
  border-color: #86efac;
}

.device-item.disconnected {
  border-color: #fca5a5;
  opacity: 0.7;
}

.device-item-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-item.connected .device-item-avatar {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.device-item.disconnected .device-item-avatar {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.device-item-avatar svg {
  width: 22px;
  height: 22px;
  color: #4338ca;
}

.device-item.connected .device-item-avatar svg {
  color: #059669;
}

.device-item.disconnected .device-item-avatar svg {
  color: #dc2626;
}

.device-item-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border: 2px solid white;
  border-radius: 50%;
}

.device-item-status.online {
  background: #10b981;
}

.device-item-info {
  flex: 1;
  min-width: 0;
}

.device-item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-item-status-text {
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
}

.device-item-status-text.online {
  color: #059669;
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #475569;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #ef4444;
}

.form-input,
.form-select,
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
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  line-height: 1.6;
}

.char-count {
  font-size: 12px;
  color: #94a3b8;
  text-align: right;
}

.form-help {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.form-help svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Auto-filled Section */
.auto-filled-section {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
}

.auto-filled-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #0c4a6e;
  font-size: 13px;
  font-weight: 600;
}

.auto-filled-header svg {
  width: 16px;
  height: 16px;
}

.auto-filled-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.auto-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auto-field.full {
  grid-column: 1 / -1;
}

.auto-field label {
  font-size: 11px;
  font-weight: 600;
  color: #075985;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auto-field span {
  color: #0c4a6e;
  font-weight: 500;
}

.auto-field p {
  margin: 0;
  color: #0c4a6e;
  font-size: 13px;
  line-height: 1.6;
}

/* Action Section */
.action-section {
  display: flex;
  gap: 12px;
}

.btn-preview,
.btn-submit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-preview {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-preview:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-2px);
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-preview:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-preview svg,
.btn-submit svg {
  width: 20px;
  height: 20px;
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

/* Modal */
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
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.preview-modal {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
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
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
}

.btn-close svg {
  width: 18px;
  height: 18px;
  color: #475569;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
  background: #f8fafc;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* PDF Preview Container */
.pdf-preview-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item label,
.preview-field label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-item span {
  color: #1e293b;
  font-weight: 500;
  font-size: 14px;
}

.preview-field {
  margin-bottom: 12px;
}

.preview-field p {
  margin: 4px 0 0 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.preview-feedback {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #334155;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.preview-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 10px;
  color: #0369a1;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.preview-link:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  transform: translateX(4px);
}

.preview-link svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  gap: 16px;
}

.preview-empty svg {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
}

.preview-empty p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8fafc;
}

.btn-secondary,
.btn-download,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-download {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-download:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary svg,
.btn-download svg,
.btn-primary svg {
  width: 16px;
  height: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .wrapper {
    padding: 0 16px;
  }

  .form-layout {
    grid-template-columns: 1fr !important;
  }

  .form-row,
  .auto-filled-grid,
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .device-grid {
    grid-template-columns: 1fr;
  }

  .action-section {
    flex-direction: column;
  }

  .preview-modal {
    width: 95%;
    max-height: 95vh;
  }

  .device-info-card {
    flex-direction: column;
    text-align: center;
  }

  .btn-change-device {
    width: 100%;
    justify-content: center;
  }

  /* 🆕 Rating stars responsive */
  .rating-stars .star {
    font-size: 28px;
  }

  /* 🆕 Comment checkboxes responsive */
  .comment-checkboxes {
    max-height: 300px;
  }
}

/* 🆕 Two Column Layout */
.form-layout {
  display: grid;
  grid-template-columns: 38fr 62fr; /* Kiri lebih kecil (38%), Kanan lebih lebar (62%) */
  gap: 20px;
  align-items: start;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 🆕 Full Height Card for Comments */
.card-full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-full-height .card-body-compact {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-full-height .comment-checkboxes {
  flex: 1;
  max-height: none;
}

/* 🆕 Selected Count Badge */
.selected-count-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* 🆕 Recipients Section - Full Width */
.recipients-section {
  width: 100%;
  margin-top: 4px;
}

/* 🆕 Compact Card Styles */
.card-compact {
  margin-bottom: 0;
}

.card-header-compact {
  padding: 14px 18px;
}

.card-header-compact h3 {
  font-size: 15px;
  font-weight: 600;
}

.card-header-compact h3 svg,
.card-header-compact .card-title svg {
  width: 18px;
  height: 18px;
}

.card-body-compact {
  padding: 16px 18px;
}

.badge-count-compact {
  padding: 4px 10px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* 🆕 Compact Form Elements */
.form-group-compact {
  margin-bottom: 12px;
}

.form-group-compact:last-child {
  margin-bottom: 0;
}

.form-input-compact {
  padding: 10px 12px;
  font-size: 13px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.char-count-compact {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
  margin-top: 4px;
}

/* 🆕 Device Info Compact */
.device-info-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.device-avatar-compact {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-avatar-compact.online {
  background: linear-gradient(135deg, #86efac 0%, #4ade80 100%);
}

.device-avatar-compact svg {
  width: 20px;
  height: 20px;
  color: white;
}

.device-info-text {
  flex: 1;
  min-width: 0;
}

.device-name-compact {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-status-compact {
  font-size: 11px;
  color: #dc2626;
  font-weight: 500;
  margin-top: 2px;
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

/* 🆕 Device List Compact */
.device-list-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* 🆕 Auto-filled Compact */
/* .auto-filled-compact {
  margin-top: 12px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
} */

.auto-info {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.auto-label {
  font-weight: 600;
  color: #075985;
  min-width: 50px;
}

.auto-value {
  color: #0c4a6e;
  font-weight: 500;
}

/* 🆕 Recipient Tabs Compact */
.recipient-tabs-compact {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  padding: 4px;
  background: #f8fafc;
  border-radius: 8px;
}

.recipient-tabs-compact button {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: capitalize;
}

.recipient-tabs-compact button:hover {
  color: #3b82f6;
  background: white;
}

.recipient-tabs-compact button.active {
  background: white;
  color: #3b82f6;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 🆕 Tab Content Compact */
.tab-content-compact {
  margin-bottom: 12px;
}

.recipient-input-compact {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.recipient-input-compact .form-input,
.recipient-input-compact .form-select {
  flex: 1;
}

.btn-add-compact {
  width: 40px;
  height: auto;
  min-height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-compact:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* 🆕 Recipients Chips Compact */
.recipients-chips-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.chip-compact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #475569;
  font-weight: 500;
  max-width: 100%;
}

.chip-compact button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
}

.chip-compact button:hover {
  color: #ef4444;
}

/* 🆕 Action Buttons Compact */
.action-buttons-compact {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn-preview-compact,
.btn-submit-compact {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview-compact {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-preview-compact:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-submit-compact {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-submit-compact:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-preview-compact:disabled,
.btn-submit-compact:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-preview-compact svg,
.btn-submit-compact svg {
  width: 16px;
  height: 16px;
}

/* 🆕 Alert Compact */
.alert-compact {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid;
}

.alert-compact.alert-success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.alert-compact.alert-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

/* 🆕 Recipient Tabs Styling */
.recipient-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
}

.recipient-tabs button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: -10px;
  text-transform: capitalize;
}

.recipient-tabs button:hover {
  color: #3b82f6;
  background: #f8fafc;
  border-radius: 10px 10px 0 0;
}

.recipient-tabs button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

/* Tab Content */
.manual-recipient,
.contacts-recipient,
.groups-recipient,
.labels-recipient {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-bottom: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.manual-recipient .form-group,
.contacts-recipient .form-group,
.groups-recipient .form-group,
.labels-recipient .form-group {
  flex: 1;
  margin: 0;
}

.manual-recipient button,
.contacts-recipient button,
.groups-recipient button,
.labels-recipient button {
  padding: 12px 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.manual-recipient button:hover:not(:disabled),
.contacts-recipient button:hover:not(:disabled),
.groups-recipient button:hover:not(:disabled),
.labels-recipient button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.manual-recipient button:disabled,
.contacts-recipient button:disabled,
.groups-recipient button:disabled,
.labels-recipient button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Recipients List */
.recipients-list {
  margin-top: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.recipients-list h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.recipients-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recipients-list li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

.recipients-list li button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  font-size: 12px;
}

.recipients-list li button:hover {
  color: #ef4444;
}

.recipients-list:empty::after {
  content: "Belum ada penerima yang dipilih";
  display: block;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

/* 🆕 Rating Stars */
.rating-stars {
  display: flex;
  gap: 8px;
  align-items: center;
}

.rating-stars .star {
  font-size: 32px;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.rating-stars .star:hover {
  transform: scale(1.2);
}

.rating-stars .star.filled {
  color: #fbbf24;
  text-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
}

/* 🆕 Selected Count */
.selected-count {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

/* 🆕 Comment Checkboxes */
.comment-checkboxes {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
}

.comment-category {
  margin-bottom: 12px;
}

.comment-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
  padding-bottom: 4px;
  border-bottom: 1.5px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comment-item {
  margin-bottom: 6px;
  padding: 8px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s;
}

.comment-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-item.selected {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  width: 100%;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: #3b82f6;
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-text {
  flex: 1;
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}

.comment-item.selected .checkbox-text {
  color: #1e40af;
  font-weight: 500;
}

/* 🆕 Custom Comment */
.custom-textarea-inline {
  flex: 1;
  font-size: 12px;
  padding: 6px 8px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  resize: vertical;
  transition: all 0.2s;
}

.custom-textarea-inline:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-textarea-inline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
}

.custom-textarea-inline::placeholder {
  font-size: 11px;
  color: #94a3b8;
}

/* 🆕 Custom Textarea Wrapper */
.custom-textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.custom-char-count {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
}

.custom-char-count.limit-reached {
  color: #ef4444;
}

/* 🆕 Selected Comments Preview */
.selected-comments-preview {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.selected-comments-preview .form-label {
  margin-bottom: 8px;
  color: #075985;
  font-weight: 600;
}

.preview-text {
  font-size: 13px;
  color: #0c4a6e;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

/* 🆕 Selected Count */
.selected-count {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

/* 🆕 Badge Count (untuk header recipients) */
.badge-count {
  padding: 6px 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #93c5fd;
}

/* 🆕 Selected Recipients */
.selected-recipients {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.recipients-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recipient-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  transition: all 0.2s;
}

.recipient-chip:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chip-label {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.chip-close:hover {
  color: #ef4444;
}

.chip-close svg {
  width: 16px;
  height: 16px;
}

/* 🆕 Recipient Tabs (modern dengan icon) */
.recipient-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
}

.recipient-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: -10px;
}

.recipient-tab:hover {
  color: #3b82f6;
  background: #f8fafc;
  border-radius: 10px 10px 0 0;
}

.recipient-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

.recipient-tab svg {
  width: 18px;
  height: 18px;
}

/* 🆕 Tab Content */
.tab-content {
  margin-top: 16px;
}

.tab-pane {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🆕 Input with Button */
.input-with-button {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.input-with-button .form-input,
.input-with-button .form-select {
  flex: 1;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 18px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
  padding: 12px;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary svg,
.btn-secondary svg {
  width: 18px;
  height: 18px;
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

/* 🆕 Comment Checkboxes */

/* 🆕 Clear Data Button */
.btn-clear-data {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-clear-data:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-clear-data svg {
  width: 14px;
  height: 14px;
}
</style>
