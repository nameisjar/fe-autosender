<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="currentColor"
              stroke-width="2"
            />
            <polyline
              points="22,6 12,13 2,6"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          Pesan Masuk
        </h2>
        <p class="subtitle">Lihat semua pesan masuk dari WhatsApp</p>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <div>
            <div class="stat-value">{{ meta.totalMessages || messages.length }}</div>
            <div class="stat-label">Total Pesan</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <div>
            <div class="stat-value">{{ devices.length }}</div>
            <div class="stat-label">Perangkat</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <div class="stat-value">{{ todayCount }}</div>
            <div class="stat-label">Hari Ini</div>
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
          <input v-model="q" placeholder="Cari pesan atau pengirim..." />
        </div>

        <div class="filter-group">
          <select
            v-model="selectedDeviceId"
            @change="onDeviceChange"
            class="filter-select"
          >
            <option value="">📱 Pilih Perangkat</option>
            <option v-for="d in devices" :key="d.id" :value="d.id">
              {{ d.name || d.id }} — {{ getDeviceStatusLabel(d) }}
            </option>
          </select>

          <select
            v-model.number="pageSize"
            @change="onPageSizeChange"
            class="filter-select"
            title="Jumlah baris per halaman"
          >
            <option :value="10">10 baris</option>
            <option :value="25">25 baris</option>
            <option :value="50">50 baris</option>
          </select>
        </div>

        <button class="btn-reload" @click="loadMessages" :disabled="loading || !selectedDeviceId">
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

        <button
          class="btn-delete-all"
          @click="confirmDeleteAll"
          :disabled="loading || !selectedDeviceId || conversations.length === 0"
          title="Hapus semua pesan masuk dan keluar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Hapus Semua
        </button>
      </div>
    </div>

    <!-- Messages Table -->
    <div class="table-container" v-if="selectedDeviceId || isOpeningNavigationTarget">
      <div v-if="loading || isOpeningNavigationTarget" class="loading-state">
        <div class="spinner"></div>
        <p>{{ isOpeningNavigationTarget ? 'Membuka percakapan...' : 'Memuat pesan masuk...' }}</p>
      </div>

      <div v-else-if="conversations.length > 0" class="messages-list">
        <div
          v-for="conv in conversations"
          :key="conv.from"
          class="message-item"
          :class="{ 'is-group': conv.isGroup }"
          @click="viewConversation(conv)"
        >
          <div class="message-avatar">
            <!-- Personal chat with profile picture -->
            <img
              v-if="getConversationAvatar(conv)"
              :src="getConversationAvatar(conv)"
              class="avatar-image"
              referrerpolicy="no-referrer"
              @error="(e) => handleAvatarError(conv, e)"
            />
            <!-- Fallback avatar circle -->
            <div
              v-else
              class="avatar-circle"
              :style="{ backgroundColor: conv.contact?.colorCode || getRandomColor(conv.from) }"
            >
              <span v-if="conv.contact">
                {{ getInitials(conv.contact.firstName, conv.contact.lastName) }}
              </span>
              <span v-else-if="conv.isGroup && conv.groupName">
                {{ getInitials(conv.groupName) }}
              </span>
              <span v-else-if="conv.pushName">
                {{ getInitials(conv.pushName) }}
              </span>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div v-if="conv.isGroup" class="group-badge" title="Pesan Grup">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div class="message-content">
            <div class="message-header">
              <div class="sender-identity">
                <div class="sender-name-row">
                  <span class="sender-name">
                    {{ getSenderName(conv) }}
                  </span>
                  <div v-if="getConversationLabels(conv).length" class="conversation-labels compact-labels">
                    <span
                      class="conversation-label-chip"
                      :title="getConversationLabels(conv)[0]"
                    >
                      {{ getConversationLabels(conv)[0] }}
                    </span>
                    <span
                      v-if="getConversationLabels(conv).length > 1"
                      class="conversation-label-chip label-overflow"
                      :title="getConversationLabels(conv).slice(1).join(', ')"
                    >
                      +{{ getConversationLabels(conv).length - 1 }}
                    </span>
                  </div>
                </div>
                <span v-if="getConversationPhone(conv)" class="sender-phone">
                  {{ getConversationPhone(conv) }}
                </span>
              </div>
              <div class="message-header-right">
                <span class="message-time">{{ formatTime(conv.latestMessage.receivedAt) }}</span>
                <!-- Unread badge -->
                <span v-if="conv.unreadCount > 0" class="unread-badge">
                  {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
                </span>
              </div>
            </div>
            <div class="message-preview">
              {{ getMessagePreview(conv.latestMessage) }}
            </div>
            <div v-if="conv.messageCount > 1" class="message-meta">
              <span class="message-count">
                {{ conv.messageCount }} pesan
              </span>
            </div>
          </div>
          <button
            class="btn-delete-conv"
            @click.stop="confirmDeleteConversation(conv)"
            title="Hapus percakapan ini"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <h3>{{ q ? 'Tidak Ada Hasil' : 'Belum Ada Pesan Masuk' }}</h3>
        <p>
          {{ q ? 'Tidak ada pesan yang cocok dengan pencarian Anda' : 'Pesan masuk akan muncul di sini' }}
        </p>
      </div>

      <div v-if="meta.totalConversations > 0" class="pagination">
        <div class="pagination-info">
          Menampilkan <strong>{{ paginationStart }}-{{ paginationEnd }}</strong> dari
          <strong>{{ meta.totalConversations }}</strong> percakapan
        </div>
        <div class="pagination-controls">
          <button class="btn-page" :disabled="page <= 1 || loading" @click="goPrev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span class="pagination-label">Sebelumnya</span>
          </button>
          <button
            v-for="pageNumber in visiblePageNumbers"
            :key="pageNumber"
            class="btn-page page-number"
            :class="{ active: pageNumber === page }"
            :disabled="loading"
            @click="goToPage(pageNumber)"
          >
            {{ pageNumber }}
          </button>
          <button class="btn-page" :disabled="!meta.hasMore || loading" @click="goNext">
            <span class="pagination-label">Berikutnya</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-selection-card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
      <h3>Pilih Perangkat</h3>
      <p>Pilih perangkat di toolbar untuk melihat pesan masuk</p>
    </div>

    <!-- Message Detail Modal -->
    <Transition name="inbox-modal">
      <div
        v-if="selectedConversation"
        class="modal-overlay"
        :class="{ 'modal-overlay--opening-navigation': isOpeningNavigationTarget }"
        @click="closeConversation"
      >
      <div
        class="modal conversation-modal"
        :class="{ 'conversation-modal--fullscreen': isConversationFullscreen }"
        @click.stop
        @dragenter.prevent="handleConversationDragEnter"
        @dragover.prevent="handleConversationDragOver"
        @dragleave.prevent="handleConversationDragLeave"
        @drop.prevent="handleConversationDrop"
      >
        <div v-if="isDraggingAttachment" class="attachment-drop-overlay" aria-hidden="true">
          <div class="attachment-drop-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3v12" />
              <path d="m7 8 5-5 5 5" />
              <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
            </svg>
            <strong>Lepaskan file untuk dilampirkan</strong>
            <span>File akan dipreview sebelum dikirim</span>
          </div>
        </div>

        <div class="modal-header">
          <div class="modal-header-info">
            <!-- Personal chat with profile picture -->
            <img
              v-if="getConversationAvatar(selectedConversation)"
              :src="getConversationAvatar(selectedConversation)"
              class="avatar-image modal-avatar"
              referrerpolicy="no-referrer"
              @error="(e) => handleAvatarError(selectedConversation, e)"
            />
            <!-- Fallback avatar circle -->
            <div
              v-else
              class="avatar-circle"
              :style="{ backgroundColor: selectedConversation.contact?.colorCode || getRandomColor(selectedConversation.from) }"
            >
              <span v-if="selectedConversation.contact">
                {{ getInitials(selectedConversation.contact.firstName, selectedConversation.contact.lastName) }}
              </span>
              <span v-else-if="selectedConversation.isGroup && selectedConversation.groupName">
                {{ getInitials(selectedConversation.groupName) }}
              </span>
              <span v-else-if="selectedConversation.pushName">
                {{ getInitials(selectedConversation.pushName) }}
              </span>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div class="modal-identity">
              <div class="modal-name-row">
                <h3>{{ getSenderName(selectedConversation) }}</h3>
                <div
                  v-if="getConversationLabels(selectedConversation).length"
                  class="conversation-labels modal-labels"
                >
                  <span
                    v-for="label in getConversationLabels(selectedConversation).slice(0, 2)"
                    :key="label"
                    class="conversation-label-chip"
                    :title="label"
                  >
                    {{ label }}
                  </span>
                  <span
                    v-if="getConversationLabels(selectedConversation).length > 2"
                    class="conversation-label-chip label-overflow"
                    :title="getConversationLabels(selectedConversation).slice(2).join(', ')"
                  >
                    +{{ getConversationLabels(selectedConversation).length - 2 }}
                  </span>
                </div>
              </div>
              <span v-if="getConversationPhone(selectedConversation)" class="modal-phone">
                {{ getConversationPhone(selectedConversation) }}
              </span>
              <span class="modal-subtitle">{{ selectedConversation.messageCount }} pesan</span>
            </div>
          </div>
          <div class="modal-header-actions">
            <button
              v-if="canAddSelectedConversationContact"
              type="button"
              class="btn-add-contact"
              title="Simpan nomor ini ke Kontak"
              aria-label="Tambah ke kontak"
              @click="openAddContactModal"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="16" y1="11" x2="22" y2="11" />
              </svg>
              <span>Tambah Kontak</span>
            </button>
            <button
              type="button"
              class="btn-close btn-fullscreen"
              :title="isConversationFullscreen ? 'Kembali ke ukuran normal' : 'Perbesar percakapan'"
              :aria-label="isConversationFullscreen ? 'Kembali ke ukuran normal' : 'Perbesar percakapan'"
              @click="isConversationFullscreen = !isConversationFullscreen"
            >
              <svg v-if="!isConversationFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="10" y1="14" x2="3" y2="21" />
                <line x1="14" y1="10" x2="21" y2="3" />
              </svg>
            </button>
            <button type="button" class="btn-close" title="Tutup percakapan" aria-label="Tutup percakapan" @click="closeConversation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div class="modal-body chat-body">
          <div
            v-if="isPreparingConversation"
            class="conversation-sync-indicator"
            role="status"
            aria-live="polite"
          >
            <span class="conversation-opening-spinner" aria-hidden="true"></span>
            <span>Memperbarui...</span>
          </div>
          <div
            class="chat-messages"
            :class="{ 'chat-messages--positioning': !isConversationViewportReady }"
            ref="chatMessagesContainer"
            @scroll.passive="handleConversationScroll"
            @wheel.passive="takeConversationScrollControl"
            @touchstart.passive="takeConversationScrollControl"
          >
            <div v-if="loadingOlderMessages" class="history-loading" role="status">
              <span class="conversation-opening-spinner" aria-hidden="true"></span>
              <span>Memuat pesan lama...</span>
            </div>
            <button
              v-else-if="conversationHasMoreHistory"
              type="button"
              class="load-older-messages"
              @click="loadOlderConversationMessages"
            >
              Muat pesan sebelumnya
            </button>
            <!-- All messages (incoming + outgoing) sorted by timestamp -->
            <div
              v-for="msg in allMessages"
              :key="msg.pkId || msg.tempId"
              class="chat-bubble"
              :class="[
                msg.type === 'incoming' ? 'incoming' : 'outgoing',
                { 'message-target-highlight': highlightedMessageId === getMessageDomId(msg) },
              ]"
              :data-message-id="getMessageDomId(msg)"
            >
              <div class="bubble-content">
                <!-- Sender name for group incoming messages -->
                <div v-if="msg.type === 'incoming' && selectedConversation.isGroup" class="bubble-sender">
                  <span>{{ msg.pushName || 'Tidak dikenal' }}</span>
                  <span v-if="getMessageSenderPhone(msg)" class="bubble-sender-phone">
                    {{ getMessageSenderPhone(msg) }}
                  </span>
                </div>
                
                <!-- Incoming WhatsApp sticker (static or animated WebP) -->
                <img
                  v-if="isStickerMessage(msg) && msg.mediaPath && !hasMediaFailed(msg)"
                  :src="mediaThumbnailUrl(msg.mediaPath)"
                  alt="Stiker"
                  class="sticker-message"
                  loading="lazy"
                  @load="handleConversationMediaLoaded"
                  @error="handleStickerError($event, msg)"
                />

                <img
                  v-else-if="isImageMedia(msg) && !hasMediaFailed(msg)"
                  :src="mediaThumbnailUrl(msg.mediaPath)"
                  alt="Gambar WhatsApp"
                  class="chat-image"
                  loading="lazy"
                  decoding="async"
                  @load="handleConversationMediaLoaded"
                  role="button"
                  tabindex="0"
                  title="Klik untuk memperbesar gambar"
                  @click="openImagePreview(msg, $event)"
                  @keydown.enter.prevent="openImagePreview(msg, $event)"
                  @keydown.space.prevent="openImagePreview(msg, $event)"
                  @error="handleMediaError($event, msg)"
                />

                <template v-else-if="isVideoMedia(msg)">
                  <video
                    v-if="isMediaActivated(msg) && !hasMediaFailed(msg)"
                    :src="mediaUrl(msg.mediaPath)"
                    class="chat-video"
                    controls
                    autoplay
                    preload="metadata"
                    @loadedmetadata="handleConversationMediaLoaded"
                    @error="handleMediaError($event, msg)"
                  ></video>
                  <button v-else type="button" class="media-load-button" :disabled="hasMediaFailed(msg)" @click="activateMedia(msg)">
                    {{ hasMediaFailed(msg) ? 'Video tidak tersedia' : 'Putar video' }}
                  </button>
                </template>

                <template v-else-if="isAudioMedia(msg)">
                  <audio
                    v-if="isMediaActivated(msg) && !hasMediaFailed(msg)"
                    :src="mediaUrl(msg.mediaPath)"
                    class="chat-audio"
                    controls
                    autoplay
                    preload="metadata"
                    @loadedmetadata="handleConversationMediaLoaded"
                    @error="handleMediaError($event, msg)"
                  ></audio>
                  <button v-else type="button" class="media-load-button" :disabled="hasMediaFailed(msg)" @click="activateMedia(msg)">
                    {{ hasMediaFailed(msg) ? 'Audio tidak tersedia' : 'Putar audio' }}
                  </button>
                </template>

                <a
                  v-else-if="isDocumentMedia(msg)"
                  :href="mediaUrl(msg.mediaPath)"
                  class="chat-document"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{{ getMediaFileName(msg) }}</span>
                </a>

                <div v-if="isDeletedForEveryone(msg)" class="deleted-message-notice">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
                  </svg>
                  <em>Pesan ini telah dihapus</em>
                </div>

                <!-- Message text -->
                <div v-else-if="getVisibleMessageText(msg)" class="bubble-text">
                  {{ getVisibleMessageText(msg) }}
                </div>
                
                <!-- Time with status for outgoing -->
                <div class="bubble-time">
                  <!-- Status icons for outgoing messages -->
                  <template v-if="msg.type === 'outgoing' && !isDeletedForEveryone(msg)">
                    <!-- Loading icon for sending/pending -->
                    <svg v-if="msg.status === 'sending'" class="status-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>

                    <!-- Local handoff succeeded; waiting for WhatsApp server ACK -->
                    <svg v-else-if="msg.status === 'submitted'" class="status-icon checkmark-submitted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-label="Diserahkan ke WhatsApp, menunggu konfirmasi server">
                      <title>Diserahkan ke WhatsApp, menunggu konfirmasi server</title>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    
                    <!-- Single checkmark for server_ack (terkirim ke server) -->
                    <svg v-else-if="msg.status === 'server_ack'" class="status-icon checkmark-single" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    
                    <!-- Double checkmark (gray) for delivery_ack (terkirim ke penerima) -->
                    <svg v-else-if="msg.status === 'delivery_ack'" class="status-icon checkmark-double" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="16 6 5 17 0 12" />
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    
                    <!-- Double checkmark (blue) for read (dibaca penerima) -->
                    <svg v-else-if="msg.status === 'read'" class="status-icon checkmark-double-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="16 6 5 17 0 12" />
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    
                    <!-- Error icon (X red) -->
                    <svg v-else-if="msg.status === 'error'" class="status-icon error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </template>
                  
                  {{ msg.type === 'incoming' ? formatFullTime(msg.receivedAt) : formatTime(msg.timestamp) }}
                  
                  <!-- ✅ Read count badge untuk grup messages -->
                  <span v-if="msg.type === 'outgoing' && msg.isGroup && msg.readCount > 0" class="read-count-badge" :title="`Dibaca oleh ${msg.readCount} orang`">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ msg.readCount }}
                  </span>
                </div>
              </div>
              <div
                v-if="getReactionGroups(msg).length"
                class="bubble-reactions"
                :class="msg.type"
              >
                <button
                  v-for="reaction in getReactionGroups(msg)"
                  :key="reaction.emoji"
                  type="button"
                  class="reaction-chip"
                  :title="reaction.title"
                  :aria-label="`Lihat ${reaction.title} ${reaction.emoji}`"
                  @click.stop="openReactionDetails(msg, reaction.emoji)"
                >
                  <span class="reaction-emoji">{{ reaction.emoji }}</span>
                  <span v-if="reaction.count > 1" class="reaction-count">
                    {{ reaction.count }}
                  </span>
                </button>
              </div>
              <div
                v-if="canReactToMessage(msg)"
                class="message-reaction-control"
                :class="msg.type"
              >
                <button
                  type="button"
                  class="btn-message-reaction"
                  :class="msg.type"
                  :disabled="isSendingReaction(msg)"
                  :aria-label="`Beri reaction pada pesan ${msg.type === 'incoming' ? 'masuk' : 'keluar'}`"
                  title="Beri reaction"
                  @click.stop="toggleReactionPicker(msg, $event)"
                >
                  {{ isSendingReaction(msg) ? '…' : '☺' }}
                </button>
                <ReactionPicker
                  v-if="isReactionPickerOpen(msg)"
                  :direction="msg.type"
                  :current-emoji="getOwnReaction(msg)?.emoji || ''"
                  :loading="isSendingReaction(msg)"
                  :anchor-element="reactionPickerAnchor"
                  :boundary-element="chatMessagesContainer"
                  @select="emoji => sendReaction(msg, emoji)"
                />
              </div>
              <button
                v-if="canDeleteMessage(msg)"
                type="button"
                class="btn-message-actions"
                :class="msg.type"
                :aria-label="`Opsi pesan ${msg.type === 'incoming' ? 'masuk' : 'keluar'}`"
                title="Opsi pesan"
                @click.stop="toggleMessageActionMenu(msg, $event)"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <Teleport to="body">
                <div
                  v-if="isMessageActionMenuOpen(msg)"
                  :ref="setMessageActionMenuElement"
                  class="message-actions-menu"
                  :class="msg.type"
                  :style="messageActionMenuStyle"
                  @click.stop
                >
                  <button type="button" @click="confirmDeleteMessage(msg, 'me')">
                    Hapus untuk saya
                  </button>
                  <button
                    v-if="msg.type === 'outgoing' && !isDeletedForEveryone(msg)"
                    type="button"
                    class="danger"
                    @click="confirmDeleteMessage(msg, 'everyone')"
                  >
                    Hapus untuk semua
                  </button>
                </div>
              </Teleport>
            </div>
          </div>
          
          <!-- Reply Input -->
          <div class="reply-input-container">
            <div v-if="selectedAttachment" class="attachment-preview">
              <img
                v-if="attachmentKind === 'image'"
                :src="attachmentPreviewUrl"
                alt="Preview lampiran"
              />
              <div v-else class="attachment-file-icon">{{ attachmentKindLabel }}</div>
              <div class="attachment-info">
                <strong>{{ selectedAttachment.name }}</strong>
                <span>{{ formatFileSize(selectedAttachment.size) }}</span>
              </div>
              <button type="button" @click="clearAttachment" title="Hapus lampiran">×</button>
            </div>

            <div class="reply-input-row">
              <input
                ref="attachmentInput"
                type="file"
                class="attachment-input"
                :accept="MEDIA_ACCEPT"
                @change="handleAttachmentChange"
              />
              <button
                type="button"
                class="btn-attachment"
                :disabled="sendingReply"
                title="Lampirkan gambar, video, audio, atau dokumen"
                @click="attachmentInput?.click()"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <textarea
                id="inbox-reply-textarea"
                v-model="replyText"
                :placeholder="selectedAttachment ? 'Tambahkan caption (opsional)...' : 'Ketik pesan atau tempel gambar...'"
                class="reply-textarea"
                autofocus
                @keydown.enter.exact="handleEnterKey"
                @paste="handleReplyPaste"
                rows="1"
                ref="replyTextarea"
              ></textarea>
              <button
                class="btn-send-reply"
                @click="sendReply"
                :disabled="(!replyText.trim() && !selectedAttachment) || sendingReply"
                title="Kirim pesan"
              >
                <svg v-if="sendingReply" class="spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- Add Contact Modal -->
    <div
      v-if="addContactModal.show"
      class="modal-overlay add-contact-overlay"
      @click="closeAddContactModal"
    >
      <form class="modal add-contact-modal" @click.stop @submit.prevent="saveInboxContact">
        <div class="modal-header add-contact-header">
          <div>
            <h3>Tambah Kontak</h3>
            <p>Simpan nomor dari percakapan ini ke menu Kontak.</p>
          </div>
          <button
            type="button"
            class="btn-close"
            title="Tutup form"
            aria-label="Tutup form tambah kontak"
            :disabled="savingContact"
            @click="closeAddContactModal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="add-contact-body">
          <div class="add-contact-grid">
            <label class="add-contact-field">
              <span>Nama depan <strong>*</strong></span>
              <input
                v-model.trim="addContactModal.firstName"
                type="text"
                maxlength="100"
                autocomplete="off"
                required
                autofocus
                placeholder="Nama depan"
              />
            </label>
            <label class="add-contact-field">
              <span>Nama belakang</span>
              <input
                v-model.trim="addContactModal.lastName"
                type="text"
                maxlength="100"
                autocomplete="off"
                placeholder="Nama belakang (opsional)"
              />
            </label>
          </div>

          <label class="add-contact-field">
            <span>Nomor WhatsApp</span>
            <input :value="addContactModal.phone" type="text" readonly />
          </label>

          <label class="add-contact-field">
            <span>Label</span>
            <input
              v-model.trim="addContactModal.labels"
              type="text"
              autocomplete="off"
              placeholder="Contoh: Siswa, Orang Tua (opsional)"
            />
            <small>Pisahkan beberapa label dengan koma.</small>
          </label>
        </div>

        <div class="add-contact-actions">
          <button type="button" class="btn-cancel" :disabled="savingContact" @click="closeAddContactModal">
            Batal
          </button>
          <button type="submit" class="btn-save-contact" :disabled="savingContact">
            <svg v-if="savingContact" class="spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            {{ savingContact ? 'Menyimpan...' : 'Simpan Kontak' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModal.show" class="modal-overlay" @click="deleteModal.show = false">
      <div class="modal delete-modal" @click.stop>
        <div class="modal-header delete-modal-header">
          <div class="delete-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3>{{ deleteModal.title }}</h3>
          <p class="delete-modal-desc">{{ deleteModal.description }}</p>
        </div>
        <div class="delete-modal-actions">
          <button class="btn-cancel" @click="deleteModal.show = false" :disabled="deleteModal.loading">
            Batal
          </button>
          <button class="btn-confirm-delete" @click="executeDelete" :disabled="deleteModal.loading">
            <svg v-if="deleteModal.loading" class="spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            {{ deleteModal.loading ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="activeReactionDetails"
        class="reaction-details-overlay"
        @click="closeReactionDetails"
      >
        <section
          class="reaction-details-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="`Daftar pemberi reaction ${activeReactionDetails.emoji}`"
          @click.stop
        >
          <header class="reaction-details-header">
            <div>
              <h3>
                <span aria-hidden="true">{{ activeReactionDetails.emoji }}</span>
                Reaction
              </h3>
              <p>{{ activeReactionDetails.count }} orang</p>
            </div>
            <button
              type="button"
              class="reaction-details-close"
              aria-label="Tutup daftar reaction"
              @click="closeReactionDetails"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <ul class="reaction-member-list">
            <li
              v-for="member in activeReactionDetails.members"
              :key="member.reactorJid"
              class="reaction-member"
            >
              <span class="reaction-member-avatar" aria-hidden="true">
                {{ getReactionMemberInitial(member) }}
                <img
                  v-if="getReactionMemberProfileUrl(member)"
                  :key="getReactionMemberProfileUrl(member)"
                  :src="getReactionMemberProfileUrl(member)"
                  alt=""
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  @load="handleReactionProfileLoad(member)"
                  @error="handleReactionProfileError($event, member)"
                />
              </span>
              <span class="reaction-member-identity">
                <strong>{{ getReactionMemberName(member) }}</strong>
                <small v-if="getReactionMemberPhone(member)">
                  {{ getReactionMemberPhone(member) }}
                </small>
              </span>
              <span class="reaction-member-emoji" aria-hidden="true">
                {{ activeReactionDetails.emoji }}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="imagePreview"
        class="image-preview-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Preview gambar pesan"
        @click="closeImagePreview"
      >
        <button
          type="button"
          class="image-preview-close"
          aria-label="Tutup preview gambar"
          title="Tutup preview (Esc)"
          @click="closeImagePreview"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <figure class="image-preview-content" @click.stop>
          <img
            :src="imagePreview.src"
            :alt="imagePreview.alt"
            class="image-preview-image"
            @error="handlePreviewImageError"
          />
          <figcaption v-if="imagePreview.caption || imagePreview.time" class="image-preview-meta">
            <p v-if="imagePreview.caption">{{ imagePreview.caption }}</p>
            <time v-if="imagePreview.time">{{ imagePreview.time }}</time>
          </figcaption>
        </figure>
      </div>
    </Teleport>

    <p v-if="err" class="error-message">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue';
