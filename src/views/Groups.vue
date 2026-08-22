<template>
  <div class="wrapper">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" />
            <path
              d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Kelola Grup WhatsApp
        </h2>
        <p class="subtitle">Join, kelola, dan monitor grup WhatsApp yang terhubung</p>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            role="img"
          >
            <!-- badan / bahu user utama -->
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <!-- kepala user utama -->
            <circle cx="9" cy="7" r="4" />
            <!-- badan / bahu user kedua (kanan) -->
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <!-- kepala user kedua (kanan) -->
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>

          <div>
            <div class="stat-value">{{ groupsMeta.totalGroups }}</div>
            <div class="stat-label">Total Grup</div>
          </div>
        </div>
        <div class="stat-card">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            role="img"
          >
            <!-- badan / bahu user utama -->
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <!-- kepala user utama -->
            <circle cx="9" cy="7" r="4" />
            <!-- badan / bahu user kedua (kanan) -->
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <!-- kepala user kedua (kanan) -->
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>

          <div>
            <div class="stat-value">{{ totalMembers }}</div>
            <div class="stat-label">Total Anggota</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <div>
            <div class="stat-value">{{ paginatedGroups.length }}</div>
            <div class="stat-label">Grup Ditampilkan</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Device Selection Card -->
    <section class="device-selection-card">
      <div class="card-header-section">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          Pilih Perangkat
        </h3>
      </div>
      <div class="device-selection">
        <div class="form-group device-dropdown">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            Perangkat
          </label>
          <select v-model="selectedDeviceId" @change="onDeviceChange">
            <option value="">Pilih Perangkat</option>
            <option v-for="d in devices" :key="d.id" :value="d.id">
              {{ d.name || d.id }} — {{ getDeviceStatusLabel(d) }}
            </option>
          </select>
        </div>
      </div>
      <div class="device-actions">
        <button
          @click="showJoinModal = true"
          :disabled="!selectedDeviceId"
          class="btn-action btn-join"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Join Grup
        </button>
        <button
          @click="handleSync"
          :disabled="loadingGroups || !selectedDeviceId"
          class="btn-action btn-sync"
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
          {{ loadingGroups ? "Menyinkronkan..." : "Sync Grup" }}
        </button>
        <button
          @click="loadGroups({ force: true })"
          :disabled="loadingGroups || !selectedDeviceId"
          class="btn-action btn-reload"
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
          {{ loadingGroups ? "Memuat..." : "Muat Ulang" }}
        </button>
      </div>
    </section>

    <!-- Groups List -->
    <section class="list-card" v-if="selectedDeviceId">
      <div class="card-header-section">
        <h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            role="img"
          >
            <!-- badan user utama -->
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />

            <!-- kepala user utama -->
            <circle cx="9" cy="7" r="4" />

            <!-- badan user kedua -->
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />

            <!-- kepala user kedua -->
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>

          Daftar Grup ({{ groupsMeta.totalGroups }})
        </h3>
      </div>

      <!-- Toolbar -->
      <div class="toolbar-section">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchQuery" placeholder="Cari nama grup atau ID..." />
        </div>
        <select v-model.number="pageSize" class="page-size-select">
          <option :value="10">10 per halaman</option>
          <option :value="25">25 per halaman</option>
          <option :value="50">50 per halaman</option>
          <option :value="100">100 per halaman</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loadingGroups" class="loading-state">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="spinning"
        >
          <path
            d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
          />
        </svg>
        <p>Memuat grup...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errGroups" class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>{{ errGroups }}</p>
        <button @click="loadGroups({ force: true })" class="btn-retry">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
            />
          </svg>
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredGroups.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="9" cy="7" r="4" />
        </svg>
        <h3>{{ searchQuery ? "Grup tidak ditemukan" : "Belum ada grup" }}</h3>
        <p>
          {{
            searchQuery
              ? "Coba kata kunci lain"
              : "Bergabung ke grup atau sync untuk memuat grup"
          }}
        </p>
      </div>

      <!-- Table View -->
      <div v-else class="table-container">
        <table class="groups-table">
          <thead>
            <tr>
              <th class="col-name">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <!-- badan user utama -->
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />

                  <!-- kepala user utama -->
                  <circle cx="9" cy="7" r="4" />

                  <!-- badan user kedua -->
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />

                  <!-- kepala user kedua -->
                  <path d="M16 3.13a4 4 0 1 1 0 7.75" />
                </svg>

                Nama Grup
              </th>
              <th class="col-members">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <!-- badan user utama -->
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />

                  <!-- kepala user utama -->
                  <circle cx="9" cy="7" r="4" />

                  <!-- badan user kedua -->
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />

                  <!-- kepala user kedua -->
                  <path d="M16 3.13a4 4 0 1 1 0 7.75" />
                </svg>

                Anggota
              </th>
              <th class="col-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in paginatedGroups" :key="group.value" class="group-row">
              <td class="col-name">
                <div class="group-name-cell">
                  <div class="group-avatar-small">
                    <CachedProfileImage
                      v-if="group.profilePicUrl"
                      :src="group.profilePicUrl"
                      :status="group.profilePictureStatus"
                      :alt="group.label"
                    />
                    <DefaultAvatar kind="group" />
                  </div>
                  <div class="group-name-text">
                    <span class="name-full">{{ group.label }}</span>
                  </div>
                </div>
              </td>
              <td class="col-members">
                <div class="members-badge">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <!-- badan user utama -->
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />

                    <!-- kepala user utama -->
                    <circle cx="9" cy="7" r="4" />

                    <!-- badan user kedua -->
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />

                    <!-- kepala user kedua -->
                    <path d="M16 3.13a4 4 0 1 1 0 7.75" />
                  </svg>

                  {{ group.meta?.participants || 0 }}
                </div>
              </td>
              <td class="col-actions">
                <div class="action-buttons">
                  <button
                    class="btn-chat-table"
                    @click="openGroupChat(group)"
                    title="Chat grup"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 3C6.49 3 2 6.81 2 11.5c0 2.66 1.45 5.13 3.91 6.74L4.7 21.46a.75.75 0 0 0 .96.96l4.02-1.51c.76.14 1.54.21 2.32.21 5.51 0 10-3.81 10-8.5S17.51 3 12 3Z" />
                      <circle cx="8" cy="12" r="1.15" fill="#ffffff" />
                      <circle cx="12" cy="12" r="1.15" fill="#ffffff" />
                      <circle cx="16" cy="12" r="1.15" fill="#ffffff" />
                    </svg>
                  </button>
                  <button
                    class="btn-leave-table"
                    @click="confirmLeaveGroup(group)"
                    title="Keluar dari Grup"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredGroups.length > 0" class="pagination">
        <div class="pagination-info">
          Menampilkan <strong>{{ startIndex + 1 }}</strong> -
          <strong>{{ endIndex }}</strong> dari
          <strong>{{ groupsMeta.totalGroups }}</strong> grup
        </div>
        <div class="pagination-controls">
          <button class="btn-page" :disabled="currentPage <= 1" @click="prevPage">
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
            :disabled="currentPage >= totalPages"
            @click="nextPage"
          >
            Berikutnya
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Empty Selection Card -->
    <div v-else class="empty-selection-card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
      <h3>Pilih Perangkat</h3>
      <p>Pilih perangkat di atas untuk melihat dan mengelola grup</p>
    </div>

    <!-- Join Group Modal -->
    <div v-if="showJoinModal" class="modal-overlay" @click.self="closeJoinModal">
      <div class="modal">
        <div class="modal-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Join Grup WhatsApp
          </h3>
          <button @click="closeJoinModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="handleJoinGroup">
          <div class="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Link Invite Grup *
            </label>
            <input
              v-model="inviteLink"
              type="text"
              placeholder="https://chat.whatsapp.com/xxxxx"
              required
            />
            <small class="help-text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Paste link invite grup WhatsApp (contoh: https://chat.whatsapp.com/xxxxx)
            </small>
          </div>

          <div v-if="joinError" class="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ joinError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeJoinModal" class="btn-cancel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Batal
            </button>
            <button
              type="submit"
              :disabled="!inviteLink || joiningGroup"
              class="btn-submit"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                v-if="!joiningGroup"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="spinning"
                v-else
              >
                <path
                  d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                />
              </svg>
              {{ joiningGroup ? "Joining..." : "Join Grup" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Leave Confirmation Modal -->
    <div
      v-if="showLeaveModal"
      class="modal-overlay delete-modal-overlay"
      @click.self="showLeaveModal = false"
    >
      <div class="delete-modal">
        <div class="delete-modal-icon">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 Z" />
            </svg>
          </div>
        </div>

        <div class="delete-modal-content">
          <h3>Keluar dari Grup?</h3>
          <p class="delete-warning">
            Anda yakin ingin keluar dari grup <strong>{{ selectedGroup?.label }}</strong
            >?
          </p>
          <p class="delete-warning">Anda perlu link invite untuk bergabung kembali.</p>
        </div>

        <div class="delete-modal-actions">
          <button
            type="button"
            @click="showLeaveModal = false"
            class="btn-keep"
            :disabled="loadingGroups"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Batal
          </button>
          <button
            type="button"
            @click="handleLeaveGroup"
            :disabled="loadingGroups"
            class="btn-delete-confirm"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              v-if="!loadingGroups"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="spinning"
              v-else
            >
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
              />
            </svg>
            {{ loadingGroups ? "Keluar..." : "Ya, Keluar" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { userApi } from "../api/http.js";
import { useToast } from "../composables/useToast";
import { useDevices } from "../composables/useDevices.js";
import { listenToGroupLeft, listenToGroupUpdates, listenToNewGroup } from "../api/socket.js";
import { cache } from "../utils/cache.js";
import CachedProfileImage from "../components/CachedProfileImage.vue";
import DefaultAvatar from "../components/DefaultAvatar.vue";
import { getDeviceStatusLabel } from "../utils/deviceStatus.js";

// ✅ Destructure fungsi yang benar dari useToast
const { success: showSuccess, error: showError } = useToast();
const router = useRouter();

// State
const groups = ref([]);
const {
  availableDevices: devices,
  selectedDeviceId,
  loadDevices: fetchDevices,
  selectDevice,
} = useDevices();
const loadingGroups = ref(false);
const errGroups = ref("");
const searchQuery = ref("");
const showJoinModal = ref(false);
const showLeaveModal = ref(false);
const inviteLink = ref("");
const joinError = ref("");
const joiningGroup = ref(false);
const selectedGroup = ref(null);

// Pagination
const currentPage = ref(1);
const pageSize = ref(25);
const groupsMeta = ref({
  totalGroups: 0,
  totalMembers: 0,
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
});
let latestGroupsRequest = 0;
let groupSearchTimer;
let groupRefreshTimer;
let groupSocketCleanups = [];

// Computed
const filteredGroups = computed(() => groups.value);
const totalPages = computed(() => Math.max(1, Number(groupsMeta.value.totalPages || 1)));

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value;
});

const endIndex = computed(() => {
  return Math.min(
    startIndex.value + groups.value.length,
    Number(groupsMeta.value.totalGroups || groups.value.length),
  );
});

const paginatedGroups = computed(() => {
  return filteredGroups.value;
});

const totalMembers = computed(() => {
  return Number(groupsMeta.value.totalMembers || 0);
});

watch(searchQuery, () => {
  currentPage.value = 1;
  if (groupSearchTimer) clearTimeout(groupSearchTimer);
  groupSearchTimer = setTimeout(() => loadGroups(), 250);
});

watch(pageSize, () => {
  currentPage.value = 1;
  void loadGroups();
});

// Methods
const onDeviceChange = () => {
  selectDevice(selectedDeviceId.value);
  currentPage.value = 1;
  
  // ✅ Dispatch custom event untuk Dashboard.vue
  window.dispatchEvent(new Event('deviceChanged'));
  
  setupGroupRealtime(selectedDeviceId.value);
  loadGroups();
};

const cleanupGroupRealtime = () => {
  groupSocketCleanups.forEach((cleanup) => cleanup?.());
  groupSocketCleanups = [];
};

const setupGroupRealtime = (deviceId) => {
  cleanupGroupRealtime();
  if (!deviceId) return;

  const scheduleRefresh = () => {
    if (groupRefreshTimer) clearTimeout(groupRefreshTimer);
    groupRefreshTimer = setTimeout(
      () => loadGroups({ force: true, silent: true }),
      200,
    );
  };

  groupSocketCleanups = [
    listenToGroupUpdates(deviceId, scheduleRefresh),
    listenToNewGroup(deviceId, scheduleRefresh),
    listenToGroupLeft(deviceId, scheduleRefresh),
  ];
};

const loadGroups = async ({ force = false, silent = false } = {}) => {
  if (!selectedDeviceId.value) {
    groups.value = [];
    groupsMeta.value = {
      totalGroups: 0,
      totalMembers: 0,
      currentPage: 1,
      totalPages: 1,
      hasMore: false,
    };
    return;
  }

  const requestId = ++latestGroupsRequest;
  const cacheKey = [
    'groups-page',
    selectedDeviceId.value,
    currentPage.value,
    pageSize.value,
    searchQuery.value.trim().toLocaleLowerCase(),
  ].join(':');
  const cached = force ? null : cache.get(cacheKey);
  if (cached) {
    groups.value = cached.groups;
    groupsMeta.value = cached.metadata;
  }

  loadingGroups.value = !cached && !silent;
  errGroups.value = "";

  try {
    const { data } = await userApi.get(
      `/whatsapp-groups/device/${selectedDeviceId.value}/active`,
      {
        params: {
          page: currentPage.value,
          pageSize: pageSize.value,
          ...(searchQuery.value.trim() ? { q: searchQuery.value.trim() } : {}),
        },
      },
    );

    if (requestId !== latestGroupsRequest) return;

    // console.log('Raw API Response:', data); // Debug log

    if (data && data.status && Array.isArray(data.data)) {
      // Transform data to ensure label and value exist
      groups.value = data.data.map((group) => {
        // console.log("Processing group:", group); // Debug individual group

        // Try different possible field names for group name
        const groupName =
          group.name ||
          group.subject ||
          group.label ||
          group.groupName ||
          group.title ||
          "Unknown Group";

        // Try different possible field names for group ID
        const groupId = group.id || group.groupId || group.value || group._id || "";

        // Try different possible field names for participants
        let participantCount = 0;
        if (group.participants) {
          participantCount = Array.isArray(group.participants)
            ? group.participants.length
            : group.participants;
        } else if (group.participantCount !== undefined) {
          participantCount = group.participantCount;
        } else if (group.meta?.participants !== undefined) {
          participantCount = group.meta.participants;
        } else if (group.size !== undefined) {
          participantCount = group.size;
        }

        // Try different possible field names for profile picture
        const profilePicUrl =
          group.profilePicUrl ||
          group.pictureUrl ||
          group.picture ||
          group.avatar ||
          group.imgUrl ||
          null;

        return {
          label: groupName,
          value: groupId,
          profilePicUrl: profilePicUrl,
          profilePictureStatus: group.profilePictureStatus || "pending",
          meta: {
            participants: participantCount,
          },
          // Keep original data for reference
          _original: group,
        };
      });

      groupsMeta.value = {
        totalGroups: Number(data.metadata?.totalGroups || groups.value.length),
        totalMembers: Number(data.metadata?.totalMembers || 0),
        currentPage: Number(data.metadata?.currentPage || currentPage.value),
        totalPages: Math.max(1, Number(data.metadata?.totalPages || 1)),
        hasMore: Boolean(data.metadata?.hasMore),
      };
      cache.set(cacheKey, { groups: groups.value, metadata: groupsMeta.value }, 60);

      // console.log("Transformed groups:", groups.value); // Debug log
      // console.log("First group sample:", groups.value[0]); // Debug first group
    } else {
      // console.log("Invalid data structure:", data);
      if (!cached) groups.value = [];
    }
  } catch (error) {
    console.error("Error loading groups:", error);
    errGroups.value = error?.response?.data?.message || "Gagal memuat grup";
    if (!cached) groups.value = [];
  } finally {
    if (requestId === latestGroupsRequest) loadingGroups.value = false;
  }
};

const openGroupChat = (group) => {
  if (!selectedDeviceId.value || !group?.value) {
    showError("Pilih perangkat dan pastikan grup valid");
    return;
  }

  const conversationJid = String(group.value).includes("@")
    ? String(group.value)
    : `${group.value}@g.us`;
  void router.push({
    name: "inbox",
    query: {
      device: selectedDeviceId.value,
      conversation: conversationJid,
      displayName: group.label || "Grup WhatsApp",
      isGroup: "true",
      profilePicUrl: group.profilePicUrl || "",
      returnTo: "groups",
    },
  });
};

const handleSync = async () => {
  if (!selectedDeviceId.value) {
    showError("Pilih perangkat terlebih dahulu");
    return;
  }

  loadingGroups.value = true;

  try {
    const { data } = await userApi.post(
      `/whatsapp-groups/device/${selectedDeviceId.value}/sync`
    );

    if (data && data.status) {
      showSuccess(data.message || "Grup berhasil disinkronkan!");
      await loadGroups({ force: true });
    } else {
      throw new Error(data?.message || "Gagal sinkronisasi grup");
    }
  } catch (error) {
    console.error("Error syncing groups:", error);
    showError(
      error?.response?.data?.message || error.message || "Gagal sinkronisasi grup"
    );
  } finally {
    loadingGroups.value = false;
  }
};

const closeJoinModal = () => {
  showJoinModal.value = false;
  inviteLink.value = "";
  joinError.value = "";
};

const handleJoinGroup = async () => {
  if (!inviteLink.value) {
    joinError.value = "Link invite harus diisi";
    return;
  }

  if (!selectedDeviceId.value) {
    joinError.value = "Pilih perangkat terlebih dahulu";
    return;
  }

  // Validasi format link
  const inviteLinkPattern = /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/;
  if (!inviteLinkPattern.test(inviteLink.value)) {
    joinError.value =
      "Format link invite tidak valid. Gunakan link dari WhatsApp (contoh: https://chat.whatsapp.com/xxxxx)";
    return;
  }

  joinError.value = "";
  joiningGroup.value = true;

  try {
    // Extract invite code from link
    const inviteCode = inviteLink.value.split("chat.whatsapp.com/")[1];

    const { data } = await userApi.post(
      `/whatsapp-groups/device/${selectedDeviceId.value}/join`,
      {
        inviteLink: inviteLink.value,
        inviteCode: inviteCode,
      }
    );

    if (data && data.status) {
      showSuccess(data.message || "Berhasil join grup!");
      closeJoinModal();
      // Reload groups after successful join
      await loadGroups({ force: true });
    } else {
      throw new Error(data?.message || "Gagal join grup");
    }
  } catch (error) {
    console.error("Error joining group:", error);
    let errorMsg = "Gagal join grup";

    if (error?.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error?.response?.status === 404) {
      errorMsg =
        "WhatsApp session tidak ditemukan. Silakan sambungkan WhatsApp terlebih dahulu.";
    } else if (error?.response?.status === 400) {
      errorMsg = "Link invite tidak valid atau grup tidak ditemukan.";
    } else if (error?.message) {
      errorMsg = error.message;
    }

    joinError.value = errorMsg;
    showError(errorMsg);
  } finally {
    joiningGroup.value = false;
  }
};

const confirmLeaveGroup = (group) => {
  selectedGroup.value = group;
  showLeaveModal.value = true;
};

const handleLeaveGroup = async () => {
  if (!selectedGroup.value || !selectedDeviceId.value) return;

  // console.log("=== ATTEMPTING TO LEAVE GROUP ===");
  // console.log("Selected Group:", selectedGroup.value);
  // console.log("Group JID:", selectedGroup.value.value);
  // console.log("Device ID:", selectedDeviceId.value);

  // Validate Group JID format
  const groupJid = selectedGroup.value.value;
  if (!groupJid || !groupJid.includes("@g.us")) {
    console.error("Invalid Group JID format:", groupJid);
    showError(
      "Format Group ID tidak valid. Pastikan ini adalah grup WhatsApp yang valid."
    );
    return;
  }

  loadingGroups.value = true;

  try {
    // console.log(
    //   "Sending leave request to:",
    //   `/whatsapp-groups/device/${selectedDeviceId.value}/leave/${groupJid}`
    // );

    const { data } = await userApi.post(
      `/whatsapp-groups/device/${selectedDeviceId.value}/leave/${groupJid}`
    );

    // console.log("Leave response:", data);

    if (data && data.status) {
      showSuccess(
        data.message || `Berhasil keluar dari grup ${selectedGroup.value.label}`
      );
      showLeaveModal.value = false;
      selectedGroup.value = null;

      // console.log("Waiting 2 seconds before reloading groups...");
      // Wait a bit for WhatsApp to sync
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reload groups after leaving
      // console.log("Reloading groups...");
      await loadGroups({ force: true });
      // console.log("Groups reloaded successfully");
    } else {
      throw new Error(data?.message || "Gagal keluar dari grup");
    }
  } catch (error) {
    console.error("=== ERROR LEAVING GROUP ===");
    console.error("Error object:", error);
    console.error("Error response:", error?.response);
    console.error("Error data:", error?.response?.data);

    let errorMsg = "Gagal keluar dari grup";

    if (error?.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error?.message) {
      errorMsg = error.message;
    }

    showError(errorMsg);
  } finally {
    loadingGroups.value = false;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    void loadGroups();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    void loadGroups();
  }
};

// Lifecycle
onMounted(async () => {
  await fetchDevices();
  if (selectedDeviceId.value) {
    setupGroupRealtime(selectedDeviceId.value);
    await loadGroups();
  }
});

onUnmounted(() => {
  cleanupGroupRealtime();
  if (groupSearchTimer) clearTimeout(groupSearchTimer);
  if (groupRefreshTimer) clearTimeout(groupRefreshTimer);
});

</script>

<style scoped>
/* Base Styles - sama dengan Contacts */
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
  color: var(--theme-text);
}

.header-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
  stroke-width: 2.5;
}

