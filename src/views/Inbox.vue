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
              {{ d.name || d.id }} — {{ d.status }}
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
    <div class="table-container" v-if="selectedDeviceId">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat pesan masuk...</p>
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
                <span class="sender-name">
                  {{ getSenderName(conv) }}
                </span>
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
            <div class="message-meta">
              <span v-if="conv.messageCount > 1" class="message-count">
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
    <div v-if="selectedConversation" class="modal-overlay" @click="closeConversation">
      <div class="modal conversation-modal" @click.stop>
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
            <div>
              <h3>{{ getSenderName(selectedConversation) }}</h3>
              <span v-if="getConversationPhone(selectedConversation)" class="modal-phone">
                {{ getConversationPhone(selectedConversation) }}
              </span>
              <span class="modal-subtitle">{{ selectedConversation.messageCount }} pesan</span>
            </div>
          </div>
          <button class="btn-close" @click="closeConversation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body chat-body">
          <div class="chat-messages" ref="chatMessagesContainer">
            <!-- All messages (incoming + outgoing) sorted by timestamp -->
            <div
              v-for="msg in allMessages"
              :key="msg.pkId || msg.tempId"
              class="chat-bubble"
              :class="msg.type === 'incoming' ? 'incoming' : 'outgoing'"
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
                  v-if="isStickerMessage(msg) && msg.mediaPath"
                  :src="mediaUrl(msg.mediaPath)"
                  alt="Stiker"
                  class="sticker-message"
                  loading="lazy"
                  @error="handleStickerError($event, msg)"
                />

                <img
                  v-else-if="isImageMedia(msg)"
                  :src="mediaUrl(msg.mediaPath)"
                  alt="Gambar WhatsApp"
                  class="chat-image"
                  loading="lazy"
                  @error="handleMediaError($event, msg)"
                />

                <video
                  v-else-if="isVideoMedia(msg)"
                  :src="mediaUrl(msg.mediaPath)"
                  class="chat-video"
                  controls
                  preload="metadata"
                ></video>

                <audio
                  v-else-if="isAudioMedia(msg)"
                  :src="mediaUrl(msg.mediaPath)"
                  class="chat-audio"
                  controls
                  preload="metadata"
                ></audio>

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
                <span
                  v-for="reaction in getReactionGroups(msg)"
                  :key="reaction.emoji"
                  class="reaction-chip"
                  :title="reaction.title"
                >
                  <span class="reaction-emoji">{{ reaction.emoji }}</span>
                  <span v-if="reaction.count > 1" class="reaction-count">
                    {{ reaction.count }}
                  </span>
                </span>
              </div>
              <button
                v-if="canReactToMessage(msg)"
                type="button"
                class="btn-message-reaction"
                :class="msg.type"
                :disabled="isSendingReaction(msg)"
                :aria-label="`Beri reaction pada pesan ${msg.type === 'incoming' ? 'masuk' : 'keluar'}`"
                title="Beri reaction"
                @click.stop="toggleReactionPicker(msg)"
              >
                {{ isSendingReaction(msg) ? '…' : '☺' }}
              </button>
              <button
                v-if="canDeleteMessage(msg)"
                type="button"
                class="btn-message-actions"
                :class="msg.type"
                :aria-label="`Opsi pesan ${msg.type === 'incoming' ? 'masuk' : 'keluar'}`"
                title="Opsi pesan"
                @click.stop="toggleMessageActionMenu(msg)"
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
              <ReactionPicker
                v-if="isReactionPickerOpen(msg)"
                :direction="msg.type"
                :current-emoji="getOwnReaction(msg)?.emoji || ''"
                :loading="isSendingReaction(msg)"
                @click.stop
                @select="emoji => sendReaction(msg, emoji)"
              />
              <div
                v-if="isMessageActionMenuOpen(msg)"
                class="message-actions-menu"
                :class="msg.type"
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
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm,audio/mpeg,audio/ogg,audio/wav,audio/webm,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
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
                v-model="replyText"
                :placeholder="selectedAttachment ? 'Tambahkan caption (opsional)...' : 'Ketik pesan...'"
                class="reply-textarea"
                @keydown.enter.exact="handleEnterKey"
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

    <p v-if="err" class="error-message">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { userApi, deviceApi } from '../api/http.js';