import { userApi, deviceApi } from '../api/http.js';
import { useToast } from '../composables/useToast.js';
import { connectSocket, getSocket } from '../api/socket.js';
import { mediaUrl } from '../utils/mediaUrl.js';
import { getInboxMediaType } from '../utils/inboxMedia.js';
import {
  insertComposerCharacter,
  shouldRedirectInboxTyping,
} from '../utils/inboxComposer.js';
import { getDeviceStatusLabel } from '../utils/deviceStatus.js';
import { getContactLabelNames } from '../utils/contactLabels.js';
import {
  MEDIA_ACCEPT,
  MEDIA_MAX_SIZE,
  isSupportedMediaFile,
} from '../utils/mediaUpload.js';
import ReactionPicker from '../components/ReactionPicker.vue';
import { useRoute, useRouter } from 'vue-router';
import {
  applyMessageReactionEvent,
  findOwnMessageReaction,
  getMessageReactionTargetId,
  groupMessageReactions,
  sameConversationJid,
} from '../utils/messageReactions.js';
import {
  createOutgoingMessageId,
  getOutgoingFailureMessage,
  isConfirmedOutgoingFailure,
  mergeOutgoingResponseStatus,
  mergeOutgoingSnapshotStatuses,
  mergeOutgoingStatus,
  normalizeOutgoingUiStatus,
  resolveOutgoingUiStatus,
} from '../utils/outgoingStatus.js';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const isOpeningNavigationTarget = ref(Boolean(route.query.device && route.query.conversation));
const DELETED_MESSAGE_TEXT = 'Pesan ini telah dihapus';

const messages = ref([]);
const outgoingConversationSummaries = ref([]);
const devices = ref([]);
const selectedDeviceId = ref(localStorage.getItem('device_selected_id') || '');
const loading = ref(false);
const err = ref('');
const selectedConversation = ref(null);
const isConversationFullscreen = ref(false);
const savingContact = ref(false);
const addContactModal = ref({
  show: false,
  firstName: '',
  lastName: '',
  phone: '',
  labels: '',
});
const conversationReactions = ref([]);
const reactionDetails = ref(null);
const reactionProfileRetryVersions = ref({});
const reactionPickerMessageKey = ref('');
const reactionPickerAnchor = ref(null);
const sendingReactionMessageKey = ref('');
const messageActionMenuKey = ref('');
const messageActionMenuAnchor = ref(null);
const messageActionMenuElement = ref(null);
const hiddenMessageActionMenuStyle = () => ({
  top: '0px',
  left: '0px',
  right: 'auto',
  visibility: 'hidden',
});
const messageActionMenuStyle = ref(hiddenMessageActionMenuStyle());
const imagePreview = ref(null);
const highlightedMessageId = ref('');
const isPreparingConversation = ref(false);
const loadingOlderMessages = ref(false);
const conversationHasMoreTimeline = ref(false);
const conversationTimelineCursor = ref('');
const conversationReturnRoute = ref('');
const conversationOpenedFromNavigation = ref(false);

// Reply functionality
const replyText = ref('');
const sendingReply = ref(false);
const sentMessages = ref([]);
const sentMessagesConversationJid = ref('');
const replyTextarea = ref(null);
const chatMessagesContainer = ref(null);
const attachmentInput = ref(null);
const selectedAttachment = ref(null);
const attachmentPreviewUrl = ref('');
const isDraggingAttachment = ref(false);
const failedMediaIds = ref(new Set());
const activatedMediaIds = ref(new Set());
const isInitialBottomPinning = ref(false);
const isConversationViewportReady = ref(false);
const conversationUserTookScrollControl = ref(false);
let attachmentDragDepth = 0;
const conversationAvatarUrls = ref({});
const failedAvatarKeys = ref(new Set());
const loadingAvatarKeys = new Set();
const avatarRecoveryAttempts = new Map();
const avatarRetryAt = new Map();
const AVATAR_NEGATIVE_CACHE_MS = 15 * 60 * 1000;
const AVATAR_TRANSIENT_RETRY_MS = 5 * 60 * 1000;

const attachmentKind = computed(() => {
  const type = selectedAttachment.value?.type || '';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return 'document';
});

const attachmentKindLabel = computed(() => ({
  image: 'Gambar',
  video: 'Video',
  audio: 'Audio',
  document: 'Dokumen',
}[attachmentKind.value]));

// Search & pagination
const q = ref('');
const page = ref(1);
const pageSize = ref(25);
const meta = ref({
  totalMessages: 0,
  totalConversations: 0,
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
  conversationKeys: [],
  todayIncomingCount: null,
});

let searchTimer;
let socketCleanup = null;
let socketConnectionCleanup = null;
let latestLoadRequest = 0;
let latestTimelineRequest = 0;
let latestReactionsRequest = 0;
let messageHighlightTimer = null;
let inboxNavigationGeneration = 0;
let conversationOpenGeneration = 0;
let conversationRequestController = null;
let bottomPinReleaseTimer = null;
const conversationSnapshotCache = new Map();
const MAX_CONVERSATION_SNAPSHOTS = 10;
const reactionProfileRetryCounts = new Map();
const reactionProfileRetryTimers = new Map();
const statusReconciliationTimers = new Map();

const confirmedOutgoingError = message => {
  const error = new Error(message);
  error.outgoingFailureConfirmed = true;
  return error;
};

const clearStatusReconciliationTimers = () => {
  statusReconciliationTimers.forEach(timer => clearTimeout(timer));
  statusReconciliationTimers.clear();
};

const scheduleConversationStatusReconciliation = conversationFrom => {
  if (!conversationFrom) return;

  [1200, 4500].forEach(delay => {
    const timerKey = `${getConversationSnapshotKey(conversationFrom)}:${delay}`;
    const previousTimer = statusReconciliationTimers.get(timerKey);
    if (previousTimer) clearTimeout(previousTimer);
    const timer = setTimeout(() => {
      statusReconciliationTimers.delete(timerKey);
      if (
        !selectedConversation.value
        || !sameConversationJid(selectedConversation.value.from, conversationFrom)
      ) return;

      void loadConversationTimeline(conversationFrom, {
        mergeLatest: true,
        signal: conversationRequestController?.signal,
      }).catch(() => undefined);
    }, delay);
    statusReconciliationTimers.set(timerKey, timer);
  });
};

const cloneSnapshotItems = items => (Array.isArray(items)
  ? items.map(item => ({
      ...item,
      ...(Array.isArray(item?.readBy) ? { readBy: [...item.readBy] } : {}),
      ...(Array.isArray(item?.members) ? { members: [...item.members] } : {}),
    }))
  : []);

const getConversationSnapshotKey = (
  conversationFrom,
  deviceId = selectedDeviceId.value,
) => `${String(deviceId || '')}:${String(conversationFrom || '').trim().toLowerCase()}`;

const getConversationSnapshot = conversationFrom => {
  if (!conversationFrom || !selectedDeviceId.value) return null;
  const snapshot = conversationSnapshotCache.get(
    getConversationSnapshotKey(conversationFrom),
  );
  if (!snapshot) return null;
  return {
    incomingMessages: cloneSnapshotItems(snapshot.incomingMessages),
    sentMessages: cloneSnapshotItems(snapshot.sentMessages),
    reactions: cloneSnapshotItems(snapshot.reactions),
    timelineCursor: snapshot.timelineCursor || '',
    hasMoreTimeline: Boolean(snapshot.hasMoreTimeline),
  };
};

const cacheConversationSnapshot = (conversationFrom, patch = {}) => {
  if (!conversationFrom || !selectedDeviceId.value) return;
  const key = getConversationSnapshotKey(conversationFrom);
  const previous = conversationSnapshotCache.get(key) || {
    incomingMessages: [],
    sentMessages: [],
    reactions: [],
  };
  const next = {
    incomingMessages: Object.prototype.hasOwnProperty.call(patch, 'incomingMessages')
      ? cloneSnapshotItems(patch.incomingMessages).slice(-60)
      : previous.incomingMessages,
    sentMessages: Object.prototype.hasOwnProperty.call(patch, 'sentMessages')
      ? cloneSnapshotItems(patch.sentMessages).slice(-60)
      : previous.sentMessages,
    reactions: Object.prototype.hasOwnProperty.call(patch, 'reactions')
      ? cloneSnapshotItems(patch.reactions)
      : previous.reactions,
    timelineCursor: Object.prototype.hasOwnProperty.call(patch, 'timelineCursor')
      ? patch.timelineCursor
      : previous.timelineCursor,
    hasMoreTimeline: Object.prototype.hasOwnProperty.call(patch, 'hasMoreTimeline')
      ? Boolean(patch.hasMoreTimeline)
      : Boolean(previous.hasMoreTimeline),
  };

  // Refresh insertion order so the least recently used snapshot is evicted.
  conversationSnapshotCache.delete(key);
  conversationSnapshotCache.set(key, next);
  while (conversationSnapshotCache.size > MAX_CONVERSATION_SNAPSHOTS) {
    const oldestKey = conversationSnapshotCache.keys().next().value;
    conversationSnapshotCache.delete(oldestKey);
  }
};

const cacheCurrentConversationSnapshot = () => {
  const conversationFrom = selectedConversation.value?.from;
  if (
    !conversationFrom
    || !sameConversationJid(sentMessagesConversationJid.value, conversationFrom)
  ) return;
  cacheConversationSnapshot(conversationFrom, {
    incomingMessages: selectedConversation.value.messages,
    sentMessages: sentMessages.value,
    reactions: conversationReactions.value,
    timelineCursor: conversationTimelineCursor.value,
    hasMoreTimeline: conversationHasMoreTimeline.value,
  });
};

const conversationHasMoreHistory = computed(() => conversationHasMoreTimeline.value);

// Computed
const todayCount = computed(() => {
  if (
    meta.value.todayIncomingCount != null
    && Number.isFinite(Number(meta.value.todayIncomingCount))
  ) {
    return Number(meta.value.todayIncomingCount);
  }
  const today = new Date().toDateString();
  return messages.value.filter(m => new Date(m.receivedAt).toDateString() === today).length;
});

const paginationStart = computed(() =>
  meta.value.totalConversations > 0 ? (page.value - 1) * pageSize.value + 1 : 0,
);
const paginationEnd = computed(() =>
  Math.min(page.value * pageSize.value, meta.value.totalConversations || 0),
);
const visiblePageNumbers = computed(() => {
  const total = Math.max(1, Number(meta.value.totalPages) || 1);
  const current = Math.min(Math.max(1, page.value), total);
  let start = Math.max(1, current - 2);
  let end = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
});

// Merge incoming and outgoing messages, sorted by timestamp
const allMessages = computed(() => {
  if (!selectedConversation.value) return [];
  
  const incoming = selectedConversation.value.messages.map(msg => ({
    ...msg,
    type: 'incoming',
    timestamp: msg.receivedAt,
  }));
  
  const outgoing = sentMessages.value.map(msg => ({
    ...msg,
    type: 'outgoing',
    timestamp: msg.timestamp,
  }));
  
  // Merge incoming and outgoing messages, sorted by timestamp
  const merged = [...incoming, ...outgoing].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  return merged;
});

const reactionGroupsByMessageKey = computed(() => {
  const grouped = new Map();
  allMessages.value.forEach(message => {
    grouped.set(
      getReactionMessageKey(message),
      groupMessageReactions(message, conversationReactions.value),
    );
  });
  return grouped;
});

const getReactionGroups = message =>
  reactionGroupsByMessageKey.value.get(getReactionMessageKey(message)) || [];

const isDeletedForEveryone = message => Boolean(
  message?.deletedForEveryone ||
  message?.status === 'revoked' ||
  (message?.type === 'outgoing' && message?.text === DELETED_MESSAGE_TEXT)
);

const getReactionMessageKey = message =>
  `${message?.type || 'unknown'}:${getMessageReactionTargetId(message) || ''}`;

const activeReactionDetails = computed(() => {
  if (!reactionDetails.value) return null;
  const message = allMessages.value.find(item =>
    getReactionMessageKey(item) === reactionDetails.value.messageKey
  );
  if (!message) return null;

  return getReactionGroups(message).find(group =>
    group.emoji === reactionDetails.value.emoji
  ) || null;
});

const openReactionDetails = (message, emoji) => {
  closeMessagePopups();
  reactionDetails.value = {
    messageKey: getReactionMessageKey(message),
    emoji,
  };
};

const closeReactionDetails = () => {
  reactionDetails.value = null;
  for (const timer of reactionProfileRetryTimers.values()) clearTimeout(timer);
  reactionProfileRetryTimers.clear();
  reactionProfileRetryCounts.clear();
};

const getReactionMemberProfileUrl = member => {
  const source = String(member?.reactorProfilePicUrl || '').trim();
  if (!source) return '';
  const key = String(member?.reactorJid || source);
  const version = reactionProfileRetryVersions.value[key] || 0;
  const separator = source.includes('?') ? '&' : '?';
  return `${mediaUrl(source)}${separator}profileRetry=${version}`;
};