.subtitle {
  margin: 0;
  color: var(--theme-text-muted);
  font-size: 15px;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--theme-gradient-surface);
  border: 1px solid var(--theme-border);
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
  border-color: var(--theme-border-strong);
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
  color: var(--theme-text);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--theme-text-muted);
  margin-top: 4px;
}

/* Device Selection Card */
.device-selection-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.device-selection {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 250px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-text-secondary);
}

.form-group label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.form-group select {
  padding: 12px 14px;
  border: 1.5px solid var(--theme-border);
  border-radius: 10px;
  font-size: 14px;
  background: var(--theme-surface-soft);
  transition: all 0.2s ease;
  cursor: pointer;
}

.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  background: var(--theme-surface);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.device-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.page-size-select {
  padding: 10px 14px;
  border: 1.5px solid var(--theme-border);
  border-radius: 10px;
  font-size: 13px;
  background: var(--theme-surface-soft);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  min-width: 160px;
}

.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: var(--theme-surface);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Empty Selection Card */
.empty-selection-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  background: var(--theme-gradient-surface);
  border: 2px dashed var(--theme-border-strong);
  border-radius: 16px;
  text-align: center;
  margin-bottom: 24px;
}

.empty-selection-card svg {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-selection-card h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--theme-text-secondary);
}

