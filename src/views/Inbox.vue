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
          :disabled="loading || !selectedDeviceId || messages.length === 0"
          title="Hapus Semua Pesan Masuk"
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
            <!-- Group with picture -->
            <img
              v-if="conv.isGroup && conv.groupPicUrl"
              :src="conv.groupPicUrl"
              class="avatar-image"
              @error="(e) => e.target.style.display = 'none'"
            />
            <!-- Fallback avatar circle -->
            <div
              v-if="!conv.isGroup || !conv.groupPicUrl"
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
              <span class="sender-name">
                {{ getSenderName(conv) }}
              </span>
              <span class="message-time">{{ formatTime(conv.latestMessage.receivedAt) }}</span>
            </div>
            <div class="message-preview">
              {{ truncateMessage(conv.latestMessage.message, 100) }}
            </div>
            <div class="message-meta">
              <span class="phone-number">{{ formatPhoneOrId(conv.from) }}</span>
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

      <div v-if="meta.totalMessages > 0" class="pagination">
        <div class="pagination-info">
          Menampilkan <strong>{{ conversations.length }}</strong> percakapan dari
          <strong>{{ meta.totalMessages }}</strong> pesan
        </div>
        <div class="pagination-controls">
          <button class="btn-page" :disabled="page <= 1 || loading" @click="goPrev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Sebelumnya
          </button>
          <div class="page-indicator">
            <span class="current-page">{{ page }}</span>
            <span class="page-separator">/</span>
            <span class="total-pages">{{ meta.totalPages || 1 }}</span>
          </div>
          <button class="btn-page" :disabled="!meta.hasMore || loading" @click="goNext">
            Berikutnya
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
    <div v-if="selectedConversation" class="modal-overlay" @click="selectedConversation = null">
      <div class="modal conversation-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-header-info">
            <!-- Group with picture -->
            <img
              v-if="selectedConversation.isGroup && selectedConversation.groupPicUrl"
              :src="selectedConversation.groupPicUrl"
              class="avatar-image modal-avatar"
              @error="(e) => e.target.style.display = 'none'"
            />
            <!-- Fallback avatar circle -->
            <div
              v-if="!selectedConversation.isGroup || !selectedConversation.groupPicUrl"
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
              <span class="modal-subtitle">{{ formatPhoneOrId(selectedConversation.from) }} • {{ selectedConversation.messages.length }} pesan</span>
            </div>
          </div>
          <button class="btn-close" @click="selectedConversation = null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body chat-body">
          <div class="chat-messages">
            <div
              v-for="msg in selectedConversation.messages"
              :key="msg.pkId"
              class="chat-bubble incoming"
            >
              <div class="bubble-content">
                <div v-if="selectedConversation.isGroup" class="bubble-sender">
                  {{ msg.pushName || formatPhoneOrId(msg.participant) || 'Tidak dikenal' }}
                </div>
                <div class="bubble-text">{{ msg.message }}</div>
                <div class="bubble-time">{{ formatFullTime(msg.receivedAt) }}</div>
              </div>
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
import { userApi } from '../api/http.js';
import { useToast } from '../composables/useToast.js';
import { connectSocket, getSocket } from '../api/socket.js';

const toast = useToast();

const messages = ref([]);
const devices = ref([]);
const selectedDeviceId = ref(localStorage.getItem('device_selected_id') || '');
const loading = ref(false);
const err = ref('');
const selectedConversation = ref(null);

// Search & pagination
const q = ref('');
const page = ref(1);
const pageSize = ref(25);
const meta = ref({ totalMessages: 0, currentPage: 1, totalPages: 1, hasMore: false });

let searchTimer;
let socketCleanup = null;

// Computed
const todayCount = computed(() => {
  const today = new Date().toDateString();
  return messages.value.filter(m => new Date(m.receivedAt).toDateString() === today).length;
});

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
        isGroup: msg.isGroup || msg.from?.includes('@g.us'),
        messages: [],
        latestMessage: msg,
        messageCount: 0,
      };
    }
    grouped[key].messages.push(msg);
    grouped[key].messageCount++;
    
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
    
    // Keep track of latest message
    if (new Date(msg.receivedAt) > new Date(grouped[key].latestMessage.receivedAt)) {
      grouped[key].latestMessage = msg;
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
    devices.value = Array.isArray(data) ? data : [];
  } catch {
    devices.value = [];
  }
};

const onDeviceChange = () => {
  localStorage.setItem('device_selected_id', selectedDeviceId.value);
  window.dispatchEvent(new Event('deviceChanged'));
  page.value = 1;
  loadMessages();
  setupSocketListener();
};