const handleReactionProfileLoad = member => {
  const key = String(member?.reactorJid || '');
  if (!key) return;
  const timer = reactionProfileRetryTimers.get(key);
  if (timer) clearTimeout(timer);
  reactionProfileRetryTimers.delete(key);
  reactionProfileRetryCounts.delete(key);
};

const handleReactionProfileError = (event, member) => {
  if (event?.currentTarget) event.currentTarget.style.display = 'none';
  const key = String(member?.reactorJid || '');
  if (!key || member?.reactorProfileStatus === 'unavailable') return;

  const attempt = reactionProfileRetryCounts.get(key) || 0;
  const retryDelays = [2000, 4000, 8000, 12000];
  if (attempt >= retryDelays.length || reactionProfileRetryTimers.has(key)) return;

  reactionProfileRetryCounts.set(key, attempt + 1);
  const timer = setTimeout(() => {
    reactionProfileRetryTimers.delete(key);
    reactionProfileRetryVersions.value = {
      ...reactionProfileRetryVersions.value,
      [key]: (reactionProfileRetryVersions.value[key] || 0) + 1,
    };
  }, retryDelays[attempt]);
  reactionProfileRetryTimers.set(key, timer);
};

const getReactionMemberPhone = member => {
  if (!member || member.reactorJid === 'me') return '';
  const phone = String(member.reactorPhone || '').replace(/\D/g, '');
  return phone ? `+${phone}` : formatWhatsAppIdentity(member.reactorJid);
};

const getReactionMemberName = member => {
  if (member?.reactorJid === 'me') return 'Anda';
  return String(member?.reactorDisplayName || '').trim()
    || getReactionMemberPhone(member)
    || 'Tidak dikenal';
};

const getReactionMemberInitial = member => {
  const name = getReactionMemberName(member);
  return name === 'Anda' ? 'A' : name.replace(/^\+/, '').charAt(0).toUpperCase() || '?';
};

const getOwnReaction = message =>
  findOwnMessageReaction(message, conversationReactions.value);

const canReactToMessage = message => Boolean(
  getMessageReactionTargetId(message) &&
  message?.status !== 'sending' &&
  message?.status !== 'error' &&
  !isDeletedForEveryone(message)
);

const isReactionPickerOpen = message =>
  reactionPickerMessageKey.value === getReactionMessageKey(message);

const isSendingReaction = message =>
  sendingReactionMessageKey.value === getReactionMessageKey(message);

const closeMessagePopups = () => {
  reactionPickerMessageKey.value = '';
  reactionPickerAnchor.value = null;
  messageActionMenuKey.value = '';
  messageActionMenuAnchor.value = null;
  messageActionMenuElement.value = null;
  messageActionMenuStyle.value = hiddenMessageActionMenuStyle();
};

const handleMessagePopupPointerDown = event => {
  if (!selectedConversation.value) return;
  if (!reactionPickerMessageKey.value && !messageActionMenuKey.value) return;

  const target = event.target;
  const isPopupInteraction = typeof target?.closest === 'function' && target.closest(
    '.btn-message-reaction, .reaction-picker, .btn-message-actions, .message-actions-menu',
  );

  if (!isPopupInteraction) closeMessagePopups();
};

const toggleReactionPicker = (message, event) => {
  const messageKey = getReactionMessageKey(message);
  const isClosing = reactionPickerMessageKey.value === messageKey;
  messageActionMenuKey.value = '';
  reactionPickerAnchor.value = isClosing ? null : event?.currentTarget || null;
  reactionPickerMessageKey.value = isClosing ? '' : messageKey;
};

watch(reactionPickerMessageKey, value => {
  if (!value) reactionPickerAnchor.value = null;
});

const canDeleteMessage = message => Boolean(getMessageReactionTargetId(message));

const isMessageActionMenuOpen = message =>
  messageActionMenuKey.value === getReactionMessageKey(message);

const setMessageActionMenuElement = element => {
  messageActionMenuElement.value = element || null;
};

const updateMessageActionMenuPosition = () => {
  const anchor = messageActionMenuAnchor.value;
  const menu = messageActionMenuElement.value;
  const boundary = chatMessagesContainer.value;
  if (!anchor || !menu || !boundary || !messageActionMenuKey.value) return;

  const anchorRect = anchor.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const boundaryRect = boundary.getBoundingClientRect();
  const gap = 6;
  const padding = 8;
  const menuWidth = menuRect.width || 190;
  const menuHeight = menuRect.height || 96;
  const minLeft = Math.max(padding, boundaryRect.left + padding);
  const maxLeft = Math.max(minLeft, Math.min(
    window.innerWidth - menuWidth - padding,
    boundaryRect.right - menuWidth - padding,
  ));
  const preferredLeft = anchorRect.right - menuWidth;
  const left = Math.min(maxLeft, Math.max(minLeft, preferredLeft));
  const spaceBelow = boundaryRect.bottom - anchorRect.bottom - gap;
  const spaceAbove = anchorRect.top - boundaryRect.top - gap;
  const openAbove = spaceBelow < menuHeight && spaceAbove >= menuHeight;
  const minTop = Math.max(padding, boundaryRect.top + padding);
  const maxTop = Math.max(minTop, Math.min(
    window.innerHeight - menuHeight - padding,
    boundaryRect.bottom - menuHeight - padding,
  ));
  const preferredTop = openAbove
    ? anchorRect.top - menuHeight - gap
    : anchorRect.bottom + gap;
  const top = Math.min(maxTop, Math.max(minTop, preferredTop));

  messageActionMenuStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    right: 'auto',
    visibility: 'visible',
  };
};

const toggleMessageActionMenu = async (message, event) => {
  const messageKey = getReactionMessageKey(message);
  reactionPickerMessageKey.value = '';
  if (messageActionMenuKey.value === messageKey) {
    closeMessagePopups();
    return;
  }

  messageActionMenuAnchor.value = event?.currentTarget || null;
  messageActionMenuStyle.value = hiddenMessageActionMenuStyle();
  messageActionMenuKey.value = messageKey;
  await nextTick();
  updateMessageActionMenuPosition();
};

const sendReaction = async (message, selectedEmoji) => {
  const targetMessageId = getMessageReactionTargetId(message);
  if (!targetMessageId || !selectedConversation.value) return;

  const device = devices.value.find(item => item.id === selectedDeviceId.value);
  if (!device?.isConnected) {
    toast.error('Device WhatsApp belum terhubung');
    return;
  }

  const messageKey = getReactionMessageKey(message);
  if (sendingReactionMessageKey.value) return;

  const ownReaction = getOwnReaction(message);
  const emoji = ownReaction?.emoji === selectedEmoji ? '' : selectedEmoji;
  const previousReactions = [...conversationReactions.value];
  const optimisticEvent = {
    targetMessageId,
    targetFromMe: message.type === 'outgoing',
    reactorJid: 'me',
    emoji,
    removed: !emoji,
    reactedAt: new Date().toISOString(),
    conversationJid: selectedConversation.value.from,
  };

  sendingReactionMessageKey.value = messageKey;
  reactionPickerMessageKey.value = '';
  conversationReactions.value = applyMessageReactionEvent(
    conversationReactions.value,
    optimisticEvent,
  );

  try {
    const { data } = await deviceApi.post('/messages/reaction', {
      targetMessageId,
      targetFromMe: message.type === 'outgoing',
      emoji,
    });
    if (data?.reaction) {
      conversationReactions.value = applyMessageReactionEvent(
        conversationReactions.value,
        data.reaction,
      );
    }
  } catch (error) {
    conversationReactions.value = previousReactions;
    toast.error(
      error?.response?.data?.message || error?.message || 'Gagal mengirim reaction',
    );
  } finally {
    if (sendingReactionMessageKey.value === messageKey) {
      sendingReactionMessageKey.value = '';
    }
  }
};

const removeReactionPlaceholder = reactionMessageId => {
  if (!reactionMessageId) return;

  messages.value = messages.value.filter(message => message.id !== reactionMessageId);
  if (selectedConversation.value?.messages) {
    const previousLength = selectedConversation.value.messages.length;
    selectedConversation.value.messages = selectedConversation.value.messages.filter(
      message => message.id !== reactionMessageId,
    );
    if (selectedConversation.value.messages.length !== previousLength) {
      selectedConversation.value.messageCount = Math.max(
        0,
        Number(selectedConversation.value.messageCount || 0) - 1,
      );
    }
  }
};

const applyInboxReactionEvent = event => {
  if (
    !selectedConversation.value ||
    !sameConversationJid(selectedConversation.value.from, event?.conversationJid)
  ) {
    return;
  }

  conversationReactions.value = applyMessageReactionEvent(
    conversationReactions.value,
    event,
  );
  removeReactionPlaceholder(event.reactionMessageId);
};

const removeDeletedMessageFromState = event => {
  if (!event?.targetMessageId) return false;

  let removedFromOpenConversation = false;
  if (event.targetFromMe) {
    if (event.scope === 'everyone') {
      let replacedMessage = false;
      sentMessages.value = sentMessages.value.map(message => {
        if (
          getMessageReactionTargetId({ ...message, type: 'outgoing' }) !==
          event.targetMessageId
        ) return message;

        replacedMessage = true;
        return {
          ...message,
          text: event.placeholder || DELETED_MESSAGE_TEXT,
          mediaPath: '',
          status: 'revoked',
          deletedForEveryone: true,
        };
      });
      removedFromOpenConversation = replacedMessage;
    } else {
      const previousLength = sentMessages.value.length;
      sentMessages.value = sentMessages.value.filter(message =>
        getMessageReactionTargetId({ ...message, type: 'outgoing' }) !== event.targetMessageId
      );
      removedFromOpenConversation = sentMessages.value.length !== previousLength;
    }
  } else {
    messages.value = messages.value.filter(message => message.id !== event.targetMessageId);
    if (
      selectedConversation.value?.messages &&
      sameConversationJid(selectedConversation.value.from, event.conversationJid)
    ) {
      const previousLength = selectedConversation.value.messages.length;
      selectedConversation.value.messages = selectedConversation.value.messages.filter(
        message => message.id !== event.targetMessageId,
      );
      removedFromOpenConversation =
        selectedConversation.value.messages.length !== previousLength;
    }
  }

  conversationReactions.value = conversationReactions.value.filter(
    reaction => !(
      reaction.targetMessageId === event.targetMessageId &&
      Boolean(reaction.targetFromMe) === Boolean(event.targetFromMe)
    ),
  );

  if (
    removedFromOpenConversation &&
    event.scope !== 'everyone' &&
    selectedConversation.value
  ) {
    selectedConversation.value.messageCount = Math.max(
      0,
      Number(selectedConversation.value.messageCount || 0) - 1,
    );
    meta.value.totalMessages = Math.max(0, Number(meta.value.totalMessages || 0) - 1);
  }
  return removedFromOpenConversation;
};

// Group messages by sender (from) to create conversations
const conversations = computed(() => {
  const grouped = {};
  
  // Group messages by 'from' field
  messages.value.forEach(msg => {
    const key = msg.from;
    if (!grouped[key]) {
      grouped[key] = {
        from: msg.from,
        contact: msg.contact,
        pushName: msg.pushName, // Add pushName from first message
        groupName: msg.groupName, // Add groupName for group messages
        groupPicUrl: msg.groupPicUrl, // Add group picture URL
        profilePicUrl: msg.profilePicUrl, // Add profile picture URL for personal chat
        isGroup: msg.isGroup || msg.from?.includes('@g.us'),
        messages: [],
        latestMessage: msg,
        messageCount: Number(msg.conversationIncomingCount) || 0,
        unreadCount: Number(msg.conversationUnreadCount) || 0,
      };
    }
    grouped[key].messages.push(msg);
    if (msg.conversationIncomingCount == null) {
      grouped[key].messageCount++;
    } else {
      grouped[key].messageCount = Math.max(
        grouped[key].messageCount,
        Number(msg.conversationIncomingCount) || 0,
      );
    }

    // Count unread messages (messages not yet read by user)
    if (msg.conversationUnreadCount == null && !msg.isRead) {
      grouped[key].unreadCount++;
    } else if (msg.conversationUnreadCount != null) {
      grouped[key].unreadCount = Math.max(
        grouped[key].unreadCount,
        Number(msg.conversationUnreadCount) || 0,
      );
    }
    
    // Update pushName if newer message has it
    if (msg.pushName && !grouped[key].pushName) {
      grouped[key].pushName = msg.pushName;
    }

    // Update groupName if newer message has it
    if (msg.groupName && !grouped[key].groupName) {
      grouped[key].groupName = msg.groupName;
    }
    
    // Update groupPicUrl if newer message has it
    if (msg.groupPicUrl && !grouped[key].groupPicUrl) {
      grouped[key].groupPicUrl = msg.groupPicUrl;
    }
    
    // Update profilePicUrl if newer message has it (for personal chat)
    if (msg.profilePicUrl && !grouped[key].profilePicUrl) {
      grouped[key].profilePicUrl = msg.profilePicUrl;
    }
    
    // Keep track of latest message
    if (new Date(msg.receivedAt) > new Date(grouped[key].latestMessage.receivedAt)) {
      grouped[key].latestMessage = msg;
    }
  });

  // Add recipients that only have outgoing messages (broadcast, campaign,
  // direct send, etc.) and merge them with existing incoming conversations.
  outgoingConversationSummaries.value.forEach(outgoing => {
    const key = outgoing.to;
    if (!key) return;

    const normalizedMessage = {
      ...outgoing,
      from: key,
      message: outgoing.message || '',
      receivedAt: outgoing.createdAt,
      isOutgoing: true,
    };

    if (!grouped[key]) {
      grouped[key] = {
        from: key,
        contact: outgoing.contact,
        pushName: outgoing.pushName || null,
        groupName: outgoing.groupName || null,
        groupPicUrl: outgoing.groupPicUrl || null,
        profilePicUrl: outgoing.profilePicUrl || null,
        isGroup: outgoing.isGroup || key.includes('@g.us'),
        messages: [],
        latestMessage: normalizedMessage,
        messageCount: Number(outgoing.messageCount) || 1,
        unreadCount: 0,
      };
      return;
    }

    const conversation = grouped[key];
    conversation.messageCount += Number(outgoing.messageCount) || 1;
    if (!conversation.contact && outgoing.contact) {
      conversation.contact = outgoing.contact;
    }
    if (!conversation.pushName && outgoing.pushName) {
      conversation.pushName = outgoing.pushName;
    }
    if (
      new Date(normalizedMessage.receivedAt) >
      new Date(conversation.latestMessage.receivedAt)
    ) {
      conversation.latestMessage = normalizedMessage;
    }
  });
  
  // Convert to array and sort by latest message time (newest first)
  return Object.values(grouped)
    .map(conv => ({
      ...conv,
      messages: conv.messages.sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt)), // oldest first in chat
    }))
    .sort((a, b) => new Date(b.latestMessage.receivedAt) - new Date(a.latestMessage.receivedAt));
});

// Methods
const fetchDevices = async () => {
  try {
    const { data } = await userApi.get('/devices');
    const rawDevices = Array.isArray(data) ? data : [];
    
    // Add isConnected property based on status
    devices.value = rawDevices.map(d => ({
      ...d,
      isConnected: d.status === 'open',
    }));
  } catch {
    devices.value = [];
  }
};

const onDeviceChange = () => {
  cacheCurrentConversationSnapshot();
  releaseInitialBottomPin();
  conversationRequestController?.abort();
  conversationRequestController = null;
  latestTimelineRequest++;
  latestReactionsRequest++;
  selectedConversation.value = null;
  sentMessages.value = [];
  sentMessagesConversationJid.value = '';
  conversationReactions.value = [];
  clearConversationAvatars();
  localStorage.setItem('device_selected_id', selectedDeviceId.value);
  window.dispatchEvent(new Event('deviceChanged'));
  page.value = 1;
  loadMessages();
  setupSocketListener();
};

const loadMessages = async () => {
  if (!selectedDeviceId.value) return;

  const requestId = ++latestLoadRequest;
  const requestedDeviceId = selectedDeviceId.value;
  const messageIdsBeforeRequest = new Set(messages.value.map(message => message.id));
  const outgoingIdsBeforeRequest = new Set(
    outgoingConversationSummaries.value.map(message => message.id),
  );

  loading.value = true;
  err.value = '';

  try {
    // Use userApi (JWT auth) instead of deviceApi (session-based auth)
    // This works even when device is disconnected from WhatsApp
    const inboxRequest = userApi.get(`/devices/${selectedDeviceId.value}/inbox`, {
      params: {
        ...(q.value ? { message: q.value } : {}),
        page: page.value,
        pageSize: pageSize.value,
        _t: Date.now(),
      },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    });
    const { data } = await inboxRequest;

    if (requestId !== latestLoadRequest || requestedDeviceId !== selectedDeviceId.value) return;

    const conversationKeys = Array.isArray(data?.metadata?.conversationKeys)
      ? data.metadata.conversationKeys
      : [];
    const { data: outgoingData } = await userApi
      .get(`/devices/${selectedDeviceId.value}/outbox/conversations`, {
        params: {
          ...(q.value
            ? { search: q.value }
            : conversationKeys.length > 0
              ? { recipients: conversationKeys.join(',') }
              : {}),
          _t: Date.now(),
        },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      })
      .catch(() => ({ data: [] }));

    // Ignore responses from a device/search request that is no longer current.
    if (requestId !== latestLoadRequest || requestedDeviceId !== selectedDeviceId.value) return;

    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    // A socket message can arrive while this request is in flight. Preserve it so
    // a slower HTTP response cannot make a real-time message disappear again.
    const realtimeMessages = q.value
      ? []
      : messages.value.filter(message => !messageIdsBeforeRequest.has(message.id));
    const realtimeIds = new Set(realtimeMessages.map(message => message.id));
    messages.value = [
      ...realtimeMessages,
      ...list.filter(message => !realtimeIds.has(message.id)),
    ];
    const outgoingList = Array.isArray(outgoingData)
      ? outgoingData
      : Array.isArray(outgoingData?.data)
        ? outgoingData.data
        : [];
    const realtimeOutgoing = q.value
      ? []
      : outgoingConversationSummaries.value.filter(
          message => !outgoingIdsBeforeRequest.has(message.id),
        );
    const realtimeOutgoingIds = new Set(realtimeOutgoing.map(message => message.id));
    outgoingConversationSummaries.value = [
      ...realtimeOutgoing,
      ...outgoingList.filter(message => !realtimeOutgoingIds.has(message.id)),
    ];
    void loadConversationAvatars([
      ...messages.value.map(message => ({
        from: message.from,
        isGroup: message.isGroup || message.from?.includes('@g.us'),
        profilePicUrl: message.profilePicUrl,
        groupPicUrl: message.groupPicUrl,
      })),
      ...outgoingConversationSummaries.value.map(message => ({
        from: message.to,
        isGroup: message.isGroup || message.to?.includes('@g.us'),
        profilePicUrl: message.profilePicUrl,
        groupPicUrl: message.groupPicUrl,
      })),
    ]);
    meta.value = {
      totalMessages: data?.metadata?.totalMessages ?? data?.total ?? list.length,
      totalConversations: data?.metadata?.totalConversations ?? conversations.value.length,
      currentPage: data?.metadata?.currentPage ?? page.value,
      totalPages: data?.metadata?.totalPages ?? 1,
      hasMore: data?.metadata?.hasMore ?? false,
      conversationKeys,
      todayIncomingCount: data?.metadata?.todayIncomingCount ?? null,
    };
    page.value = meta.value.currentPage;
  } catch (e) {
    if (requestId === latestLoadRequest) {
      err.value = e?.response?.data?.message || 'Gagal memuat pesan masuk';
      messages.value = [];
      outgoingConversationSummaries.value = [];
      meta.value = {
        totalMessages: 0,
        totalConversations: 0,
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
        conversationKeys: [],
        todayIncomingCount: null,
      };
    }
  } finally {
    if (requestId === latestLoadRequest) {
      loading.value = false;
    }
  }
};

