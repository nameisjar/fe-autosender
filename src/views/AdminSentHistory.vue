<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
            <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Semua Pesan Terkirim (Admin)
        </h2>
        <p class="subtitle">Monitor dan kelola semua pesan yang telah terkirim</p>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <div>
            <div class="stat-value">{{ meta.totalMessages || 0 }}</div>
            <div class="stat-label">Total Pesan</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <div>
            <div class="stat-value">{{ displayedRows.filter(r => String(r.status).toLowerCase().includes('delivery') || String(r.status).toLowerCase().includes('read')).length }}</div>
            <div class="stat-label">Terkirim</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <div>
            <div class="stat-value">{{ displayedRows.filter(r => String(r.status).toLowerCase().includes('fail') || String(r.status).toLowerCase().includes('error')).length }}</div>
            <div class="stat-label">Gagal</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <div>
            <div class="stat-value">{{ displayedRows.filter(r => String(r.status).toLowerCase() === 'pending').length }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
      </div>
    </div>

    <div class="toolbar-card">
      <div class="toolbar-header">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="21" x2="4" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/>
            <line x1="20" y1="12" x2="20" y2="3"/>
            <line x1="1" y1="14" x2="7" y2="14"/>
            <line x1="9" y1="8" x2="15" y2="8"/>
            <line x1="17" y1="16" x2="23" y2="16"/>
          </svg>
          Filter & Pencarian
        </h3>
        <div class="action-buttons">
          <button class="btn-action export" @click="exportCsv" :disabled="loading || exporting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ exporting ? 'Mengekspor...' : 'Export CSV' }}
          </button>
          <button class="btn-action danger" @click="deleteAllSent" :disabled="loading || deleting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {{ deleting ? 'Menghapus...' : 'Hapus Semua' }}
          </button>
        </div>
      </div>

      <div class="filters-grid">
        <div class="filter-item">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Nomor Telepon
          </label>
          <input v-model="phoneNumber" placeholder="628xx..." />
        </div>

        <div class="filter-item">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Tutor
          </label>
          <input v-model="tutorQuery" placeholder="Nama tutor..." />
        </div>

        <div class="filter-item span-2">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Cari Pesan
          </label>
          <input v-model="messageQuery" placeholder="Cari dalam pesan..." />
        </div>

        <div class="filter-item">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="20" y2="12"/>
              <line x1="12" y1="18" x2="20" y2="18"/>
            </svg>
            Urutkan
          </label>
          <select v-model="sortBy">
            <option value="createdAt">⏰ Terbaru</option>
            <option value="to">📱 Nomor</option>
            <option value="message">💬 Pesan</option>
            <option value="status">📊 Status</option>
          </select>
        </div>

        <div class="filter-item compact">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            Arah
          </label>
          <select v-model="sortDir">
            <option value="desc">↓ Turun</option>
            <option value="asc">↑ Naik</option>
          </select>
        </div>

        <div class="filter-item compact">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Tampil
          </label>
          <select v-model.number="pageSize">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <div class="filter-item">
          <label>&nbsp;</label>
          <button class="btn-load" @click="load(1)" :disabled="loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            {{ loading ? 'Memuat...' : 'Muat Data' }}
          </button>
        </div>
      </div>
    </div>

    <div class="messages-container">
      <!-- Table View -->
      <div class="table-container">
        <table class="messages-table" v-if="!loading && displayedRows.length > 0">
          <thead>
            <tr>
              <th class="col-expand"></th>
              <th class="col-contact">Kontak</th>
              <th class="col-message">Pesan</th>
              <th class="col-status">Status</th>
              <th class="col-time">Waktu</th>
              <th class="col-source">Sumber</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in displayedRows" :key="r.id" class="message-row">
              <td class="col-expand">
                <button 
                  class="btn-expand" 
                  @click="openDetailModal(r)"
                  title="Lihat detail"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </button>
              </td>
              <td class="col-contact">
                <div class="contact-cell">
                  <div class="contact-name">{{ r.contact ? (r.contact.firstName + ' ' + (r.contact.lastName||'')) : 'Tidak Ada Nama' }}</div>
                  <div class="phone-number">{{ normalizeNumber(r.to) }}</div>
                </div>
              </td>
              <td class="col-message">
                <div class="message-preview-cell">{{ truncateMessage(r.message, 50) }}</div>
              </td>
              <td class="col-status">
                <span class="status-badge" :class="badgeClass(r.status)">
                  {{ statusLabel(r.status) }}
                </span>
              </td>
              <td class="col-time">
                <div class="time-cell">{{ fmt(r.createdAt) }}</div>
              </td>
              <td class="col-source">
                <span v-if="sourceSimple(r) === 'reminder'" class="source-chip reminder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Reminder
                </span>
                <span v-else-if="sourceSimple(r) === 'feedback'" class="source-chip feedback">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  Feedback
                </span>
                <span v-else-if="sourceSimple(r) === 'recurrence'" class="source-chip recurrence">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Recurrence
                </span>
                <span v-else-if="sourceSimple(r)" class="source-chip broadcast">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="2"/>
                    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
                  </svg>
                  Broadcast
                </span>
                <span v-else class="no-source">-</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else-if="!loading && displayedRows.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M8 10h.01M12 10h.01M16 10h.01"/>
          </svg>
          <h3>Tidak Ada Pesan</h3>
          <p>Belum ada pesan terkirim yang ditemukan</p>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="meta.totalPages > 1">
      <button class="btn-page" :disabled="page<=1 || loading" @click="load(page-1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Sebelumnya
      </button>
      <div class="page-info">
        <span class="current-page">{{ page }}</span>
        <span class="page-separator">/</span>
        <span class="total-pages">{{ meta.totalPages }}</span>
      </div>
      <button class="btn-page" :disabled="!meta.hasMore || loading" @click="load(page+1)">
        Selanjutnya
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <p v-if="err" class="error">{{ err }}</p>

    <!-- Detail Modal Popup -->
    <div v-if="showDetailModal" class="modal-overlay detail-modal-overlay" @click="closeDetailModal">
      <div class="detail-modal" @click.stop>
        <div class="detail-modal-header">
          <div class="detail-modal-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div>
              <h3>Detail Pesan Terkirim</h3>
              <p class="detail-subtitle">Informasi lengkap pesan broadcast</p>
            </div>
          </div>
          <button class="btn-close-modal" @click="closeDetailModal" title="Tutup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="detail-modal-body" v-if="selectedMessage">
          <!-- Contact Info -->
          <div class="detail-section">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Informasi Kontak
            </label>
            <div class="info-grid">
              <div class="info-item">
                <label class="info-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Nama
                </label>
                <div class="info-value">{{ selectedMessage.contact ? (selectedMessage.contact.firstName + ' ' + (selectedMessage.contact.lastName||'')) : 'Tidak Ada Nama' }}</div>
              </div>

              <div class="info-item">
                <label class="info-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Nomor Telepon
                </label>
                <div class="info-value phone-value">{{ normalizeNumber(selectedMessage.to) }}</div>
              </div>
            </div>
          </div>

          <!-- Message Content -->
          <div class="detail-section">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Pesan
            </label>
            <div class="message-preview-full">{{ selectedMessage.message }}</div>
          </div>

          <!-- Status & Time Info -->
          <div class="detail-section">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Informasi Status
            </label>
            <div class="info-grid">
              <div class="info-item">
                <label class="info-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  Status
                </label>
                <span class="status-badge" :class="badgeClass(selectedMessage.status)">
                  {{ statusLabel(selectedMessage.status) }}
                </span>
              </div>

              <div class="info-item">
                <label class="info-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Waktu Terkirim
                </label>
                <div class="info-value">{{ fmt(selectedMessage.createdAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Tutor Info (if exists) -->
          <div class="detail-section" v-if="tutorName(selectedMessage) !== '-'">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Tutor
            </label>
            <div class="info-value">{{ tutorName(selectedMessage) }}</div>
          </div>

          <!-- Source Info -->
          <div class="detail-section" v-if="sourceSimple(selectedMessage)">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="2"/>
                <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
              </svg>
              Sumber Pesan
            </label>
            <div class="source-detail">
              <span v-if="sourceSimple(selectedMessage) === 'reminder'" class="source-chip reminder large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Reminder
              </span>
              <span v-else-if="sourceSimple(selectedMessage) === 'feedback'" class="source-chip feedback large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                Feedback
              </span>
              <span v-else-if="sourceSimple(selectedMessage) === 'recurrence'" class="source-chip recurrence large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Recurrence
              </span>
              <span v-else class="source-chip broadcast large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="2"/>
                  <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
                </svg>
                Broadcast
              </span>
            </div>
          </div>

          <!-- Media (if exists) -->
          <div class="detail-section" v-if="selectedMessage.mediaPath">
            <label class="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
              Media
            </label>
            <div class="media-content">
              <a :href="mediaUrl(selectedMessage.mediaPath)" target="_blank" rel="noopener" class="media-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirm" class="modal-overlay delete-modal-overlay" @click.self="cancelConfirm">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-icon">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        </div>
        
        <div class="delete-modal-content">
          <h3>Hapus Semua Pesan?</h3>
          <p class="delete-warning">Hapus SEMUA status pesan terkirim pada tampilan ini? Tindakan ini tidak dapat dibatalkan.</p>
        </div>

        <div class="delete-modal-actions">
          <button type="button" class="btn-keep" @click="cancelConfirm" :disabled="deleting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Batal
          </button>
          <button type="button" class="btn-delete-confirm" @click="executeConfirm" :disabled="deleting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus Semua' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { userApi, deviceApi } from '../api/http.js';
import { useToast } from '../composables/useToast.js';

const toast = useToast();

const rows = ref([]);
const meta = ref({ totalMessages: 0, currentPage: 1, totalPages: 1, hasMore: false });
const page = ref(1);
const pageSize = ref(25);
const sortBy = ref('createdAt');
const sortDir = ref('desc');
const phoneNumber = ref('');
const tutorQuery = ref('');
const messageQuery = ref('');
const loading = ref(false);
const err = ref('');

const exporting = ref(false);
const deleting = ref(false);

// Confirmation dialog state
const showConfirm = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmAction = ref(() => {});

const cancelConfirm = () => {
  showConfirm.value = false;
  confirmAction.value = () => {};
};

const executeConfirm = async () => {
  if (confirmAction.value) {
    await confirmAction.value();
  }
};

const isBroadcast = (r) => String(r?.id || '').startsWith('BC_');

const displayedRows = computed(() => {
  const list = rows.value || [];
  if (!tutorQuery.value) return list;
  const q = tutorQuery.value.trim().toLowerCase();
  return list.filter((r) => tutorName(r).toLowerCase().includes(q));
});

const deviceTutorMap = ref({});
const sessionTutorMap = ref({});
const tutorMapLoaded = ref(false);

const broadcastNameMap = ref({});
const getBroadcastPkId = (id) => {
  const m = String(id || '').match(/^BC_(\d+)_/);
  return m ? Number(m[1]) : null;
};
const loadBroadcasts = async () => {
  try {
    const { data } = await deviceApi.get('/messages/broadcasts');
    const arr = Array.isArray(data) ? data : [];
    const map = {};
    for (const b of arr) {
      const key = Number(b?.pkId ?? b?.id);
      if (Number.isFinite(key)) map[key] = String(b?.name || '');
    }
    broadcastNameMap.value = map;
  } catch (_) { /* ignore */ }
};

const fmt = (d) => {
  try { const dd = new Date(d); return isNaN(dd.getTime()) ? '-' : dd.toLocaleString(); } catch { return '-'; }
};
const normalizeNumber = (to) => String(to || '').replace('@s.whatsapp.net','');
const badgeClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s.includes('fail') || s.includes('error')) return 'warn';
  if (s === 'read' || s === 'played' || s === 'delivery_ack') return 'ok';
  if (s === 'server_ack') return 'info';
  if (s === 'pending') return 'info';
  return 'info';
};

const statusLabel = (status) => {
  const s = String(status || '').toLowerCase();
  switch (s) {
    case 'pending': return '🕐'; // jam
    case 'server_ack': return '✔️'; // centang satu
    case 'delivery_ack': return '✔️✔️'; // centang dua
    case 'read': return 'Dibaca'; // centang dua biru
    case 'played': return 'Diputar'; // audio played
    case 'error': return 'Gagal'; // error occurred
    default: return status || 'Pending'; // default status
  }
};

const tutorName = (r) => {
  const f = r.tutor?.firstName || r.user?.firstName;
  const l = r.tutor?.lastName || r.user?.lastName;
  if (f) return [f, l].filter(Boolean).join(' ');
  const did = r.deviceId || r.device?.id || r.device_id;
  const byDevice = did && deviceTutorMap.value[did];
  if (byDevice) return byDevice;
  const sid = r.sessionId || r.session_id;
  const bySession = sid && sessionTutorMap.value[sid];
  return bySession || '-';
};

const sourceLabel = (r) => {
  const t = (r && r.broadcastType) ? String(r.broadcastType).toLowerCase() : '';
  if (t === 'feedback') return 'Feedback';
  if (t === 'reminder') return 'Reminder';

  const name = typeof r?.broadcastName === 'string' ? r.broadcastName : '';
  if (name) {
    const isReminderByName = /\bRecipients\b/i.test(name);
    return isReminderByName ? 'Reminder' : 'Feedback';
  }

  const id = r?.id;
  if (!id || typeof id !== 'string' || !id.startsWith('BC_')) return '';
  const pk = getBroadcastPkId(id);
  const nm = pk != null ? (broadcastNameMap.value[pk] || '') : '';
  if (!nm) return '';
  const isReminder = /\bRecipients\b/i.test(nm);
  return isReminder ? 'Reminder' : 'Feedback';
};

const loadTutorDeviceMap = async () => {
  try {
    const { data } = await userApi.get('/tutors');
    const map = {};
    const list = Array.isArray(data) ? data : [];
    for (const t of list) {
      const name = [t?.firstName, t?.lastName].filter(Boolean).join(' ') || t?.email || 'Tutor';
      const devices = Array.isArray(t?.devices) ? t.devices : [];
      for (const d of devices) {
        if (d && d.id) map[d.id] = name;
      }
    }
    deviceTutorMap.value = map;
  } catch (_) {
    // ignore
  }
};

const loadSessionTutorMap = async () => {
  try {
    const { data } = await userApi.get('/tutors');
    const list = Array.isArray(data) ? data : [];
    const entries = [];
    for (const t of list) {
      const name = [t?.firstName, t?.lastName].filter(Boolean).join(' ') || t?.email || 'Tutor';
      const devices = Array.isArray(t?.devices) ? t.devices : [];
      for (const d of devices) {
        if (d && d.id) {
          entries.push({ deviceId: d.id, name });
        }
      }
    }
    const results = await Promise.allSettled(entries.map((e) => userApi.get(`/devices/${encodeURIComponent(e.deviceId)}`)));
    const map = {};
    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        const tutorName = entries[idx].name;
        const sessions = Array.isArray(res.value?.data?.sessions) ? res.value.data.sessions : [];
        sessions.forEach((s) => {
          if (s && s.sessionId) map[s.sessionId] = tutorName;
        });
      }
    });
    sessionTutorMap.value = map;
  } catch (_) {
    // ignore
  } finally {
    tutorMapLoaded.value = true;
  }
};

