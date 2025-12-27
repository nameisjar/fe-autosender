<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M16 2V6M8 2V6M3 10H21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Jadwal Saya
        </h2>
        <p class="subtitle">Kelola dan pantau jadwal broadcast Anda</p>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <div class="stat-value">{{ summary.sent }}</div>
            <div class="stat-label">Terkirim</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <div class="stat-value">{{ summary.scheduled }}</div>
            <div class="stat-label">Terjadwal</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <div>
            <div class="stat-value">{{ summary.inactive }}</div>
            <div class="stat-label">Nonaktif</div>
          </div>
        </div>
      </div>
    </div>

    <div class="toolbar-card">
      <div class="toolbar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="q" placeholder="Cari nama jadwal..." />
        </div>

        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">📋 Semua Status</option>
            <option value="upcoming">⏰ Proses Dikirim</option>
            <option value="sent">✅ Sudah Dikirim</option>
            <option value="inactive">❌ Nonaktif</option>
          </select>

          <select v-model="typeFilter" class="filter-select">
            <option value="all">📝 Semua Tipe</option>
            <option value="broadcast">📢 Broadcast</option>
            <option value="feedback">💬 Feedback</option>
            <option value="reminder">🔔 Reminder</option>
            <option value="recurrence">🔄 Recurrence</option>
          </select>

          <select
            v-model="selectedDeviceId"
            @change="onDeviceChange"
            class="filter-select"
          >
            <option value="">📱 Pilih Perangkat</option>
            <option v-for="d in devices" :key="d.id" :value="d.id">
              {{ d.name || d.id }} — {{ d.status }}
            </option>
          </select>

          <select v-model="sortBy" class="filter-select" title="Urutkan berdasarkan">
            <option value="schedule">📅 Jadwal Terdekat</option>
            <option value="name">🔤 Nama</option>
          </select>

          <select v-model="sortDir" class="filter-select sort-dir" title="Arah urutan">
            <option value="asc">↑ Naik</option>
            <option value="desc">↓ Turun</option>
          </select>

          <select
            v-model.number="pageSize"
            class="filter-select"
            title="Jumlah baris per halaman"
          >
            <option :value="10">10 baris</option>
            <option :value="25">25 baris</option>
            <option :value="50">50 baris</option>
          </select>
        </div>

        <button class="btn-reload" @click="load" :disabled="loading">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            :class="{ spinning: loading }"
          >
            <path
              d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
            />
          </svg>

          {{ loading ? "Memuat..." : "Muat Ulang" }}
        </button>
      </div>
    </div>

    <!-- Table View -->
    <div class="table-container">
      <div class="table-wrapper">
        <!-- GROUP VIEW -->
        <table class="schedules-table" v-if="!loading && visibleGroups.length > 0">
          <thead>
            <tr>
              <th class="col-expand"></th>
              <th class="col-name">Nama Jadwal</th>
              <th class="col-schedule">Waktu Jadwal</th>
              <th class="col-status">Status</th>
              <th class="col-recipients">Penerima</th>
              <th class="col-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in visibleGroups" :key="g.name" class="schedule-row">
              <td class="col-expand">
                <button
                  class="btn-expand"
                  @click="openDetailModal(g)"
                  title="Lihat detail"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <!-- batang i (dipendekkan) -->
                    <line x1="12" y1="11.5" x2="12" y2="15" />
                    <!-- titik i (kecil & pas) -->
                    <circle cx="12" cy="8.5" r="0.7" />
                  </svg>
                </button>
              </td>
              <td class="col-name">
                <div class="name-cell">
                  <div class="name-text">{{ displayName(g) }}</div>
                  <div class="name-meta">{{ g.broadcastsCount }} jadwal</div>
                </div>
              </td>
              <td class="col-schedule">
                <div class="schedule-cell">
                  {{ fmtWithDay(selectedOf(g)?.schedule) }}
                </div>
              </td>
              <td class="col-status">
                <span class="status-badge" :class="badgeClass(selectedOf(g))">
                  <span class="badge-dot"></span>
                  {{ badgeText(selectedOf(g)) }}
                </span>
              </td>
              <td class="col-recipients">
                <div class="recipients-summary">
                  {{ getRecipientsSummary(selectedOf(g)) }}
                </div>
              </td>
              <td class="col-actions">
                <div class="action-buttons">
                  <button
                    v-if="canDelete(selectedOf(g))"
                    class="btn-action btn-delete-action"
                    @click="openDeleteDialog(g.name)"
                    title="Hapus jadwal"
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
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && visibleGroups.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2V6M8 2V6M3 10H21" />
        </svg>
        <h3>Tidak Ada Jadwal</h3>
        <p>Belum ada jadwal broadcast yang ditemukan</p>
      </div>
    </div>

    <div class="pagination" v-if="activeMeta.totalPages > 1">
      <button class="btn-page" :disabled="page <= 1 || loading" @click="goPrev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Sebelumnya
      </button>
      <div class="page-info">
        <span class="current-page">{{ page }}</span>
        <span class="page-separator">/</span>
        <span class="total-pages">{{ activeMeta.totalPages }}</span>
      </div>
      <button class="btn-page" :disabled="!activeMeta.hasMore || loading" @click="goNext">
        Selanjutnya
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <!-- Detail Modal Popup -->
    <div
      v-if="showDetailModal && selectedGroup"
      class="modal-overlay"
      @click="closeDetailModal"
    >
      <div class="detail-modal" @click.stop>
        <div class="detail-modal-header">
          <div class="detail-modal-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div>
              <h3>{{ displayName(selectedGroup) }}</h3>
              <p class="detail-subtitle">Detail Jadwal Broadcast</p>
            </div>
          </div>
          <button class="btn-close-modal" @click="closeDetailModal" title="Tutup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="detail-modal-body">
          <div class="detail-section">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2V6M8 2V6M3 10H21" />
              </svg>
              Pilih Jadwal
            </label>
            <select v-model="selections[selectedGroup.name]" class="schedule-select">
              <option v-for="b in selectedGroup.broadcasts" :key="b.id" :value="b.id">
                {{ fmtWithDay(b.schedule) }} — {{ statusShort(b) }}
              </option>
            </select>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Waktu Jadwal
              </label>
              <div class="info-value">
                {{ fmtWithDay(selectedOf(selectedGroup)?.schedule) }}
              </div>
            </div>

            <div class="info-item">
              <label class="info-label">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                Status
              </label>
              <div class="status-toggle-wrapper">
                <span class="status-badge" :class="badgeClass(selectedOf(selectedGroup))">
                  <span class="badge-dot"></span>
                  {{ badgeText(selectedOf(selectedGroup)) }}
                </span>
                <button
                  v-if="!selectedOf(selectedGroup)?.isSent"
                  class="btn-toggle-status"
                  :class="{ active: selectedOf(selectedGroup)?.status !== false }"
                  @click="toggleBroadcastStatus(selectedOf(selectedGroup))"
                  :disabled="togglingStatus"
                  :title="
                    selectedOf(selectedGroup)?.status !== false
                      ? 'Nonaktifkan jadwal ini'
                      : 'Aktifkan jadwal ini'
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="8" width="18" height="8" rx="4" />
                    <circle
                      :cx="selectedOf(selectedGroup)?.status !== false ? '15' : '9'"
                      cy="12"
                      r="3"
                    />
                  </svg>
                  {{ selectedOf(selectedGroup)?.status !== false ? "Aktif" : "Nonaktif" }}
                </button>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="selectedOf(selectedGroup)?.message">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Pesan
            </label>
            <div class="message-preview">{{ selectedOf(selectedGroup).message }}</div>
          </div>

          <div class="detail-section" v-if="selectedOf(selectedGroup)?.mediaPath">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              Media
            </label>
            <div class="media-preview">
              <a
                :href="mediaUrl(selectedOf(selectedGroup).mediaPath)"
                target="_blank"
                rel="noopener"
                class="media-link"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Lihat Media
              </a>
              <img
                v-if="isImagePath(selectedOf(selectedGroup).mediaPath)"
                :src="mediaUrl(selectedOf(selectedGroup).mediaPath)"
                alt="media"
                class="media-thumb"
              />
            </div>
          </div>

          <div class="detail-section">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Penerima ({{ getRecipientCount(selectedOf(selectedGroup)) }})
            </label>
            <div class="recipients-grid">
              <span
                v-for="lbl in modalGroupRecipients"
                :key="'g-' + lbl"
                class="recipient-chip group-chip"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {{ lbl }}
              </span>
              <span
                v-for="lbl in modalLabelRecipients"
                :key="'l-' + lbl"
                class="recipient-chip label-chip"
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
                {{ lbl }}
              </span>
              <span
                v-for="num in modalPhoneRecipients"
                :key="'p-' + num"
                class="recipient-chip phone-chip"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  />
                </svg>
                {{ getPhoneDisplay(num) }}
              </span>

              <button
                v-if="modalHasMorePhones"
                type="button"
                class="btn-show-more"
                @click="toggleShowAllRecipients"
              >
                {{
                  showAllRecipients
                    ? "Tampilkan lebih sedikit"
                    : `Lihat semua nomor (${modalTotalPhones})`
                }}
              </button>
            </div>
          </div>

          <div
            class="detail-section"
            v-if="getFailedInfo(selectedOf(selectedGroup)).count > 0"
          >
            <label class="detail-label error-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Gagal Terkirim ({{ getFailedInfo(selectedOf(selectedGroup)).count }})
            </label>
            <div class="failed-container">
              <div
                v-if="getFailedInfo(selectedOf(selectedGroup)).groups.length > 0"
                class="failed-section"
              >
                <div class="recipients-grid">
                  <span
                    v-for="grp in getFailedInfo(selectedOf(selectedGroup)).groups"
                    :key="grp"
                    class="recipient-chip failed-chip"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {{ grp }}
                  </span>
                </div>
              </div>
              <div
                v-if="getFailedInfo(selectedOf(selectedGroup)).phones.length > 0"
                class="failed-section"
              >
                <div class="recipients-grid">
                  <span
                    v-for="phone in getFailedInfo(selectedOf(selectedGroup)).phones"
                    :key="phone"
                    class="recipient-chip failed-chip"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {{ phone }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dibaca (summary) for selected broadcast -->
          <div class="detail-section" v-if="selectedGroup && selectedOf(selectedGroup)">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Dibaca
            </label>

            <div v-if="outgoingLoading" class="outgoing-loading">Memuat...</div>
            <div v-else-if="outgoingError" class="outgoing-error">
              {{ outgoingError }}
            </div>
            <div v-else class="info-value">{{ outgoingTotalGroupReaders }} orang</div>
          </div>
        </div>

        <div class="detail-modal-footer">
          <button class="btn-close-footer" @click="closeDetailModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="showDeleteDialog"
      class="modal-overlay delete-modal-overlay"
      @click.self="closeDeleteDialog"
    >
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-icon">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        <div class="delete-modal-content">
          <h3>Hapus Jadwal Ini?</h3>
          <p class="delete-warning">
            Hapus jadwal "{{ scheduleToDelete }}" yang belum terkirim? Tindakan ini tidak
            dapat dibatalkan.
          </p>
        </div>

        <div class="delete-modal-actions">
          <button
            type="button"
            class="btn-keep"
            @click="closeDeleteDialog"
            :disabled="loading"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Batal
          </button>
          <button
            type="button"
            class="btn-delete-confirm"
            @click="confirmDelete"
            :disabled="loading"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18" />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
            </svg>
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>

    <p v-if="msg" class="success">{{ msg }}</p>
    <p v-if="err" class="error">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { deviceApi, userApi } from "../api/http.js";
import { useToast } from "../composables/useToast.js";
import { mediaUrl } from "../utils/mediaUrl.js";

const toast = useToast();

// --- pagination/sort state MUST be declared before any watch/load uses it ---
const page = ref(1);
const pageSize = ref(10);
const sortBy = ref("schedule");
const sortDir = ref("asc");

// ✅ groups = sumber utama untuk tabel (1 baris per nama)
const groups = ref([]);

// Perubahan: items sekarang berisi list group dari server (/broadcasts/groups)
const items = ref([]);
const loading = ref(false);
const err = ref("");
const msg = ref("");
const q = ref("");
const statusFilter = ref("upcoming");
const typeFilter = ref("all");

const groupsMap = ref({});
const loadGroupNames = async () => {
  try {
    const deviceId = localStorage.getItem("device_selected_id") || "";
    if (!deviceId) {
      return;
    }

    // 🆕 Primary: Load dari database (ambil juga yang inactive supaya nama grup tetap ada saat WA offline)
    try {
      const { data } = await userApi.get(`/whatsapp-groups/device/${deviceId}/active`, {
        params: { includeInactive: 1 },
      });
      const groups = Array.isArray(data?.data) ? data.data : [];

      const map = {};
      for (const g of groups) {
        const groupJid = g.id || g.groupId || "";
        const groupName = g.name || g.subject || "Tanpa Nama";

        if (groupJid) {
          map[groupJid] = groupName;
          if (!groupJid.includes("@")) {
            map[`${groupJid}@g.us`] = groupName;
          }
          const idOnly = groupJid.split("@")[0];
          if (idOnly && idOnly !== groupJid) {
            map[idOnly] = groupName;
          }
        }
      }

      groupsMap.value = map;
      return; // Success, exit early
    } catch {
      // Primary method failed, try fallback
    }

    // Fallback 1: Try from WhatsApp API (requires device open)
    try {
      let res;
      try {
        res = await deviceApi.get("/messages/get-groups/detail");
      } catch {
        res = await deviceApi.get("/messages/get-groups");
      }
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data?.results || res.data?.data || [];
      const map = {};
      for (const g of raw) {
        const id = (g.id || g.jid || "").toString();
        const full = id.includes("@") ? id : `${id}@g.us`;
        const name = g.subject || g.name || g.title || g.id || "Tanpa Nama";
        map[full] = name;
      }
      groupsMap.value = map;
      return; // Success, exit early
    } catch {
      // Fallback also failed, use last resort
    }

    // Fallback 2: Extract from recipients in loaded broadcasts
    const map = {};
    for (const b of items.value) {
      const recipients = Array.isArray(b.recipients) ? b.recipients : [];
      for (const r of recipients) {
        const str = String(r);
        if (str.includes("@g.us")) {
          const idOnly = str.split("@")[0];
          // Simpan dengan format yang lebih user-friendly
          if (!map[str]) {
            map[str] = `Group ${idOnly.substring(0, 8)}`;
          }
          if (!map[idOnly]) {
            map[idOnly] = `Group ${idOnly.substring(0, 8)}`;
          }
        }
      }
    }
    groupsMap.value = map;
  } catch {
    // All methods failed, use empty map
    groupsMap.value = {};
  }
};

const contacts = ref([]);
const loadingContacts = ref(false);
const loadContacts = async () => {
  try {
    loadingContacts.value = true;
    const deviceId = localStorage.getItem("device_selected_id") || "";
    const allContacts = [];
    let page = 1;
    let hasMore = true;

    // Loop pagination untuk load semua kontak
    while (hasMore) {
      const { data } = await userApi.get("/contacts", {
        params: {
          ...(deviceId ? { deviceId } : {}),
          page,
          pageSize: 200,
        },
      });

      // Backend mengembalikan { data: contacts[], metadata: {...} }
      const batch = data?.data || [];
      allContacts.push(...batch);

      // Cek apakah masih ada data lagi
      hasMore = data?.metadata?.hasMore ?? batch.length === 200;
      page++;

      // Safety limit: maksimal 50 halaman (10.000 kontak)
      if (page > 50) break;
    }

    contacts.value = allContacts;
  } catch (_) {
    contacts.value = [];
  } finally {
    loadingContacts.value = false;
  }
};

const labelToPhones = computed(() => {
  const map = {};
  for (const c of contacts.value || []) {
    const phone = String(c.phone || "").trim();
    if (!phone) continue;
    const cLabels = Array.isArray(c.ContactLabel) ? c.ContactLabel : [];
    for (const cl of cLabels) {
      const name = cl?.label?.name;
      if (!name || String(name).startsWith("device_")) continue;
      if (!map[name]) map[name] = new Set();
      map[name].add(phone);
    }
  }
  return map;
});

// Map nomor telepon ke nama kontak
const phoneToContactMap = computed(() => {
  const map = {};
  for (const c of contacts.value || []) {
    const phone = String(c.phone || "").trim();
    if (!phone) continue;

    // Gabungkan firstName dan lastName untuk nama lengkap
    const firstName = String(c.firstName || "").trim();
    const lastName = String(c.lastName || "").trim();
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    const displayName = fullName || phone;

    // Normalisasi nomor untuk pencocokan yang lebih baik
    const normalized = phone.replace(/@s\.whatsapp\.net$/i, "").replace(/\D/g, "");

    // Simpan dengan berbagai format untuk matching yang lebih baik
    map[phone] = displayName;
    map[normalized] = displayName;
    map[`${phone}@s.whatsapp.net`] = displayName;
    map[`${normalized}@s.whatsapp.net`] = displayName;

    // Tambahkan format dengan +62 jika dimulai dengan 62
    if (normalized.startsWith("62")) {
      map[`+${normalized}`] = displayName;
    }
  }
  return map;
});

// Helper: strict group detection for recipients in Schedules
// NOTE: Previously we treated any long numeric id as group, which caused phone numbers like 6282... to be counted as group.
const isGroupJid = (val) => {
  const s = String(val || "").trim();
  if (!s) return false;
  if (s.includes("@g.us")) return true;
  // legacy heuristic: some stored groups may appear like "12345-67890" without suffix
  if (!s.includes("@") && s.includes("-")) return true;
  // if we already have a mapping for it, treat as group
  if (groupsMap.value && (groupsMap.value[s] || groupsMap.value[`${s}@g.us`]))
    return true;
  return false;
};

// Fungsi untuk mendapatkan display name dari nomor (nama kontak atau nomor)
const getPhoneDisplay = (phoneNum) => {
  if (!phoneNum) return "";

  const phoneStr = String(phoneNum).trim();

  // Coba cari langsung
  if (phoneToContactMap.value[phoneStr]) {
    return phoneToContactMap.value[phoneStr];
  }

  // Coba dengan normalisasi
  const normalized = phoneStr.replace(/@s\.whatsapp\.net$/i, "").replace(/\D/g, "");
  if (phoneToContactMap.value[normalized]) {
    return phoneToContactMap.value[normalized];
  }

  // Coba cari dengan suffix @s.whatsapp.net
  if (phoneToContactMap.value[`${phoneStr}@s.whatsapp.net`]) {
    return phoneToContactMap.value[`${phoneStr}@s.whatsapp.net`];
  }

  if (phoneToContactMap.value[`${normalized}@s.whatsapp.net`]) {
    return phoneToContactMap.value[`${normalized}@s.whatsapp.net`];
  }

  // Jika tidak ditemukan di kontak, tampilkan nomor yang sudah dinormalisasi
  return normalizeNumber(phoneStr);
};

const selections = ref({});

// --- PERF NOTES ---
// For very large datasets (10k-100k+ broadcasts/contacts), avoid:
// - mutating reactive state inside computed
// - repeated expensive scans from template (find/sort/recipients expansion)
// The changes below keep UI responsive by caching and keeping computed pure.

const pickDefault = (arr) => {
  const upcoming = arr.find(
    (b) => !b.isSent && b.status !== false && new Date(b.schedule).getTime() > Date.now()
  );
  return upcoming?.id || arr[arr.length - 1]?.id;
};

const grouped = computed(() => {
  // groups sudah terfilter oleh server, tapi tetap apply filter q secara ringan (jaga-jaga)
  const qq = q.value.toLowerCase();
  return (groups.value || []).filter((g) =>
    String(g.name || "")
      .toLowerCase()
      .includes(qq)
  );
});

// ✅ FIX: Gunakan sample broadcast (pertama dari server) untuk filtering tabel
// Sample ini adalah broadcast yang sesuai dengan filter status dari server
const getOriginalSample = (g) => {
  if (!g) return null;
  return g._originalSample || null; // Sample pertama adalah yang dari server (sesuai filter)
};

const matchesStatus = (g) => {
  // ✅ FIX: Gunakan original sample untuk filtering, bukan selected broadcast
  const b = getOriginalSample(g);
  if (!b) return false;
  if (statusFilter.value === "all") return true;
  if (statusFilter.value === "inactive") return b.status === false;
  const isSent = !!b.isSent;
  const sched = new Date(b.schedule).getTime();
  if (statusFilter.value === "sent") return isSent;
  if (statusFilter.value === "upcoming")
    return !isSent && b.status !== false && sched > Date.now();
  return true;
};

const matchesType = (g) => {
  const b = getOriginalSample(g);
  if (!b) return false;
  if (typeFilter.value === "all") return true;
  return b.type === typeFilter.value;
};

const filtered = computed(() => grouped.value.filter(matchesStatus).filter(matchesType));

// --- Recipients caching ---
// In large datasets, expanding recipients (especially "all" / labels) is expensive.
// Cache per broadcast id and invalidate when contacts change.
const contactsVersion = ref(0);
watch(
  contacts,
  () => {
    contactsVersion.value += 1;
  },
  { deep: true }
);

const recipientsCache = ref(new Map());
const getRecipientsCached = (broadcast) => {
  if (!broadcast?.id) return { groups: [], labels: [], phones: [] };
  const key = `${broadcast.id}::${contactsVersion.value}`;
  const cached = recipientsCache.value.get(key);
  if (cached) return cached;

  const groups = groupRecipientLabels(broadcast);
  const labels = labelRecipientLabels(broadcast);
  const phones = phoneRecipients(broadcast);
  const value = { groups, labels, phones };
  recipientsCache.value.set(key, value);
  return value;
};

// Prevent unbounded growth when contactsVersion changes a lot
watch(contactsVersion, () => {
  recipientsCache.value = new Map();
});

const fmt = (d) => {
  try {
    const dd = new Date(d);
    if (isNaN(dd.getTime())) return "-";
    return dd.toLocaleString();
  } catch {
    return "-";
  }
};

const fmtWithDay = (d) => {
  try {
    const dd = new Date(d);
    if (isNaN(dd.getTime())) return "-";
    const hari = dd.toLocaleDateString("id-ID", { weekday: "long" });
    const tanggal = dd.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const jam = dd.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return `${hari}, ${tanggal} ${jam}`;
  } catch {
    return "-";
  }
};

const badgeClass = (b) => {
  if (b.status === false) return "warn";
  if (b.isSent) return "ok";
  const due = new Date(b.schedule).getTime();
  return due > Date.now() ? "info" : "warn";
};

const badgeText = (b) => {
  if (b.status === false) return "Nonaktif";
  if (b.isSent) return "Terkirim";
  const due = new Date(b.schedule).getTime();
  return due > Date.now() ? "Terjadwal" : "Tertunda";
};

const statusShort = (b) => {
  if (!b) return "-";
  if (b.status === false) return "Nonaktif";
  if (b.isSent) return "Terkirim";
  const due = new Date(b.schedule).getTime();
  return due > Date.now() ? "Terjadwal" : "Tertunda";
};

const groupRecipientLabels = (b) => {
  if (!b) return [];
  const arr = Array.isArray(b.recipients) ? b.recipients : [];

  return arr
    .filter((r) => typeof r === "string" || typeof r === "number")
    .filter(isGroupJid)
    .map((jidOrId) => {
      const raw = String(jidOrId).trim();
      const idOnly = raw.includes("@") ? raw.split("@")[0] : raw;
      const normalizedJid = raw.includes("@") ? raw : `${idOnly}@g.us`;

      if (groupsMap.value[normalizedJid]) return groupsMap.value[normalizedJid];
      if (groupsMap.value[idOnly]) return groupsMap.value[idOnly];

      for (const [key, value] of Object.entries(groupsMap.value)) {
        if (String(key).startsWith(idOnly)) return value;
      }

      return `Group ${idOnly.substring(0, 8)}`;
    });
};

const labelRecipientLabels = (b) => {
  if (!b) return [];
  const arr = Array.isArray(b.recipients) ? b.recipients : [];
  return arr
    .filter((r) => typeof r === "string" && r.toLowerCase().startsWith("label_"))
    .map((r) => String(r).slice("label_".length));
};

const canDelete = (b) => b && !b.isSent && b.status !== false;

// Dialog konfirmasi
const showDeleteDialog = ref(false);
const scheduleToDelete = ref(null);

const openDeleteDialog = (name) => {
  scheduleToDelete.value = name;
  showDeleteDialog.value = true;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  scheduleToDelete.value = null;
};

const confirmDelete = async () => {
  if (!scheduleToDelete.value) return;

  msg.value = "";
  err.value = "";

  try {
    const deviceId = localStorage.getItem("device_selected_id") || "";
    if (!deviceId) {
      toast.error("Silakan pilih device terlebih dahulu");
      closeDeleteDialog();
      return;
    }

    await userApi.delete("/broadcasts/by-name", {
      params: { deviceId },
      headers: { "x-device-id": deviceId },
      data: { name: scheduleToDelete.value },
    });

    toast.success(
      `Jadwal "${scheduleToDelete.value}" yang belum terkirim berhasil dihapus`
    );
    closeDeleteDialog();
    await load();
  } catch (e) {
    const errorMessage =
      e?.response?.data?.message || e?.message || "Gagal menghapus jadwal";
    toast.error(errorMessage);
    closeDeleteDialog();
  }
};

const summary = ref({ sent: 0, scheduled: 0, inactive: 0 });

const loadSummary = async () => {
  try {
    const deviceId = localStorage.getItem("device_selected_id") || "";
    if (!deviceId) {
      summary.value = { sent: 0, scheduled: 0, inactive: 0 };
      return;
    }
    const { data } = await userApi.get("/broadcasts/summary", { params: { deviceId } });
    summary.value = {
      sent: Number(data?.sent || 0),
      scheduled: Number(data?.scheduled || 0),
      inactive: Number(data?.inactive || 0),
    };
  } catch {
    summary.value = { sent: 0, scheduled: 0, inactive: 0 };
  }
};

// debounce query to reduce API calls while typing
let qTimer;
watch(q, () => {
  clearTimeout(qTimer);
  qTimer = setTimeout(() => {
    page.value = 1;
    load();
  }, 250);
});

watch([statusFilter, typeFilter, sortBy, sortDir, pageSize], async () => {
  page.value = 1;
  await load();
});

const load = async () => {
  loading.value = true;
  err.value = "";

  try {
    const deviceId = localStorage.getItem("device_selected_id") || "";

    if (!deviceId) {
      toast.error("Silakan pilih device terlebih dahulu");
      items.value = [];
      groups.value = [];
      serverMeta.value = {
        total: 0,
        page: 1,
        pageSize: pageSize.value,
        totalPages: 1,
        hasMore: false,
      };
      return;
    }

    // 1) ambil groups per name dari backend baru
    const params = {
      deviceId,
      page: page.value,
      pageSize: pageSize.value,
      q: q.value || "",
      status: statusFilter.value,
      type: typeFilter.value,
      sortBy: sortBy.value,
      sortDir: sortDir.value,
    };

    const { data } = await userApi.get("/broadcasts/groups", { params });

    const list = Array.isArray(data?.data) ? data.data : [];
    serverMeta.value = data?.meta || null;

    // Konversi group row -> bentuk yg dipakai UI
    // broadcasts: isi awal 1 sample broadcast (untuk status/schedule/recipients summary).
    groups.value = list.map((row) => {
      const sample = {
        id: row.sampleId,
        name: row.name,
        schedule: row.sampleSchedule || row.nextSchedule,
        message: row.sampleMessage,
        mediaPath: row.sampleMediaPath,
        recipients: Array.isArray(row.sampleRecipients) ? row.sampleRecipients : [],
        status: row.sampleStatus,
        isSent: row.sampleIsSent,
        sentCount: row.sampleSentCount || 0,
        failedCount: row.sampleFailedCount || 0,
        lastError: row.sampleLastError || null,
        type: row.sampleType || row.type || "broadcast", // ✅ Tambahkan type untuk filtering
      };

      return {
        name: row.name,
        broadcastsCount: row.broadcastsCount,
        nextSchedule: row.nextSchedule,
        broadcasts: [sample],
        // ✅ FIX: Simpan original sample terpisah agar tidak terpengaruh hydration modal
        _originalSample: sample,
      };
    });

    items.value = list;

    await loadGroupNames();
    await loadSummary();
  } catch (e) {
    const errorMsg = e?.response?.data?.message || e?.message || "Gagal memuat jadwal";
    toast.error(errorMsg);
    items.value = [];
    groups.value = [];
    serverMeta.value = null;
  } finally {
    loading.value = false;
  }
};

const serverMeta = ref(null);
const meta = computed(() => {
  if (serverMeta.value) {
    return {
      totalGroups: Number(serverMeta.value.total || 0),
      currentPage: Number(serverMeta.value.page || 1),
      totalPages: Number(serverMeta.value.totalPages || 1),
      hasMore: !!serverMeta.value.hasMore,
    };
  }
  // fallback safety
  return {
    totalGroups: 0,
    currentPage: page.value,
    totalPages: 1,
    hasMore: false,
  };
});

const activeMeta = computed(() => meta.value);

const goNext = () => {
  if (activeMeta.value.hasMore) {
    page.value += 1;
    load();
  }
};
const goPrev = () => {
  if (page.value > 1) {
    page.value -= 1;
    load();
  }
};

const sortedGroups = computed(() => {
  const arr = filtered.value.slice();
  if (sortBy.value === "name") {
    arr.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  } else {
    arr.sort((a, b) => {
      const sa = new Date(selectedOf(a)?.schedule || 0).getTime();
      const sb = new Date(selectedOf(b)?.schedule || 0).getTime();
      return sa - sb;
    });
  }
  if (sortDir.value === "desc") arr.reverse();
  return arr;
});

// Karena pagination sudah dari server, tampilkan apa adanya.
const visibleGroups = computed(() => sortedGroups.value);

// --- selections / selectedOf ---
watch(
  grouped,
  (gs) => {
    const next = { ...selections.value };
    for (const g of gs || []) {
      if (!next[g.name]) next[g.name] = pickDefault(g.broadcasts || []);
    }
    selections.value = next;
  },
  { immediate: true }
);

const selectedBroadcastByGroupName = computed(() => {
  const map = {};
  for (const g of grouped.value) {
    const selId = selections.value[g.name];
    const arr = Array.isArray(g.broadcasts) ? g.broadcasts : [];
    map[g.name] = arr.find((b) => b.id === selId) || arr[arr.length - 1] || null;
  }
  return map;
});

const selectedOf = (g) => {
  if (!g) return null;
  return (
    selectedBroadcastByGroupName.value[g.name] ||
    g.broadcasts?.[g.broadcasts.length - 1] ||
    null
  );
};

const displayName = (g) => {
  const n = g?.name || "";
  return n || "Tanpa Nama";
};

const phoneRecipients = (b) => {
  if (!b) return [];
  const arr = Array.isArray(b.recipients) ? b.recipients : [];

  const set = new Set(
    arr
      .map((r) => String(r).trim())
      // exclude groups strictly
      .filter((r) => !isGroupJid(r))
      .filter((r) => !r.toLowerCase().startsWith("label"))
      .filter((r) => r.length > 0)
  );

  for (const r of arr) {
    const s = String(r).toLowerCase();
    if (s.startsWith("label_")) {
      const labelName = String(r).slice("label_".length);
      const phones = labelToPhones.value[labelName];
      if (phones) {
        for (const p of phones) set.add(String(p));
      }
    }
  }

  return Array.from(set);
};

const normalizeNumber = (num) =>
  String(num)
    .trim()
    .replace(/@s\.whatsapp\.net$/i, "");

const devices = ref([]);
const selectedDeviceId = ref(localStorage.getItem("device_selected_id") || "");

const fetchDevices = async () => {
  try {
    const { data } = await userApi.get("/devices");
    devices.value = Array.isArray(data) ? data : [];
  } catch {
    devices.value = [];
  }
};

const ensureDeviceKeyValid = () => {
  const selId = localStorage.getItem("device_selected_id");
  if (!selId) return false;
  const ok = devices.value.some((d) => d.id === selId);
  if (!ok) {
    localStorage.removeItem("device_selected_id");
    localStorage.removeItem("device_selected_name");
    selectedDeviceId.value = "";
  }
  return ok;
};

const pickDefaultDevice = () => {
  if (!devices.value.length) return;
  const current = devices.value.find((d) => d.status === "open") || devices.value[0];
  if (current) {
    localStorage.setItem("device_selected_id", current.id);
    localStorage.setItem("device_selected_name", current.name || "");
    selectedDeviceId.value = current.id;
  }
};

const onDeviceChange = () => {
  const dev = devices.value.find((d) => d.id === selectedDeviceId.value);
  if (dev) {
    localStorage.setItem("device_selected_id", dev.id);
    localStorage.setItem("device_selected_name", dev.name || "");

    // Dispatch custom event untuk Dashboard.vue
    window.dispatchEvent(new Event("deviceChanged"));

    load();
    loadContacts();
    loadGroupNames(); // Reload group names when device changes
  }
};

const isImagePath = (p) => /\.(png|jpe?g|webp|gif)$/i.test(p || "");

// Fungsi untuk mendapatkan informasi pesan yang gagal terkirim
const getFailedInfo = (b) => {
  if (!b) return { count: 0, groups: [], phones: [] };

  const failedCount = b.failedCount || 0;

  if (failedCount === 0) {
    return { count: 0, groups: [], phones: [] };
  }

  const failedGroups = [];
  const failedPhones = [];

  // Ekstrak JID dari lastError jika ada
  const lastError = b.lastError || "";
  const jidMatches = lastError.match(/(\d+)@g\.us/g) || [];

  if (jidMatches.length > 0) {
    // Ada JID group di error message, ekstrak dan konversi ke nama
    for (const jidMatch of jidMatches) {
      const groupName = groupsMap.value[jidMatch];

      if (groupName) {
        if (!failedGroups.includes(groupName)) {
          failedGroups.push(groupName);
        }
      } else {
        // Coba cari dengan ID tanpa suffix
        const idOnly = jidMatch.split("@")[0];
        let found = false;

        for (const [key, value] of Object.entries(groupsMap.value)) {
          if (key.includes(idOnly)) {
            if (!failedGroups.includes(value)) {
              failedGroups.push(value);
            }
            found = true;
            break;
          }
        }

        // Jika tetap tidak ditemukan, tampilkan nama generic
        if (!found) {
          failedGroups.push(`Group (${idOnly.substring(0, 8)}...)`);
        }
      }
    }
  } else {
    // Tidak ada JID di error, gunakan logic lama
    const groupRecipients = (b.recipients || []).filter(
      (r) => typeof r === "string" && r.includes("@g.us")
    );

    const phoneRecipients = (b.recipients || []).filter(
      (r) =>
        typeof r === "string" &&
        !r.includes("@g.us") &&
        !r.toLowerCase().startsWith("label")
    );

    if (failedCount >= groupRecipients.length && groupRecipients.length > 0) {
      for (const jid of groupRecipients) {
        const normalizedJid = jid.includes("@") ? jid : `${jid}@g.us`;
        const groupName = groupsMap.value[normalizedJid];

        if (groupName) {
          failedGroups.push(groupName);
        } else {
          const idOnly = jid.split("@")[0];
          let found = false;
          for (const [key, value] of Object.entries(groupsMap.value)) {
            if (key.startsWith(idOnly)) {
              failedGroups.push(value);
              found = true;
              break;
            }
          }
          if (!found) {
            failedGroups.push(`Group (${idOnly.substring(0, 8)}...)`);
          }
        }
      }
    }

    const remainingFailed = failedCount - failedGroups.length;
    if (remainingFailed > 0 && phoneRecipients.length > 0) {
      const phonesToShow = Math.min(remainingFailed, 3);
      for (let i = 0; i < phonesToShow && i < phoneRecipients.length; i++) {
        const phone = normalizeNumber(phoneRecipients[i]);
        failedPhones.push(phone);
      }

      if (phoneRecipients.length > phonesToShow) {
        failedPhones.push(`+${phoneRecipients.length - phonesToShow} lainnya`);
      }
    }
  }

  return {
    count: failedCount,
    groups: failedGroups,
    phones: failedPhones,
  };
};

// Fungsi untuk memotong pesan error jika terlalu panjang
const truncateError = (error) => {
  if (!error) return "";
  const maxLength = 100;
  if (error.length <= maxLength) return error;
  return error.substring(0, maxLength) + "...";
};

const showDetailModal = ref(false);
const selectedGroup = ref(null);

const outgoingRows = ref([]);
const outgoingLoading = ref(false);
const outgoingError = ref("");

const isGroupRecipient = (to) => isGroupJid(to);

const outgoingTotalGroupReaders = computed(() => {
  const b = selectedGroup.value ? selectedOf(selectedGroup.value) : null;

  // ✅ FIX: Jangan hitung pembaca jika broadcast belum terkirim
  if (!b || !b.isSent) {
    return 0;
  }

  const { groups, labels, phones } = getRecipientsCached(b);

  // ✅ FIX: Untuk single phone recipient, hitung berdasarkan status message
  if (phones.length === 1 && groups.length === 0 && labels.length === 0) {
    const anyRead = (outgoingRows.value || []).some((row) => {
      const s = String(row?.status || "").toLowerCase();
      return s === "read" || s === "played";
    });
    return anyRead ? 1 : 0;
  }

  // ✅ FIX: Untuk group recipients, HANYA hitung JID yang benar-benar ada di readBy
  const readers = new Set();
  for (const row of outgoingRows.value || []) {
    // Pastikan ini pesan ke group
    if (!isGroupRecipient(row?.to)) continue;

    const rb = row?.readBy;
    // ✅ CRITICAL: Hanya proses jika readBy adalah array dengan isi
    if (!Array.isArray(rb) || rb.length === 0) continue;

    // ✅ CRITICAL: Hanya tambahkan JID yang valid
    for (const jid of rb) {
      const jidStr = String(jid || "").trim();
      if (jidStr) {
        readers.add(jidStr);
      }
    }
  }

  return readers.size;
});

const loadOutgoing = async (broadcastId) => {
  if (!broadcastId) return;

  outgoingLoading.value = true;
  outgoingError.value = "";
  outgoingRows.value = [];

  try {
    const { data } = await userApi.get(`/broadcasts/${broadcastId}/outgoing`);
    outgoingRows.value = Array.isArray(data?.outgoingBroadcasts)
      ? data.outgoingBroadcasts
      : [];
  } catch (e) {
    outgoingError.value =
      e?.response?.data?.message || e?.message || "Gagal memuat data dibaca";
  } finally {
    outgoingLoading.value = false;
  }
};

const loadBroadcastsByName = async (name) => {
  const deviceId = localStorage.getItem("device_selected_id") || "";
  if (!deviceId || !name) return [];

  // Ambil cukup besar supaya mencakup semua jadwal untuk name ini.
  const params = {
    deviceId,
    page: 1,
    pageSize: 200,
    q: name,
    status: "all",
    sortBy: "schedule",
    sortDir: "asc",
  };

  const { data } = await userApi.get("/broadcasts", { params });
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  // Filter strict by exact name (karena q adalah contains)
  return list
    .filter((b) => String(b?.name || "") === String(name))
    .map((b) => ({
      id: b.id,
      name: b.name,
      schedule: b.schedule,
      message: b.message,
      mediaPath: b.mediaPath,
      recipients: Array.isArray(b.recipients) ? b.recipients : [],
      status: b.status,
      isSent: b.isSent,
      sentCount: b.sentCount || 0,
      failedCount: b.failedCount || 0,
      lastError: b.lastError || null,
    }));
};

const openDetailModal = async (group) => {
  // hydrate broadcasts list for this name
  try {
    const full = await loadBroadcastsByName(group?.name);
    if (Array.isArray(full) && full.length) {
      group.broadcasts = full;
      if (!selections.value[group.name]) selections.value[group.name] = pickDefault(full);
    }
  } catch {
    // ignore, keep sample
  }

  selectedGroup.value = group;
  showDetailModal.value = true;

  const selectedBroadcast = selectedOf(group);
  if (selectedBroadcast?.id) loadOutgoing(selectedBroadcast.id);
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedGroup.value = null;
  outgoingRows.value = [];
  outgoingError.value = "";
};

watch(
  () => selections.value?.[selectedGroup.value?.name],
  () => {
    if (!selectedGroup.value) return;
    const selectedBroadcast = selectedOf(selectedGroup.value);
    if (selectedBroadcast?.id) loadOutgoing(selectedBroadcast.id);
  }
);

const getRecipientsSummary = (b) => {
  if (!b) return "";
  const { groups, labels, phones } = getRecipientsCached(b);
  return `${groups.length} grup, ${labels.length} label, ${phones.length} nomor`;
};

const getRecipientCount = (b) => {
  if (!b) return 0;
  const { groups, labels, phones } = getRecipientsCached(b);
  return groups.length + labels.length + phones.length;
};

const togglingStatus = ref(false);

const toggleBroadcastStatus = async (broadcast) => {
  if (!broadcast || togglingStatus.value) return;

  togglingStatus.value = true;

  try {
    const newStatus = broadcast.status === false ? true : false;
    await userApi.patch(`/broadcasts/${broadcast.id}/status`, { status: newStatus });
    broadcast.status = newStatus;
    toast.success(
      `Jadwal "${broadcast.name}" berhasil di${newStatus ? "aktifkan" : "nonaktifkan"}`
    );
  } catch (e) {
    const errorMessage =
      e?.response?.data?.message || e?.message || "Gagal mengubah status jadwal";
    toast.error(errorMessage);
  } finally {
    togglingStatus.value = false;
  }
};

const showAllRecipients = ref(false);
const maxPhoneChips = 200;

const toggleShowAllRecipients = () => {
  showAllRecipients.value = !showAllRecipients.value;
};

watch(showDetailModal, (open) => {
  if (!open) showAllRecipients.value = false;
});

const selectedBroadcastForModal = computed(() => {
  return selectedGroup.value ? selectedOf(selectedGroup.value) : null;
});

const modalRecipients = computed(() => {
  const b = selectedBroadcastForModal.value;
  if (!b) return { groups: [], labels: [], phones: [] };
  return getRecipientsCached(b);
});

const modalGroupRecipients = computed(() => modalRecipients.value.groups);
const modalLabelRecipients = computed(() => modalRecipients.value.labels);

const modalTotalPhones = computed(() => modalRecipients.value.phones.length);
const modalHasMorePhones = computed(
  () => !showAllRecipients.value && modalRecipients.value.phones.length > maxPhoneChips
);

const modalPhoneRecipients = computed(() => {
  const phones = modalRecipients.value.phones;
  if (showAllRecipients.value) return phones;
  return phones.slice(0, maxPhoneChips);
});

onMounted(async () => {
  await fetchDevices();
  if (!ensureDeviceKeyValid()) pickDefaultDevice();
  await Promise.allSettled([load(), loadGroupNames(), loadContacts(), loadSummary()]);
});
</script>

<style scoped>
/* Base Styles - Konsisten dengan menu Broadcast */
.wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Page Header - Konsisten dengan Broadcast */
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
  stroke-width: 2.5;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.stat-card svg {
  width: 40px;
  height: 40px;
  color: #3b82f6;
  flex-shrink: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* Toolbar Card */
.toolbar-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #475569;
}

.filter-select:hover {
  border-color: #cbd5e1;
  background: #ffffff;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sort-dir {
  min-width: 100px;
}

.btn-reload {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-reload:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-reload:active:not(:disabled) {
  transform: translateY(0);
}

.btn-reload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reload svg {
  width: 18px;
  height: 18px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Table View */
.table-container {
  margin-bottom: 32px;
}

.table-wrapper {
  overflow-x: auto;
}

.schedules-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.schedules-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.schedules-table th {
  padding: 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
}

.schedules-table td {
  padding: 16px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.schedule-row {
  transition: background 0.2s ease;
}

.schedule-row:hover {
  background: #f8fafc;
}

.schedule-row:last-child td {
  border-bottom: none;
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-text {
  font-weight: 600;
  color: #1e293b;
}

.name-meta {
  font-size: 12px;
  color: #64748b;
}

.schedule-cell {
  font-weight: 500;
  color: #475569;
}

.recipients-summary {
  font-size: 13px;
  color: #64748b;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-badge.ok {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.status-badge.ok .badge-dot {
  background: #15803d;
}

.status-badge.info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-color: #93c5fd;
}

.status-badge.info .badge-dot {
  background: #1e40af;
}

.status-badge.warn {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-color: #fcd34d;
}

.status-badge.warn .badge-dot {
  background: #92400e;
}

.col-expand {
  width: 50px;
  text-align: center;
}

.col-name {
  min-width: 200px;
}

.col-schedule {
  min-width: 220px;
}

.col-status {
  width: 140px;
}

.col-recipients {
  min-width: 180px;
}

.col-actions {
  width: 80px;
  text-align: center;
}

.btn-expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-expand:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
  transform: scale(1.1);
}

.btn-expand svg {
  width: 18px;
  height: 18px;
  color: #3b82f6;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover {
  transform: scale(1.1);
}

.btn-delete-action {
  color: #dc2626;
}

.btn-delete-action:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #fca5a5;
}

.btn-action svg {
  width: 18px;
  height: 18px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  text-align: center;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #475569;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

/* Modal Popup */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

.detail-modal {
  background: #ffffff;
  border-radius: 20px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
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

.detail-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.detail-modal-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.detail-modal-title svg {
  width: 28px;
  height: 28px;
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-modal-title h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}

.detail-subtitle {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.btn-close-modal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 16px;
}

.btn-close-modal:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  transform: rotate(90deg);
}

.btn-close-modal svg {
  width: 18px;
  height: 18px;
  color: #dc2626;
}

.detail-modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.detail-label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
  flex-shrink: 0;
}

.error-label {
  color: #dc2626;
}

.error-label svg {
  color: #dc2626;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-label svg {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.schedule-select {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #334155;
}

.schedule-select:hover {
  border-color: #cbd5e1;
  background: #ffffff;
}

.schedule-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-preview {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  word-break: break-word;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

.media-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  text-decoration: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  align-self: flex-start;
  border: 1.5px solid #cbd5e1;
}

.media-link:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.media-link svg {
  width: 16px;
  height: 16px;
}

.media-thumb {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recipients-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recipient-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.2s ease;
}

.recipient-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recipient-chip svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.group-chip {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-color: #93c5fd;
}

.label-chip {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border-color: #a5b4fc;
}

.phone-chip {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.failed-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.failed-section {
  padding: 14px 16px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 10px;
}

.failed-chip {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

.detail-modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.btn-close-footer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-close-footer:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-close-footer svg {
  width: 16px;
  height: 16px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-page {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ffffff;
  color: #475569;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-page svg {
  width: 18px;
  height: 18px;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 10px;
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.current-page {
  font-size: 20px;
}

.page-separator {
  opacity: 0.7;
}

.total-pages {
  opacity: 0.9;
}

/* Messages */
.error,
.success {
  margin-top: 20px;
  padding: 14px 18px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  border: 1px solid;
}

.error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

.success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

/* Delete Modal - Sama dengan AdminSentHistory */
.delete-modal-overlay {
  animation: fadeIn 0.2s ease-out;
  z-index: 10002;
}

.delete-modal {
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 32px;
  text-align: center;
  animation: slideUp 0.3s ease-out;
  position: relative;
  z-index: 10003;
}

.delete-modal-icon {
  margin-bottom: 20px;
  animation: pulse 0.5s ease-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.icon-circle::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  opacity: 0.3;
  animation: ripple 1.5s infinite;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.icon-circle svg {
  width: 40px;
  height: 40px;
  color: #dc2626;
  position: relative;
  z-index: 1;
}

.delete-modal-content {
  padding: 0;
  text-align: center;
}

.delete-modal-content h3 {
  margin: 0 0 12px 0;
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

.delete-modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 0;
  background: transparent;
  border: none;
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
  transition: all 0.2s ease;
}

.btn-keep {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-keep:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-delete-confirm {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-delete-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
}

.btn-delete-confirm:disabled,
.btn-keep:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-keep svg,
.btn-delete-confirm svg {
  width: 18px;
  height: 18px;
}

/* Responsive for Delete Modal */
@media (max-width: 768px) {
  .delete-modal {
    padding: 24px;
    max-width: 90%;
  }

  .icon-circle {
    width: 72px;
    height: 72px;
  }

  .icon-circle svg {
    width: 36px;
    height: 36px;
  }

  .delete-modal-content h3 {
    font-size: 20px;
  }

  .delete-modal-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-keep,
  .btn-delete-confirm {
    width: 100%;
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

  .header-icon {
    width: 28px;
    height: 28px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
    min-width: unset;
  }

  .filter-group {
    width: 100%;
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .btn-reload {
    width: 100%;
    justify-content: center;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .btn-page {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .wrapper {
    padding: 0 12px;
  }

  .header-content h2 {
    font-size: 20px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-card svg {
    width: 32px;
    height: 32px;
  }

  .stat-value {
    font-size: 24px;
  }

  .toolbar-card {
    padding: 16px;
  }
}

.status-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-toggle-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle-status:hover:not(:disabled) {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-toggle-status:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-toggle-status svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.btn-toggle-status.active {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #86efac;
  color: #15803d;
}

.btn-toggle-status.active svg {
  color: #15803d;
}

.outgoing-loading,
.outgoing-error {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #475569;
  text-align: center;
}

.btn-show-more {
  margin-top: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-show-more:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
</style>