.empty-selection-card p {
  margin: 0;
  color: var(--theme-text-muted);
  font-size: 14px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--theme-surface-soft);
  border: 1.5px solid var(--theme-border);
  border-radius: 12px;
  gap: 16px;
}

.pagination-info {
  color: var(--theme-text-muted);
  font-size: 14px;
}

.pagination-info strong {
  color: var(--theme-text);
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
  background: var(--theme-surface);
  color: var(--theme-text-secondary);
  border: 1.5px solid var(--theme-border);
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: var(--theme-surface-soft);
  border-color: var(--theme-border-strong);
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

/* Actions Card */
.actions-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
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
  border-bottom: 1px solid var(--theme-border);
}

.card-header-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-text);
}

.card-header-section h3 svg {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

.actions-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 180px;
  justify-content: center;
}

.btn-action svg {
  width: 18px;
  height: 18px;
}

.btn-join {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-join:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-sync {
  background: var(--theme-gradient-success);
  color: var(--theme-success-text);
  border-color: var(--theme-success-border);
}

.btn-sync:hover:not(:disabled) {
  background: var(--theme-gradient-success);
  transform: translateY(-1px);
}

.btn-reload {
  background: var(--theme-gradient-neutral);
  color: var(--theme-text-secondary);
  border-color: var(--theme-border-strong);
}

.btn-reload:hover:not(:disabled) {
  background: var(--theme-gradient-neutral-hover);
  transform: translateY(-1px);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* List Card */
.list-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  color: var(--theme-text-muted);
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1.5px solid var(--theme-border);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: var(--theme-surface-soft);
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  background: var(--theme-surface);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  background: var(--theme-gradient-surface);
  border: 2px dashed var(--theme-border-strong);
  border-radius: 16px;
  text-align: center;
}

.loading-state svg,
.error-state svg,
.empty-state svg {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.loading-state p,
.error-state p,
.empty-state p {
  margin: 0;
  color: var(--theme-text-muted);
  font-size: 14px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--theme-text-secondary);
}

.btn-retry {
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
  margin-top: 16px;
  transition: all 0.2s ease;
}

.btn-retry:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-retry svg {
  width: 18px;
  height: 18px;
}

/* Table */
.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
}