const load = async (p = page.value) => {
  loading.value = true;
  err.value = '';
  try {
    page.value = p;
    const params = { page: page.value, pageSize: pageSize.value, sortBy: sortBy.value, sortDir: sortDir.value };
    if (phoneNumber.value) params.phoneNumber = phoneNumber.value;
    if (messageQuery.value) params.message = messageQuery.value;
    const { data } = await userApi.get('/tutors/messages/all', { params });
    rows.value = data.data || [];
    meta.value = data.metadata || meta.value;
  } catch (e) {
    err.value = e?.response?.data?.message || e?.message || 'Gagal memuat data';
  } finally {
    loading.value = false;
  }
};

const fbNameMap = ref({});
const fbNameMapNorm = ref({});
const normalizeCourseKey = (s) => String(s || '').trim().toLowerCase();
const loadFbNameMap = () => {
  try {
    const raw = localStorage.getItem('feedback_broadcast_names');
    const map = raw ? JSON.parse(raw) : {};
    fbNameMap.value = map;
    const norm = {};
    Object.keys(map).forEach((k) => { norm[normalizeCourseKey(k)] = map[k]; });
    fbNameMapNorm.value = norm;
  } catch {
    fbNameMap.value = {};
    fbNameMapNorm.value = {};
  }
};

