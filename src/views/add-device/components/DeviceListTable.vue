<template>
  <div class="card-header-section">
    <h3>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path
          d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
      Daftar Device ({{ filteredDevices.length }})
    </h3>

    <div class="header-actions">
      <button class="btn-reload" @click="$emit('reload')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
          />
        </svg>
        Muat Ulang
      </button>

      <button
        class="btn-add-device"
        @click="$emit('openAddDeviceModal')"
        v-if="!tutorReachedLimit"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Tambah Device
      </button>
    </div>
  </div>

  <div class="search-filter-section" v-if="devices.length">
    <div class="search-input-wrapper">
      <svg
        class="search-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        placeholder="Cari device berdasarkan nama, nomor, atau status..."
        class="search-input"
      />
      <button
        v-if="searchQuery"
        @click="$emit('update:searchQuery', '')"
        class="clear-search-btn"
        title="Hapus pencarian"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div class="search-result-info" v-if="searchQuery">
      <span v-if="filteredDevices.length > 0">
        Ditemukan <strong>{{ filteredDevices.length }}</strong> device dari
        <strong>{{ devices.length }}</strong> total
      </span>
      <span v-else class="no-results">
        Tidak ada device yang cocok dengan pencarian "{{ searchQuery }}"
      </span>
    </div>
  </div>

  <div class="table-wrapper" v-if="devices.length">
    <table class="devices-table">
      <thead>
        <tr>
          <th>Device</th>
          <th>Nomor WhatsApp</th>
          <th>Status</th>
          <th>Kontak & Grup</th>
          <th class="text-center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredDevices.length === 0 && searchQuery" class="no-results-row">
          <td colspan="5">
            <div class="no-results-message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h4>Tidak ada hasil</h4>
              <p>
                Tidak ditemukan device yang cocok dengan pencarian "<strong>{{
                  searchQuery
                }}</strong
                >"
              </p>
              <button class="btn-reset-search" @click="$emit('update:searchQuery', '')">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Pencarian
              </button>
            </div>
          </td>
        </tr>

        <tr
          v-for="d in paginatedDevices"
          :key="d.id"
          :class="{ 'row-connected': String(d.status).toLowerCase() === 'open' }"
        >
          <td data-label="Device">
            <div class="device-cell">
              <div class="device-icon-small" :class="statusClass(d.status)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
              </div>
              <div class="device-info-cell">
                <div class="device-name">{{ d.name }}</div>
              </div>
            </div>
          </td>

          <td data-label="Nomor WhatsApp">
            <span class="phone-number">{{ d.phone || "-" }}</span>
          </td>

          <td data-label="Status">
            <span class="status-badge" :class="statusClass(d.status)">
              <span class="status-dot"></span>
              {{ humanStatus(d.status) }}
            </span>
          </td>

          <td data-label="Kontak & Grup">
            <div class="features-cell">
              <template
                v-if="String(d.status).toLowerCase() === 'open' && deviceStats[d.id]"
              >
                <span class="feature-badge feature-contacts">
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
                  {{ deviceStats[d.id].contacts }} Kontak
                </span>
                <span class="feature-badge feature-groups">
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
                  {{ deviceStats[d.id].groups }} Grup
                </span>
              </template>
              <template v-else-if="String(d.status).toLowerCase() === 'open'">
                <span class="feature-badge feature-loading">
                  <svg
                    class="spin-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                    />
                  </svg>
                  Memuat...
                </span>
              </template>
              <template v-else>
                <span class="feature-badge disabled">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Belum terhubung
                </span>
              </template>
            </div>
          </td>

          <td data-label="Aksi" class="text-center">
            <button
              class="btn-delete-table"
              @click="$emit('deleteOne', d)"
              :disabled="deleting"
              title="Hapus Device"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination" v-if="totalPages > 1">
      <div class="pagination-info">
        Menampilkan
        <strong
          >{{ (currentPage - 1) * itemsPerPage + 1 }} -
          {{ Math.min(currentPage * itemsPerPage, filteredDevices.length) }}</strong
        >
        dari <strong>{{ filteredDevices.length }}</strong> device{{
          searchQuery ? " (terfilter)" : ""
        }}
      </div>
      <div class="pagination-controls">
        <button class="btn-page" :disabled="currentPage === 1" @click="$emit('prevPage')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Sebelumnya
        </button>
        <div class="page-indicator">
          <span class="current-page">{{ currentPage }}</span>
          <span class="page-separator">/</span>
          <span class="total-pages">{{ totalPages }}</span>
        </div>
        <button
          class="btn-page"
          :disabled="currentPage === totalPages"
          @click="$emit('nextPage')"
        >
          Berikutnya
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- 🆕 Loading placeholder to prevent empty-state flash on refresh -->
  <div v-else-if="loading" class="empty-state empty-state--loading" aria-busy="true">
    <div class="loader" />
    <h3>Memuat device…</h3>
    <p>Mohon tunggu sebentar</p>
  </div>

  <div v-else class="empty-state">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      width="64"
      height="64"
      aria-hidden="true"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
    <h3>Belum Ada Device</h3>
    <p>Buat device baru untuk mulai menggunakan fitur WhatsApp</p>
    <small>Satu device dapat terhubung ke satu nomor WhatsApp</small>
  </div>
