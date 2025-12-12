<template>
  <div class="wrapper">
    <!-- Page Header -->
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
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
            <path d="M8 10h.01M12 10h.01M16 10h.01" stroke-linecap="round" />
          </svg>
          Riwayat Pesan Terkirim
        </h2>
        <p class="subtitle">
          Pantau status pengiriman pesan broadcast dan notifikasi Anda
        </p>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <div>
            <div class="stat-value">{{ meta.totalMessages || 0 }}</div>
            <div class="stat-label">Total Pesan</div>
          </div>
        </div>
        <div class="stat-card">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <div>
            <div class="stat-value">
              {{
                rows.filter(
                  (r) =>
                    String(r.status).toLowerCase().includes("delivery") ||
                    String(r.status).toLowerCase().includes("read")
                ).length
              }}
            </div>
            <div class="stat-label">Terkirim</div>
          </div>
        </div>
        <div class="stat-card">
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
          <div>
            <div class="stat-value">
              {{
                rows.filter(
                  (r) =>
                    String(r.status).toLowerCase().includes("fail") ||
                    String(r.status).toLowerCase().includes("error")
                ).length
              }}
            </div>
            <div class="stat-label">Gagal</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <section class="list-card">
      <div class="card-header-section">
        <h3>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Daftar Pesan
        </h3>
        <div class="header-actions">
          <button
            class="btn-action export"
            @click="downloadExport"
            :disabled="
              !phoneNumber && !contactName && !messageQuery && rows.length === 0
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export ZIP
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar-section">
        <div class="search-box">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            v-model="messageQuery"
            placeholder="Cari isi pesan..."
            @keyup.enter="load(1)"
          />
        </div>
        <div class="filter-group">
          <input
            v-model="phoneNumber"
            placeholder="Filter Nomor (628..)"
            class="filter-input"
            @keyup.enter="load(1)"
          />
          <input
            v-model="contactName"
            placeholder="Nama Kontak"
            class="filter-input"
            @keyup.enter="load(1)"
          />

          <button class="btn-filter" @click="load(1)">
            {{ loading ? "..." : "Cari" }}
          </button>

          <select
            v-model.number="pageSize"
            class="page-size-select"
            @change="load(1)"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="custom-table" v-if="!loading && rows.length > 0">
          <thead>
            <tr>
              <th class="col-expand"></th>
              <th class="col-time">Waktu</th>
              <th class="col-dest">Tujuan</th>
              <th class="col-msg">Pesan</th>
              <th class="col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td class="col-expand">
                <button
                  class="btn-expand"
                  @click="openDetailModal(r)"
                  title="Lihat detail"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>
              </td>
              <td class="col-time">
                <div class="time-text">{{ formatLocalTime(r.createdAt) }}</div>
              </td>
              <td class="col-dest">
                <div class="dest-info">
                  <span class="dest-name">{{
                    r.contact
                      ? r.contact.firstName + " " + (r.contact.lastName || "")
                      : "-"
                  }}</span>
                  <span class="dest-phone">{{
                    (r.to || "").replace("@s.whatsapp.net", "")
                  }}</span>
                </div>
              </td>
              <td class="col-msg">
                <div class="msg-content">
                  {{ truncateMessage(r.message) }}
                </div>
              </td>
              <td class="col-status">
                <span class="status-badge" :class="badgeClass(r.status)">
                  {{ statusLabel(r.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else-if="!loading && rows.length === 0" class="empty-state">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
            <path d="M8 10h.01M12 10h.01M16 10h.01" />
          </svg>
          <h3>Belum ada riwayat pesan</h3>
          <p>Pesan yang Anda kirim akan muncul di sini</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="meta.totalPages > 1" class="pagination">
        <div class="pagination-info">
          Halaman <strong>{{ page }}</strong> dari
          <strong>{{ meta.totalPages }}</strong>
        </div>
        <div class="pagination-controls">
          <button
            class="btn-page"
            :disabled="page <= 1 || loading"
            @click="load(page - 1)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Sebelumnya
          </button>
          <div class="page-indicator">
            {{ page }}
          </div>
          <button
            class="btn-page"
            :disabled="!meta.hasMore || loading"
            @click="load(page + 1)"
          >
            Berikutnya
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Detail Modal Popup -->
    <div
      v-if="showDetailModal"
      class="modal-overlay detail-modal-overlay"
      @click="closeDetailModal"
    >
      <div class="detail-modal" @click.stop>
        <div class="detail-modal-header">
          <div class="detail-modal-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              />
            </svg>
            <div>
              <h3>Detail Pesan Terkirim</h3>
              <p class="detail-subtitle">Informasi lengkap pesan</p>
            </div>
          </div>
          <button class="btn-close-modal" @click="closeDetailModal" title="Tutup">
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
        </div>

        <div class="detail-modal-body" v-if="selectedMessage">
          <!-- Contact Info -->
          <div class="detail-section">
            <label class="detail-label">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Informasi Kontak
            </label>
            <div class="info-grid">
              <div class="info-item">
                <label class="info-label">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Nama
                </label>
                <div class="info-value">
                  {{
                    selectedMessage.contact
                      ? selectedMessage.contact.firstName +
                        " " +
                        (selectedMessage.contact.lastName || "")
                      : "-"
                  }}
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
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    />
                  </svg>
                  Nomor Telepon
                </label>
                <div class="info-value phone-value">
                  {{ (selectedMessage.to || "").replace("@s.whatsapp.net", "") }}
                </div>
              </div>
            </div>
          </div>

          <!-- Message Content -->
          <div class="detail-section">
            <label class="detail-label">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                />
              </svg>
              Pesan
            </label>
            <div class="message-preview-full">{{ selectedMessage.message }}</div>
          </div>

          <!-- Status & Time Info -->
          <div class="detail-section">
            <label class="detail-label">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Informasi Status
            </label>
            <div class="info-grid">
              <div class="info-item">
                <label class="info-label">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Status
                </label>
                <span
                  class="status-badge"
                  :class="badgeClass(selectedMessage.status)"
                >
                  {{ statusLabel(selectedMessage.status) }}
                </span>
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
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Waktu Terkirim
                </label>
                <div class="info-value">
                  {{ formatLocalTime(selectedMessage.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Media (if exists) -->
          <div class="detail-section" v-if="selectedMessage.mediaPath">
            <label class="detail-label">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              Media
            </label>
            <div class="media-content">
              <a
                :href="mediaUrl(selectedMessage.mediaPath)"
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
                  <path
                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                  />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Lihat Media
              </a>
              <img
                v-if="isImagePath(selectedMessage.mediaPath)"
                :src="mediaUrl(selectedMessage.mediaPath)"
                alt="media"
                class="media-thumb"
              />
            </div>
          </div>
        </div>

        <div class="detail-modal-footer">
          <button class="btn-close-footer" @click="closeDetailModal">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { deviceApi } from "../api/http.js";
import { formatLocalTime } from "../utils/datetime.js";

const rows = ref([]);
const meta = ref({
  totalMessages: 0,
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
});
const page = ref(1);
const pageSize = ref(25);
const phoneNumber = ref("");
const contactName = ref("");
const messageQuery = ref("");
const loading = ref(false);

const showDetailModal = ref(false);
const selectedMessage = ref(null);

const openDetailModal = (message) => {
  selectedMessage.value = message;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedMessage.value = null;
};

const truncateMessage = (message, length = 50) => {
  if (!message) return "";
  if (message.length <= length) return message;
  return message.substring(0, length) + "...";
};

const mediaUrl = (p) => {
  if (!p) return "";
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
  const cleanPath = p.startsWith("/") ? p.slice(1) : p;
  return `${API_BASE}/${cleanPath}`;
};

const isImagePath = (p) => /\.(png|jpe?g|webp|gif)$/i.test(p || "");

const load = async (p = page.value) => {
  loading.value = true;
  try {
    page.value = p;
    const params = { page: page.value, pageSize: pageSize.value };
    if (phoneNumber.value) params.phoneNumber = phoneNumber.value;
    if (contactName.value) params.contactName = contactName.value;
    if (messageQuery.value) params.message = messageQuery.value;
    const { data } = await deviceApi.get("/messages/outgoing", { params });
    rows.value = data.data || [];
    meta.value = data.metadata || meta.value;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const downloadExport = async () => {
  try {
    const params = { phoneNumber: phoneNumber.value };
    const res = await deviceApi.get("/messages/export-zip", {
      params,
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${phoneNumber.value || "export"}.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert(
      (e && e.response && e.response.data && e.response.data.message) ||
        "Gagal export"
    );
  }
};

const badgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("fail") || s.includes("error")) return "warn";
  if (s === "read" || s === "played" || s === "delivery_ack") return "ok";
  if (s === "server_ack") return "info";
  if (s === "pending") return "info";
  return "info";
};

const statusLabel = (status) => {
  const s = String(status || "").toLowerCase();
  switch (s) {
    case "pending":
      return "🕐";
    case "server_ack":
      return "✔️";
    case "delivery_ack":
      return "✔️✔️";
    case "read":
      return "Dibaca";
    case "played":
      return "Diputar";
    case "error":
      return "Gagal";
    default:
      return status || "Pending";
  }
};

load(1);
</script>

<style scoped>
/* Base Styles */
.wrapper {
  max-width: 1400px;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

/* List Card */
.list-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

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

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action svg {
  width: 16px;
  height: 16px;
}

.btn-action.export {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #15803d;
  border-color: #86efac;
}

.btn-action.export:hover:not(:disabled) {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  transform: translateY(-1px);
}

/* Toolbar */
.toolbar-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
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

.filter-input,
.filter-select {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  background: #f8fafc;
  min-width: 120px;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
}

.btn-filter {
  padding: 10px 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-filter:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.page-size-select {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  background: #f8fafc;
  cursor: pointer;
}

/* Table */
.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.custom-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.custom-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.custom-table tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.custom-table tbody tr:last-child {
  border-bottom: none;
}

.custom-table tbody tr:hover {
  background: #f8fafc;
}

.custom-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #1e293b;
  vertical-align: top;
}

/* Columns */
.col-expand {
  width: 50px;
}
.col-time {
  width: 180px;
}
.col-dest {
  width: 250px;
}
.col-msg {
  width: 300px;
}
.col-status {
  width: 120px;
}

.btn-expand {
  background: none;
  border: none;
  cursor: pointer;
  color: #3b82f6;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-expand:hover {
  background: #eff6ff;
  transform: scale(1.1);
}

.btn-expand svg {
  width: 20px;
  height: 20px;
}

.time-text {
  color: #64748b;
  font-size: 13px;
}

.dest-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dest-name {
  font-weight: 600;
  color: #1e293b;
}

.dest-phone {
  font-size: 12px;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.msg-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #334155;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.ok {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.status-badge.info {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.status-badge.warn {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

/* Empty State */
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
  margin-bottom: 24px;
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
}

.empty-state p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  gap: 16px;
}

.pagination-info {
  color: #64748b;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-page {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ffffff;
  color: #475569;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-page svg {
  width: 16px;
  height: 16px;
}

.page-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.detail-modal {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.detail-modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.detail-modal-title {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.detail-modal-title svg {
  width: 32px;
  height: 32px;
  color: #3b82f6;
  padding: 6px;
  background: #eff6ff;
  border-radius: 10px;
}

.detail-modal-title h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.detail-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #f1f5f9;
  color: #ef4444;
}

.btn-close-modal svg {
  width: 20px;
  height: 20px;
}

.detail-modal-body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
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
}

.phone-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.message-preview-full {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  white-space: pre-wrap;
}

.media-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.media-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

.media-link:hover {
  text-decoration: underline;
}

.media-link svg {
  width: 16px;
  height: 16px;
}

.media-thumb {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid #e2e8f0;
}

.detail-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  background: #f8fafc;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.btn-close-footer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-footer:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #cbd5e1;
}

.btn-close-footer svg {
  width: 18px;
  height: 18px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* Responsive */
@media (max-width: 768px) {
  .wrapper {
    padding: 0 16px;
  }

  .header-content h2 {
    font-size: 24px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .toolbar-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
    min-width: unset;
  }

  .filter-group {
    flex-direction: column;
  }

  .filter-input,
  .filter-select,
  .btn-filter,
  .page-size-select {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: space-between;
  }
}
</style>