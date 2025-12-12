<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none">
            <rect
              x="5"
              y="2"
              width="14"
              height="20"
              rx="2"
              ry="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <line
              x1="12"
              y1="18"
              x2="12.01"
              y2="18"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          Kelola Device WhatsApp
        </h2>
        <p class="subtitle">
          Kelola dan hubungkan perangkat WhatsApp untuk mengirim pesan
        </p>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <div>
            <div class="stat-value">{{ devices.length }}</div>
            <div class="stat-label">Total Device</div>
          </div>
        </div>
        <div class="stat-card stat-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <div class="stat-value">
              {{ devices.filter((d) => d.status === "open").length }}
            </div>
            <div class="stat-label">Terhubung</div>
          </div>
        </div>
        <div class="stat-card stat-warning">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12" y2="16" />
          </svg>

          <div>
            <div class="stat-value">
              {{ devices.filter((d) => d.status !== "open").length }}
            </div>
            <div class="stat-label">Belum Terhubung</div>
          </div>
        </div>
      </div>
    </div>

    <section class="pairing card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path
              d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
            />
            <path
              d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
            />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
          Pairing WhatsApp (QR Code)
        </h3>
      </div>
      <div class="toolbar">
        <div class="filters">
          <div class="field">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              Pilih Device
            </label>
            <select v-model="deviceId">
              <option value="" disabled>Pilih device</option>
              <option v-for="d in devices" :key="d.id" :value="String(d.id)">
                {{ d.name }} - {{ humanStatus(d.status) }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>&nbsp;</label>
            <div class="row-btns">
              <button
                v-if="selectedStatus !== 'open'"
                class="btn primary"
                @click="startPairing"
                :disabled="
                  !deviceId || pairingLoading || (isTutor && tutorHasConnectedDevice)
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {{ pairingLoading ? "Menunggu QR..." : "Mulai Pairing" }}
              </button>
              <button
                v-else-if="!isTutor"
                class="btn outline"
                @click="selectNextDisconnectedDevice"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                  />
                </svg>
                Pairing Device Lain
              </button>
              <button
                v-if="controller && selectedStatus !== 'open'"
                class="btn outline"
                @click="stopPairing"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
                Hentikan
              </button>
            </div>
          </div>
        </div>
      </div>
      <p class="hint">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12" y2="17" />
        </svg>
        Scan QR dari WhatsApp di ponsel Anda. Jika sudah terhubung, jangan lupa untuk
        di-refresh.
      </p>

      <!-- Success Connection Display -->
      <div v-if="selectedStatus === 'open'" class="connection-success">
        <div class="success-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div class="success-content">
          <h4>✅ WhatsApp Berhasil Terhubung!</h4>
          <p>
            Device <strong>{{ selectedDevice?.name }}</strong> sudah siap digunakan untuk
            mengirim pesan dan broadcast.
          </p>
          <div class="success-features">
            <div class="feature-item">
              <span class="feature-icon">💬</span>
              <span>Kirim Feedback</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📢</span>
              <span>Broadcast Massal</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">👥</span>
              <span>Sinkron Grup</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📱</span>
              <span>Reminder Otomatis</span>
            </div>
          </div>
          <div class="success-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span
              >1 Device = 1 Akun WhatsApp. Logout dari WhatsApp di ponsel Anda jika ingin
              disconnect.</span
            >
          </div>
        </div>
      </div>

      <!-- 🆕 CLEAN: Unified Status Bar (replaces 3 separate boxes) -->
      <template v-else>
        <!-- State 1: Connecting (Normal) -->
        <div
          v-if="pairingLoading && !apiError && !qr"
          class="status-bar status-bar-connecting"
        >
          <div class="status-spinner"></div>
          <span class="status-message">{{
            statusText || "Menghubungkan ke WhatsApp..."
          }}</span>
        </div>

        <!-- State 2: Error (Timeout/Expired) -->
        <div v-else-if="apiError" class="status-bar status-bar-error">
          <svg
            class="status-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="status-message">{{ apiError }}</span>
          <button
            v-if="!pairingLoading"
            @click="quickRetryPairing"
            class="status-retry-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Generate Ulang
          </button>
        </div>

        <!-- 🆕 Waiting for Disconnect -->
        <div v-if="waitingDisconnect" class="status-bar status-bar-waiting">
          <svg
            class="status-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span class="status-message"
            >Menunggu status terputus... (<strong>{{ disconnectCountdown }}s</strong
            >)</span
          >
        </div>

        <!-- 🆕 QR Code Display with Side-by-Side Layout (WhatsApp Web Style) -->
        <div v-if="qr && selectedStatus !== 'open'" class="qr-section">
          <h3 class="qr-main-title">Tautkan dengan WhatsApp</h3>
          <div class="qr-layout">
            <!-- Left: Instructions -->
            <div class="qr-instructions-side">
              <div class="instruction-item">
                <div class="instruction-number">1</div>
                <div class="instruction-content">
                  <span class="instruction-text"
                    >Buka <strong>WhatsApp</strong> di ponsel</span
                  >
                </div>
              </div>
              <div class="instruction-item">
                <div class="instruction-number">2</div>
                <div class="instruction-content">
                  <span class="instruction-text"
                    >Ketuk <strong>Menu</strong>
                    <span class="instruction-icon">⋮</span> atau <strong>Setelan</strong>
                    <span class="instruction-icon">⚙</span> dan pilih
                    <strong>Perangkat Tertaut</strong></span
                  >
                </div>
              </div>
              <div class="instruction-item">
                <div class="instruction-number">3</div>
                <div class="instruction-content">
                  <span class="instruction-text"
                    >Ketuk <strong>Tautkan Perangkat</strong></span
                  >
                </div>
              </div>
              <div class="instruction-item">
                <div class="instruction-number">4</div>
                <div class="instruction-content">
                  <span class="instruction-text"
                    >Arahkan ponsel ke layar ini untuk
                    <strong>memindai kode QR</strong></span
                  >
                </div>
              </div>

              <!-- Timer info at bottom -->
              <div
                v-if="!qrExpired"
                class="timer-info"
                :class="{ 'timer-warning': qrTimeLeft <= 10 }"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span v-if="qrTimeLeft > 10"
                  >Kode valid untuk <strong>{{ qrTimeLeft }}</strong> detik</span
                >
                <span v-else
                  >⚠️ Segera scan! <strong>{{ qrTimeLeft }}</strong> detik lagi</span
                >
              </div>
            </div>

            <!-- Right: QR Code with Reload Overlay -->
            <div class="qr-code-side">
              <div class="qr-box" :class="{ 'qr-expired': qrExpired }">
                <img :src="qr" alt="QR Code" @error="onQRImageError" />

                <!-- 🆕 Reload Overlay when expired (like WhatsApp Web) -->
                <div
                  v-if="qrExpired"
                  class="qr-expired-overlay"
                  @click="quickRetryPairing"
                >
                  <div class="reload-icon-circle">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <p class="reload-text">Klik untuk muat ulang kode QR</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ASCII QR fallback -->
        <div v-else-if="asciiQr && selectedStatus !== 'open'" class="qr-ascii">
          <h4>QR Code (Text Format)</h4>
          <pre>{{ asciiQr }}</pre>
        </div>

        <!-- Loading indicator (only when no QR yet) -->
        <div
          v-else-if="pairingLoading && !apiError && !qr && selectedStatus !== 'open'"
          class="loading-qr"
        >
          <div class="spinner-large"></div>
          <p>Menunggu QR Code dari server...</p>
          <small>Proses ini membutuhkan waktu beberapa detik</small>
        </div>
      </template>
    </section>

    <section class="list card">
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
          <button class="btn-reload" @click="fetchDevices(true)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
              />
            </svg>
            Muat Ulang
          </button>
          <button
            class="btn-add-device"
            @click="openAddDeviceModal"
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

      <!-- 🆕 Search Filter -->
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
            v-model="searchQuery"
            placeholder="Cari device berdasarkan nama, nomor, atau status..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
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
            <!-- 🆕 Show "no results" row when filter returns empty -->
            <tr v-if="filteredDevices.length === 0 && searchQuery" class="no-results-row">
              <td colspan="5">
                <div class="no-results-message">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
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
                  <button class="btn-reset-search" @click="searchQuery = ''">
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
              :class="{ 'row-connected': d.status === 'open' }"
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
                  <template v-if="d.status === 'open' && deviceStats[d.id]">
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
                  <template v-else-if="d.status === 'open'">
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
                        <line x1="12" y="8" x2="12" y2="12" />
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
                  @click="deleteOne(d)"
                  :disabled="deleting"
                  title="Hapus Device"
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
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
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
            <button class="btn-page" :disabled="currentPage === 1" @click="prevPage">
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
              @click="nextPage"
            >
              Berikutnya
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        <h3>Belum Ada Device</h3>
        <p>Buat device baru untuk mulai menggunakan fitur WhatsApp</p>
        <small>Satu device dapat terhubung ke satu nomor WhatsApp</small>
      </div>
    </section>

    <!-- 🆕 Add Device Modal -->
    <div v-if="showAddDeviceModal" class="modal-overlay" @click="closeAddDeviceModal">
      <div class="form-modal" @click.stop>
        <div class="modal-header">
          <h3>Tambah Device Baru</h3>
          <button class="btn-close" @click="closeAddDeviceModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleCreateDevice">
            <div class="form-grid-modal">
              <div class="form-group full">
                <label for="deviceName">
                  Nama Device <span class="required">*</span>
                </label>
                <input
                  id="deviceName"
                  v-model="name"
                  type="text"
                  placeholder="Contoh: Device Tutor"
                  required
                  autofocus
                />
                <small class="field-hint"
                  >Beri nama yang mudah dikenali untuk device WhatsApp Anda</small
                >
              </div>

              <div v-if="tutorReachedLimit" class="info-box">
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
                <span>Tutor hanya bisa memiliki 1 device.</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeAddDeviceModal">
                Batal
              </button>
              <button
                type="submit"
                class="btn-save"
                :disabled="loading || tutorReachedLimit || !name.trim()"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                {{ loading ? "Menyimpan..." : "Buat Device" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay delete-modal-overlay"
      @click="cancelDelete"
    >
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
            Tindakan ini tidak dapat dibatalkan. Device dan semua koneksi WhatsApp-nya
            akan dihapus secara permanen.
          </p>

          <div class="device-preview" v-if="deviceToDelete">
            <div class="preview-icon" :class="statusClass(deviceToDelete.status)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <div class="preview-info">
              <div class="preview-name">{{ deviceToDelete.name }}</div>
              <div class="preview-status">
                <span
                  class="status-dot"
                  :class="statusClass(deviceToDelete.status)"
                ></span>
                {{ humanStatus(deviceToDelete.status) }}
              </div>
            </div>
          </div>
        </div>

        <div class="delete-modal-actions">
          <button
            type="button"
            class="btn-keep"
            @click="cancelDelete"
            :disabled="deleting"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Batal
          </button>
          <button
            type="button"
            class="btn-delete-confirm"
            @click="confirmDelete"
            :disabled="deleting"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
              <path d="M10 11v6M14 11v6" />
            </svg>
            {{ deleting ? "Menghapus..." : "Ya, Hapus Device" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted, watch } from "vue";
import { userApi } from "../api/http.js";
import { useAuthStore } from "../stores/auth.js";
import QRCode from "qrcode";
import { useGroups } from "../composables/useGroups.js";
import { useToast } from "../composables/useToast.js";
import {
  listenToDeviceStatus,
  listenToGroupUpdates,
  listenToNewGroup,
} from "../api/socket.js";
import { cache } from "../utils/cache.js";
import { debounce } from "../utils/debounce.js";

const toast = useToast();
const auth = useAuthStore();
const devices = ref([]);
const name = ref("");
const loading = ref(false);
const deleting = ref(false);
const error = ref("");
const success = ref("");

// Delete confirmation modal state
const showDeleteModal = ref(false);
const deviceToDelete = ref(null);

// Pairing state
const deviceId = ref("");
const qr = ref("");
const asciiQr = ref("");
const statusText = ref("");
const pairingLoading = ref(false);
const apiError = ref("");
// 🆕 State untuk tracking waktu tunggu disconnect
const waitingDisconnect = ref(false);
const disconnectCountdown = ref(0);
// 🆕 Frontend Guard: Track last pairing attempt untuk prevent spam
const lastPairingAttempt = ref(0);
const isCleaningUp = ref(false);
const MIN_RETRY_INTERVAL = 2000; // 2 detik (realistis untuk production)
let controller = null;
let socketCleanupFunctions = [];
// 🆕 Interval untuk countdown
let disconnectInterval = null;

// 🆕 PHASE 1: QR Timer & Expiry Tracking
const qrGeneratedAt = ref(null);
const qrTimeLeft = ref(60);
const qrExpired = ref(false);
let qrTimerInterval = null;

// 🆕 PHASE 1: Computed properties untuk QR timer UI
const qrTimerPercent = computed(() => {
  return (qrTimeLeft.value / 60) * 100;
});

const qrTimerWarning = computed(() => {
  if (qrTimeLeft.value <= 10) return "warning";
  if (qrTimeLeft.value <= 30) return "caution";
  return "";
});

// 🆕 Flag untuk mendeteksi apakah user manual memilih device
let isManualSelection = false;

const CACHE_KEY = "devices_list";
const CACHE_TTL = 30; // 30 seconds

const isTutor = computed(() => auth.roleName === "cs");
const tutorReachedLimit = computed(() => isTutor.value && devices.value.length >= 1);
const tutorHasConnectedDevice = computed(
  () => isTutor.value && devices.value.some((d) => d.status === "open")
);

// Simplified group handling - groups are automatically synced when device connects
const { clearGroups } = useGroups();

// Pairing helpers
const selectedDevice = computed(() =>
  devices.value.find((d) => String(d.id) === String(deviceId.value))
);
const selectedStatus = computed(() => selectedDevice.value?.status || "");
// expose for template tests
// eslint-disable-next-line no-undef
defineExpose({ selectedStatus });

// 🆕 Add showInstructions state for collapsible
const showInstructions = ref(false);

// 🆕 Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);
const deviceStats = ref({}); // Store { deviceId: { contacts: 0, groups: 0 } }

// 🆕 Search/Filter state
const searchQuery = ref("");

// 🆕 Computed filtered devices based on search query
const filteredDevices = computed(() => {
  if (!searchQuery.value.trim()) {
    return devices.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return devices.value.filter((device) => {
    const nameMatch = device.name && device.name.toLowerCase().includes(query);
    const phoneMatch = device.phone && device.phone.includes(query);
    const statusMatch = humanStatus(device.status).toLowerCase().includes(query);

    return nameMatch || phoneMatch || statusMatch;
  });
});

// 🆕 Watch searchQuery to reset pagination when filtering
watch(searchQuery, () => {
  currentPage.value = 1;
});

// 🆕 Computed pagination based on filtered devices
const totalPages = computed(() =>
  Math.ceil(filteredDevices.value.length / itemsPerPage.value)
);
const paginatedDevices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredDevices.value.slice(start, end);
});

// 🆕 Pagination controls
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// 🆕 Computed untuk visible pages (max 5 pages visible)
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];

  if (total <= 5) {
    // Show all pages if total <= 5
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Show current, prev, next and first/last
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (current >= total - 2) {
      pages.push(total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(current - 2, current - 1, current, current + 1, current + 2);
    }
  }

  return pages;
});

// 🆕 Watch devices untuk reset pagination saat device count berubah
watch(
  () => devices.value.length,
  () => {
    // Reset to page 1 if current page is out of bounds
    if (currentPage.value > totalPages.value) {
      currentPage.value = 1;
    }
  }
);

// 🆕 Function untuk fetch stats kontak & grup per device
const fetchDeviceStats = async (deviceId) => {
  try {
    console.log(`[Stats] Fetching stats for device ${deviceId}...`);

    // Fetch contacts count
    const contactsRes = await userApi.get(`/contacts?deviceId=${deviceId}`);
    const contactsCount = contactsRes.data?.length || 0;

    // Fetch groups count
    const groupsRes = await userApi.get(`/groups?deviceId=${deviceId}`);
    const groupsCount = groupsRes.data?.length || 0;

    deviceStats.value[deviceId] = {
      contacts: contactsCount,
      groups: groupsCount,
    };

    console.log(
      `[Stats] Device ${deviceId}: ${contactsCount} kontak, ${groupsCount} grup`
    );
  } catch (e) {
    console.error(`[Stats] Error fetching stats for device ${deviceId}:`, e);
    deviceStats.value[deviceId] = {
      contacts: 0,
      groups: 0,
    };
  }
};

// 🆕 Fetch stats untuk semua connected devices
const fetchAllDeviceStats = async () => {
  const connectedDevices = devices.value.filter((d) => d.status === "open");
  console.log(
    `[Stats] Fetching stats for ${connectedDevices.length} connected devices...`
  );
  await Promise.all(connectedDevices.map((d) => fetchDeviceStats(d.id)));
};

// Fetch devices dengan cache layer
const fetchDevices = async (forceRefresh = false) => {
  try {
    // Check cache first (kecuali force refresh)
    if (!forceRefresh) {
      const cachedDevices = cache.get(CACHE_KEY);
      if (cachedDevices) {
        devices.value = cachedDevices;
        // console.log("[Fetch] Using cached devices, no API call needed");

        // Auto-select device jika ada
        autoSelectDevice();

        // Setup socket listeners dengan data cache
        setupSocketListeners();
        return;
      }
    }

    // console.log('[Fetch] Cache miss atau force refresh, calling API...');
    const { data } = await userApi.get("/devices");
    devices.value = data;

    // Save to cache
    cache.set(CACHE_KEY, data, CACHE_TTL);

    // Auto-select device jika ada
    autoSelectDevice();

    // Setup socket listeners after fetching devices
    setupSocketListeners();

    // 🆕 Fetch stats untuk connected devices
    await fetchAllDeviceStats();

    // Clear groups cache if current device is not connected
    const curId = localStorage.getItem("device_selected_id");
    if (curId) {
      const cur = devices.value.find((d) => String(d.id) === String(curId));
      if (cur && String(cur.status).toLowerCase() !== "open") {
        clearGroups();
      }
    }
  } catch (e) {
    console.error("[Fetch] Error:", e);
  }
};

const autoSelectDevice = () => {
  if (!devices.value.length) return;

  // ✅ SKIP auto-select jika user baru saja manual memilih device
  if (isManualSelection) {
    // console.log('[Auto-Select] Skipped - User manual selection');
    isManualSelection = false; // Reset flag
    return;
  }

  // Jika hanya ada 1 device, langsung pilih
  if (devices.value.length === 1) {
    deviceId.value = String(devices.value[0].id);
    // console.log('[Auto-Select] Otomatis memilih device:', devices.value[0].name);
    return;
  }

  // ✅ PRIORITAS #1: Jika ada device tersimpan di localStorage, gunakan itu
  const savedDeviceId = localStorage.getItem("device_selected_id");
  if (savedDeviceId) {
    const savedDevice = devices.value.find((d) => String(d.id) === savedDeviceId);
    if (savedDevice) {
      deviceId.value = savedDeviceId;
      // console.log('[Auto-Select] Menggunakan device tersimpan dari localStorage:', savedDevice.name);
      return;
    }
  }

  // ✅ PRIORITAS #2: UNTUK ADMIN: Prioritas pilih device yang belum terhubung agar bisa langsung pairing
  if (!isTutor.value) {
    const disconnectedDevice = devices.value.find((d) => d.status !== "open");
    if (disconnectedDevice) {
      deviceId.value = String(disconnectedDevice.id);
      // console.log('[Auto-Select] Admin - memilih device yang belum terhubung:', disconnectedDevice.name);
      return;
    }
  }

  // ✅ PRIORITAS #3: Untuk Tutor: Jika ada device yang sudah open, pilih yang itu
  const openDevice = devices.value.find((d) => d.status === "open");
  if (openDevice) {
    deviceId.value = String(openDevice.id);
    // console.log('[Auto-Select] Otomatis memilih device terhubung:', openDevice.name);
    return;
  }

  // ✅ PRIORITAS #4: Default: pilih device pertama
  deviceId.value = String(devices.value[0].id);
  // console.log('[Auto-Select] Memilih device pertama:', devices.value[0].name);
};

// Debounced version untuk mencegah multiple calls
const debouncedFetchDevices = debounce(fetchDevices, 1000);

const createDevice = async () => {
  error.value = "";
  success.value = "";

  if (!name.value.trim()) {
    toast.error("Nama device tidak boleh kosong");
    return;
  }

  if (tutorReachedLimit.value) {
    toast.error("Tutor hanya dapat memiliki 1 device");
    return;
  }

  loading.value = true;
  try {
    await userApi.post("/tutors/devices", { name: name.value });
    toast.success("Device berhasil dibuat");
    name.value = "";

    // Invalidate cache dan fetch ulang
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  } catch (e) {
    toast.error(
      (e && e.response && e.response.data && e.response.data.message) ||
        "Gagal membuat device"
    );
  } finally {
    loading.value = false;
  }
};

const doDelete = async (ids) => {
  if (!ids || ids.length === 0) return;
  const msg =
    ids.length === 1 ? "Hapus device ini?" : `Hapus ${ids.length} device terpilih?`;
  if (!window.confirm(msg)) return;
  error.value = "";
  success.value = "";
  deleting.value = true;
  try {
    await userApi.delete("/devices", { data: { deviceIds: ids } });
    toast.success("Device berhasil dihapus");

    // Invalidate cache dan fetch ulang
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  } catch (e) {
    toast.error(
      (e && e.response && e.response.data && e.response.data.message) ||
        "Gagal menghapus device"
    );
  } finally {
    deleting.value = false;
  }
};

const deleteOne = async (d) => {
  // Show custom delete modal instead of browser confirm
  deviceToDelete.value = d;
  showDeleteModal.value = true;
};

// Confirm delete action
const confirmDelete = async () => {
  if (!deviceToDelete.value) return;

  deleting.value = true;

  try {
    await userApi.delete("/devices", { data: { deviceIds: [deviceToDelete.value.id] } });
    toast.success("Device berhasil dihapus");

    // Close modal
    showDeleteModal.value = false;
    deviceToDelete.value = null;

    // Invalidate cache dan fetch ulang
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  } catch (e) {
    toast.error(
      (e && e.response && e.response.data && e.response.data.message) ||
        "Gagal menghapus device"
    );
  } finally {
    deleting.value = false;
  }
};

// Cancel delete action
const cancelDelete = () => {
  showDeleteModal.value = false;
  deviceToDelete.value = null;
};

const onQRImageError = () => {
  console.error("QR image failed to load");
  if (qr.value && !qr.value.startsWith("data:image")) {
    generateQRFromString(qr.value);
  }
};

const generateQRFromString = async (qrString) => {
  try {
    qr.value = await QRCode.toDataURL(qrString);
    asciiQr.value = "";
  } catch (error) {
    console.error("Error generating QR from string:", error);
  }
};

async function openSSEOnce() {
  controller = new AbortController();
  apiError.value = "";
  qr.value = "";
  asciiQr.value = "";

  const token = localStorage.getItem("token") || "";

  // Get API base URL from environment
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
  const sseUrl = `${API_BASE}/tutors/sessions/create-sse`;

  try {
    const resp = await fetch(sseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ deviceId: deviceId.value }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${errorText}`);
    }

    if (!resp.body) {
      throw new Error("Response body is null");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let connectedOpen = false;

    const processLines = async () => {
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const json = line.slice(5).trim();
          if (!json) continue;

          try {
            const data = JSON.parse(json);

            if (data.error) {
              apiError.value = data.error;
              continue;
            }

            if (data.qr) {
              if (typeof data.qr === "string" && data.qr.startsWith("data:image")) {
                qr.value = data.qr;
                asciiQr.value = "";
              } else if (typeof data.qr === "string") {
                await generateQRFromString(data.qr);
              }
            }

            if (!qr.value && data.qrRaw) {
              asciiQr.value = data.qrRaw;
            }

            if (data.connection) {
              statusText.value = data.connection;
              if (data.connection === "open") {
                connectedOpen = true;
                qr.value = "";
                asciiQr.value = "";
                statusText.value = "Berhasil terhubung!";
              }
            }
          } catch (parseError) {
            console.error("Error parsing SSE data:", parseError);
          }
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      await processLines();
    }

    return connectedOpen;
  } catch (error) {
    if (error.name === "AbortError") {
      return false; // Stopped manually
    }
    throw error;
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const startPairing = async () => {
  // 🔧 GUARD #1: Check if already pairing
  if (pairingLoading.value) {
    toast.warning("Pairing sedang berlangsung. Mohon tunggu...");
    console.log("[Frontend Guard] Blocked: Already pairing");
    return;
  }

  // 🔧 GUARD #2: Check if still cleaning up
  if (isCleaningUp.value) {
    toast.warning("Sedang membersihkan koneksi lama. Mohon tunggu...");
    console.log("[Frontend Guard] Blocked: Still cleaning up");
    return;
  }

  // 🔧 GUARD #3: Check retry interval (prevent spam)
  const now = Date.now();
  const elapsed = now - lastPairingAttempt.value;

  if (lastPairingAttempt.value > 0 && elapsed < MIN_RETRY_INTERVAL) {
    const waitTime = Math.ceil((MIN_RETRY_INTERVAL - elapsed) / 1000);
    toast.warning(`⏳ Tunggu ${waitTime} detik sebelum pairing lagi`);
    console.log(
      `[Frontend Guard] Blocked: Too fast retry (${elapsed}ms < ${MIN_RETRY_INTERVAL}ms)`
    );
    return;
  }

  // 🔧 GUARD #4: Validate device selection
  if (!deviceId.value) {
    toast.error("Pilih device terlebih dahulu");
    console.log("[Frontend Guard] Blocked: No device selected");
    return;
  }

  // ✅ ALL GUARDS PASSED - Record attempt time
  lastPairingAttempt.value = now;
  console.log("[Frontend Guard] ✅ All guards passed, proceeding with pairing...");

  // Clear groups cache before re-pairing (old session groups become invalid)
  clearGroups();

  // Refresh device list to reflect latest status (use cache if available)
  await fetchDevices();

  // prevent parallel streams
  if (controller) {
    try {
      controller.abort();
    } catch (e) {
      console.error("Error aborting controller:", e);
    }
  }

  qr.value = "";
  asciiQr.value = "";
  statusText.value = "Menghubungkan...";
  pairingLoading.value = true;
  apiError.value = "";

  try {
    const maxCycles = 1; // 🆕 Cukup 1 cycle karena backend sudah handle retry
    for (let i = 0; i < maxCycles; i++) {
      statusText.value =
        i === 0 ? "Memulai koneksi..." : `Mencoba ulang... (${i + 1}/${maxCycles})`;
      const opened = await openSSEOnce();

      if (opened) {
        statusText.value = "Berhasil terhubung!";
        toast.success("WhatsApp berhasil terhubung!");

        // 🆕 Force clear QR dan stop loading saat sukses
        qr.value = "";
        asciiQr.value = "";
        pairingLoading.value = false;

        // 🆕 Refresh devices untuk update status
        cache.invalidate(CACHE_KEY);
        await fetchDevices(true);
        break;
      }

      if (!pairingLoading.value) break; // stopped manually

      if (i < maxCycles - 1) {
        await wait(1000);
      }
    }
  } catch (e) {
    console.error("Pairing error:", e);

    // 🆕 Better error messages
    let errorMessage = "Terjadi kesalahan saat melakukan pairing";

    if (e?.message?.includes("timeout")) {
      errorMessage = "Pairing timeout. Silakan coba lagi.";
    } else if (e?.message?.includes("already connected")) {
      errorMessage =
        "Device sudah terhubung. Refresh halaman untuk melihat status terbaru.";
    } else if (e?.message?.includes("Device not found")) {
      errorMessage = "Device tidak ditemukan.";
    } else if (e?.message) {
      errorMessage = e.message;
    }

    statusText.value = errorMessage;
    apiError.value = errorMessage;
    toast.error(errorMessage);
  } finally {
    pairingLoading.value = false;
    controller = null;

    // Invalidate cache setelah pairing selesai untuk pastikan data fresh
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  }
};

const stopPairing = () => {
  console.log("[Stop Pairing] User clicked stop - cleaning up...");

  // 🆕 CRITICAL: Abort controller FIRST sebelum clear state
  if (controller) {
    try {
      controller.abort();
      console.log("[Stop Pairing] Controller aborted");
    } catch (e) {
      console.error("Error stopping pairing:", e);
    }
  }

  // 🆕 Set controller ke null IMMEDIATELY untuk prevent race condition
  controller = null;

  // 🆕 Clear semua state dengan force
  pairingLoading.value = false;
  apiError.value = "";
  qr.value = "";
  asciiQr.value = "";
  statusText.value = "Dihentikan";

  // 🆕 Tampilkan "Waiting for Disconnect" info box
  waitingDisconnect.value = true;
  disconnectCountdown.value = 10; // Mulai dari 10 detik

  // 🆕 Start countdown interval
  if (disconnectInterval) {
    clearInterval(disconnectInterval);
  }

  disconnectInterval = setInterval(() => {
    disconnectCountdown.value -= 1;

    // Jika countdown habis, stop interval dan hide info box
    if (disconnectCountdown.value <= 0) {
      clearInterval(disconnectInterval);
      disconnectInterval = null;
      waitingDisconnect.value = false;

      // Show warning jika status masih belum berubah
      if (selectedStatus.value !== "close" && selectedStatus.value !== "closed") {
        toast.warning("Status masih belum berubah. Silakan refresh halaman jika perlu.");
      }
    }
  }, 1000);

  console.log("[Stop Pairing] All states cleared, showing disconnect countdown");

  // 🆕 Extra safety: Force refresh device status setelah stop
  setTimeout(async () => {
    console.log("[Stop Pairing] Refreshing device status after stop...");
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  }, 500);
};

// 🆕 Function untuk memilih device berikutnya yang belum terhubung
const selectNextDisconnectedDevice = () => {
  // Cari device yang belum terhubung (status !== 'open')
  const disconnectedDevices = devices.value.filter((d) => d.status !== "open");

  if (disconnectedDevices.length === 0) {
    toast.info("Semua device sudah terhubung");
    return;
  }

  // Pilih device pertama yang belum terhubung
  const nextDevice = disconnectedDevices[0];
  deviceId.value = String(nextDevice.id);

  // console.log('[Select Next] Memilih device yang belum terhubung:', nextDevice.name);
  toast.success(
    `Device "${nextDevice.name}" dipilih. Klik "Mulai Pairing" untuk menghubungkan.`
  );
};

// 🆕 PHASE 1: Quick Retry Function - One-click recovery from timeout/error
const quickRetryPairing = async () => {
  console.log("[Quick Retry] 🔄 User initiated quick retry...");

  // Clear error state
  apiError.value = "";
  qrExpired.value = false;

  // Reset retry throttle to allow immediate retry
  lastPairingAttempt.value = 0;

  // Stop existing connection if any
  if (controller) {
    try {
      controller.abort();
    } catch (e) {
      console.error("[Quick Retry] Error aborting:", e);
    }
    controller = null;
  }

  // Reset UI state
  qr.value = "";
  asciiQr.value = "";
  pairingLoading.value = false;
  statusText.value = "";

  // Wait 500ms for cleanup
  await wait(500);

  // Retry pairing
  toast.info("🔄 Membuat QR Code baru...");
  await startPairing();
};

// Pretty status mapping for table badges
const humanStatus = (s) => {
  const key = String(s || "").toLowerCase();
  const map = {
    open: "Terhubung",
    connected: "Terhubung",
    connecting: "Menghubungkan…",
    pending: "Menunggu…",
    closed: "Terputus",
    disconnected: "Terputus",
    close: "Terputus",
  };
  return map[key] || s || "-";
};

const statusClass = (s) => {
  const key = String(s || "").toLowerCase();
  if (key === "open" || key === "connected") return "is-open";
  if (key === "connecting" || "pending") return "is-pending";
  return "is-closed";
};

// Watch for status changes and auto-refresh
watch(selectedStatus, async (newStatus, oldStatus) => {
  if (oldStatus && newStatus !== oldStatus) {
    // console.log(`✅ Status berubah dari ${oldStatus} ke ${newStatus}`);

    // Update cache dengan status baru (no API call needed)
    const cachedDevices = cache.get(CACHE_KEY);
    if (cachedDevices) {
      const deviceIndex = cachedDevices.findIndex(
        (d) => d.id === selectedDevice.value.id
      );
      if (deviceIndex !== -1) {
        cachedDevices[deviceIndex].status = newStatus;
        cache.set(CACHE_KEY, cachedDevices, CACHE_TTL);
        // console.log("[Cache] Updated device status in cache");
      }
    }

    // 🆕 Jika status berubah menjadi terputus saat waitingDisconnect aktif
    if (
      waitingDisconnect.value &&
      (newStatus === "close" || newStatus === "closed" || newStatus === "disconnected")
    ) {
      // Stop countdown interval
      if (disconnectInterval) {
        clearInterval(disconnectInterval);
        disconnectInterval = null;
      }

      // Hide waiting disconnect box
      waitingDisconnect.value = false;

      console.log("[Disconnect] Status berubah menjadi terputus, countdown stopped");
      toast.success("Device berhasil terputus!");
    }

    // Jika berubah menjadi open (terhubung)
    if (newStatus === "open") {
      // ✅ FORCE clear semua QR state
      qr.value = "";
      asciiQr.value = "";
      statusText.value = "Berhasil terhubung! ✅";
      pairingLoading.value = false;
      apiError.value = "";

      // ✅ FORCE stop controller dan SSE stream
      if (controller) {
        try {
          controller.abort();
        } catch (e) {
          console.error("Error aborting:", e);
        }
        controller = null;
      }

      // Show success toast
      toast.success("Device berhasil terhubung dengan WhatsApp!");

      // ✅ Extra safety: Clear QR lagi setelah delay untuk handle race condition
      setTimeout(() => {
        qr.value = "";
        asciiQr.value = "";
      }, 500);
    }

    // Jika berubah menjadi closed/disconnected (terputus)
    if (
      (oldStatus === "open" || oldStatus === "connected") &&
      (newStatus === "close" || newStatus === "closed" || newStatus === "disconnected")
    ) {
      // Reset semua state pairing
      pairingLoading.value = false;
      qr.value = "";
      asciiQr.value = "";
      statusText.value = "";
      apiError.value = "";

      // Stop controller jika masih ada
      if (controller) {
        try {
          controller.abort();
        } catch (e) {
          console.error("Error aborting:", e);
        }
        controller = null;
      }

      // Clear success message jika masih ada
      success.value = "";

      // Show warning toast
      toast.warning("Device terputus dari WhatsApp. Silakan lakukan pairing ulang.");

      // console.log("⚠️ Device terputus, UI telah direset ke state awal");
    }

    // 🆕 Auto-fetch stats saat status berubah ke open
    if (newStatus === "open") {
      await fetchDeviceStats(selectedDevice.value.id);
    }
  }
});

// Watch deviceId untuk save ke localStorage
watch(deviceId, (newDeviceId, oldDeviceId) => {
  if (newDeviceId) {
    localStorage.setItem("device_selected_id", newDeviceId);
    const device = devices.value.find((d) => String(d.id) === newDeviceId);
    if (device) {
      localStorage.setItem("device_selected_name", device.name);
    }

    // ✅ Dispatch custom event untuk notify Dashboard.vue
    if (oldDeviceId && oldDeviceId !== newDeviceId) {
      isManualSelection = true;
      window.dispatchEvent(new Event("deviceChanged"));
      // console.log("[Manual Selection] User memilih device:", device?.name);
    }
  }
});

// 🆕 PHASE 1: Watch QR untuk start countdown timer dan auto-clear saat expired
watch(qr, (newQr) => {
  if (newQr && newQr.startsWith("data:image")) {
    // QR baru di-generate
    console.log("[QR Timer] ⏰ New QR generated, starting 60s countdown...");
    qrGeneratedAt.value = Date.now();
    qrTimeLeft.value = 60;
    qrExpired.value = false;

    // Clear old timer
    if (qrTimerInterval) {
      clearInterval(qrTimerInterval);
    }

    // Start countdown
    qrTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - qrGeneratedAt.value) / 1000);
      qrTimeLeft.value = Math.max(0, 60 - elapsed);

      // Warning at 10 seconds
      if (qrTimeLeft.value === 10 && !qrExpired.value) {
        console.log("[QR Timer] ⚠️ 10 seconds left!");
        toast.warning("⚠️ QR akan expired dalam 10 detik! Scan sekarang.", {
          duration: 5000,
        });
      }

      // Mark as expired and AUTO-CLEAR (CRITICAL FIX!)
      if (qrTimeLeft.value <= 0) {
        console.log("[QR Timer] ❌ QR expired - auto-clearing...");
        clearInterval(qrTimerInterval);
        qrTimerInterval = null;
        qrExpired.value = true;

        // AUTO-CLEAR expired QR (Fix root cause masalah!)
        qr.value = "";
        asciiQr.value = "";

        // Show expired message with retry option
        apiError.value =
          "QR Code expired. Klik tombol 'Generate QR Baru' untuk mencoba lagi.";

        console.log("[QR Timer] ✅ Expired QR cleared from UI");
      }
    }, 1000);
  } else if (!newQr) {
    // QR cleared, stop timer
    if (qrTimerInterval) {
      clearInterval(qrTimerInterval);
      qrTimerInterval = null;
    }
    qrGeneratedAt.value = null;
    qrTimeLeft.value = 60;
  }
});

// Setup Socket.IO listeners for all devices - PURE REAL-TIME (NO POLLING)
const setupSocketListeners = () => {
  // Clean up existing listeners first
  cleanupSocketListeners();

  // console.log(`[Socket.IO] Setting up listeners for ${devices.value.length} devices`);

  // Setup listener untuk setiap device
  devices.value.forEach((device) => {
    const cleanup = listenToDeviceStatus(device.id, async (newStatus) => {
      // console.log(`[Socket.IO] Device ${device.id} status: ${newStatus}`);

      // Update device status in local state TANPA API call
      const deviceIndex = devices.value.findIndex((d) => d.id === device.id);
      if (deviceIndex !== -1) {
        const oldStatus = devices.value[deviceIndex].status;
        devices.value[deviceIndex].status = newStatus;

        // Trigger Vue reactivity
        devices.value = [...devices.value];

        // Update cache juga
        const cachedDevices = cache.get(CACHE_KEY);
        if (cachedDevices) {
          const cachedIndex = cachedDevices.findIndex((d) => d.id === device.id);
          if (cachedIndex !== -1) {
            cachedDevices[cachedIndex].status = newStatus;
            cache.set(CACHE_KEY, cachedDevices, CACHE_TTL);
          }
        }

        // console.log(`[Socket.IO] ✅ Updated: ${oldStatus} -> ${newStatus} (0 API calls)`);
      }
    });

    socketCleanupFunctions.push(cleanup);
  });

  // console.log("[Socket.IO] ✅ All listeners active, monitoring real-time via WebSocket");
};

const cleanupSocketListeners = () => {
  socketCleanupFunctions.forEach((cleanup) => cleanup());
  socketCleanupFunctions = [];
};

onMounted(async () => {
  // console.log("[Mount] 🚀 Optimasi Ekstrem Active: Socket.IO + Cache (No Polling)");

  if (!auth.me) {
    try {
      await auth.fetchMe();
    } catch (_) {}
  }

  // Initial fetch (akan pakai cache jika tersedia)
  await fetchDevices();
});

// Cleanup on unmount
onUnmounted(() => {
  // console.log("[Unmount] Cleaning up...");

  if (controller) {
    try {
      controller.abort();
    } catch (e) {
      console.error("Error aborting controller on unmount:", e);
    }
  }

  cleanupSocketListeners();

  // Clear QR timer interval
  if (qrTimerInterval) {
    clearInterval(qrTimerInterval);
    qrTimerInterval = null;
  }
});

// 🆕 Add Device Modal State
const showAddDeviceModal = ref(false);

const openAddDeviceModal = () => {
  name.value = "";
  showAddDeviceModal.value = true;
};

const closeAddDeviceModal = () => {
  showAddDeviceModal.value = false;
  name.value = "";
};

const handleCreateDevice = async () => {
  error.value = "";
  success.value = "";

  if (!name.value.trim()) {
    toast.error("Nama device tidak boleh kosong");
    return;
  }

  if (tutorReachedLimit.value) {
    toast.error("Tutor hanya dapat memiliki 1 device");
    return;
  }

  loading.value = true;
  try {
    await userApi.post("/tutors/devices", { name: name.value });
    toast.success("Device berhasil dibuat");

    // Close modal
    closeAddDeviceModal();

    // Invalidate cache dan fetch ulang
    cache.invalidate(CACHE_KEY);
    await fetchDevices(true);
  } catch (e) {
    toast.error(
      (e && e.response && e.response.data && e.response.data.message) ||
        "Gagal membuat device"
    );
  } finally {
    loading.value = false;
  }
};
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
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

.stat-card.stat-success svg {
  color: #10b981;
}

.stat-card.stat-warning svg {
  color: #f59e0b;
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

/* Card Styles */
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
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
  transition: all 0.2s ease;
}

.btn-reload:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-reload svg {
  width: 16px;
  height: 16px;
}

/* Form Styles */
.form-inline {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 250px;
}

.field label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.field label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.field input,
.field select {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn.outline {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
}

.btn.outline:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

/* Info Box */
.info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  border-radius: 10px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.info svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #f59e0b;
}

/* Toolbar */
.toolbar {
  margin-bottom: 16px;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.row-btns {
  display: flex;
  gap: 8px;
}

/* Hint */
.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  margin-top: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.hint svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #3b82f6;
}

/* Connection Success */
.connection-success {
  margin: 20px 0;
  padding: 24px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #34d399;
  border-radius: 16px;
  display: flex;
  gap: 20px;
  box-shadow: 0 4px 16px rgba(52, 211, 153, 0.2);
}

.success-icon-box {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.success-icon-box svg {
  width: 32px;
  height: 32px;
  color: #ffffff;
}

.success-content {
  flex: 1;
}

.success-content h4 {
  margin: 0 0 8px 0;
  color: #065f46;
  font-size: 18px;
  font-weight: 700;
}

.success-content p {
  margin: 0 0 16px 0;
  color: #047857;
  line-height: 1.6;
}

.success-content strong {
  font-weight: 600;
  color: #065f46;
}

.success-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.feature-icon {
  font-size: 18px;
}

.success-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  font-size: 13px;
  color: #047857;
  border-left: 3px solid #10b981;
}

.success-note svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #10b981;
}

/* 🆕 CLEAN: Unified Status Bar (replaces old status-display, error-box, waiting-disconnect-box) */
.status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0;
  border: 1.5px solid;
  transition: all 0.3s ease;
}

.status-bar .status-icon,
.status-bar .status-spinner {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.status-bar .status-message {
  flex: 1;
}

.status-bar strong {
  font-weight: 700;
}

/* Status Bar States */
.status-bar-connecting {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #93c5fd;
  color: #1e40af;
}

.status-bar-connecting .status-spinner {
  border: 2.5px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.status-bar-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fbbf24;
  color: #92400e;
}

.status-bar-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
  color: #991b1b;
}

.status-bar-waiting {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
  color: #92400e;
}

/* Status Retry Button (integrated in status bar) */
.status-retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: white;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.status-retry-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.status-retry-btn svg {
  width: 14px;
  height: 14px;
}

/* 🆕 CLEAN: Minimal Progress Bar */
.progress-bar-wrapper {
  margin: 16px 0 24px 0;
}

.progress-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #64748b;
}

.progress-label {
  font-weight: 500;
}

.progress-time {
  font-weight: 600;
  color: #1e293b;
  transition: color 0.3s ease;
}

.progress-time-warning {
  color: #d97706;
}

.progress-bar-track {
  height: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 10px;
  transition: width 1s linear, background 0.3s ease;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.4);
}

.progress-bar-fill.progress-bar-caution {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 1px 4px rgba(245, 158, 11, 0.4);
}

.progress-bar-fill.progress-bar-urgent {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.4);
}

/* 🆕 CLEAN: QR Section dengan WhatsApp Web Style */
.qr-section {
  margin: 32px 0;
}

.qr-main-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 32px 0;
}

.qr-layout {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto;
}

/* 🎨 Panduan Elegan */
.qr-instructions-side {
  flex: 1;
  max-width: 450px;
  text-align: left;
}

.instruction-item {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: flex-start;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.instruction-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.instruction-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.instruction-item:hover::before {
  opacity: 1;
}

.instruction-number {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.instruction-content {
  flex: 1;
  padding-top: 4px;
}

.instruction-text {
  font-size: 15px;
  color: #475569;
  line-height: 1.7;
}

.instruction-text strong {
  color: #1e293b;
  font-weight: 600;
}

.instruction-icon {
  display: inline-block;
  padding: 2px 6px;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

/* Timer info at bottom of instructions */
.timer-info {
  margin-top: 20px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1.5px solid #93c5fd;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #1e40af;
  font-weight: 500;
}

.timer-info.timer-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
  color: #92400e;
  animation: pulse-warning 1s ease-in-out infinite;
}

.timer-info svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.timer-info strong {
  font-weight: 700;
}

@keyframes pulse-warning {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* QR Code Side */
.qr-code-side {
  flex: 0 0 auto;
}

.qr-box {
  position: relative;
  display: inline-block;
  padding: 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.qr-box:not(.qr-expired):hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.qr-box img {
  width: 280px;
  height: 280px;
  display: block;
  border-radius: 8px;
}

/* 🆕 QR Expired State */
.qr-box.qr-expired img {
  filter: grayscale(100%) opacity(0.3);
}

/* 🆕 Reload Overlay (like WhatsApp Web) */
.qr-expired-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qr-expired-overlay:hover {
  background: rgba(255, 255, 255, 0.98);
}

.qr-expired-overlay:hover .reload-icon-circle {
  transform: scale(1.1) rotate(90deg);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.reload-icon-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
}

.reload-icon-circle svg {
  width: 40px;
  height: 40px;
  color: white;
}

.reload-text {
  font-size: 15px;
  font-weight: 600;
  color: #475569;
  margin: 0;
  text-align: center;
  padding: 0 20px;
}

/* 🔧 FIX: Spinner Animation yang Benar */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner-large,
.status-spinner,
.spin-icon {
  animation: spin 0.8s linear infinite !important;
}

/* 🆕 Loading QR Indicator */
.loading-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  margin-bottom: 20px;
}

.loading-qr p {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.loading-qr small {
  font-size: 13px;
  color: #64748b;
}

/* 🆕 ASCII QR Fallback */
.qr-ascii {
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin: 20px 0;
}

.qr-ascii h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.qr-ascii pre {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  line-height: 1.2;
  color: #1e293b;
  overflow-x: auto;
  white-space: pre;
}

/* Empty State */
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
  width: 48px;
  height: 48px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.empty-state p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #64748b;
}

.empty-state small {
  font-size: 13px;
  color: #94a3b8;
}

/* 🔧 FIX: Spinner Animation yang Benar */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner-large,
.status-spinner {
  animation: spin 0.8s linear infinite !important;
}

/* Remove old unused styles */
.status-display,
.waiting-disconnect-box,
.error-box,
.qr-timer-section,
.qr-timer-progress-bar,
.qr-timer-info,
.qr-container,
.btn-retry,
.qr-header,
.qr-hint,
.qr-instructions-wrapper,
.instructions-toggle,
.toggle-icon,
.instruction-step,
.step-number,
.progress-bar-wrapper {
  display: none !important;
}

/* Responsive untuk QR Section */
@media (max-width: 1024px) {
  .qr-layout {
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  .qr-instructions-side {
    max-width: 600px;
  }

  .qr-main-title {
    font-size: 22px;
  }
}

@media (max-width: 768px) {
  .qr-main-title {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .qr-layout {
    gap: 24px;
  }

  .instruction-item {
    padding: 12px;
    margin-bottom: 12px;
  }

  .instruction-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .instruction-text {
    font-size: 14px;
  }

  .qr-box {
    padding: 20px;
  }

  .qr-box img {
    width: 240px;
    height: 240px;
  }

  .reload-icon-circle {
    width: 64px;
    height: 64px;
  }

  .reload-icon-circle svg {
    width: 32px;
    height: 32px;
  }

  .reload-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .qr-main-title {
    font-size: 18px;
  }

  .instruction-item {
    padding: 10px;
    gap: 12px;
  }

  .instruction-number {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }

  .instruction-text {
    font-size: 13px;
  }

  .qr-box {
    padding: 16px;
  }

  .qr-box img {
    width: 200px;
    height: 200px;
  }

  .timer-info {
    padding: 10px 12px;
    font-size: 13px;
  }
}

/* 🎨 Status Badge - Warna Lebih Soft & Professional */
.devices-table .status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
}

/* Status: Terhubung (Hijau Soft) */
.devices-table .status-badge.is-open {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #065f46;
}

.devices-table .status-badge.is-open .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-dot 2s ease-in-out infinite;
}

/* Status: Terputus (Merah Soft) */
.devices-table .status-badge.is-closed {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #991b1b;
}

.devices-table .status-badge.is-closed .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
}

/* Status: Pending (Orange Soft) */
.devices-table .status-badge.is-pending {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}

.devices-table .status-badge.is-pending .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

/* Features Cell */
.features-cell {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 🎨 Feature Badge - Warna Lebih Soft */
.feature-badge.feature-contacts {
  background: #dbeafe;
  border: 1px solid #93c5fd;
  color: #1e40af;
  font-weight: 500;
}

.feature-badge.feature-groups {
  background: #e9d5ff;
  border: 1px solid #c084fc;
  color: #6b21a8;
  font-weight: 500;
}

.feature-badge.feature-loading {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #64748b;
  font-weight: 500;
}

.feature-badge.feature-loading .spin-icon {
  animation: spin 1s linear infinite;
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
  transition: all 0.2s ease;
}

.feature-badge svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.feature-badge.disabled {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
}

/* 🆕 Pagination Wrapper */
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

.pagination-info strong {
  color: #1e293b;
  font-weight: 600;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.current-page {
  font-size: 16px;
}

.page-separator {
  opacity: 0.7;
}

.total-pages {
  opacity: 0.9;
}

/* Delete Button in Table */
.btn-delete-table {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border: 1.5px solid #fca5a5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete-table:hover:not(:disabled) {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.btn-delete-table:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delete-table svg {
  width: 18px;
  height: 18px;
}

/* 🆕 Table Styles - Modern & Clean */
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

.devices-table thead th.text-center {
  text-align: center;
}

.devices-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.devices-table tbody tr:hover {
  background: #f8fafc;
}

.devices-table tbody tr.row-connected {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.devices-table tbody tr.row-connected:hover {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.devices-table tbody td {
  padding: 16px 20px;
  color: #1e293b;
  vertical-align: middle;
}

.devices-table tbody td.text-center {
  text-align: center;
}

/* Device Cell */
.device-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-icon-small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-icon-small svg {
  width: 20px;
  height: 20px;
  color: #1e40af;
}

.device-icon-small.is-open {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.device-icon-small.is-open svg {
  color: #065f46;
}

.device-icon-small.is-closed {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.device-icon-small.is-closed svg {
  color: #991b1b;
}

.device-icon-small.is-pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.device-icon-small.is-pending svg {
  color: #92400e;
}

.device-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.device-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-id-small {
  font-size: 11px;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Phone Number */
.phone-number {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
}

/* 🎨 Status Badge - Lebih Berwarna & Eye-catching */
.devices-table .status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid;
  white-space: nowrap;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.devices-table .status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Status: Terhubung (Hijau) */
.devices-table .status-badge.is-open {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #059669;
  color: #ffffff;
}

.devices-table .status-badge.is-open .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  animation: pulse-dot 2s ease-in-out infinite;
}

/* Status: Terputus (Merah) */
.devices-table .status-badge.is-closed {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: #dc2626;
  color: #ffffff;
}

.devices-table .status-badge.is-closed .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  opacity: 0.8;
}

/* Status: Pending/Menghubungkan (Kuning/Orange) */
.devices-table .status-badge.is-pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #d97706;
  color: #ffffff;
}

.devices-table .status-badge.is-pending .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* Features Cell */
.features-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 🎨 Feature Badge - Kontak (Biru) */
.feature-badge.feature-contacts {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: 2px solid #2563eb;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.feature-badge.feature-contacts:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* 🎨 Feature Badge - Grup (Ungu/Purple) */
.feature-badge.feature-groups {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border: 2px solid #7c3aed;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.feature-badge.feature-groups:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

/* 🎨 Feature Badge - Loading (Animasi) */
.feature-badge.feature-loading {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 2px solid #cbd5e1;
  color: #64748b;
  font-weight: 600;
}

.feature-badge.feature-loading .spin-icon {
  animation: spin 1s linear infinite;
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.feature-badge svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.feature-badge.disabled {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  color: #94a3b8;
}

/* 🆕 Pagination Wrapper */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;
}

.pagination-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.pagination-btn svg {
  width: 18px;
  height: 18px;
}

.pagination-pages {
  display: flex;
  gap: 6px;
}

.pagination-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-page:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.pagination-page.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.pagination-page.active:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Delete Button in Table */
.btn-delete-table {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border: 1.5px solid #fca5a5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete-table:hover:not(:disabled) {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.btn-delete-table:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delete-table svg {
  width: 18px;
  height: 18px;
}

/* Responsive Table */
@media (max-width: 1024px) {
  .devices-table {
    font-size: 13px;
  }

  .devices-table thead th {
    padding: 14px 16px;
    font-size: 12px;
  }

  .devices-table tbody td {
    padding: 14px 16px;
  }

  .device-name {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .table-wrapper {
    border-radius: 8px;
  }

  .devices-table {
    font-size: 12px;
  }

  .devices-table thead th {
    padding: 12px;
    font-size: 11px;
  }

  .devices-table tbody td {
    padding: 12px;
  }

  .device-cell {
    gap: 10px;
  }

  .device-icon-small {
    width: 36px;
    height: 36px;
  }

  .device-icon-small svg {
    width: 18px;
    height: 18px;
  }

  .device-name {
    font-size: 12px;
  }

  .device-id-small {
    font-size: 10px;
  }

  .status-badge,
  .feature-badge {
    font-size: 11px;
    padding: 5px 10px;
  }

  .btn-delete-table {
    width: 32px;
    height: 32px;
  }

  .btn-delete-table svg {
    width: 16px;
    height: 16px;
  }
}

/* Mobile: Convert to stacked cards */
@media (max-width: 640px) {
  .table-wrapper {
    border: none;
    background: transparent;
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .devices-table tbody tr.row-connected {
    border-color: #34d399;
  }

  .devices-table tbody tr:hover {
    background: white;
    transform: none;
  }

  .devices-table tbody td {
    padding: 8px 0;
    border: none;
  }

  .devices-table tbody td:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 8px;
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

  .features-cell {
    margin-top: 4px;
  }

  .btn-delete-table {
    width: 100%;
    height: 40px;
    margin-top: 8px;
  }
}

/* Remove old card styles that are no longer needed */
.devices-grid,
.device-card,
.device-header,
.device-icon,
.device-info,
.device-body,
.device-feature,
.sync-status,
.sync-icon,
.sync-text,
.warning-icon,
.dim,
.device-footer,
.btn-delete {
  display: none !important;
}

/* Responsive */
@media (max-width: 1024px) {
  .filters {
    grid-template-columns: 1fr;
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

  .form-inline {
    flex-direction: column;
    align-items: stretch;
  }

  .field {
    min-width: unset;
  }

  .row-btns {
    flex-direction: column;
  }

  .row-btns button {
    width: 100%;
  }

  .connection-success {
    flex-direction: column;
    text-align: center;
  }

  .success-icon-box {
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .wrapper {
    padding: 0 12px;
  }

  .card {
    padding: 16px;
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

  .success-features {
    grid-template-columns: 1fr;
  }
}

/* Delete Modal */
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

.delete-modal-overlay {
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

.delete-modal {
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 32px;
  text-align: center;
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

.delete-modal-icon {
  margin-bottom: 20px;
  animation: pulse-icon 0.5s ease-out;
}

@keyframes pulse-icon {
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

.device-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: left;
  transition: all 0.2s ease;
}

.device-preview:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.preview-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
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

.preview-icon.is-open {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.preview-icon.is-open svg {
  color: #065f46;
}

.preview-icon.is-closed {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.preview-icon.is-closed svg {
  color: #991b1b;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.preview-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.preview-status .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.preview-status .status-dot.is-open {
  background: #10b981;
}

.preview-status .status-dot.is-closed {
  background: #dc2626;
}

.preview-status .status-dot.is-pending {
  background: #f59e0b;
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

/* Header Actions */
.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-add-device:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-add-device:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-add-device svg {
  width: 18px;
  height: 18px;
}

/* Form Modal (same as Templates.vue) */
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
  animation: slideUp 0.3s ease-out;
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
  transition: all 0.2s ease;
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
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-grid-modal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid-modal .form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-grid-modal .form-group.full {
  width: 100%;
}

.form-grid-modal .form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-grid-modal .form-group .required {
  color: #dc2626;
}

.form-grid-modal .form-group input {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.form-grid-modal .form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-hint {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
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
  margin-top: 16px;
}

.info-box svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #f59e0b;
}

/* 🔧 FIX: Form Actions - Button yang lebih rapi */
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
  transition: all 0.2s ease;
  min-width: 120px;
  white-space: nowrap;
}

.btn-cancel {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: 1.5px solid #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save svg {
  width: 18px;
  height: 18px;
}

/* Responsive */
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

  .form-modal {
    max-width: 95%;
    width: 95%;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 480px) {
  .form-modal {
    max-width: 100%;
    width: 100%;
    margin: 0;
    border-radius: 20px 20px 0 0;
    max-height: 90vh;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .form-grid-modal {
    gap: 16px;
  }
}

/* 🆕 Search Filter Section */
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
  transition: all 0.2s ease;
  color: #1e293b;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.clear-search-btn:hover {
  background: #e2e8f0;
  opacity: 1;
  transform: scale(1.05);
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

.search-result-info strong {
  color: #1e293b;
  font-weight: 600;
}

.search-result-info .no-results {
  color: #dc2626;
  font-weight: 500;
}

/* 🆕 No Results Row in Table */
.no-results-row {
  background: #f8fafc !important;
}

.no-results-row:hover {
  background: #f8fafc !important;
}

.no-results-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  gap: 16px;
}

.no-results-message svg {
  width: 48px;
  height: 48px;
  color: #94a3b8;
}

.no-results-message h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.no-results-message p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.no-results-message p strong {
  color: #1e293b;
  font-weight: 600;
}

.btn-reset-search {
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
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  margin-top: 8px;
}

.btn-reset-search:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-reset-search svg {
  width: 16px;
  height: 16px;
}

/* Responsive for Search Filter */
@media (max-width: 768px) {
  .search-filter-section {
    padding: 16px;
  }

  .search-input {
    font-size: 13px;
    padding: 10px 40px 10px 40px;
  }

  .search-icon {
    width: 18px;
    height: 18px;
    left: 12px;
  }

  .search-result-info {
    font-size: 12px;
    padding: 6px 10px;
  }

  .no-results-message {
    padding: 32px 16px;
  }

  .no-results-message svg {
    width: 40px;
    height: 40px;
  }

  .no-results-message h4 {
    font-size: 16px;
  }

  .no-results-message p {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .search-filter-section {
    padding: 12px;
  }

  .search-input {
    font-size: 12px;
    padding: 10px 36px 10px 36px;
  }

  .search-icon {
    width: 16px;
    height: 16px;
    left: 10px;
  }

  .clear-search-btn {
    width: 24px;
    height: 24px;
    right: 6px;
  }

  .clear-search-btn svg {
    width: 12px;
    height: 12px;
  }

  .no-results-message {
    padding: 24px 12px;
    gap: 12px;
  }

  .btn-reset-search {
    width: 100%;
    justify-content: center;
  }
}

/* 🆕 Pagination Styles */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-top: 1.5px solid #e2e8f0;
  gap: 16px;
  flex-wrap: wrap;
}

.pagination-info {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.pagination-info strong {
  color: #1e293b;
  font-weight: 600;
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
  white-space: nowrap;
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
  background: #f8fafc;
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
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  min-width: 80px;
  justify-content: center;
}

.current-page {
  font-size: 16px;
}

.page-separator {
  opacity: 0.7;
  font-size: 14px;
}

.total-pages {
  opacity: 0.9;
  font-size: 14px;
}

/* Responsive for Pagination */
@media (max-width: 768px) {
  .pagination {
    padding: 16px;
    gap: 12px;
  }

  .pagination-info {
    font-size: 13px;
    width: 100%;
    text-align: center;
    order: 1;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
    order: 2;
    gap: 10px;
  }

  .btn-page {
    padding: 8px 14px;
    font-size: 12px;
  }

  .btn-page span {
    display: none;
  }

  .page-indicator {
    padding: 8px 14px;
    font-size: 13px;
    min-width: 70px;
  }

  .current-page {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .pagination {
    padding: 12px;
  }

  .pagination-info {
    font-size: 12px;
  }

  .pagination-controls {
    gap: 8px;
  }

  .btn-page {
    padding: 6px 12px;
    min-width: 36px;
    justify-content: center;
  }

  .btn-page svg {
    width: 14px;
    height: 14px;
  }

  .page-indicator {
    padding: 6px 12px;
    font-size: 12px;
    min-width: 60px;
  }

  .current-page {
    font-size: 14px;
  }
}

/* ...existing form modal styles... */

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  display: block;
}

.form-group label .required {
  color: #dc2626;
  margin-left: 2px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
  color: #1e293b;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-hint {
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
  display: block;
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
  margin-top: 16px;
}

.info-box svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #f59e0b;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel,
.btn-save {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: 1.5px solid #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save svg,
.btn-cancel svg {
  width: 16px;
  height: 16px;
}
</style>