const setupSocketListener = () => {
  // Cleanup previous listener
  if (socketCleanup) {
    socketCleanup();
    socketCleanup = null;
  }

  if (!selectedDeviceId.value) {
    return;
  }

  const device = devices.value.find(d => d.id === selectedDeviceId.value);
  
  if (!device) {
    return;
  }

  // Get sessionId directly from device object (not from sessions array)
  const sessionId = device.sessionId;
  
  if (!sessionId) {
    return;
  }

  try {
    const socket = getSocket();
    if (!socket) {
      return;
    }

    socket.emit('session:subscribe', {
      deviceId: selectedDeviceId.value,
      sessionId,
    });

    const incomingEventName = `incoming:${sessionId}`;
    const outgoingEventName = `outgoing:${sessionId}`;
    const profileUpdateEventName = `incoming:${sessionId}:profile-updated`;
    const mediaUpdateEventName = `incoming:${sessionId}:media-updated`;
    const statusEventName = `device:${selectedDeviceId.value}:message-status`;
    const reactionEventName = `reaction:${sessionId}`;
    const deletedMessageEventName = `message-deleted:${sessionId}`;
    
    const handleIncoming = (data) => {
      // ✅ CRITICAL: Check for duplicates before adding
      const isDuplicate = messages.value.some(m => m.id === data.id);
      if (isDuplicate) {
        return; // Skip duplicate message
      }
      
      const isOpenConversation = selectedConversation.value?.from === data.from;
      const incomingMessage = data;

      // Add to messages list
      messages.value.unshift(incomingMessage);
      meta.value.totalMessages++;
      
      // ✅ Notifikasi toast & suara sudah ditangani oleh useGlobalNotifications di App.vue
      // Tidak perlu duplikat notifikasi di sini
      
      // ✅ Auto-scroll conversation list to top to show new message
      scrollConversationListToTop();

      // If conversation is open, add to chat
      if (isOpenConversation) {
        const shouldFollowLatestMessage = isConversationNearBottom(140);
        // ✅ Check duplicate in conversation messages too
        const isConvDuplicate = selectedConversation.value.messages.some(m => m.id === data.id);
        if (!isConvDuplicate) {
          selectedConversation.value.messages.push(incomingMessage);
          selectedConversation.value.messageCount++;
          if (shouldFollowLatestMessage) {
            setTimeout(() => scrollToBottom(), 100);
          }
        }

        // The backend stores every incoming message as unread first. Persist the
        // read state immediately when its conversation is already being viewed.
        markConversationAsRead(data.from);
      }
    };

    const handleOutgoing = (data) => {
      if (!data?.to || !data?.id) return;

      const existingIndex = outgoingConversationSummaries.value.findIndex(
        message => message.to === data.to,
      );
      const existing = existingIndex >= 0
        ? outgoingConversationSummaries.value[existingIndex]
        : null;
      const isSameMessage = existing?.id === data.id;
      const normalized = {
        ...existing,
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        messageCount: existing
          ? (Number(existing.messageCount) || 1) + (isSameMessage ? 0 : 1)
          : 1,
        contact: data.contact || existing?.contact || null,
      };

      if (existingIndex >= 0) {
        outgoingConversationSummaries.value.splice(existingIndex, 1);
      }
      outgoingConversationSummaries.value.unshift(normalized);

      if (selectedConversation.value?.from === data.to) {
        const shouldFollowLatestMessage = isConversationNearBottom(140);
        void loadConversationTimeline(data.to, {
          mergeLatest: true,
          signal: conversationRequestController?.signal,
        }).then(() => {
          if (shouldFollowLatestMessage) void scrollToBottom();
        }).catch(() => {});
      }
      scrollConversationListToTop();
    };
    
    // ✅ NEW: Handle profile picture update from background fetch
    const handleProfileUpdate = (data) => {
      // Update message in messages list
      const msgIndex = messages.value.findIndex(m => m.id === data.id);
      if (msgIndex !== -1) {
        // ✅ Force reactivity by creating new object
        messages.value[msgIndex] = { 
          ...messages.value[msgIndex], 
          profilePicUrl: data.profilePicUrl,
          groupPicUrl: data.groupPicUrl 
        };
        // Trigger reactivity
        messages.value = [...messages.value];
      }
      
      // Update in conversation if open
      if (selectedConversation.value && selectedConversation.value.from === data.from) {
        const convMsgIndex = selectedConversation.value.messages.findIndex(m => m.id === data.id);
        if (convMsgIndex !== -1) {
          selectedConversation.value.messages[convMsgIndex] = {
            ...selectedConversation.value.messages[convMsgIndex],
            profilePicUrl: data.profilePicUrl,
            groupPicUrl: data.groupPicUrl
          };
          // Trigger reactivity
          selectedConversation.value.messages = [...selectedConversation.value.messages];
        }
      }

      void loadConversationAvatar({
        from: data.from,
        isGroup: data.isGroup || data.from?.includes('@g.us'),
        profilePicUrl: data.profilePicUrl,
        groupPicUrl: data.groupPicUrl,
      }, true);
    };

    const handleMediaUpdate = (data) => {
      if (!data?.id || !data?.mediaPath) return;

      const recoveredData = { ...data, mediaLoadFailed: false };

      const messageIndex = messages.value.findIndex(message => message.id === data.id);
      if (messageIndex !== -1) {
        messages.value[messageIndex] = {
          ...messages.value[messageIndex],
          ...recoveredData,
        };
        messages.value = [...messages.value];
      }

      if (selectedConversation.value?.from === data.from) {
        const conversationMessageIndex = selectedConversation.value.messages.findIndex(
          message => message.id === data.id,
        );
        if (conversationMessageIndex !== -1) {
          selectedConversation.value.messages[conversationMessageIndex] = {
            ...selectedConversation.value.messages[conversationMessageIndex],
            ...recoveredData,
          };
          selectedConversation.value.messages = [...selectedConversation.value.messages];
        }
      }
    };

    const handleMessageStatus = (data) => {
      // Update sentMessages array
      // Match by waMessageId first, fallback to tempId (id field)
      const msgIndex = sentMessages.value.findIndex(m => 
        (m.waMessageId && m.waMessageId === data.waMessageId) || 
        (m.tempId && m.tempId === data.waMessageId)
      );
      
      if (msgIndex !== -1) {
        const currentStatus = sentMessages.value[msgIndex].status;
        const newStatus = resolveOutgoingUiStatus(data.status, {
          readCount: data.readCount,
          isGroup: Boolean(sentMessages.value[msgIndex].isGroup),
        });
        
        const normalizedCurrentStatus = normalizeOutgoingUiStatus(currentStatus) || 'sending';
        const mergedStatus = mergeOutgoingStatus(currentStatus, newStatus);
        let messageChanged = false;

        if (mergedStatus !== normalizedCurrentStatus) {
          sentMessages.value[msgIndex].status = mergedStatus;
          messageChanged = true;

          if (mergedStatus === 'error') {
            const errorMessage = `WhatsApp menolak pesan${data.errorCode ? ` (kode ${data.errorCode})` : ''}.`;
            toast.error(errorMessage);
          }
        }

        if (!sentMessages.value[msgIndex].waMessageId && data.waMessageId) {
          sentMessages.value[msgIndex].waMessageId = data.waMessageId;
          messageChanged = true;
        }

        if (
          data.readCount !== undefined &&
          data.readCount > (sentMessages.value[msgIndex].readCount || 0)
        ) {
          sentMessages.value[msgIndex].readCount = data.readCount;
          sentMessages.value[msgIndex].readBy = data.readBy || [];
          messageChanged = true;
        }

        if (messageChanged) sentMessages.value = [...sentMessages.value];

        // Status pengiriman terlihat dari ikon pada bubble chat.
      }
    };

    const handleReaction = data => {
      applyInboxReactionEvent(data);
      if (
        selectedConversation.value?.from
        && sameConversationJid(selectedConversation.value.from, data?.conversationJid)
      ) {
        void loadConversationReactions(selectedConversation.value.from);
      }
    };

    const handleDeletedMessage = data => {
      removeDeletedMessageFromState(data);
      void loadMessages();
    };

    // Register listeners
    socket.on(incomingEventName, handleIncoming);
    socket.on(outgoingEventName, handleOutgoing);
    socket.on(profileUpdateEventName, handleProfileUpdate); // ✅ NEW: Listen for profile picture updates
    socket.on(mediaUpdateEventName, handleMediaUpdate);
    socket.on(statusEventName, handleMessageStatus);
    socket.on(reactionEventName, handleReaction);
    socket.on(deletedMessageEventName, handleDeletedMessage);
    
    socketCleanup = () => {
      socket.off(incomingEventName, handleIncoming);
      socket.off(outgoingEventName, handleOutgoing);
      socket.off(profileUpdateEventName, handleProfileUpdate); // ✅ Cleanup profile update listener
      socket.off(mediaUpdateEventName, handleMediaUpdate);
      socket.off(statusEventName, handleMessageStatus);
      socket.off(reactionEventName, handleReaction);
      socket.off(deletedMessageEventName, handleDeletedMessage);
    };
  } catch (e) {
    // Socket setup failed, silently ignore
  }
};

const focusReplyInput = async ({ force = false, afterPaint = false } = {}) => {
  await nextTick();
  if (afterPaint && typeof window.requestAnimationFrame === 'function') {
    await new Promise(resolve => window.requestAnimationFrame(resolve));
  }
  const textarea = replyTextarea.value
    || document.getElementById('inbox-reply-textarea');
  if (!textarea || !selectedConversation.value) return false;

  const activeElement = document.activeElement;
  const hasUserFocusElsewhere = activeElement
    && activeElement !== document.body
    && activeElement !== textarea;
  if (!force && hasUserFocusElsewhere) return false;

  try {
    textarea.focus({ preventScroll: true });
  } catch {
    textarea.focus();
  }
  return document.activeElement === textarea;
};

const scheduledReplyFocusTimers = new Set();

const clearScheduledReplyFocus = () => {
  scheduledReplyFocusTimers.forEach(timer => clearTimeout(timer));
  scheduledReplyFocusTimers.clear();
};

const scheduleReplyInputFocus = () => {
  clearScheduledReplyFocus();
  const conversationFrom = selectedConversation.value?.from;
  if (!conversationFrom) return;

  [0, 80, 200, 500, 900].forEach((delay) => {
    const timer = setTimeout(async () => {
      scheduledReplyFocusTimers.delete(timer);
      if (
        !sameConversationJid(selectedConversation.value?.from, conversationFrom)
        || isOpeningNavigationTarget.value
      ) return;

      const textarea = replyTextarea.value;
      const modal = textarea?.closest?.('.conversation-modal');
      const activeElement = document.activeElement;
      const userSelectedAnotherModalControl = Boolean(
        modal?.contains(activeElement) && activeElement !== textarea,
      );
      if (userSelectedAnotherModalControl) {
        clearScheduledReplyFocus();
        return;
      }

      await focusReplyInput({ force: true, afterPaint: delay === 0 });
    }, delay);
    scheduledReplyFocusTimers.add(timer);
  });
};

const handleInboxComposerTyping = async (event) => {
  const targetIsExternal = !event.target?.closest?.('.conversation-modal');
  const blocked = Boolean(
    addContactModal.value.show
    || deleteModal.value.show
    || imagePreview.value
    || reactionDetails.value,
  );
  if (!shouldRedirectInboxTyping(event, {
    conversationOpen: Boolean(selectedConversation.value),
    blocked,
    targetIsExternal,
  })) return;

  const textarea = replyTextarea.value;
  const hasComposerFocus = document.activeElement === textarea;
  const { value, caret } = insertComposerCharacter(
    replyText.value,
    event.key,
    hasComposerFocus ? textarea?.selectionStart : undefined,
    hasComposerFocus ? textarea?.selectionEnd : undefined,
  );

  event.preventDefault();
  replyText.value = value;
  await focusReplyInput({ force: true });
  await nextTick();
  replyTextarea.value?.setSelectionRange?.(caret, caret);
};