.groups-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--theme-surface);
  border: 1.5px solid var(--theme-border);
  border-radius: 12px;
  overflow: hidden;
}

.groups-table thead {
  background: var(--theme-gradient-surface);
}

.groups-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--theme-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--theme-border);
  white-space: nowrap;
}

.groups-table th svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
  vertical-align: middle;
  margin-right: 6px;
  flex-shrink: 0;
}

.groups-table tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--theme-border);
}

.groups-table tbody tr:last-child {
  border-bottom: none;
}

.groups-table tbody tr:hover {
  background: var(--theme-surface-soft);
}

.groups-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: var(--theme-text);
  vertical-align: middle;
}

/* Table Columns */
.groups-table .col-name {
  min-width: 280px;
}

.groups-table .col-members {
  min-width: 120px;
}

.groups-table .col-actions {
  width: 120px;
  text-align: center;
}

/* Group Name Cell */
.group-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--theme-gradient-info);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.group-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

.group-avatar-small svg {
  width: 20px;
  height: 20px;
  color: #1e40af;
  position: relative;
  z-index: 1;
}

.group-name-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name-full {
  font-weight: 600;
  color: var(--theme-text);
  font-size: 14px;
}

/* Members Badge */
.members-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: var(--theme-gradient-info);
  color: #4338ca;
  border: 1px solid #a5b4fc;
}