const loadMessages = async () => {
  if (!selectedDeviceId.value) return;

  loading.value = true;
  err.value = '';

  try {
    // Use userApi (JWT auth) instead of deviceApi (session-based auth)
    // This works even when device is disconnected from WhatsApp
    const { data } = await userApi.get(`/devices/${selectedDeviceId.value}/inbox`, {
      params: {
        ...(q.value ? { message: q.value } : {}),
        page: page.value,
        pageSize: pageSize.value,
      },
    });

    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    messages.value = list;
    meta.value = {
      totalMessages: data?.metadata?.totalMessages || data?.total || list.length,
      currentPage: page.value,
      totalPages: data?.metadata?.totalPages || Math.ceil((data?.total || list.length) / pageSize.value),
      hasMore: data?.metadata?.hasMore || list.length === pageSize.value,
    };
  } catch (e) {
    err.value = e?.response?.data?.message || 'Gagal memuat pesan masuk';
    messages.value = [];
    meta.value = { totalMessages: 0, currentPage: 1, totalPages: 1, hasMore: false };
  } finally {
    loading.value = false;
  }
};

const setupSocketListener = () => {
  // Cleanup previous listener
  if (socketCleanup) {
    socketCleanup();
    socketCleanup = null;
  }

  if (!selectedDeviceId.value) return;

  const device = devices.value.find(d => d.id === selectedDeviceId.value);
  if (!device?.sessionId) return;

  try {
    const socket = getSocket();
    if (!socket) return;

    const eventName = `incoming:${device.sessionId}`;
    
    const handleIncoming = (data) => {
      // Add to top of list
      messages.value.unshift(data);
      meta.value.totalMessages++;
      
      toast.info(`Pesan baru dari ${data.contact?.firstName || formatPhone(data.from)}`);
    };

    socket.on(eventName, handleIncoming);
    
    socketCleanup = () => {
      socket.off(eventName, handleIncoming);
    };
  } catch (e) {
    console.warn('Failed to setup socket listener:', e);
  }
};

const viewConversation = (conv) => {
  selectedConversation.value = conv;
};

// Delete functionality
const deleteModal = ref({
  show: false,
  title: '',
  description: '',
  type: '', // 'conversation' or 'all'
  from: null,
  loading: false,
});

const confirmDeleteConversation = (conv) => {
  deleteModal.value = {
    show: true,
    title: 'Hapus Percakapan',
    description: `Apakah Anda yakin ingin menghapus ${conv.messageCount} pesan dari ${getSenderName(conv)}? Tindakan ini tidak dapat dibatalkan.`,
    type: 'conversation',
    from: conv.from,
    loading: false,
  };
};

const confirmDeleteAll = () => {
  deleteModal.value = {
    show: true,
    title: 'Hapus Semua Pesan Masuk',
    description: `Apakah Anda yakin ingin menghapus seluruh ${meta.value.totalMessages} pesan masuk? Tindakan ini tidak dapat dibatalkan.`,
    type: 'all',
    from: null,
    loading: false,
  };
};

const executeDelete = async () => {
  deleteModal.value.loading = true;
  try {
    if (deleteModal.value.type === 'conversation') {
      await userApi.delete(`/devices/${selectedDeviceId.value}/inbox/conversation`, {
        data: { from: deleteModal.value.from },
      });
      toast.success('Percakapan berhasil dihapus');
    } else {
      await userApi.delete(`/devices/${selectedDeviceId.value}/inbox`);
      toast.success('Semua pesan masuk berhasil dihapus');
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
  return formatPhoneOrId(conv.from);
};

// Format phone number, or show ID info if it's a LID format
const formatPhoneOrId = (jid) => {
  if (!jid) return '';
  const cleaned = jid.replace(/@s\.whatsapp\.net|@g\.us|@lid/g, '');
  
  // Check if it's a LID (Linked ID) format
  if (jid.includes('@lid')) {
    return `ID: ${cleaned.slice(-8)}...`; // Show last 8 chars of LID
  }
  
  return cleaned;
};

// Watchers
watch(q, () => {
  page.value = 1;
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadMessages(), 300);
});

// Lifecycle
onMounted(async () => {
  await fetchDevices();
  if (selectedDeviceId.value) {
    loadMessages();
    setupSocketListener();
  }
  
  // Initialize socket connection
  try {
    connectSocket();
  } catch (e) {
    console.warn('Socket connection failed:', e);
  }
});

onUnmounted(() => {
  if (socketCleanup) {
    socketCleanup();
  }
});
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

.phone-number {
  font-size: 12px;
  color: #94a3b8;
  font-family: monospace;
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
  gap: 12px;
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

.chat-body {
  flex: 1;
  padding: 0;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-bubble.incoming {
  align-self: flex-start;
}

.bubble-content {
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 16px;
  border-top-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.bubble-sender {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
}

.bubble-text {
  color: #1e293b;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble-time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
  text-align: right;
}

/* Message Count Badge */
.message-count {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
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
}
</style>