const viewConversation = async (conv, { targetMessageId = '' } = {}) => {
  const generation = ++conversationOpenGeneration;
  const conversationFrom = conv.from;
  const isDifferentConversation = !sameConversationJid(
    sentMessagesConversationJid.value,
    conversationFrom,
  );

  if (isDifferentConversation) {
    cacheCurrentConversationSnapshot();
    conversationRequestController?.abort();
    conversationRequestController = new AbortController();

    latestTimelineRequest++;
    const snapshot = getConversationSnapshot(conversationFrom);
    sentMessages.value = snapshot?.sentMessages || [];
    sentMessagesConversationJid.value = conversationFrom;
    conversationReactions.value = snapshot?.reactions || [];
    conversationTimelineCursor.value = snapshot?.timelineCursor || '';
    conversationHasMoreTimeline.value = snapshot?.hasMoreTimeline ?? true;
    failedMediaIds.value = new Set();
    activatedMediaIds.value = new Set();
    replyText.value = '';
    clearAttachment();
    resetAttachmentDrag();
    closeMessagePopups();
  }

  isPreparingConversation.value = true;
  isConversationViewportReady.value = false;
  conversationUserTookScrollControl.value = false;
  const snapshot = getConversationSnapshot(conversationFrom);
  selectedConversation.value = {
    ...conv,
    messages: snapshot?.incomingMessages?.length
      ? snapshot.incomingMessages
      : conv.messages,
  };
  replyText.value = '';

  try {
    await focusReplyInput({ force: true });

    // Fetch one combined timeline so incoming and outgoing messages share the
    // same 30-message window and one stable cursor.
    const backgroundSynchronization = Promise.allSettled([
      markConversationAsRead(conversationFrom),
      loadConversationReactions(
        conversationFrom,
        conversationRequestController?.signal,
      ),
    ]);
    try {
      await loadConversationTimeline(conversationFrom, {
        signal: conversationRequestController?.signal,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal memuat percakapan');
    }
    void backgroundSynchronization;

    if (
      generation !== conversationOpenGeneration
      || !sameConversationJid(selectedConversation.value?.from, conversationFrom)
    ) return;

    await nextTick();

    let didFocusTarget = targetMessageId
      ? await focusInboxMessage(String(targetMessageId))
      : false;

    // Navigation from sent-history can point to an older message. Load a few
    // cursor pages on demand instead of returning the entire conversation in
    // the initial Inbox payload.
    for (
      let attempt = 0;
      targetMessageId && !didFocusTarget && conversationHasMoreHistory.value && attempt < 8;
      attempt += 1
    ) {
      await loadOlderConversationMessages();
      didFocusTarget = await focusInboxMessage(String(targetMessageId));
    }

    if (!didFocusTarget && !conversationUserTookScrollControl.value) {
      await startInitialBottomPin();
    } else {
      isConversationViewportReady.value = true;
    }
  } finally {
    if (generation === conversationOpenGeneration) {
      isPreparingConversation.value = false;
    }
  }
};

const getMessageDomId = message => String(
  message?.id || message?.waMessageId || message?.tempId || message?.pkId || '',
);

const getInboxNavigationTarget = () => {
  const deviceId = String(route.query.device || '');
  const conversationJid = String(route.query.conversation || '');
  const messageId = String(route.query.message || '');
  const displayName = String(route.query.displayName || '');
  const isGroup = String(route.query.isGroup || '') === 'true';
  const profilePicUrl = String(route.query.profilePicUrl || '');
  const requestedReturnRoute = String(route.query.returnTo || '');
  const returnTo = ['contacts', 'groups'].includes(requestedReturnRoute)
    ? requestedReturnRoute
    : '';
  if (!deviceId || !conversationJid) return null;
  return {
    deviceId,
    conversationJid,
    messageId,
    displayName,
    isGroup,
    profilePicUrl,
    returnTo,
  };
};

const clearInboxNavigationQuery = () => {
  const query = { ...route.query };
  delete query.device;
  delete query.conversation;
  delete query.message;
  delete query.displayName;
  delete query.isGroup;
  delete query.profilePicUrl;
  delete query.returnTo;
  return router.replace({ name: 'inbox', query });
};

const createEmptyConversation = target => {
  const isGroup = target.isGroup || target.conversationJid.endsWith('@g.us');
  const fallbackName = isGroup ? 'Grup WhatsApp' : 'Kontak WhatsApp';
  const displayName = target.displayName || fallbackName;
  const phone = target.conversationJid.split('@')[0].split(':')[0];

  return {
    from: target.conversationJid,
    contact: isGroup
      ? null
      : { firstName: displayName, lastName: '', phone, colorCode: null },
    pushName: isGroup ? null : displayName,
    groupName: isGroup ? displayName : null,
    groupPicUrl: isGroup ? target.profilePicUrl || null : null,
    profilePicUrl: isGroup ? null : target.profilePicUrl || null,
    isGroup,
    messages: [],
    latestMessage: {
      from: target.conversationJid,
      message: '',
      receivedAt: new Date().toISOString(),
    },
    messageCount: 0,
    unreadCount: 0,
  };
};

const mergeNavigationMetadata = (conversation, target) => {
  const isGroup = Boolean(
    target.isGroup
    || conversation?.isGroup
    || target.conversationJid.endsWith('@g.us'),
  );
  const displayName = target.displayName || '';
  const phone = target.conversationJid.split('@')[0].split(':')[0];

  return {
    ...conversation,
    isGroup,
    groupName: isGroup
      ? (conversation?.groupName || displayName || null)
      : conversation?.groupName || null,
    groupPicUrl: isGroup
      ? (conversation?.groupPicUrl || target.profilePicUrl || null)
      : conversation?.groupPicUrl || null,
    profilePicUrl: !isGroup
      ? (conversation?.profilePicUrl || target.profilePicUrl || null)
      : conversation?.profilePicUrl || null,
    contact: !isGroup && !conversation?.contact && displayName
      ? { firstName: displayName, lastName: '', phone, colorCode: null }
      : conversation?.contact || null,
    pushName: !isGroup
      ? (conversation?.pushName || displayName || null)
      : conversation?.pushName || null,
  };
};

const fetchNavigationConversation = async target => {
  try {
    const [inboxResponse, outboxResponse] = await Promise.all([
      userApi.get(`/devices/${target.deviceId}/inbox`, {
        params: {
          conversationJid: target.conversationJid,
          page: 1,
          pageSize: 1,
          _t: Date.now(),
        },
        headers: { 'Cache-Control': 'no-cache, no-store' },
      }),
      userApi.get(`/devices/${target.deviceId}/outbox/conversations`, {
        params: { recipients: target.conversationJid, _t: Date.now() },
        headers: { 'Cache-Control': 'no-cache, no-store' },
      }).catch(() => ({ data: [] })),
    ]);

    const inboxPayload = inboxResponse?.data;
    const incoming = Array.isArray(inboxPayload)
      ? inboxPayload
      : Array.isArray(inboxPayload?.data)
        ? inboxPayload.data
        : [];
    const outgoingPayload = outboxResponse?.data;
    const outgoing = Array.isArray(outgoingPayload)
      ? outgoingPayload
      : Array.isArray(outgoingPayload?.data)
        ? outgoingPayload.data
        : [];
    const incomingMessages = incoming
      .filter(message => sameConversationJid(message.from, target.conversationJid))
      .sort((left, right) => new Date(left.receivedAt) - new Date(right.receivedAt));
    const outgoingSummary = outgoing.find(message =>
      sameConversationJid(message.to, target.conversationJid)
    ) || null;

    if (incomingMessages.length === 0 && !outgoingSummary) {
      return createEmptyConversation(target);
    }

    const newestIncoming = incomingMessages[incomingMessages.length - 1] || null;
    const identityMessage = [...incomingMessages].reverse().find(message =>
      message.groupName || message.pushName || message.contact
    ) || newestIncoming;
    const outgoingLatest = outgoingSummary
      ? {
          ...outgoingSummary,
          from: target.conversationJid,
          message: outgoingSummary.message || '',
          receivedAt: outgoingSummary.createdAt,
          isOutgoing: true,
        }
      : null;
    const latestMessage = !newestIncoming
      ? outgoingLatest
      : !outgoingLatest
        ? newestIncoming
        : new Date(outgoingLatest.receivedAt) > new Date(newestIncoming.receivedAt)
          ? outgoingLatest
          : newestIncoming;
    const isGroup = Boolean(
      target.isGroup
      || target.conversationJid.endsWith('@g.us')
      || identityMessage?.isGroup
      || outgoingSummary?.isGroup,
    );

    return mergeNavigationMetadata({
      from: target.conversationJid,
      contact: identityMessage?.contact || outgoingSummary?.contact || null,
      pushName: identityMessage?.pushName || outgoingSummary?.pushName || null,
      groupName: identityMessage?.groupName || outgoingSummary?.groupName || null,
      groupPicUrl: identityMessage?.groupPicUrl || outgoingSummary?.groupPicUrl || null,
      profilePicUrl: identityMessage?.profilePicUrl || outgoingSummary?.profilePicUrl || null,
      isGroup,
      messages: incomingMessages,
      latestMessage: latestMessage || createEmptyConversation(target).latestMessage,
      messageCount: Number(inboxPayload?.metadata?.totalMessages)
        || incomingMessages.length + (Number(outgoingSummary?.messageCount) || 0),
      unreadCount: incomingMessages.filter(message => !message.isRead).length,
    }, target);
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Gagal memuat percakapan tujuan');
    return createEmptyConversation(target);
  }
};

const focusInboxMessage = async messageId => {
  if (!messageId) return false;
  await nextTick();

  const container = chatMessagesContainer.value;
  const element = Array.from(container?.querySelectorAll('[data-message-id]') || [])
    .find(item => item.dataset.messageId === messageId);
  if (!container || !element) return false;

  const centeredTop = element.offsetTop
    - Math.max(0, (container.clientHeight - element.offsetHeight) / 2);
  const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
  container.scrollTop = Math.min(maxScrollTop, Math.max(0, centeredTop));

  highlightedMessageId.value = messageId;
  if (messageHighlightTimer) clearTimeout(messageHighlightTimer);
  messageHighlightTimer = setTimeout(() => {
    if (highlightedMessageId.value === messageId) highlightedMessageId.value = '';
    messageHighlightTimer = null;
  }, 2600);
  return true;
};

const openInboxNavigationTarget = async ({ reload = true } = {}) => {
  const target = getInboxNavigationTarget();
  if (!target) return;

  const generation = ++inboxNavigationGeneration;
  isOpeningNavigationTarget.value = true;

  try {
    const targetDevice = devices.value.find(device => device.id === target.deviceId);
    if (!targetDevice) {
      await clearInboxNavigationQuery();
      return;
    }

    const deviceChanged = selectedDeviceId.value !== target.deviceId;
    selectedDeviceId.value = target.deviceId;
    localStorage.setItem('device_selected_id', target.deviceId);
    q.value = '';
    page.value = 1;

    if (reload) await loadMessages();
    if (generation !== inboxNavigationGeneration) return;
    if (deviceChanged) setupSocketListener();

    let conversation = conversations.value.find(item =>
      sameConversationJid(item.from, target.conversationJid),
    );
    if (!conversation) conversation = await fetchNavigationConversation(target);
    if (generation !== inboxNavigationGeneration) return;
    conversation = mergeNavigationMetadata(conversation, target);
    conversationReturnRoute.value = target.returnTo;
    conversationOpenedFromNavigation.value = true;
    await viewConversation(conversation, { targetMessageId: target.messageId });
    if (generation !== inboxNavigationGeneration) return;

    await clearInboxNavigationQuery();
  } finally {
    if (generation === inboxNavigationGeneration) {
      isOpeningNavigationTarget.value = false;
      await focusReplyInput({ force: true, afterPaint: true });
    }
  }
};

const mapTimelineIncomingMessage = row => ({
  pkId: row.sourcePkId,
  id: row.id,
  message: row.message || '',
  mediaPath: row.mediaPath || '',
  fileName: row.fileName || '',
  mediaType: row.mediaType || '',
  isRead: Boolean(row.isRead),
  receivedAt: row.timestamp,
  participant: row.participant || null,
  pushName: row.pushName || null,
  groupName: row.groupName || null,
});

const mapTimelineOutgoingMessage = row => {
  const readBy = Array.isArray(row.readBy) ? row.readBy : [];
  return {
    tempId: row.id,
    text: row.message || '',
    mediaPath: row.mediaPath || '',
    fileName: row.fileName || '',
    mediaType: row.mediaType || '',
    timestamp: row.timestamp,
    status: resolveOutgoingUiStatus(row.status, {
      readCount: readBy.length,
      isGroup: Boolean(row.isGroup),
    }),
    deletedForEveryone:
      String(row.status || '').toLowerCase() === 'revoked'
      || row.message === DELETED_MESSAGE_TEXT,
    waMessageId: row.waMessageId || null,
    isGroup: Boolean(row.isGroup),
    readBy,
    readCount: readBy.length,
  };
};

const mergeTimelinePage = (current, page, getKey) => {
  const byId = new Map();
  [...page, ...current].forEach(message => {
    const key = getKey(message);
    if (key && !byId.has(key)) byId.set(key, message);
  });
  return [...byId.values()];
};

const loadConversationTimeline = async (
  conversationFrom,
  { before = '', appendOlder = false, mergeLatest = false, signal } = {},
) => {
  const requestId = ++latestTimelineRequest;
  const requestedDeviceId = selectedDeviceId.value;
  try {
    const { data } = await userApi.get(
      `/devices/${selectedDeviceId.value}/inbox/timeline`,
      {
        params: {
          conversationJid: conversationFrom,
          limit: 30,
          ...(before ? { before } : {}),
          _t: Date.now(),
        },
        signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      },
    );

    if (
      requestId !== latestTimelineRequest
      || requestedDeviceId !== selectedDeviceId.value
      || !sameConversationJid(selectedConversation.value?.from, conversationFrom)
    ) return;

    const rows = Array.isArray(data?.data) ? data.data : [];
    const incomingPage = rows
      .filter(row => row.direction === 'incoming')
      .map(mapTimelineIncomingMessage);
    const outgoingPage = rows
      .filter(row => row.direction === 'outgoing')
      .map(mapTimelineOutgoingMessage);
    const shouldMerge = appendOlder || mergeLatest;

    selectedConversation.value.messages = mergeTimelinePage(
      shouldMerge ? selectedConversation.value.messages : [],
      incomingPage,
      message => message.id || message.pkId,
    ).sort((left, right) => new Date(left.receivedAt) - new Date(right.receivedAt));
    // A timeline response can have been queried just before a Socket.IO ACK.
    // Merge its statuses monotonically so a stale pending row cannot replace
    // server_ack, delivery_ack, or read already visible in the browser.
    sentMessages.value = mergeOutgoingSnapshotStatuses(
      sentMessages.value,
      outgoingPage,
      { keepUnmatchedCurrent: shouldMerge },
    ).sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp));
    sentMessagesConversationJid.value = conversationFrom;

    if (!mergeLatest) {
      conversationTimelineCursor.value = data?.metadata?.nextCursor || '';
      conversationHasMoreTimeline.value = Boolean(data?.metadata?.hasMore);
    }
    cacheConversationSnapshot(conversationFrom, {
      incomingMessages: selectedConversation.value.messages,
      sentMessages: sentMessages.value,
      timelineCursor: conversationTimelineCursor.value,
      hasMoreTimeline: conversationHasMoreTimeline.value,
    });
  } catch (error) {
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return;
    throw error;
  }
};

const loadConversationReactions = async (conversationFrom, signal) => {
  const requestId = ++latestReactionsRequest;
  const requestedDeviceId = selectedDeviceId.value;
  try {
    const { data } = await userApi.get(
      `/devices/${selectedDeviceId.value}/inbox/reactions`,
      {
        params: {
          conversationJid: conversationFrom,
          _t: Date.now(),
        },
        signal,
        headers: { 'Cache-Control': 'no-cache, no-store' },
      },
    );

    if (
      requestId !== latestReactionsRequest
      || requestedDeviceId !== selectedDeviceId.value
      || !sameConversationJid(selectedConversation.value?.from, conversationFrom)
    ) return;
    conversationReactions.value = Array.isArray(data) ? data : [];
    cacheConversationSnapshot(conversationFrom, {
      reactions: conversationReactions.value,
    });
    conversationReactions.value.forEach(reaction => {
      removeReactionPlaceholder(reaction.reactionMessageId);
    });
  } catch {
    // Reaction is optional metadata. Preserve the last in-memory snapshot when
    // refresh fails so opening a conversation never flashes empty state.
  }
};

// ✅ NEW: Mark conversation as read (clear unread badge) - persisten ke database
const markConversationAsRead = async (from) => {
  const unreadMessages = messages.value.filter(msg => msg.from === from && !msg.isRead);
  if (unreadMessages.length === 0) return true;

  try {
    // Update UI immediately (optimistic update)
    messages.value = messages.value.map(msg => {
      if (msg.from === from) {
        return { ...msg, isRead: true, conversationUnreadCount: 0 };
      }
      return msg;
    });

    // Also update in selectedConversation if open
    if (selectedConversation.value && selectedConversation.value.from === from) {
      selectedConversation.value.messages = selectedConversation.value.messages.map(msg => ({
        ...msg,
        isRead: true
      }));
    }

    // Call API to persist to database
    await userApi.put(`/devices/${selectedDeviceId.value}/inbox/conversation/read`, {
      from: from,
    });
    return true;
  } catch (e) {
    // Restore only messages that were unread before this request. This prevents
    // the UI from claiming the badge is cleared when persistence failed.
    const unreadIds = new Set(unreadMessages.map(msg => msg.id));
    messages.value = messages.value.map(msg =>
      unreadIds.has(msg.id) ? { ...msg, isRead: false } : msg
    );
    if (selectedConversation.value?.from === from) {
      selectedConversation.value.messages = selectedConversation.value.messages.map(msg =>
        unreadIds.has(msg.id) ? { ...msg, isRead: false } : msg
      );
    }
    toast.error(e?.response?.data?.message || 'Gagal menyimpan status pesan dibaca');
    return false;
  }
};

// Load sent messages from database (OutgoingMessage)
// Close conversation
const closeConversation = () => {
  cacheCurrentConversationSnapshot();
  releaseInitialBottomPin();
  conversationRequestController?.abort();
  conversationRequestController = null;
  const returnRoute = conversationReturnRoute.value;
  const shouldRestoreInbox = conversationOpenedFromNavigation.value && !returnRoute;
  conversationReturnRoute.value = '';
  conversationOpenedFromNavigation.value = false;
  conversationOpenGeneration++;
  latestTimelineRequest++;
  latestReactionsRequest++;
  sentMessagesConversationJid.value = '';
  isPreparingConversation.value = false;
  loadingOlderMessages.value = false;
  conversationTimelineCursor.value = '';
  conversationHasMoreTimeline.value = false;
  isConversationFullscreen.value = false;
  resetAttachmentDrag();
  closeImagePreview();
  clearAttachment();
  conversationReactions.value = [];
  closeReactionDetails();
  reactionPickerMessageKey.value = '';
  sendingReactionMessageKey.value = '';
  messageActionMenuKey.value = '';
  addContactModal.value.show = false;
  selectedConversation.value = null;
  if (returnRoute) {
    void router.push({ name: returnRoute });
  } else if (shouldRestoreInbox) {
    q.value = '';
    page.value = 1;
    void loadMessages();
  }
};

// Auto-resize textarea
const autoResizeTextarea = () => {
  const textarea = replyTextarea.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }
};

// Watch reply text for auto-resize
watch(replyText, () => {
  autoResizeTextarea();
});

// Scroll chat to bottom
const isConversationNearBottom = (threshold = 96) => {
  const container = chatMessagesContainer.value;
  if (!container) return true;
  return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
};

const releaseInitialBottomPin = () => {
  isInitialBottomPinning.value = false;
  if (bottomPinReleaseTimer) clearTimeout(bottomPinReleaseTimer);
  bottomPinReleaseTimer = null;
};

const takeConversationScrollControl = () => {
  conversationUserTookScrollControl.value = true;
  releaseInitialBottomPin();
};

const scrollToBottom = async ({ force = true } = {}) => {
  if (!force && !isConversationNearBottom(140)) return false;
  await nextTick();

  const container = chatMessagesContainer.value;
  if (!container) return false;

  // Scroll only the chat viewport. scrollIntoView() can also move ancestor
  // scrollers and caused the modal to visibly jump while media was settling.
  container.scrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
  return true;
};

const startInitialBottomPin = async () => {
  isInitialBottomPinning.value = true;
  if (bottomPinReleaseTimer) clearTimeout(bottomPinReleaseTimer);
  await scrollToBottom({ force: true });
  isConversationViewportReady.value = true;
  bottomPinReleaseTimer = setTimeout(() => {
    releaseInitialBottomPin();
  }, 1200);
};

const handleConversationMediaLoaded = () => {
  if (isInitialBottomPinning.value || isConversationNearBottom(140)) {
    void scrollToBottom({ force: true });
  }
};

const loadOlderConversationMessages = async () => {
  if (
    loadingOlderMessages.value
    || !selectedConversation.value
    || !conversationHasMoreHistory.value
  ) return;

  releaseInitialBottomPin();

  const conversationFrom = selectedConversation.value.from;
  const container = chatMessagesContainer.value;
  const previousScrollHeight = container?.scrollHeight || 0;
  const previousScrollTop = container?.scrollTop || 0;
  loadingOlderMessages.value = true;

  try {
    await loadConversationTimeline(conversationFrom, {
      before: conversationTimelineCursor.value,
      appendOlder: true,
      signal: conversationRequestController?.signal,
    });

    if (
      container
      && sameConversationJid(selectedConversation.value?.from, conversationFrom)
    ) {
      await nextTick();
      container.scrollTop = previousScrollTop
        + Math.max(0, container.scrollHeight - previousScrollHeight);
    }
  } finally {
    loadingOlderMessages.value = false;
  }
};

const handleConversationScroll = event => {
  closeMessagePopups();
  if (!isInitialBottomPinning.value && event?.currentTarget?.scrollTop <= 80) {
    void loadOlderConversationMessages();
  }
};

// ✅ NEW: Scroll conversation list to top (for new incoming messages)
const scrollConversationListToTop = () => {
  const listContainer = document.querySelector('.messages-list');
  if (listContainer) {
    listContainer.scrollTop = 0;
  }
};

// Handle Enter key: Send on Enter, new line on Shift+Enter
const handleEnterKey = (event) => {
  if (!event.shiftKey) {
    event.preventDefault();
    sendReply();
  }
};

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MAX_ATTACHMENT_SIZE = MEDIA_MAX_SIZE;
const SUPPORTED_PASTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const selectAttachment = (file) => {
  if (!file) return false;

  if (file.size > MAX_ATTACHMENT_SIZE) {
    toast.error('Ukuran lampiran maksimal 25 MB');
    return false;
  }

  if (attachmentPreviewUrl.value) URL.revokeObjectURL(attachmentPreviewUrl.value);
  selectedAttachment.value = file;
  attachmentPreviewUrl.value = URL.createObjectURL(file);
  return true;
};

const isSupportedAttachment = isSupportedMediaFile;

const clearAttachment = () => {
  if (attachmentPreviewUrl.value) URL.revokeObjectURL(attachmentPreviewUrl.value);
  attachmentPreviewUrl.value = '';
  selectedAttachment.value = null;
  if (attachmentInput.value) attachmentInput.value.value = '';
};

const handleAttachmentChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!isSupportedAttachment(file)) {
    toast.error('Tipe file tidak didukung');
    event.target.value = '';
    return;
  }

  if (!selectAttachment(file)) {
    event.target.value = '';
  }
};

const getPastedImage = (clipboardData) => {
  if (!clipboardData) return null;

  const imageItem = Array.from(clipboardData.items || []).find(
    item => item.kind === 'file' && item.type.startsWith('image/'),
  );
  const itemFile = imageItem?.getAsFile?.();
  if (itemFile) return itemFile;

  return Array.from(clipboardData.files || []).find(
    file => file.type.startsWith('image/'),
  ) || null;
};

const handleReplyPaste = (event) => {
  const imageFile = getPastedImage(event.clipboardData);
  if (!imageFile) return;

  event.preventDefault();

  if (sendingReply.value) {
    toast.warning('Tunggu hingga pesan sebelumnya selesai dikirim');
    return;
  }

  if (selectedAttachment.value) {
    toast.warning('Hapus lampiran yang dipilih sebelum menempel gambar baru');
    return;
  }

  if (!SUPPORTED_PASTED_IMAGE_TYPES.has(imageFile.type.toLowerCase())) {
    toast.error('Format gambar clipboard harus JPG, PNG, GIF, atau WebP');
    return;
  }

  selectAttachment(imageFile);
};

const hasDraggedFiles = (dataTransfer) => {
  if (!dataTransfer) return false;
  return Array.from(dataTransfer.types || []).includes('Files')
    || Array.from(dataTransfer.items || []).some(item => item.kind === 'file');
};

const resetAttachmentDrag = () => {
  attachmentDragDepth = 0;
  isDraggingAttachment.value = false;
};

const handleConversationDragEnter = (event) => {
  if (!hasDraggedFiles(event.dataTransfer)) return;
  attachmentDragDepth += 1;
  isDraggingAttachment.value = true;
};

const handleConversationDragOver = (event) => {
  if (!hasDraggedFiles(event.dataTransfer)) return;
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
};

const handleConversationDragLeave = (event) => {
  if (!hasDraggedFiles(event.dataTransfer)) return;
  attachmentDragDepth = Math.max(0, attachmentDragDepth - 1);
  if (attachmentDragDepth === 0) isDraggingAttachment.value = false;
};

const handleConversationDrop = (event) => {
  const files = Array.from(event.dataTransfer?.files || []);
  resetAttachmentDrag();

  if (files.length === 0) return;
  if (sendingReply.value) {
    toast.warning('Tunggu hingga pesan sebelumnya selesai dikirim');
    return;
  }
  if (selectedAttachment.value) {
    toast.warning('Hapus lampiran yang dipilih sebelum menambahkan file baru');
    return;
  }
  if (files.length > 1) {
    toast.warning('Saat ini hanya satu file yang dapat dikirim dalam satu pesan');
    return;
  }

  const [file] = files;
  if (!isSupportedAttachment(file)) {
    toast.error('Tipe file tidak didukung');
    return;
  }

  selectAttachment(file);
};