const getBroadcastName = (r) => {
  if (typeof r?.broadcastName === 'string' && r.broadcastName) return r.broadcastName;
  const id = r?.id;
  if (!id || typeof id !== 'string' || !id.startsWith('BC_')) return '';
  const pk = getBroadcastPkId(id);
  return pk != null ? (broadcastNameMap.value[pk] || '') : '';
};

const isReminderName = (name) => /\b(Recipients|Reminder)\b/i.test(String(name || ''));
const isFeedbackName = (name) => {
  if (!name) return false;
  const key = normalizeCourseKey(name);
  return !!fbNameMapNorm.value[key];
};

const isRecurrenceName = (name) => {
  if (!name) return false;
  const nameStr = String(name || '').toLowerCase();
  // Check for patterns that indicate recurring broadcasts
  return /\b(reminder|recurrence|recurring|berulang)\b/i.test(nameStr) && 
         (/\[(reminder|recurrence)\]/i.test(nameStr) || 
          /- reminder ke \d+/i.test(nameStr));
};

const sourceSimple = (r) => {
  if (!isBroadcast(r)) return '';
  const t = (r && r.broadcastType) ? String(r.broadcastType).toLowerCase() : '';
  const name = getBroadcastName(r);
  
  if (t === 'reminder' || isReminderName(name)) return 'reminder';
  if (t === 'feedback' || isFeedbackName(name)) return 'feedback';
  if (t === 'recurrence' || isRecurrenceName(name)) return 'recurrence';
  return 'broadcast';
};