import { useToast } from '../composables/useToast.js';
import { connectSocket, getSocket } from '../api/socket.js';
import { mediaUrl } from '../utils/mediaUrl.js';
import ReactionPicker from '../components/ReactionPicker.vue';
import {
  applyMessageReactionEvent,
  findOwnMessageReaction,
  getMessageReactionTargetId,
  groupMessageReactions,
  sameConversationJid,
} from '../utils/messageReactions.js';

const toast = useToast();
const DELETED_MESSAGE_TEXT = 'Pesan ini telah dihapus';

const messages = ref([]);
const outgoingConversationSummaries = ref([]);
const devices = ref([]);
const selectedDeviceId = ref(localStorage.getItem('device_selected_id') || '');
const loading = ref(false);
const err = ref('');
const selectedConversation = ref(null);
const conversationReactions = ref([]);
const reactionPickerMessageKey = ref('');
const sendingReactionMessageKey = ref('');
const messageActionMenuKey = ref('');

// Reply functionality
const replyText = ref('');
const sendingReply = ref(false);
const sentMessages = ref([]);
const replyTextarea = ref(null);
const chatMessagesContainer = ref(null);
const attachmentInput = ref(null);
const selectedAttachment = ref(null);
const attachmentPreviewUrl = ref('');
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
});

let searchTimer;
let socketCleanup = null;
let socketConnectionCleanup = null;
let latestLoadRequest = 0;