</template>

<script setup>
defineProps({
  devices: { type: Array, default: () => [] },
  deviceStats: { type: Object, default: () => ({}) },
  deleting: { type: Boolean, default: false },

  isTutor: { type: Boolean, default: false },
  tutorReachedLimit: { type: Boolean, default: false },

  searchQuery: { type: String, default: "" },
  filteredDevices: { type: Array, default: () => [] },
  paginatedDevices: { type: Array, default: () => [] },

  itemsPerPage: { type: Number, default: 10 },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },

  // 🆕 whether the parent is currently loading devices
  loading: { type: Boolean, default: false },

  humanStatus: { type: Function, required: true },
  statusClass: { type: Function, required: true },
});

defineEmits([
  "reload",
  "openAddDeviceModal",
  "deleteOne",
  "nextPage",
  "prevPage",
  "update:searchQuery",
]);
</script>

<style scoped>
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
  gap: 12px;
  align-items: center;
}

.btn-reload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.btn-reload svg {
  width: 16px;
  height: 16px;
}

.btn-add-device {
  display: inline-flex;
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
}

.btn-add-device svg {
  width: 18px;
  height: 18px;
}

.search-filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 44px 12px 44px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #ffffff;
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  width: 28px;
  height: 28px;
  padding: 0;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.clear-search-btn svg {
  width: 14px;
  height: 14px;
  color: #64748b;
}

.search-result-info {
  font-size: 13px;
  color: #64748b;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.search-result-info .no-results {
  color: #dc2626;
  font-weight: 500;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
}

.devices-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.devices-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.devices-table thead th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.devices-table tbody td {
  padding: 16px 20px;
  color: #1e293b;
  vertical-align: middle;
}

.devices-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
}

.devices-table tbody tr.row-connected {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.device-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-icon-small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-icon-small svg {
  width: 20px;
  height: 20px;
}

.device-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.phone-number {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
}

.status-badge.is-open {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #065f46;
}

.status-badge.is-closed {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #991b1b;
}

.status-badge.is-pending {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.features-cell {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.feature-badge svg {
  width: 13px;
  height: 13px;
}

.feature-badge.feature-contacts {
  background: #dbeafe;
  border: 1px solid #93c5fd;
  color: #1e40af;
}

.feature-badge.feature-groups {
  background: #e9d5ff;
  border: 1px solid #c084fc;
  color: #6b21a8;
}

.feature-badge.feature-loading {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #64748b;
}

.feature-badge.disabled {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
}

.btn-delete-table {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: #fee2e2;
  color: #dc2626;
  border: 1.5px solid #fca5a5;
  border-radius: 8px;
  cursor: pointer;
}

.btn-delete-table svg {
  width: 18px;
  height: 18px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #f8fafc;
  border-top: 1.5px solid #e2e8f0;
  gap: 16px;
  flex-wrap: wrap;
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
}

.btn-page svg {
  width: 16px;
  height: 16px;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #2563eb;
  border-radius: 8px;
  color: #ffffff;
  font-weight: 700;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin: 20px 0;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.empty-state--loading {
  gap: 10px;
}

.loader {
  width: 44px;
  height: 44px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .btn-reload,
  .btn-add-device {
    width: 100%;
    justify-content: center;
  }

  .devices-table thead {
    display: none;
  }

  .devices-table,
  .devices-table tbody,
  .devices-table tr,
  .devices-table td {
    display: block;
  }

  .devices-table tbody tr {
    margin-bottom: 16px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    padding: 16px;
  }

  .devices-table tbody td {
    padding: 8px 0;
    border: none;
  }

  .devices-table tbody td::before {
    content: attr(data-label);
    display: block;
    font-weight: 600;
    color: #64748b;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .devices-table tbody td.text-center {
    text-align: left;
  }

  .btn-delete-table {
    width: 100%;
    height: 40px;
    margin-top: 8px;
  }

  .pagination-info {
    width: 100%;
    text-align: center;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
}
</style>