const exportCsv = async () => {
  try {
    exporting.value = true;
    const params = {
      export: 'csv',
      sortBy: sortBy.value,
      sortDir: sortDir.value,
    };
    if (phoneNumber.value) params.phoneNumber = phoneNumber.value;
    if (messageQuery.value) params.message = messageQuery.value;
    const resp = await userApi.get('/tutors/messages/all', { params, responseType: 'blob' });
    const blob = new Blob([resp.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    setAttribute('download', 'sent-messages.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Export CSV berhasil. File sedang diunduh.');
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal mengekspor CSV');
  } finally {
    exporting.value = false;
  }
};

const deleteAllSent = async () => {
  confirmTitle.value = 'localhost:5173 says';
  confirmMessage.value = 'Hapus SEMUA status pesan terkirim pada tampilan ini? Tindakan ini permanen.';
  confirmAction.value = async () => {
    showConfirm.value = false;
    try {
      deleting.value = true;

      // 1) Hapus semua status di outgoingMessage
      const msgParams = { status: 'all' };
      if (phoneNumber.value) msgParams.phoneNumber = phoneNumber.value;
      await userApi.delete('/tutors/messages/all', { params: msgParams });

      // 2) Sinkron: hapus broadcast yang sudah terkirim (cascade akan bersih-kan BC_*)
      await userApi.delete('/broadcasts/bulk', { params: { isSent: true } });

      toast.success('Semua pesan terkirim berhasil dihapus');
      await load(1);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Gagal menghapus pesan');
    } finally {
      deleting.value = false;
    }
  };
  showConfirm.value = true;
};

const mediaUrl = (p) => {
  if (!p) return '';
  
  // Get API base URL from environment
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = p.startsWith('/') ? p.slice(1) : p;
  
  // Construct full URL with API base
  return `${API_BASE}/${cleanPath}`;
};

const isImagePath = (p) => /\.(png|jpe?g|webp|gif)$/i.test(p || '');

watch([sortBy, sortDir, pageSize], () => {
  page.value = 1;
  load(1);
});

onMounted(async () => {
  await Promise.allSettled([loadTutorDeviceMap(), loadSessionTutorMap(), loadBroadcasts(), loadFbNameMap(), load(1)]);
});

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

const truncateMessage = (message, length) => {
  if (message.length <= length) return message;
  return message.substring(0, length) + '...';
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

/* Toolbar Card */
.toolbar-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.toolbar-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.toolbar-header h3 svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.action-buttons {
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
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action svg {
  width: 18px;
  height: 18px;
}

.btn-action.export {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #15803d;
  border-color: #86efac;
}

.btn-action.export:hover:not(:disabled) {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(21, 128, 61, 0.2);
}

.btn-action.danger {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border-color: #fca5a5;
}

.btn-action.danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

/* Filters Grid */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item.span-2 {
  grid-column: span 2;
}

.filter-item.compact {
  min-width: 100px;
}

.filter-item label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.filter-item label svg {
  width: 14px;
  height: 14px;
  color: #3b82f6;
}

.filter-item input,
.filter-item select {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.filter-item input:focus,
.filter-item select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-load {
  display: flex;
  align-items: center;
  justify-content: center;
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

.btn-load:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-load:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-load svg {
  width: 18px;
  height: 18px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Messages Container */
.messages-container {
  margin-bottom: 32px;
}

.table-container {
  overflow-x: auto;
}

.messages-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.messages-table th,
.messages-table td {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  color: #475569;
  border-bottom: 1px solid #f1f5f9;
}

.messages-table th {
  background: #f8fafc;
  font-weight: 600;
}

.messages-table td {
  background: #ffffff;
}

.messages-table .col-expand {
  width: 40px;
}

.messages-table .col-contact {
  width: 200px;
}

.messages-table .col-message {
  width: 300px;
}

.messages-table .col-status {
  width: 120px;
}

.messages-table .col-time {
  width: 160px;
}

.messages-table .col-source {
  width: 160px;
}

.btn-expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-expand:hover {
  background: #e2e8f0;
}

.btn-expand svg {
  width: 16px;
  height: 16px;
  color: #475569;
}

.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-name {
  font-weight: 600;
  color: #1e293b;
}

.phone-number {
  font-size: 13px;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.message-preview-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-cell {
  font-size: 13px;
  color: #64748b;
}

.no-source {
  color: #94a3b8;
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
  background: #f8fafc;
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
.error {
  margin-top: 20px;
  padding: 14px 18px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* Modal Overlay & Content */
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
  z-index: 10000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.2s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-content h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-content p {
  margin: 0 0 24px 0;
  color: #475569;
  font-size: 15px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-modal {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-modal.cancel {
  background: #f1f5f9;
  color: #475569;
  border: 1.5px solid #e2e8f0;
}

.btn-modal.cancel:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.btn-modal.confirm {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-modal.confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Delete Modal */
.delete-modal-overlay {
  animation: fadeIn 0.2s ease-out;
  z-index: 10002;
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
  position: relative;
  z-index: 10003;
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
  content: '';
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
  .messages-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }

  .filters-grid {
    grid-template-columns: repeat(3, 1fr);
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
    grid-template-columns: repeat(2, 1fr);
  }

  .messages-grid {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-item.span-2 {
    grid-column: span 1;
  }

  .toolbar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }

  .btn-action {
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
  .header-content h2 {
    font-size: 20px;
  }

  .stats-row {
    grid-template-columns: 1fr;
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

  .message-card {
    border-radius: 12px;
  }

  .message-header,
  .message-body {
    padding: 16px;
  }

  .contact-info svg {
    width: 32px;
    height: 32px;
  }

  .contact-name {
    font-size: 14px;
  }
}

/* Detail Modal */
.detail-modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.detail-modal {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10001;
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
  background: #ffffff;
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

.phone-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.message-preview-full {
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

.source-detail {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* Status Badge */
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

.status-badge.ok {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.status-badge.info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-color: #93c5fd;
}

.status-badge.warn {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-color: #fcd34d;
}

/* Source Chips */
.source-chip {
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

.source-chip svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.source-chip.reminder {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-color: #93c5fd;
}

.source-chip.feedback {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border-color: #86efac;
}

.source-chip.recurrence {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border-color: #a5b4fc;
}

.source-chip.broadcast {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  color: #c2410c;
  border-color: #fb923c;
}

.source-chip.large {
  padding: 10px 16px;
  font-size: 14px;
}

.source-chip.large svg {
  width: 16px;
  height: 16px;
}

/* Media Content */
.media-content {
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
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #ffffff;
}
</style>