.members-badge svg {
  width: 14px;
  height: 14px;
}

/* ID Text */
.id-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--theme-text-secondary);
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-chat-table,
.btn-leave-table {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-chat-table {
  color: #047857;
  background: linear-gradient(135deg, #d1fae5 0%, #99f6e4 100%);
  border: 1px solid rgba(16, 185, 129, 0.28);
  box-shadow: 0 2px 5px rgba(16, 185, 129, 0.16);
}

.btn-chat-table:hover {
  background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.28);
}

:global(html.dark) .btn-chat-table {
  color: #6ee7b7;
  background: rgba(5, 150, 105, 0.16);
  border-color: rgba(110, 231, 183, 0.34);
  box-shadow: none;
}

:global(html.dark) .btn-chat-table:hover {
  color: #a7f3d0;
  background: rgba(5, 150, 105, 0.28);
}

.btn-leave-table {
  background: var(--theme-gradient-danger);
}

.btn-leave-table:hover {
  background: var(--theme-gradient-danger);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.btn-chat-table svg,
.btn-leave-table svg {
  width: 18px;
  height: 18px;
}

.btn-chat-table svg {
  color: currentColor;
}

.btn-leave-table svg {
  color: #dc2626;
}

/* Modal - sama dengan Contacts */
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

.modal {
  background: var(--theme-surface);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid var(--theme-border);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--theme-text);
}

.modal-header h3 svg {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--theme-surface-soft);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--theme-surface-hover);
  transform: scale(1.1);
}