const sendMediaReply = async () => {
  const file = selectedAttachment.value;
  if (!file || !selectedConversation.value) return;

  const caption = replyText.value.trim();
  const recipient = selectedConversation.value.from;
  const isGroup = selectedConversation.value.isGroup || recipient.includes('@g.us');
  const kind = attachmentKind.value;
  const localPreviewUrl = attachmentPreviewUrl.value;
  const placeholders = {
    image: '[Gambar]',
    video: '[Video]',
    audio: '[Audio]',
    document: file.name,
  };
  const tempId = createOutgoingMessageId();
  const optimisticMessage = {
    tempId,
    text: caption || placeholders[kind],
    mediaPath: localPreviewUrl,
    fileName: file.name,
    timestamp: new Date().toISOString(),
    status: 'sending',
    isGroup,
    readBy: [],
    readCount: 0,
  };

  sentMessages.value.push(optimisticMessage);
  selectedAttachment.value = null;
  attachmentPreviewUrl.value = '';
  if (attachmentInput.value) attachmentInput.value.value = '';
  replyText.value = '';
  sendingReply.value = true;
  setTimeout(() => scrollToBottom(), 50);

  try {
    const formData = new FormData();
    formData.append('recipient', recipient);
    formData.append('caption', caption);
    formData.append('messageId', tempId);
    formData.append('media', file);

    const { data } = await deviceApi.post('/messages/send/media', formData);
    const saved = data?.message;
    if (!saved?.id) throw new Error('Media terkirim tetapi data pesan tidak ditemukan');

    const savedMessageId = saved.waMessageId || saved.id;
    const msgIndex = sentMessages.value.findIndex(message =>
      message.tempId === tempId ||
      message.tempId === savedMessageId ||
      message.waMessageId === savedMessageId
    );
    let responseUiStatus = normalizeOutgoingUiStatus(saved.status) || 'sending';
    if (msgIndex >= 0) {
      responseUiStatus = mergeOutgoingResponseStatus(
        sentMessages.value[msgIndex].status,
        saved.status,
      );
      sentMessages.value[msgIndex] = {
        ...sentMessages.value[msgIndex],
        tempId: savedMessageId,
        waMessageId: savedMessageId,
        text: saved.message || optimisticMessage.text,
        mediaPath: saved.mediaPath || localPreviewUrl,
        fileName: saved.fileName || optimisticMessage.fileName,
        timestamp: saved.createdAt || optimisticMessage.timestamp,
        status: responseUiStatus,
      };
      sentMessages.value = [...sentMessages.value];
    }
    if (saved.mediaPath && localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);

    const summaryIndex = outgoingConversationSummaries.value.findIndex(
      message => message.to === recipient,
    );
    const previousSummary = summaryIndex >= 0
      ? outgoingConversationSummaries.value[summaryIndex]
      : null;
    responseUiStatus = mergeOutgoingResponseStatus(
      previousSummary?.status || responseUiStatus,
      responseUiStatus,
    );
    const summary = {
      ...previousSummary,
      ...saved,
      to: recipient,
      message: saved.message || optimisticMessage.text,
      createdAt: saved.createdAt || optimisticMessage.timestamp,
      status: responseUiStatus,
      messageCount:
        (Number(previousSummary?.messageCount) || 0) +
        (previousSummary?.id === saved.id ? 0 : 1),
      contact: saved.contact || selectedConversation.value.contact || previousSummary?.contact || null,
    };
    if (summaryIndex >= 0) outgoingConversationSummaries.value.splice(summaryIndex, 1);
    outgoingConversationSummaries.value.unshift(summary);

    // Status pengiriman sudah ditampilkan oleh ikon pada bubble chat.
    // Toast hanya digunakan untuk kegagalan agar respons awal server tidak
    // disalahartikan sebagai konfirmasi bahwa media telah sampai ke penerima.
    scheduleConversationStatusReconciliation(recipient);
    setTimeout(() => scrollToBottom(), 50);
  } catch (error) {
    const failureConfirmed = isConfirmedOutgoingFailure(error);
    const msgIndex = sentMessages.value.findIndex(message => message.tempId === tempId);
    if (msgIndex >= 0) {
      sentMessages.value[msgIndex].status = failureConfirmed ? 'error' : 'sending';
      sentMessages.value = [...sentMessages.value];
    }
    const errorMessage = getOutgoingFailureMessage(error, 'Gagal mengirim media');
    if (failureConfirmed) {
      toast.error(errorMessage);
    } else {
      toast.warning('Status pengiriman media belum terkonfirmasi. Sistem akan memeriksanya kembali.');
      scheduleConversationStatusReconciliation(recipient);
    }
  } finally {
    sendingReply.value = false;
  }
};

// Send reply message
const sendReply = async () => {
  if (sendingReply.value || !selectedConversation.value) {
    return;
  }

  if (selectedAttachment.value) {
    await sendMediaReply();
    return;
  }

  if (!replyText.value.trim()) return;

  const messageText = replyText.value.trim();
  const tempId = createOutgoingMessageId();
  
  const optimisticMessage = {
    tempId,
    text: messageText,
    timestamp: new Date().toISOString(),
    status: 'sending',
    isGroup: selectedConversation.value.isGroup || false,
    readBy: [],
    readCount: 0,
  };
  
  sentMessages.value.push(optimisticMessage);
  replyText.value = '';
  setTimeout(() => scrollToBottom(), 50);
  
  sendingReply.value = true;

  try {
    const device = devices.value.find(d => d.id === selectedDeviceId.value);
    if (!device) {
      throw confirmedOutgoingError('Device tidak ditemukan');
    }

    if (!device.isConnected) {
      throw confirmedOutgoingError('Device tidak terhubung. Silakan pilih device lain atau hubungkan kembali WhatsApp.');
    }

    const recipient = selectedConversation.value.from;
    const isGroup = selectedConversation.value.isGroup || recipient.includes('@g.us');
    const recipientFormatted = recipient;
    
    const response = await deviceApi.post('/messages/send', [
      {
        recipient: recipientFormatted,
        type: isGroup ? 'group' : 'number',
        message: messageText,
        delay: 0,
        options: { messageId: tempId },
      }
    ]);

    const errors = response?.data?.errors || [];
    if (errors.length > 0) {
      throw confirmedOutgoingError(errors[0]?.error || 'Gagal mengirim pesan');
    }

    const results = response?.data?.results || [];
    
    if (results.length === 0) {
      throw new Error('Tidak ada hasil dari pengiriman pesan');
    }
    
    const resultEntry = results[0];
    const savedMessage = resultEntry?.message || resultEntry?.outgoingMessage || null;
    const databaseStatus = savedMessage?.status || resultEntry?.status;
    // The durable row was reserved before send and is the canonical tracking
    // identity. Prefer it over the transport response so an unexpected Baileys
    // ID mismatch cannot detach the optimistic bubble from later DB updates.
    const waMessageId =
      savedMessage?.waMessageId ||
      savedMessage?.id ||
      resultEntry?.result?.key?.id;
    const messageTimestamp = resultEntry?.result?.messageTimestamp;

    const msgIndex = sentMessages.value.findIndex(m =>
      m.tempId === tempId ||
      m.tempId === waMessageId ||
      m.waMessageId === waMessageId
    );
    let responseUiStatus = normalizeOutgoingUiStatus(databaseStatus) || 'sending';
    
    if (msgIndex !== -1) {
      responseUiStatus = mergeOutgoingResponseStatus(
        sentMessages.value[msgIndex].status,
        databaseStatus,
      );
      sentMessages.value[msgIndex] = {
        ...sentMessages.value[msgIndex],
        status: responseUiStatus,
        waMessageId: waMessageId,
        tempId: waMessageId,
        timestamp: messageTimestamp ? new Date(Number(messageTimestamp) * 1000).toISOString() : sentMessages.value[msgIndex].timestamp,
      };
      
      sentMessages.value = [...sentMessages.value];
    } else {
      if (waMessageId) {
        const newMessage = {
          tempId: waMessageId,
          text: messageText,
          timestamp: messageTimestamp ? new Date(Number(messageTimestamp) * 1000).toISOString() : new Date().toISOString(),
          status: responseUiStatus,
          waMessageId: waMessageId,
          isGroup: selectedConversation.value.isGroup || false,
          readBy: [],
          readCount: 0,
        };
        
        sentMessages.value.push(newMessage);
        sentMessages.value = [...sentMessages.value];
      }
    }
    
    const existingSummaryIndex = outgoingConversationSummaries.value.findIndex(
      message => message.to === recipient,
    );
    const existingSummary = existingSummaryIndex >= 0
      ? outgoingConversationSummaries.value[existingSummaryIndex]
      : null;
    responseUiStatus = mergeOutgoingResponseStatus(
      existingSummary?.status || responseUiStatus,
      responseUiStatus,
    );
    const summary = {
      ...existingSummary,
      id: waMessageId || tempId,
      waMessageId: waMessageId || null,
      to: recipient,
      message: messageText,
      createdAt: messageTimestamp
        ? new Date(Number(messageTimestamp) * 1000).toISOString()
        : new Date().toISOString(),
      status: responseUiStatus,
      isGroup,
      contact: selectedConversation.value.contact || existingSummary?.contact || null,
      messageCount:
        (Number(existingSummary?.messageCount) || 0) +
        (existingSummary?.id === (waMessageId || tempId) ? 0 : 1),
    };
    if (existingSummaryIndex >= 0) {
      outgoingConversationSummaries.value.splice(existingSummaryIndex, 1);
    }
    outgoingConversationSummaries.value.unshift(summary);
    scheduleConversationStatusReconciliation(recipient);
    setTimeout(() => scrollToBottom(), 50);
  } catch (e) {
    const failureConfirmed = isConfirmedOutgoingFailure(e);
    const msgIndex = sentMessages.value.findIndex(m => m.tempId === tempId);
    if (msgIndex !== -1) {
      sentMessages.value[msgIndex].status = failureConfirmed ? 'error' : 'sending';
      sentMessages.value = [...sentMessages.value];
    }
    
    const errorMsg = getOutgoingFailureMessage(e);
    
    if (errorMsg?.includes('Session not found') || errorMsg?.includes('unauthorized') || e?.response?.status === 401) {
      toast.error('Session WhatsApp tidak ditemukan. Device perlu di-pairing ulang atau pilih device lain yang aktif.');
    } else if (!failureConfirmed) {
      toast.warning('Status pengiriman belum terkonfirmasi. Sistem akan memeriksanya kembali.');
      scheduleConversationStatusReconciliation(selectedConversation.value?.from);
    } else {
      toast.error(errorMsg || 'Gagal mengirim pesan. Pastikan WhatsApp sudah terhubung.');
    }
  } finally {
    sendingReply.value = false;
  }
};

// Delete functionality
const deleteModal = ref({
  show: false,
  title: '',
  description: '',
  type: '', // 'conversation' or 'all'
  from: null,
  message: null,
  scope: null,
  loading: false,
});

const confirmDeleteMessage = (message, scope) => {
  messageActionMenuKey.value = '';
  reactionPickerMessageKey.value = '';
  const deleteForEveryone = scope === 'everyone';
  deleteModal.value = {
    show: true,
    title: deleteForEveryone ? 'Hapus untuk Semua' : 'Hapus untuk Saya',
    description: deleteForEveryone
      ? 'Pesan akan ditarik dari WhatsApp penerima jika masih berada dalam batas waktu yang diizinkan WhatsApp.'
      : 'Pesan akan dihapus dari Inbox Anda. Sinkronisasi ke perangkat WhatsApp akan dilakukan jika App State WhatsApp tersedia.',
    type: 'message',
    from: selectedConversation.value?.from || null,
    message,
    scope,
    loading: false,
  };
};

const confirmDeleteConversation = (conv) => {
  deleteModal.value = {
    show: true,
    title: 'Hapus Percakapan',
    description: `Apakah Anda yakin ingin menghapus ${conv.messageCount} pesan dari ${getSenderName(conv)}? Tindakan ini tidak dapat dibatalkan.`,
    type: 'conversation',
    from: conv.from,
    message: null,
    scope: null,
    loading: false,
  };
};

const confirmDeleteAll = () => {
  deleteModal.value = {
    show: true,
    title: 'Hapus Semua Pesan',
    description: 'Apakah Anda yakin ingin menghapus seluruh pesan masuk dan keluar pada device ini? Tindakan ini tidak dapat dibatalkan.',
    type: 'all',
    from: null,
    message: null,
    scope: null,
    loading: false,
  };
};

const executeDelete = async () => {
  deleteModal.value.loading = true;
  try {
    if (deleteModal.value.type === 'message') {
      const message = deleteModal.value.message;
      const targetMessageId = getMessageReactionTargetId(message);
      if (!targetMessageId) throw new Error('ID pesan WhatsApp tidak tersedia');

      const { data } = await deviceApi.delete('/messages/inbox/message', {
        data: {
          targetMessageId,
          targetFromMe: message.type === 'outgoing',
          scope: deleteModal.value.scope,
        },
      });
      if (data?.deleted) removeDeletedMessageFromState(data.deleted);
      const deleteSuccessMessage = deleteModal.value.scope === 'everyone'
        ? 'Pesan berhasil dihapus untuk semua'
        : data?.deleted?.whatsappSynced === false
          ? 'Pesan berhasil dihapus dari Inbox'
          : 'Pesan berhasil dihapus untuk Anda';
      toast.success(deleteSuccessMessage);
      deleteModal.value.show = false;
      void loadMessages();
      return;
    }

    if (deleteModal.value.type === 'conversation') {
      const { data } = await userApi.delete(`/devices/${selectedDeviceId.value}/inbox/conversation`, {
        data: { from: deleteModal.value.from },
      });
      toast.success(data?.message || 'Pesan masuk dan keluar berhasil dihapus');
    } else {
      const { data } = await userApi.delete(`/devices/${selectedDeviceId.value}/inbox`);
      toast.success(data?.message || 'Semua pesan masuk dan keluar berhasil dihapus');
    }
    deleteModal.value.show = false;
    selectedConversation.value = null;
    await loadMessages();
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Gagal menghapus pesan');
  } finally {
    deleteModal.value.loading = false;
  }
};

const goPrev = () => {
  if (page.value > 1) {
    page.value--;
    loadMessages();
  }
};

const goToPage = (targetPage) => {
  const normalizedPage = Number(targetPage);
  if (
    loading.value
    || normalizedPage < 1
    || normalizedPage > meta.value.totalPages
    || normalizedPage === page.value
  ) return;
  page.value = normalizedPage;
  loadMessages();
};

const onPageSizeChange = () => {
  page.value = 1;
  loadMessages();
};

const goNext = () => {
  if (meta.value.hasMore) {
    page.value++;
    loadMessages();
  }
};

// Helpers
const formatPhone = (jid) => {
  if (!jid) return '';
  return jid.replace(/@s\.whatsapp\.net|@g\.us/g, '');
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const formatFullTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const truncateMessage = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const getInitials = (firstName, lastName) => {
  // Handle single name (pushName)
  if (firstName && !lastName) {
    const parts = firstName.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  const f = firstName ? firstName.charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.charAt(0).toUpperCase() : '';
  return f + l || '?';
};

const getRandomColor = (seed) => {
  const colors = [
    '#4f46e5', '#7c3aed', '#db2777', '#dc2626',
    '#ea580c', '#16a34a', '#0891b2', '#2563eb',
  ];
  const hash = seed ? seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
  return colors[hash % colors.length];
};

// Get sender name with fallback priority: groupName (for groups) > contact > pushName > formatted phone/id
const getSenderName = (conv) => {
  // For group messages, show group name first
  if (conv.isGroup && conv.groupName) {
    return conv.groupName;
  }
  if (conv.contact) {
    return `${conv.contact.firstName} ${conv.contact.lastName || ''}`.trim();
  }
  if (conv.pushName) {
    return conv.pushName;
  }
  // For groups without name, show "Grup" prefix
  if (conv.isGroup) {
    return `Grup ${formatPhoneOrId(conv.from)}`;
  }
  return formatWhatsAppIdentity(conv.from) ? 'Kontak WhatsApp' : 'Kontak';
};

// Linked IDs are internal WhatsApp identifiers and must not be exposed as
// recipient numbers in the Inbox.
const formatPhoneOrId = (jid) => {
  if (!jid) return '';
  if (jid.includes('@lid')) return '';

  const cleaned = jid.replace(/@s\.whatsapp\.net|@g\.us|@lid/g, '');
  return cleaned;
};

const formatWhatsAppIdentity = (jid) => {
  if (!jid) return '';

  const raw = String(jid).trim();
  const cleaned = raw.replace(/@s\.whatsapp\.net|@g\.us|@lid/g, '');

  if (raw.includes('@lid')) return '';

  const digits = cleaned.replace(/\D/g, '');
  return digits ? `+${digits}` : cleaned;
};

const getConversationPhone = (conversation) => {
  if (!conversation || conversation.isGroup) return '';

  if (conversation.contact?.phone) {
    return String(conversation.contact.phone);
  }

  return formatWhatsAppIdentity(conversation.from);
};

const getConversationLabels = (conversation) => getContactLabelNames(conversation?.contact);

const normalizeInboxContactPhone = (conversation) => {
  if (!conversation || conversation.isGroup) return '';

  const source = conversation.contact?.phone || conversation.from || '';
  const raw = String(source).trim();
  if (!raw || raw.includes('@lid')) return '';

  let phone = raw
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '');

  if (phone.startsWith('0')) {
    phone = `62${phone.slice(1)}`;
  } else if (phone.startsWith('8')) {
    phone = `62${phone}`;
  }

  return phone;
};

const isValidInboxContactPhone = phone => /^62\d{8,15}$/.test(String(phone || ''));

const canAddSelectedConversationContact = computed(() => {
  const conversation = selectedConversation.value;
  if (!conversation || conversation.isGroup || conversation.contact) return false;
  return isValidInboxContactPhone(normalizeInboxContactPhone(conversation));
});

const getSuggestedContactName = conversation => {
  const candidate = String(conversation?.pushName || '').trim();
  if (!candidate || ['Kontak', 'Kontak WhatsApp'].includes(candidate)) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...lastNameParts] = candidate.split(/\s+/);
  return {
    firstName: firstName || '',
    lastName: lastNameParts.join(' '),
  };
};

const openAddContactModal = () => {
  if (!canAddSelectedConversationContact.value) return;

  const suggestedName = getSuggestedContactName(selectedConversation.value);
  addContactModal.value = {
    show: true,
    firstName: suggestedName.firstName,
    lastName: suggestedName.lastName,
    phone: normalizeInboxContactPhone(selectedConversation.value),
    labels: '',
  };
};

const closeAddContactModal = () => {
  if (savingContact.value) return;
  addContactModal.value = {
    show: false,
    firstName: '',
    lastName: '',
    phone: '',
    labels: '',
  };
};

const applyCreatedContactToInbox = (conversationFrom, contact) => {
  messages.value = messages.value.map(message =>
    sameConversationJid(message.from, conversationFrom)
      ? { ...message, contact }
      : message
  );
  outgoingConversationSummaries.value = outgoingConversationSummaries.value.map(summary =>
    sameConversationJid(summary.to, conversationFrom)
      ? { ...summary, contact }
      : summary
  );

  if (sameConversationJid(selectedConversation.value?.from, conversationFrom)) {
    selectedConversation.value = { ...selectedConversation.value, contact };
  }
};

