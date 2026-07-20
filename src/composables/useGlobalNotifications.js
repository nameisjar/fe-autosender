import { onMounted, onUnmounted, ref } from 'vue';
import { connectSocket, getSocket } from '../api/socket.js';
import { useToast } from './useToast.js';
import { userApi } from '../api/http.js';

/**
 * Global notification service untuk incoming WhatsApp messages
 * Bisa digunakan di semua component untuk menerima notifikasi
 */
export function useGlobalNotifications() {
  const toast = useToast();
  let socketCleanup = null;
  const devices = ref([]);

  const formatPhone = (jid) => {
    if (!jid) return '';
    const cleaned = jid.replace(/@s\.whatsapp\.net|@g\.us|@lid/g, '');
    if (jid.includes('@lid')) {
      return `ID: ${cleaned.slice(-8)}...`;
    }
    return cleaned;
  };

  const getSenderName = (data) => {
    // Prioritas: contact > pushName > groupName > formatted phone
    if (data.contact) {
      return `${data.contact.firstName} ${data.contact.lastName || ''}`.trim();
    } else if (data.pushName) {
      return data.pushName;
    } else if (data.isGroup && data.groupName) {
      return data.groupName;
    } else {
      return formatPhone(data.from);
    }
  };

  const fetchUserDevices = async () => {
    try {
      const { data } = await userApi.get('/devices');
      devices.value = Array.isArray(data) ? data : [];
      return devices.value;
    } catch (e) {
      console.error('Failed to fetch devices for global notifications:', e);
      return [];
    }
  };

  const setupGlobalListener = async () => {
    const socket = getSocket();
    if (!socket) return;

    // Fetch user devices
    const userDevices = await fetchUserDevices();
    if (userDevices.length === 0) return;

    const handlers = [];

    // ✅ FIXED: Only listen to unique sessionIds (avoid duplicate notifications if user has multiple devices with same session)
    const uniqueSessionIds = [...new Set(userDevices.map(d => d.sessionId).filter(Boolean))];

    // Listen ke semua sessions milik user
    uniqueSessionIds.forEach(sessionId => {
      const incomingEventName = `incoming:${sessionId}`;
      
      // ✅ FIXED: Remove existing listener first to prevent duplicates
      socket.off(incomingEventName);
      
      const handler = (data) => {
        const senderName = getSenderName(data);
        const preview = data.message?.substring(0, 50) || '📎 Media/File';
        
        // Show notification dengan nama pengirim
        toast.info(`💬 ${senderName}: ${preview}`);
      };

      socket.on(incomingEventName, handler);
      handlers.push({ eventName: incomingEventName, handler });
    });

    socketCleanup = () => {
      handlers.forEach(({ eventName, handler }) => {
        socket.off(eventName, handler);
      });
    };
  };

  onMounted(async () => {
    // Only setup if user is logged in
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect socket jika belum
    connectSocket();
    
    // Setup global listener
    const socket = getSocket();
    if (socket) {
      if (socket.connected) {
        await setupGlobalListener();
      } else {
        socket.on('connect', async () => {
          await setupGlobalListener();
        });
      }
    }
  });

  onUnmounted(() => {
    if (socketCleanup) {
      socketCleanup();
    }
  });

  return {
    devices,
  };
}