// Computed
const todayCount = computed(() => {
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

const getReactionGroups = message =>
  groupMessageReactions(message, conversationReactions.value);

const isDeletedForEveryone = message => Boolean(
  message?.deletedForEveryone ||
  message?.status === 'revoked' ||
  (message?.type === 'outgoing' && message?.text === DELETED_MESSAGE_TEXT)
);

const getReactionMessageKey = message =>
  `${message?.type || 'unknown'}:${getMessageReactionTargetId(message) || ''}`;

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

const toggleReactionPicker = message => {
  const messageKey = getReactionMessageKey(message);
  messageActionMenuKey.value = '';
  reactionPickerMessageKey.value =
    reactionPickerMessageKey.value === messageKey ? '' : messageKey;
};

const canDeleteMessage = message => Boolean(getMessageReactionTargetId(message));

const isMessageActionMenuOpen = message =>
  messageActionMenuKey.value === getReactionMessageKey(message);

const toggleMessageActionMenu = message => {
  const messageKey = getReactionMessageKey(message);
  reactionPickerMessageKey.value = '';
  messageActionMenuKey.value =
    messageActionMenuKey.value === messageKey ? '' : messageKey;
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
        messageCount: 0,
        unreadCount: 0, // Track unread messages
      };
    }
    grouped[key].messages.push(msg);
    grouped[key].messageCount++;

    // Count unread messages (messages not yet read by user)
    if (!msg.isRead) {
      grouped[key].unreadCount++;
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
        // ✅ Check duplicate in conversation messages too
        const isConvDuplicate = selectedConversation.value.messages.some(m => m.id === data.id);
        if (!isConvDuplicate) {
          selectedConversation.value.messages.push(incomingMessage);
          selectedConversation.value.messageCount++;
          setTimeout(() => scrollToBottom(), 100);
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
        void loadSentMessagesFromDatabase(data.to);
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
        const newStatus = data.status;
        
        const statusHierarchy = {
          error: 0,
          sending: 1,
          server_ack: 2,
          delivery_ack: 3,
          read: 4,
          played: 5
        };
        
        const currentLevel = statusHierarchy[currentStatus] || 0;
        const newLevel = statusHierarchy[newStatus] || 0;
        
        if (newLevel > currentLevel) {
          sentMessages.value[msgIndex].status = newStatus;
          
          // Also update waMessageId if it was null before
          if (!sentMessages.value[msgIndex].waMessageId && data.waMessageId) {
            sentMessages.value[msgIndex].waMessageId = data.waMessageId;
          }
          
          if (data.readCount !== undefined) {
            sentMessages.value[msgIndex].readCount = data.readCount;
            sentMessages.value[msgIndex].readBy = data.readBy || [];
          }
          
          sentMessages.value = [...sentMessages.value];

          // ✅ Toast notification untuk status update dinonaktifkan
          // Status sudah terlihat dari icon checkmark di chat bubble
        } else if (newLevel === currentLevel) {
          if (data.readCount !== undefined && data.readCount > (sentMessages.value[msgIndex].readCount || 0)) {
            sentMessages.value[msgIndex].readCount = data.readCount;
            sentMessages.value[msgIndex].readBy = data.readBy || [];
            sentMessages.value = [...sentMessages.value];
          }
        }
      }
    };

    const handleReaction = data => {
      applyInboxReactionEvent(data);
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

const viewConversation = async (conv) => {
  const isSameConversation = selectedConversation.value?.from === conv.from;
  
  selectedConversation.value = conv;

  // ✅ Mark all messages in this conversation as read
  await markConversationAsRead(conv.from);
  
  // Jangan reload jika conversation yang sama (preserve real-time messages)
  if (isSameConversation) {
    await loadConversationReactions(conv.from);
    replyText.value = '';
    setTimeout(() => scrollToBottom(), 100);
    return;
  }
  
  // Load from database untuk conversation baru
  await Promise.all([
    loadSentMessagesFromDatabase(conv.from),
    loadConversationReactions(conv.from),
  ]);
  
  replyText.value = '';
  setTimeout(() => scrollToBottom(), 100);
};

const loadConversationReactions = async conversationFrom => {
  try {
    const { data } = await userApi.get(
      `/devices/${selectedDeviceId.value}/inbox/reactions`,
      {
        params: {
          conversationJid: conversationFrom,
          _t: Date.now(),
        },
        headers: { 'Cache-Control': 'no-cache, no-store' },
      },
    );

    if (!sameConversationJid(selectedConversation.value?.from, conversationFrom)) return;
    conversationReactions.value = Array.isArray(data) ? data : [];
    conversationReactions.value.forEach(reaction => {
      removeReactionPlaceholder(reaction.reactionMessageId);
    });
  } catch {
    // Reaction is optional metadata. Never clear or block chat messages when
    // this endpoint is unavailable during a staggered deployment.
    if (sameConversationJid(selectedConversation.value?.from, conversationFrom)) {
      conversationReactions.value = [];
    }
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
        return { ...msg, isRead: true };
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
  } catch {
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
const loadSentMessagesFromDatabase = async (conversationFrom) => {
  try {
    const device = devices.value.find(d => d.id === selectedDeviceId.value);
    if (!device) {
      sentMessages.value = [];
      return;
    }

    // ✅ CRITICAL: Add timestamp + random to FORCE bypass ALL caches
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    
    // Fetch outgoing messages for this conversation from database
    const { data } = await userApi.get(`/devices/${selectedDeviceId.value}/outbox`, {
      params: {
        to: conversationFrom,
        limit: 50,
        _t: timestamp, // ✅ Timestamp cache buster
        _r: random,    // ✅ Random cache buster
      },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '-1',
        'X-Requested-With': 'XMLHttpRequest', // Some proxies respect this
      },
    });
    
    // ✅ CRITICAL: Handle different response formats
    let messages = [];
    if (Array.isArray(data)) {
      messages = data;
    } else if (data && Array.isArray(data.data)) {
      messages = data.data;
    } else if (data && data.results && Array.isArray(data.results)) {
      messages = data.results;
    }
    
    // ✅ CRITICAL: Reverse karena backend query DESC (newest first)
    // Kita perlu oldest first untuk chat UI
    messages = messages.reverse();
    
    // Transform to sentMessages format
    sentMessages.value = messages.map((msg, index) => {
      const dbStatus = msg.status?.toLowerCase() || '';
      
      // Map database status to UI status
      let uiStatus = 'server_ack';
      
      if (dbStatus === 'delivery_ack') {
        uiStatus = 'delivery_ack';
      } else if (dbStatus === 'read') {
        uiStatus = 'read';
      } else if (dbStatus === 'played') {
        uiStatus = 'read';
      } else if (dbStatus === 'failed' || dbStatus === 'error') {
        uiStatus = 'error';
      } else if (dbStatus === 'pending') {
        uiStatus = 'sending';
      } else if (dbStatus === 'revoked') {
        uiStatus = 'revoked';
      }
      
      return {
        tempId: msg.id,
        text: msg.message || '',
        mediaPath: msg.mediaPath || '',
        timestamp: msg.createdAt,
        status: uiStatus,
        deletedForEveryone:
          dbStatus === 'revoked' || msg.message === DELETED_MESSAGE_TEXT,
        waMessageId: msg.waMessageId,
        isGroup: msg.isGroup || false,
        readBy: Array.isArray(msg.readBy) ? msg.readBy : [],
        readCount: Array.isArray(msg.readBy) ? msg.readBy.length : 0,
      };
    });
    
    // ✅ CRITICAL: Force Vue reactivity trigger
    // Ensure Vue detects array change and re-renders UI
    sentMessages.value = [...sentMessages.value];
  } catch (e) {
    sentMessages.value = [];
  }
};

// Close conversation
const closeConversation = () => {
  clearAttachment();
  conversationReactions.value = [];
  reactionPickerMessageKey.value = '';
  sendingReactionMessageKey.value = '';
  messageActionMenuKey.value = '';
  selectedConversation.value = null;
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
const scrollToBottom = () => {
  const container = chatMessagesContainer.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
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

const clearAttachment = () => {
  if (attachmentPreviewUrl.value) URL.revokeObjectURL(attachmentPreviewUrl.value);
  attachmentPreviewUrl.value = '';
  selectedAttachment.value = null;
  if (attachmentInput.value) attachmentInput.value.value = '';
};

const handleAttachmentChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 25 * 1024 * 1024) {
    toast.error('Ukuran lampiran maksimal 25 MB');
    event.target.value = '';
    return;
  }

  if (attachmentPreviewUrl.value) URL.revokeObjectURL(attachmentPreviewUrl.value);
  selectedAttachment.value = file;
  attachmentPreviewUrl.value = URL.createObjectURL(file);
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
  const tempId = `media-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
    formData.append('media', file);

    const { data } = await deviceApi.post('/messages/send/media', formData);
    const saved = data?.message;
    if (!saved?.id) throw new Error('Media terkirim tetapi data pesan tidak ditemukan');

    const msgIndex = sentMessages.value.findIndex(message => message.tempId === tempId);
    if (msgIndex >= 0) {
      sentMessages.value[msgIndex] = {
        ...sentMessages.value[msgIndex],
        tempId: saved.id,
        waMessageId: saved.waMessageId || saved.id,
        text: saved.message || optimisticMessage.text,
        mediaPath: saved.mediaPath || localPreviewUrl,
        timestamp: saved.createdAt || optimisticMessage.timestamp,
        status: 'server_ack',
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
    const summary = {
      ...previousSummary,
      ...saved,
      to: recipient,
      message: saved.message || optimisticMessage.text,
      createdAt: saved.createdAt || optimisticMessage.timestamp,
      messageCount:
        (Number(previousSummary?.messageCount) || 0) +
        (previousSummary?.id === saved.id ? 0 : 1),
      contact: saved.contact || selectedConversation.value.contact || previousSummary?.contact || null,
    };
    if (summaryIndex >= 0) outgoingConversationSummaries.value.splice(summaryIndex, 1);
    outgoingConversationSummaries.value.unshift(summary);

    toast.success('Media berhasil dikirim');
    setTimeout(() => scrollToBottom(), 50);
  } catch (error) {
    const msgIndex = sentMessages.value.findIndex(message => message.tempId === tempId);
    if (msgIndex >= 0) {
      sentMessages.value[msgIndex].status = 'error';
      sentMessages.value = [...sentMessages.value];
    }
    toast.error(
      error?.response?.data?.message || error?.message || 'Gagal mengirim media',
    );
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
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
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
      throw new Error('Device tidak ditemukan');
    }

    if (!device.isConnected) {
      throw new Error('Device tidak terhubung. Silakan pilih device lain atau hubungkan kembali WhatsApp.');
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
      }
    ]);

    const errors = response?.data?.errors || [];
    if (errors.length > 0) {
      throw new Error(errors[0]?.error || 'Gagal mengirim pesan');
    }

    const results = response?.data?.results || [];
    
    if (results.length === 0) {
      throw new Error('Tidak ada hasil dari pengiriman pesan');
    }
    
    const waMessageId = results[0]?.result?.key?.id;
    const messageTimestamp = results[0]?.result?.messageTimestamp;

    const msgIndex = sentMessages.value.findIndex(m => m.tempId === tempId);
    
    if (msgIndex !== -1) {
      sentMessages.value[msgIndex] = {
        ...sentMessages.value[msgIndex],
        status: 'server_ack',
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
          status: 'server_ack',
          waMessageId: waMessageId,
          isGroup: selectedConversation.value.isGroup || false,
          readBy: [],
          readCount: 0,
        };
        
        sentMessages.value.push(newMessage);
        sentMessages.value = [...sentMessages.value];
      }
    }
    
    toast.success('Pesan berhasil dikirim');

    const existingSummaryIndex = outgoingConversationSummaries.value.findIndex(
      message => message.to === recipient,
    );
    const existingSummary = existingSummaryIndex >= 0
      ? outgoingConversationSummaries.value[existingSummaryIndex]
      : null;
    const summary = {
      ...existingSummary,
      id: waMessageId || tempId,
      waMessageId: waMessageId || null,
      to: recipient,
      message: messageText,
      createdAt: messageTimestamp
        ? new Date(Number(messageTimestamp) * 1000).toISOString()
        : new Date().toISOString(),
      status: 'server_ack',
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
    setTimeout(() => scrollToBottom(), 50);
  } catch (e) {
    // Update message status to error
    const msgIndex = sentMessages.value.findIndex(m => m.tempId === tempId);
    if (msgIndex !== -1) {
      sentMessages.value[msgIndex].status = 'error';
    }
    
    const errorMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message;
    
    if (errorMsg?.includes('Session not found') || errorMsg?.includes('unauthorized') || e?.response?.status === 401) {
      toast.error('Session WhatsApp tidak ditemukan. Device perlu di-pairing ulang atau pilih device lain yang aktif.');
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

// Lifecycle
onMounted(async () => {
  // Connect socket and setup listeners
  const socket = connectSocket();

  const handleSocketConnect = () => {
    if (selectedDeviceId.value) {
      setupSocketListener();
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
  
  // Load messages if device selected
  if (selectedDeviceId.value) {
    loadMessages();
    
    // ✅ FIXED: Only setup listener once - either if already connected OR wait for 'connect' event above
    if (socket.connected) {
      setupSocketListener();
    }
  }
});

onUnmounted(() => {
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

const getMediaExtension = (message) => {
  const path = String(message?.mediaPath || '').split(/[?#]/)[0].toLowerCase();
  return path.includes('.') ? path.substring(path.lastIndexOf('.') + 1) : '';
};

const isImageMedia = (message) =>
  Boolean(message?.mediaPath) && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getMediaExtension(message));
const isVideoMedia = (message) =>
  Boolean(message?.mediaPath) && ['mp4', 'mov', 'webm', 'mkv'].includes(getMediaExtension(message));
const isAudioMedia = (message) =>
  Boolean(message?.mediaPath) && ['mp3', 'ogg', 'wav', 'm4a', 'aac', 'opus'].includes(getMediaExtension(message));
const isDocumentMedia = (message) =>
  Boolean(message?.mediaPath) &&
  !isStickerMessage(message) &&
  !isImageMedia(message) &&
  !isVideoMedia(message) &&
  !isAudioMedia(message);

const getMediaFileName = (message) => {
  if (message?.fileName) return message.fileName;
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
  const image = event.currentTarget;
  const retryCount = Number(image.dataset.retryCount || 0);
  if (retryCount < 3 && message.mediaPath) {
    image.dataset.retryCount = String(retryCount + 1);
    image.style.visibility = 'hidden';
    setTimeout(() => {
      image.style.visibility = '';
      image.src = mediaUrl(message.mediaPath);
    }, 750 * (retryCount + 1));
    return;
  }

  image.style.display = 'none';
  message.mediaLoadFailed = true;
};

const handleMediaError = (event, message) => {
  event.currentTarget.style.display = 'none';
  message.mediaPath = '';
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
  background: #ffffff;
  border: 1px solid #e2e8f0;
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
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  align-items: center;
}

.message-item:hover {
  background: #f8fafc;
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
  color: #94a3b8;
  opacity: 0;
  transition: all 0.2s ease;
}

.btn-delete-conv:hover {
  background: #fef2f2;
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
  color: #1e293b;
  font-size: 15px;
}

.sender-identity {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sender-phone {
  margin-top: 2px;
  color: #64748b;
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
  color: #94a3b8;
}

.message-preview {
  color: #64748b;
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
}

/* Loading State - Konsisten dengan Schedules */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  color: #64748b;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
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
  color: #1e293b;
}

.empty-state p,
.empty-selection-card p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.empty-selection-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Pagination - Konsisten dengan Schedules */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  color: #64748b;
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
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
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
  border-color: #2563eb;
  background: #2563eb;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #64748b;
}

.current-page {
  font-weight: 600;
  color: #1e293b;
}

/* Modal - Konsisten dengan Schedules */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal {
  background: #ffffff;
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
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-header h3 svg {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

/* Conversation Modal */
.conversation-modal {
  max-width: 600px;
  height: 80vh;
  max-height: 700px;
}

.conversation-modal .modal-header {
  padding: 16px 20px;
}

.modal-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
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
  color: #1e293b;
}

.modal-subtitle {
  font-size: 13px;
  color: #64748b;
}

.modal-phone {
  display: block;
  margin-top: 2px;
  color: #475569;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.modal-phone + .modal-subtitle::before {
  content: ' · ';
}

.chat-body {
  flex: 1;
  padding: 0;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  max-height: calc(80vh - 140px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-bubble {
  max-width: 85%;
  position: relative;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-bubble.incoming {
  align-self: flex-start;
}

.chat-bubble.outgoing {
  align-self: flex-end;
}

.bubble-content {
  background: #ffffff;
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
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
  color: #475569;
  font-size: 12px;
  line-height: 1;
}

.reaction-emoji {
  font-size: 16px;
  line-height: 1;
}

.reaction-count {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
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
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.14);
  color: #64748b;
  cursor: pointer;
  font-size: 17px;
  line-height: 1;
  opacity: 0;
  transform: translateY(-50%);
  transition: opacity 0.15s ease, background 0.15s ease;
}

.btn-message-reaction.incoming {
  right: -36px;
}

.btn-message-reaction.outgoing {
  left: -36px;
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
  color: #64748b;
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
  background: #f8fafc;
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
  position: absolute;
  top: 36px;
  z-index: 30;
  display: flex;
  width: 190px;
  flex-direction: column;
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
}

.message-actions-menu.incoming { left: 0; }
.message-actions-menu.outgoing { right: 0; }

.message-actions-menu button {
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #334155;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
}

.message-actions-menu button:hover { background: #f1f5f9; }
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
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  font-weight: 500;
}

.bubble-text {
  color: #1e293b;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.deleted-message-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
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
  background: #f1f5f9;
  color: #1e293b;
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
  color: #94a3b8;
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
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
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
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-attachment:hover:not(:disabled) {
  border-color: #93c5fd;
  color: #2563eb;
  background: #eff6ff;
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
  background: #eff6ff;
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
  background: #dbeafe;
  color: #1d4ed8;
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
  color: #1e293b;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-info span {
  color: #64748b;
  font-size: 11px;
}

.attachment-preview > button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-size: 22px;
  cursor: pointer;
}

.reply-textarea {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.reply-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.reply-textarea::placeholder {
  color: #94a3b8;
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
  background: #e2e8f0;
  color: #64748b;
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
  background: #f1f5f9;
  border-radius: 10px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #1e293b;
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
  color: #64748b;
  margin-bottom: 8px;
}

.detail-value {
  color: #1e293b;
  font-size: 15px;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sender-info .sender-name {
  font-weight: 600;
  color: #1e293b;
}

.sender-info .sender-phone {
  font-size: 14px;
  color: #64748b;
  font-family: monospace;
}

.message-text {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  white-space: pre-wrap;
  line-height: 1.6;
  border: 1px solid #e2e8f0;
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
  background: #fef2f2;
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
  color: #1e293b;
}

.delete-modal-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
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
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: #e2e8f0;
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
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  padding: 16px 20px;
  border-radius: 12px;
  margin-top: 16px;
  border: 1px solid #fecaca;
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
  
  .chat-body {
    max-height: calc(100vh - 140px);
  }
  
  .chat-bubble {
    max-width: 90%;
  }
  
  .reply-input-container {
    padding: 12px 16px;
  }
}
</style>