const saveInboxContact = async () => {
  if (savingContact.value || !selectedConversation.value) return;

  const firstName = addContactModal.value.firstName.trim();
  const lastName = addContactModal.value.lastName.trim();
  const phone = addContactModal.value.phone;
  if (!firstName) {
    toast.error('Nama depan wajib diisi');
    return;
  }
  if (!isValidInboxContactPhone(phone)) {
    toast.error('Nomor WhatsApp tidak valid');
    return;
  }
  if (!selectedDeviceId.value) {
    toast.error('Pilih perangkat terlebih dahulu');
    return;
  }

  const conversationFrom = selectedConversation.value.from;
  savingContact.value = true;

  try {
    const labels = addContactModal.value.labels
      .split(',')
      .map(label => label.trim())
      .filter(Boolean);
    const { data } = await userApi.post('/contacts/create', {
      firstName,
      lastName,
      phone,
      email: '',
      gender: '',
      dob: '',
      labels,
      deviceId: selectedDeviceId.value,
    });

    applyCreatedContactToInbox(conversationFrom, {
      id: data?.contactId || null,
      firstName,
      lastName,
      phone,
      colorCode: null,
      ContactLabel: labels.map(name => ({ label: { name } })),
    });
    addContactModal.value.show = false;
    toast.success('Kontak berhasil ditambahkan');
    await loadMessages();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Gagal menyimpan kontak';
    if (error?.response?.status === 400 && /already exists|sudah/i.test(errorMessage)) {
      toast.warning('Nomor ini sudah tersimpan di Kontak');
      addContactModal.value.show = false;
      await loadMessages();
    } else {
      toast.error(errorMessage);
    }
  } finally {
    savingContact.value = false;
  }
};

const getMessageSenderPhone = (message) => {
  return formatWhatsAppIdentity(message?.participant);
};

const getAvatarKey = (conversation) =>
  `${selectedDeviceId.value}:${conversation?.from || conversation?.to || ''}`;

const isWhatsAppProfileCdnUrl = (source) => {
  try {
    const hostname = new URL(String(source || '')).hostname.toLowerCase();
    return hostname === 'pps.whatsapp.net' || hostname.endsWith('.pps.whatsapp.net');
  } catch {
    return false;
  }
};

const getConversationAvatar = (conversation) => {
  if (!conversation) return '';
  const key = getAvatarKey(conversation);
  if (failedAvatarKeys.value.has(key)) return '';

  const loadedSource = conversationAvatarUrls.value[key] || '';
  if (loadedSource) return mediaUrl(loadedSource);

  const source = (conversation.isGroup ? conversation.groupPicUrl : conversation.profilePicUrl) || '';
  // A signed profile endpoint can legitimately return 204 when WhatsApp has no
  // accessible photo. Probe it as XHR first so an empty response is never
  // mounted as an <img> and does not create browser console errors.
  if (String(source).includes('/inbox-profile/')) return '';
  if (isWhatsAppProfileCdnUrl(source)) return '';
  return source ? mediaUrl(source) : '';
};

const handleAvatarError = (conversation, event) => {
  const key = getAvatarKey(conversation);
  const objectUrl = conversationAvatarUrls.value[key];
  if (objectUrl?.startsWith('blob:')) URL.revokeObjectURL(objectUrl);

  const nextUrls = { ...conversationAvatarUrls.value };
  delete nextUrls[key];
  conversationAvatarUrls.value = nextUrls;
  failedAvatarKeys.value = new Set([...failedAvatarKeys.value, key]);
  avatarRetryAt.set(key, Date.now() + AVATAR_TRANSIENT_RETRY_MS);

  if (event?.target) event.target.removeAttribute('src');
  const directUrl = conversation?.isGroup
    ? conversation?.groupPicUrl
    : conversation?.profilePicUrl;
  // Signed Inbox profile URLs already perform cache + WhatsApp fallback on the
  // server. Do not retry them through the legacy device endpoint after a 204.
  if (String(directUrl || '').includes('/inbox-profile/')) return;
  const recoveryAttempts = avatarRecoveryAttempts.get(key) || 0;
  if (recoveryAttempts < 2) {
    avatarRecoveryAttempts.set(key, recoveryAttempts + 1);
    void loadConversationAvatar(conversation, true);
  }
};

const loadConversationAvatar = async (conversation, force = false) => {
  const recipient = conversation?.from || conversation?.to;
  if (!recipient || !selectedDeviceId.value || recipient.includes('@lid')) return;

  const key = getAvatarKey(conversation);
  const directUrl = conversation.isGroup
    ? conversation.groupPicUrl
    : conversation.profilePicUrl;
  if (isWhatsAppProfileCdnUrl(directUrl)) return;
  const isSignedProfileUrl = String(directUrl || '').includes('/inbox-profile/');
  const retryAt = avatarRetryAt.get(key) || 0;
  if (!force && retryAt > Date.now()) return;
  if (directUrl && failedAvatarKeys.value.has(key) && retryAt <= Date.now()) {
    const nextFailed = new Set(failedAvatarKeys.value);
    nextFailed.delete(key);
    failedAvatarKeys.value = nextFailed;
    avatarRecoveryAttempts.delete(key);
    avatarRetryAt.delete(key);
  }
  if (directUrl && !isSignedProfileUrl) return;
  if (!directUrl) return;
  if ((!force && conversationAvatarUrls.value[key]) || loadingAvatarKeys.has(key)) return;
  loadingAvatarKeys.add(key);

  try {
    // Signed image URLs authorize themselves. Avoid the global Authorization
    // header here so cross-origin image requests remain simple GET requests.
    const response = await fetch(mediaUrl(directUrl), {
      method: 'GET',
      credentials: 'omit',
      headers: { Accept: 'image/*' },
    });
    if (!response.ok || response.status === 204) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      const retryDelay = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : AVATAR_NEGATIVE_CACHE_MS;
      failedAvatarKeys.value = new Set([...failedAvatarKeys.value, key]);
      avatarRetryAt.set(key, Date.now() + retryDelay);
      return;
    }
    const data = await response.blob();
    if (!(data instanceof Blob) || data.size === 0 || !data.type.startsWith('image/')) {
      failedAvatarKeys.value = new Set([...failedAvatarKeys.value, key]);
      avatarRetryAt.set(key, Date.now() + AVATAR_NEGATIVE_CACHE_MS);
      return;
    }

    const objectUrl = URL.createObjectURL(data);
    const previousUrl = conversationAvatarUrls.value[key];
    if (previousUrl?.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
    conversationAvatarUrls.value = {
      ...conversationAvatarUrls.value,
      [key]: objectUrl,
    };
    avatarRecoveryAttempts.delete(key);
    avatarRetryAt.delete(key);

    if (failedAvatarKeys.value.has(key)) {
      const nextFailed = new Set(failedAvatarKeys.value);
      nextFailed.delete(key);
      failedAvatarKeys.value = nextFailed;
    }
  } catch {
    // Missing/private WhatsApp pictures keep the initial avatar.
    failedAvatarKeys.value = new Set([...failedAvatarKeys.value, key]);
    avatarRetryAt.set(key, Date.now() + AVATAR_TRANSIENT_RETRY_MS);
  } finally {
    loadingAvatarKeys.delete(key);
  }
};

const loadConversationAvatars = async (items) => {
  const unique = new Map();
  for (const item of items || []) {
    const recipient = item?.from || item?.to;
    if (recipient && !unique.has(recipient)) unique.set(recipient, item);
  }
  // Avoid flooding WhatsApp with profile-picture queries. Production accounts
  // can rate-limit a burst even though the same calls appear safe locally.
  const queue = [...unique.values()];
  const worker = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      await loadConversationAvatar(item);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  };
  await Promise.allSettled([worker(), worker(), worker()]);
};

const clearConversationAvatars = () => {
  Object.values(conversationAvatarUrls.value).forEach((url) => {
    if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url);
  });
  conversationAvatarUrls.value = {};
  failedAvatarKeys.value = new Set();
  loadingAvatarKeys.clear();
  avatarRecoveryAttempts.clear();
  avatarRetryAt.clear();
};

// Watchers
watch(q, () => {
  page.value = 1;
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadMessages(), 300);
});

watch(
  () => [selectedConversation.value?.from || '', isOpeningNavigationTarget.value],
  ([conversationFrom, openingNavigation]) => {
    if (!conversationFrom) {
      clearScheduledReplyFocus();
      return;
    }
    if (openingNavigation) return;
    scheduleReplyInputFocus();
  },
  { flush: 'post' },
);

// Lifecycle
onMounted(async () => {
  window.addEventListener('keydown', handleImagePreviewKeydown);
  window.addEventListener('keydown', handleInboxComposerTyping, true);
  window.addEventListener('pointerdown', handleMessagePopupPointerDown);
  window.addEventListener('resize', updateMessageActionMenuPosition);

  // Connect socket and setup listeners
  const socket = connectSocket();

  const handleSocketConnect = () => {
    if (selectedDeviceId.value) {
      setupSocketListener();
      if (selectedConversation.value?.from) {
        scheduleConversationStatusReconciliation(selectedConversation.value.from);
      }
    }
  };
  const handleSocketDisconnect = (reason) => {
    // Socket disconnected
  };
  const handleSocketConnectError = (error) => {
    // Socket connection error
  };

  socket.on('connect', handleSocketConnect);
  socket.on('disconnect', handleSocketDisconnect);
  socket.on('connect_error', handleSocketConnectError);
  socketConnectionCleanup = () => {
    socket.off('connect', handleSocketConnect);
    socket.off('disconnect', handleSocketDisconnect);
    socket.off('connect_error', handleSocketConnectError);
  };
  
  // Fetch data
  await fetchDevices();
  const navigationTarget = getInboxNavigationTarget();
  if (navigationTarget?.deviceId && devices.value.some(device => device.id === navigationTarget.deviceId)) {
    selectedDeviceId.value = navigationTarget.deviceId;
    localStorage.setItem('device_selected_id', navigationTarget.deviceId);
  }
  
  // Load messages if device selected
  if (selectedDeviceId.value) {
    await loadMessages();
    
    // ✅ FIXED: Only setup listener once - either if already connected OR wait for 'connect' event above
    if (socket.connected) {
      setupSocketListener();
    }
  }

  if (navigationTarget) await openInboxNavigationTarget({ reload: false });
});

watch(
  () => [route.query.device, route.query.conversation, route.query.message, route.query.returnTo],
  ([deviceId, conversationJid]) => {
    if (route.name === 'inbox' && deviceId && conversationJid) {
      void openInboxNavigationTarget();
    }
  },
);

onUnmounted(() => {
  clearScheduledReplyFocus();
  releaseInitialBottomPin();
  clearStatusReconciliationTimers();
  conversationRequestController?.abort();
  conversationRequestController = null;
  window.removeEventListener('keydown', handleImagePreviewKeydown);
  window.removeEventListener('keydown', handleInboxComposerTyping, true);
  window.removeEventListener('pointerdown', handleMessagePopupPointerDown);
  window.removeEventListener('resize', updateMessageActionMenuPosition);
  if (messageHighlightTimer) clearTimeout(messageHighlightTimer);
  inboxNavigationGeneration++;
  conversationOpenGeneration++;
  closeReactionDetails();
  closeImagePreview();
  clearAttachment();
  clearConversationAvatars();
  if (socketCleanup) {
    socketCleanup();
    socketCleanup = null;
  }
  if (socketConnectionCleanup) {
    socketConnectionCleanup();
    socketConnectionCleanup = null;
  }
});

const isStickerMessage = (message) => {
  const text = message?.type === 'outgoing' ? message?.text : message?.message;
  return text === '[Stiker]';
};

const isImageMedia = (message) =>
  getInboxMediaType(message) === 'image';
const isVideoMedia = (message) =>
  getInboxMediaType(message) === 'video';
const isAudioMedia = (message) =>
  getInboxMediaType(message) === 'audio';
const isDocumentMedia = (message) =>
  Boolean(message?.mediaPath) &&
  !isStickerMessage(message) &&
  getInboxMediaType(message) === 'document';

const getStableMediaId = message => String(
  message?.id || message?.waMessageId || message?.tempId || message?.pkId || message?.mediaPath || '',
);

const hasMediaFailed = message => failedMediaIds.value.has(getStableMediaId(message));
const isMediaActivated = message => activatedMediaIds.value.has(getStableMediaId(message));
const activateMedia = message => {
  const id = getStableMediaId(message);
  if (!id || activatedMediaIds.value.has(id)) return;
  activatedMediaIds.value = new Set([...activatedMediaIds.value, id]);
};