.close-btn svg {
  width: 18px;
  height: 18px;
  color: var(--theme-text-secondary);
}

.modal form {
  padding: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-text-secondary);
}

.form-group label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.form-group input {
  padding: 12px 14px;
  border: 1.5px solid var(--theme-border);
  border-radius: 10px;
  font-size: 14px;
  background: var(--theme-surface-soft);
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background: var(--theme-surface);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--theme-text-muted);
  font-style: normal;
}

.help-text svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: var(--theme-text-muted);
}

.error-message {
  padding: 12px 14px;
  background: var(--theme-gradient-danger);
  color: var(--theme-danger-text);
  border: 1px solid var(--theme-danger-border);
  border-radius: 10px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.error-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--theme-border);
}

.btn-cancel,
.btn-submit {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: var(--theme-gradient-neutral);
  color: var(--theme-text-secondary);
  border-color: var(--theme-border-strong);
}

.btn-cancel:hover {
  background: var(--theme-gradient-neutral-hover);
  transform: translateY(-1px);
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel svg,
.btn-submit svg {
  width: 18px;
  height: 18px;
}

/* Delete Modal */
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
  background: var(--theme-surface);
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
  background: var(--theme-gradient-danger);
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
  background: var(--theme-gradient-danger);
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
  color: var(--theme-text);
}

.delete-warning {
  margin: 0 0 12px 0;
  color: var(--theme-text-muted);
  font-size: 14px;
  line-height: 1.6;
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
  background: var(--theme-gradient-neutral);
  color: var(--theme-text-secondary);
  border: 1.5px solid var(--theme-border-strong);
}

.btn-keep:hover:not(:disabled) {
  background: var(--theme-gradient-neutral-hover);
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

/* Responsive */
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

  .actions-row {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
    min-width: unset;
  }

  .toolbar-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
    min-width: unset;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
    gap: 12px;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .pagination-info {
    text-align: center;
    line-height: 1.5;
  }

  .pagination-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  .pagination-controls .page-indicator {
    grid-column: 1 / -1;
    grid-row: 1;
    justify-self: center;
  }

  .pagination-controls .btn-page {
    grid-row: 2;
    width: 100%;
    min-width: 0;
    justify-content: center;
    padding: 9px 8px;
    box-sizing: border-box;
    white-space: nowrap;
  }

  .pagination-controls .btn-page svg {
    flex-shrink: 0;
  }

  .modal {
    max-width: 90%;
  }

  .delete-modal {
    padding: 24px;
    max-width: 90%;
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
</style>