const mediaThumbnailUrl = source => {
  const url = mediaUrl(source);
  if (!url) return '';
  if (!url.includes('/inbox-media/')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}thumbnail=1`;
};

const getMediaFileName = (message) => {
  if (message?.fileName) return message.fileName;
  const messageText = String(
    message?.type === 'incoming' ? message?.message : message?.text,
  ).trim();
  if (/^[^\\/]+\.[a-z0-9]{1,10}$/i.test(messageText)) return messageText;
  const path = String(message?.mediaPath || '').replace(/\\/g, '/');
  const fileName = decodeURIComponent(path.split('/').pop() || 'Dokumen');
  return fileName.replace(/^[a-zA-Z0-9_]+-/, '') || 'Dokumen';
};

const getVisibleMessageText = (message) => {
  const text = message?.type === 'incoming' ? message?.message : message?.text;
  if (!text) return '';
  if (
    message?.mediaPath &&
    !message?.mediaLoadFailed &&
    ['[Stiker]', '[Gambar]', '[Video]', '[Audio]'].includes(text)
  ) return '';
  return text;
};

const openImagePreview = (message, event) => {
  if (!message?.mediaPath || message?.mediaLoadFailed) return;

  const src = mediaUrl(message.mediaPath);
  if (!src) return;

  imagePreview.value = {
    src,
    alt: message?.type === 'outgoing' ? 'Gambar terkirim' : 'Gambar masuk',
    caption: getVisibleMessageText(message),
    time: message?.type === 'incoming'
      ? formatFullTime(message.receivedAt)
      : formatTime(message.timestamp),
  };
};

function closeImagePreview() {
  imagePreview.value = null;
}

function handleImagePreviewKeydown(event) {
  if (event.key !== 'Escape') return;

  if (reactionDetails.value) {
    event.preventDefault();
    closeReactionDetails();
    return;
  }

  if (imagePreview.value) {
    event.preventDefault();
    closeImagePreview();
    return;
  }

  if (reactionPickerMessageKey.value || messageActionMenuKey.value) {
    event.preventDefault();
    closeMessagePopups();
    return;
  }

  if (isConversationFullscreen.value) {
    event.preventDefault();
    isConversationFullscreen.value = false;
  }
}

const handlePreviewImageError = () => {
  closeImagePreview();
  toast.error('Gambar tidak dapat dibuka. Silakan muat ulang percakapan.');
};

const getMessagePreview = (message) => {
  const preview = isStickerMessage(message)
    ? 'Stiker'
    : isImageMedia(message)
      ? 'Gambar'
      : isVideoMedia(message)
        ? 'Video'
        : isAudioMedia(message)
          ? 'Audio'
          : isDocumentMedia(message)
            ? `Dokumen: ${getMediaFileName(message)}`
            : truncateMessage(message?.message || '', 100);
  return message?.isOutgoing ? `Anda: ${preview}` : preview;
};

const handleStickerError = (event, message) => {
  handleMediaError(event, message);
};

const handleMediaError = (event, message) => {
  event.currentTarget.style.display = 'none';
  const id = getStableMediaId(message);
  if (id) failedMediaIds.value = new Set([...failedMediaIds.value, id]);
};
</script>

<style scoped>
/* Base Styles - Konsisten dengan menu Schedules */
.wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Page Header - Konsisten dengan Schedules */
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

/* Toolbar Card */
.toolbar-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
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

.filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 14px;
  border: 1.5px solid var(--theme-border);
  border-radius: 10px;
  font-size: 13px;
  background: var(--theme-surface-soft);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: var(--theme-text-secondary);
}

.filter-select:hover {
  border-color: var(--theme-border-strong);
  background: var(--theme-surface);
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: var(--theme-surface);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  margin-left: auto;
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

.btn-delete-all {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-delete-all:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-delete-all:active:not(:disabled) {
  transform: translateY(0);
}

.btn-delete-all:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-delete-all svg {
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

/* Table Container */
.table-container {
  margin-bottom: 32px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Messages List */
.messages-list {
  max-height: 600px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--theme-border);
  cursor: pointer;
  transition: all 0.2s ease;
  align-items: center;
}

.message-item:hover {
  background: var(--theme-surface-soft);
}

.message-item:hover .btn-delete-conv {
  opacity: 1;
}

.btn-delete-conv {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--theme-text-muted);
  opacity: 0;
  transition: all 0.2s ease;
}

.btn-delete-conv:hover {
  background: var(--theme-danger-soft);
  color: #ef4444;
}

.btn-delete-conv svg {
  width: 18px;
  height: 18px;
}

.message-item:last-child {
  border-bottom: none;
}

.message-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
}

.avatar-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-image.modal-avatar {
  width: 48px;
  height: 48px;
}

.avatar-circle.small {
  width: 36px;
  height: 36px;
  font-size: 0.875rem;
}

.avatar-circle svg {
  width: 24px;
  height: 24px;
  stroke: #fff;
}

.group-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.group-badge svg {
  width: 12px;
  height: 12px;
  stroke: #fff;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.sender-name {
  font-weight: 600;
  color: var(--theme-text);
  font-size: 15px;
}

.sender-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.sender-name-row .sender-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sender-identity {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.sender-phone {
  margin-top: 2px;
  color: var(--theme-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.message-time {
  font-size: 12px;
  color: var(--theme-text-muted);
}

.message-preview {
  color: var(--theme-text-muted);
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.message-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.conversation-labels {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  min-width: 0;
}

.conversation-label-chip {
  display: inline-block;
  max-width: 160px;
  padding: 2px 7px;
  overflow: hidden;
  color: var(--theme-info-text);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--theme-info-soft);
  border: 1px solid var(--theme-info-border);
  border-radius: 999px;
}

.label-overflow {
  flex-shrink: 0;
}

.compact-labels {
  margin: 0;
  flex: 0 0 auto;
  flex-wrap: nowrap;
}

.compact-labels .conversation-label-chip {
  max-width: 90px;
}

/* Loading State - Konsisten dengan Schedules */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  color: var(--theme-text-muted);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--theme-border);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

/* Empty State - Konsisten dengan Schedules */
.empty-state,
.empty-selection-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.empty-state svg,
.empty-selection-card svg {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: #cbd5e1;
}

.empty-state h3,
.empty-selection-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-text);
}

.empty-state p,
.empty-selection-card p {
  margin: 0;
  color: var(--theme-text-muted);
  font-size: 14px;
}

.empty-selection-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Pagination - Konsisten dengan Schedules */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid var(--theme-border);
  background: var(--theme-surface-soft);
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  color: var(--theme-text-muted);
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-page {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1.5px solid var(--theme-border);
  border-radius: 10px;
  background: var(--theme-surface);
  color: var(--theme-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: var(--theme-info-soft);
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page svg {
  width: 16px;
  height: 16px;
}

.btn-page.page-number {
  min-width: 38px;
  justify-content: center;
  padding: 8px 10px;
}

.btn-page.page-number.active {
  color: #ffffff;
  border-color: var(--theme-info-text);
  background: #2563eb;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--theme-text-muted);
}

.current-page {
  font-weight: 600;
  color: var(--theme-text);
}

/* Modal - Konsisten dengan Schedules */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-overlay--opening-navigation {
  visibility: hidden;
  pointer-events: none;
}

.inbox-modal-enter-active,
.inbox-modal-leave-active {
  transition: opacity 180ms ease;
}

.inbox-modal-enter-from,
.inbox-modal-leave-to {
  opacity: 0;
}

.modal {
  background: var(--theme-surface);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--theme-border);
  background: var(--theme-gradient-surface);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-text);
}

.modal-header h3 svg {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

/* Conversation Modal */
.conversation-modal {
  position: relative;
  max-width: 880px;
  height: 88vh;
  max-height: 850px;
  transition: width 180ms ease, height 180ms ease, max-width 180ms ease;
}

.attachment-drop-overlay {
  position: absolute;
  inset: 10px;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 24px;
  color: #ffffff;
  background: rgba(15, 23, 42, 0.82);
  border: 2px dashed #60a5fa;
  border-radius: 16px;
  backdrop-filter: blur(5px);
  pointer-events: none;
  animation: attachmentDropFadeIn 140ms ease-out;
}

.attachment-drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.attachment-drop-content svg {
  width: 52px;
  height: 52px;
  margin-bottom: 4px;
  color: #60a5fa;
}

.attachment-drop-content strong {
  font-size: 18px;
  font-weight: 700;
}

.attachment-drop-content span {
  color: #cbd5e1;
  font-size: 13px;
}

@keyframes attachmentDropFadeIn {
  from { opacity: 0; transform: scale(0.985); }
  to { opacity: 1; transform: scale(1); }
}

.conversation-modal--fullscreen {
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  border-radius: 16px;
}

.conversation-modal .modal-header {
  padding: 16px 20px;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-add-contact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 8px 12px;
  border: 1px solid var(--theme-success-border);
  border-radius: 10px;
  background: var(--theme-success-soft);
  color: var(--theme-success-text);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-contact:hover {
  transform: translateY(-1px);
  background: var(--theme-gradient-success);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.18);
}

.btn-add-contact svg {
  width: 17px;
  height: 17px;
}

.modal-header-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
  min-width: 0;
}

.modal-header-info .avatar-circle {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.modal-header-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--theme-text);
}

.modal-subtitle {
  font-size: 13px;
  color: var(--theme-text-muted);
}

.modal-phone {
  display: block;
  margin-top: 2px;
  color: var(--theme-text-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.modal-phone + .modal-subtitle::before {
  content: ' · ';
}

.modal-identity {
  flex: 1;
  min-width: 0;
}

.modal-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.modal-name-row h3 {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-labels {
  flex: 0 1 auto;
  flex-wrap: nowrap;
  max-width: min(280px, 30vw);
  overflow: hidden;
}

.add-contact-overlay {
  z-index: 1100;
}

.add-contact-modal {
  max-width: 560px;
}

.add-contact-header p {
  margin: 5px 0 0;
  color: var(--theme-text-muted);
  font-size: 13px;
}

.add-contact-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 24px;
  overflow-y: auto;
}

.add-contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.add-contact-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.add-contact-field > span {
  color: var(--theme-text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.add-contact-field > span strong {
  color: #ef4444;
}

.add-contact-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--theme-border-strong);
  border-radius: 9px;
  outline: none;
  background: var(--theme-input);
  color: var(--theme-text);
  font: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.add-contact-field input:focus {
  border-color: var(--theme-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.14);
}

.add-contact-field input[readonly] {
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
  cursor: default;
}

.add-contact-field small {
  color: var(--theme-text-muted);
  font-size: 11px;
}

.add-contact-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 22px;
  border-top: 1px solid var(--theme-border);
  background: var(--theme-surface-soft);
}

.btn-save-contact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 138px;
  padding: 10px 18px;
  border: none;
  border-radius: 9px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.25);
}

.btn-save-contact:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-save-contact svg {
  width: 16px;
  height: 16px;
}

.conversation-modal .modal-body.chat-body {
  flex: 1;
  min-height: 0;
  padding: 0;
  background: var(--theme-surface-soft);
  display: flex;
  flex-direction: column;
  max-height: none;
  overflow: hidden;
  position: relative;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-anchor: none;
  opacity: 1;
  transition: opacity 120ms ease-out;
}

.chat-messages--positioning {
  visibility: hidden;
  opacity: 0;
}

.conversation-sync-indicator {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid var(--theme-border);
  border-radius: 999px;
  background: var(--theme-surface);
  background: color-mix(in srgb, var(--theme-surface) 92%, transparent);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(8px);
  color: var(--theme-text-muted);
  font-size: 12px;
  font-weight: 600;
  pointer-events: none;
}

.conversation-opening-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--theme-border-strong);
  border-top-color: var(--theme-accent);
  border-radius: 50%;
  animation: conversation-opening-spin 0.7s linear infinite;
}

@keyframes conversation-opening-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .inbox-modal-enter-active,
  .inbox-modal-leave-active,
  .inbox-modal-enter-active .conversation-modal,
  .inbox-modal-leave-active .conversation-modal {
    transition-duration: 1ms;
  }
}

.chat-bubble {
  max-width: 78%;
  position: relative;
}

.history-loading,
.load-older-messages {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 7px 12px;
  border: 1px solid var(--theme-border);
  border-radius: 999px;
  background: var(--theme-surface);
  color: var(--theme-text-muted);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
}

.load-older-messages {
  cursor: pointer;
}

.chat-bubble.incoming {
  align-self: flex-start;
}

.chat-bubble.outgoing {
  align-self: flex-end;
}

.bubble-content {
  background: var(--theme-surface);
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.chat-bubble.incoming .bubble-content {
  border-top-left-radius: 4px;
}

.chat-bubble.outgoing .bubble-content {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-top-right-radius: 4px;
}

.bubble-reactions {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: -7px;
}

.bubble-reactions.incoming {
  justify-content: flex-start;
  padding-left: 12px;
}

.bubble-reactions.outgoing {
  justify-content: flex-end;
  padding-right: 12px;
}

.reaction-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  min-height: 24px;
  padding: 2px 7px;
  border: 1px solid #dbe3ef;
  border-radius: 999px;
  background: var(--theme-surface);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
  color: var(--theme-text-secondary);
  font-size: 12px;
  font-family: inherit;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.reaction-chip:hover,
.reaction-chip:focus-visible {
  border-color: var(--theme-accent);
  background: var(--theme-accent-soft);
  outline: none;
}

.reaction-emoji {
  font-size: 16px;
  line-height: 1;
}

.reaction-count {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.reaction-details-overlay {
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(2, 6, 23, 0.68);
  backdrop-filter: blur(4px);
}

.reaction-details-dialog {
  width: min(420px, 100%);
  max-height: min(560px, calc(100vh - 40px));
  overflow: hidden;
  border: 1px solid var(--theme-border);
  border-radius: 18px;
  background: var(--theme-surface);
  color: var(--theme-text);
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.32);
  animation: reaction-details-enter 0.16s ease-out;
}

.reaction-details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--theme-border);
}

.reaction-details-header h3,
.reaction-details-header p {
  margin: 0;
}

.reaction-details-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.reaction-details-header p {
  margin-top: 4px;
  color: var(--theme-text-muted);
  font-size: 13px;
}

.reaction-details-close {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: var(--theme-surface-soft);
  color: var(--theme-text-secondary);
  cursor: pointer;
}

.reaction-details-close:hover {
  background: var(--theme-accent-soft);
  color: var(--theme-accent);
}

.reaction-details-close svg {
  width: 19px;
  height: 19px;
}

.reaction-member-list {
  max-height: min(440px, calc(100vh - 150px));
  margin: 0;
  padding: 8px;
  overflow-y: auto;
  list-style: none;
}

.reaction-member {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 11px 12px;
  border-radius: 12px;
}

.reaction-member + .reaction-member {
  border-top: 1px solid var(--theme-border);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.reaction-member-avatar {
  position: relative;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--theme-accent-soft);
  color: var(--theme-accent);
  font-weight: 800;
  overflow: hidden;
}

.reaction-member-avatar img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--theme-surface-soft);
}

.reaction-member-identity {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.reaction-member-identity strong,
.reaction-member-identity small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reaction-member-identity strong {
  color: var(--theme-text);
  font-size: 14px;
}

.reaction-member-identity small {
  color: var(--theme-text-muted);
  font-size: 12px;
}

.reaction-member-emoji {
  flex: 0 0 auto;
  font-size: 22px;
}

@keyframes reaction-details-enter {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.message-reaction-control {
  position: absolute;
  top: 50%;
  z-index: 40;
  width: 28px;
  height: 28px;
  transform: translateY(-50%);
}

.message-reaction-control.incoming {
  right: -36px;
}

.message-reaction-control.outgoing {
  left: -36px;
}

.btn-message-reaction,
.btn-message-actions {
  position: absolute;
  top: 50%;
  z-index: 4;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #dbe3ef;
  border-radius: 50%;
  background: var(--theme-surface);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.14);
  color: var(--theme-text-muted);
  cursor: pointer;
  font-size: 17px;
  line-height: 1;
  opacity: 0;
  transform: translateY(-50%);
  transition: opacity 0.15s ease, background 0.15s ease;
}

.btn-message-reaction {
  position: static;
  top: auto;
  transform: none;
}

.btn-message-actions {
  top: 5px;
  z-index: 21;
  width: 30px;
  height: 28px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  box-shadow: none;
  transform: none;
  pointer-events: none;
}

.btn-message-actions svg {
  width: 18px;
  height: 18px;
}

.btn-message-actions.incoming {
  left: 5px;
  color: var(--theme-text-muted);
  background: transparent;
}

.btn-message-actions.outgoing {
  right: 5px;
  color: #ffffff;
  background: transparent;
}

.chat-bubble:hover .btn-message-reaction,
.chat-bubble:focus-within .btn-message-reaction,
.chat-bubble:hover .btn-message-actions,
.chat-bubble:focus-within .btn-message-actions {
  opacity: 1;
  pointer-events: auto;
}

.btn-message-reaction:hover {
  background: var(--theme-surface-soft);
}

.btn-message-actions.incoming:hover,
.btn-message-actions.outgoing:hover {
  background: transparent;
}

.btn-message-reaction:disabled {
  cursor: wait;
  opacity: 0.65;
}

.message-actions-menu {
  position: fixed;
  z-index: 2100;
  display: flex;
  width: 190px;
  flex-direction: column;
  padding: 6px;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
}

.message-actions-menu button {
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--theme-text-secondary);
  cursor: pointer;
  font-size: 13px;
  text-align: left;
}

.message-actions-menu button:hover { background: var(--theme-surface-soft); }
.message-actions-menu button.danger { color: #dc2626; }

@media (hover: none) {
  .btn-message-reaction,
  .btn-message-actions {
    opacity: 0.78;
    pointer-events: auto;
  }
}

.bubble-sender {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
}

.bubble-sender-phone {
  display: block;
  margin-top: 1px;
  color: var(--theme-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  font-weight: 500;
}

.bubble-text {
  color: var(--theme-text);
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.deleted-message-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--theme-text-muted);
  font-size: 14px;
  line-height: 1.5;
}

.deleted-message-notice svg {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
}

.chat-bubble.outgoing .deleted-message-notice {
  color: rgba(255, 255, 255, 0.85);
}

.sticker-message {
  display: block;
  width: auto;
  height: auto;
  max-width: min(180px, 45vw);
  max-height: 180px;
  object-fit: contain;
}

.chat-image,
.chat-video {
  display: block;
  width: min(320px, 60vw);
  max-width: 100%;
  max-height: 320px;
  border-radius: 10px;
  object-fit: contain;
  background: rgba(15, 23, 42, 0.08);
}

.media-load-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 132px;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.18);
  color: inherit;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.chat-bubble.message-target-highlight .bubble-content {
  animation: messageTargetPulse 2.6s ease-out;
  outline: 3px solid rgba(96, 165, 250, 0.85);
  outline-offset: 3px;
}

@keyframes messageTargetPulse {
  0%, 35% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.28); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.chat-image {
  cursor: zoom-in;
  transition: filter 160ms ease, transform 160ms ease;
}

.chat-image:hover {
  filter: brightness(0.94);
}

.chat-image:focus-visible {
  outline: 3px solid var(--theme-accent);
  outline-offset: 3px;
}

.image-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 32px 28px;
  background: rgba(2, 6, 23, 0.92);
  backdrop-filter: blur(8px);
  animation: imagePreviewFadeIn 160ms ease-out;
}

.image-preview-close {
  position: fixed;
  top: 20px;
  right: 24px;
  z-index: 1;
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  place-items: center;
  color: #f8fafc;
  background: rgba(30, 41, 59, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 160ms ease, transform 160ms ease;
}

.image-preview-close:hover {
  background: rgba(51, 65, 85, 0.96);
  transform: scale(1.04);
}

.image-preview-close:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 3px;
}

.image-preview-close svg {
  width: 24px;
  height: 24px;
}

.image-preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  max-width: min(1200px, 100%);
  max-height: 100%;
  margin: 0;
}

.image-preview-image {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 160px);
  object-fit: contain;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.5);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5);
}

.image-preview-meta {
  max-width: min(760px, 100%);
  margin-top: 14px;
  color: #f8fafc;
  text-align: center;
}

.image-preview-meta p {
  margin: 0 0 5px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.image-preview-meta time {
  color: #aebbcf;
  font-size: 13px;
}

@keyframes imagePreviewFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.chat-audio {
  display: block;
  width: min(300px, 65vw);
  max-width: 100%;
}

.chat-document {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
  max-width: 320px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--theme-surface-soft);
  color: var(--theme-text);
  text-decoration: none;
}

.chat-bubble.outgoing .chat-document {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.chat-document svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.chat-document span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-bubble.outgoing .bubble-text {
  color: #ffffff;
}

.bubble-time {
  font-size: 11px;
  color: var(--theme-text-muted);
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.chat-bubble.outgoing .bubble-time {
  color: rgba(255, 255, 255, 0.8);
}

/* Read Count Badge for Group Messages */
.read-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 6px;
}

.read-count-badge svg {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
}

.chat-bubble.incoming .read-count-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.status-icon.error {
  color: #fca5a5;
}

/* Checkmark styles */
.status-icon.checkmark-single {
  color: rgba(255, 255, 255, 0.8);
}

.status-icon.checkmark-submitted {
  color: rgba(255, 255, 255, 0.5);
}

.status-icon.checkmark-double {
  color: rgba(255, 255, 255, 0.7);
}

.status-icon.checkmark-double-blue {
  color: #60a5fa; /* Blue color for read status */
}

/* Reply Input */
.reply-input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  background: var(--theme-surface);
  border-top: 1px solid var(--theme-border);
}

.reply-input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.attachment-input {
  display: none;
}

.btn-attachment {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-attachment:hover:not(:disabled) {
  border-color: var(--theme-info-border);
  color: var(--theme-info-text);
  background: var(--theme-info-soft);
}

.btn-attachment:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-attachment svg {
  width: 20px;
  height: 20px;
}

.attachment-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: var(--theme-info-soft);
}

.attachment-preview > img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.attachment-file-icon {
  min-width: 52px;
  padding: 7px;
  border-radius: 8px;
  background: var(--theme-info-soft);
  color: var(--theme-info-text);
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
}

.attachment-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.attachment-info strong {
  overflow: hidden;
  color: var(--theme-text);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-info span {
  color: var(--theme-text-muted);
  font-size: 11px;
}

.attachment-preview > button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--theme-text-muted);
  font-size: 22px;
  cursor: pointer;
}

.reply-textarea {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 14px;
  border: 1.5px solid var(--theme-border);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: all 0.2s ease;
  background: var(--theme-surface-soft);
}

.reply-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: var(--theme-surface);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.reply-textarea::placeholder {
  color: var(--theme-text-muted);
}

.btn-send-reply {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-send-reply:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-send-reply:active:not(:disabled) {
  transform: translateY(0);
}

.btn-send-reply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-send-reply svg {
  width: 20px;
  height: 20px;
}

/* Message Count Badge - Gray (bukan unread indicator) */
.message-count {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: var(--theme-surface-hover);
  color: var(--theme-text-muted);
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  margin-left: 8px;
}

.btn-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--theme-surface-soft);
  border-radius: 10px;
  cursor: pointer;
  color: var(--theme-text-muted);
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--theme-surface-hover);
  color: var(--theme-text);
}

.btn-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--theme-text-muted);
  margin-bottom: 8px;
}

.detail-value {
  color: var(--theme-text);
  font-size: 15px;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sender-info .sender-name {
  font-weight: 600;
  color: var(--theme-text);
}

.sender-info .sender-phone {
  font-size: 14px;
  color: var(--theme-text-muted);
  font-family: monospace;
}

.message-text {
  background: var(--theme-surface-soft);
  padding: 16px;
  border-radius: 12px;
  white-space: pre-wrap;
  line-height: 1.6;
  border: 1px solid var(--theme-border);
  font-size: 14px;
}

/* Delete Confirmation Modal */
.delete-modal {
  max-width: 420px;
  border-radius: 16px;
  overflow: hidden;
}

.delete-modal-header {
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 24px 16px;
  border-bottom: none;
}

.delete-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--theme-danger-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.delete-icon-wrapper svg {
  width: 28px;
  height: 28px;
  stroke: #ef4444;
}

.delete-modal-header h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--theme-text);
}

.delete-modal-desc {
  margin: 0;
  font-size: 14px;
  color: var(--theme-text-muted);
  line-height: 1.5;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  justify-content: center;
}

.btn-cancel {
  padding: 10px 24px;
  background: var(--theme-surface-soft);
  color: var(--theme-text-secondary);
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: var(--theme-surface-hover);
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm-delete {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-confirm-delete:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-confirm-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm-delete svg {
  width: 16px;
  height: 16px;
}

/* Error Message - Konsisten dengan Schedules */
.error-message {
  background: var(--theme-gradient-danger);
  color: #dc2626;
  padding: 16px 20px;
  border-radius: 12px;
  margin-top: 16px;
  border: 1px solid var(--theme-danger-border);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .wrapper {
    padding: 16px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .filter-group {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .btn-reload {
    margin-left: 0;
    justify-content: center;
  }

  .btn-delete-all {
    justify-content: center;
  }

  .btn-delete-conv {
    opacity: 1;
  }

  .pagination {
    flex-direction: column;
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .pagination-label {
    display: none;
  }
  
  .conversation-modal {
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .btn-fullscreen {
    display: none;
  }

  .btn-add-contact {
    width: 36px;
    padding: 8px;
  }

  .btn-add-contact span {
    display: none;
  }

  .add-contact-grid {
    grid-template-columns: 1fr;
  }
  
  .chat-body {
    max-height: calc(100vh - 140px);
  }
  
  .chat-bubble {
    max-width: 90%;
  }

  .image-preview-overlay {
    padding: 60px 12px 18px;
  }

  .image-preview-close {
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
  }

  .image-preview-image {
    max-height: calc(100vh - 130px);
    border-radius: 8px;
  }

  .image-preview-meta {
    margin-top: 10px;
    font-size: 14px;
  }
  
  .reply-input-container {
    padding: 12px 16px;
  }
}
</style>
