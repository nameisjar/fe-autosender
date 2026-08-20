import { onMounted, onUnmounted, ref } from 'vue';
import { connectSocket, getSocket } from '../api/socket.js';
import { useToast } from './useToast.js';
import { userApi } from '../api/http.js';
import { useRouter } from 'vue-router';
import { useInboxUnread } from './useInboxUnread.js';

const NOTIFICATION_DEDUP_TTL_MS = 10 * 60 * 1000;
const MAX_RECENT_NOTIFICATIONS = 1000;

/** Global toast and sound notifications for incoming WhatsApp messages. */
export function useGlobalNotifications() {
  const toast = useToast();
  const router = useRouter();
  const { incrementUnreadCount } = useInboxUnread();
  const devices = ref([]);
  let socketCleanup = null;
  let connectionCleanup = null;
  let refreshTimer = null;
  let setupGeneration = 0;
  let audioContext = null;
  const recentNotifications = new Map();

  const isDuplicateNotification = (sessionId, messageId, now = Date.now()) => {
    if (!messageId) return false;

    const key = `${sessionId}:${messageId}`;
    const expiresAt = recentNotifications.get(key);
    if (expiresAt && expiresAt > now) return true;

    recentNotifications.set(key, now + NOTIFICATION_DEDUP_TTL_MS);
    if (recentNotifications.size > MAX_RECENT_NOTIFICATIONS) {
      for (const [recentKey, recentExpiresAt] of recentNotifications) {
        if (recentExpiresAt <= now) recentNotifications.delete(recentKey);
      }
      while (recentNotifications.size > MAX_RECENT_NOTIFICATIONS) {
        const oldestKey = recentNotifications.keys().next().value;
        if (!oldestKey) break;
        recentNotifications.delete(oldestKey);
      }
    }

    return false;
  };

  const formatPhone = (jid) => {
    if (!jid) return '';
    if (jid.includes('@lid')) return 'Kontak WhatsApp';
    return jid.replace(/@s\.whatsapp\.net|@g\.us/g, '');
  };

  const getSenderName = (data) => {
    if ((data.isGroup || data.from?.endsWith('@g.us')) && data.groupName) {
      return data.groupName;
    }
    if (data.contact) {
      return `${data.contact.firstName} ${data.contact.lastName || ''}`.trim();
    }
    if (data.pushName) return data.pushName;
    return formatPhone(data.from);
  };

  const getAudioContext = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContextClass();
    }
    return audioContext;
  };

  // Browsers allow sound only after a user gesture. Unlock one shared context
  // on pointer/keyboard input so later incoming messages can play reliably.
  const unlockNotificationSound = async () => {
    try {
      const context = getAudioContext();
      if (context?.state === 'suspended') await context.resume();
    } catch (_) {}
  };

  const playNotificationSound = async () => {
    try {
      const context = getAudioContext();
      if (!context) return;
      if (context.state === 'suspended') await context.resume();

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.frequency.setValueAtTime(600, context.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (_) {}
  };

  const fetchUserDevices = async () => {
    try {
      const { data } = await userApi.get('/devices');
      devices.value = Array.isArray(data) ? data : [];
      return devices.value;
    } catch (error) {
      console.error('Failed to fetch devices for global notifications:', error);
      return null;
    }
  };

  const setupGlobalListener = async () => {
    const socket = getSocket();
    if (!socket) return;

    const generation = ++setupGeneration;
    const userDevices = await fetchUserDevices();
    if (generation !== setupGeneration) return;

    // A temporary API failure must not remove listeners that are still valid.
    if (userDevices === null) return;

    if (socketCleanup) {
      socketCleanup();
      socketCleanup = null;
    }
    if (userDevices.length === 0) return;

    const handlers = [];
    const uniqueSessionIds = [...new Set(userDevices.map(device => device.sessionId).filter(Boolean))];

    uniqueSessionIds.forEach((sessionId) => {
      const eventName = `incoming:${sessionId}`;
      const device = userDevices.find(item => item.sessionId === sessionId);
      const handler = (data) => {
        if (isDuplicateNotification(sessionId, data?.id)) return;

        incrementUnreadCount(device?.id, 1);

        const senderName = getSenderName(data);
        const preview = data.message?.substring(0, 50) || 'Media/File';
        const openInboxMessage = () => router.push({
          name: 'inbox',
          query: {
            device: device?.id || '',
            conversation: data.from || '',
            message: data.id || '',
            displayName: senderName,
            isGroup: String(Boolean(data.isGroup || data.from?.endsWith('@g.us'))),
            profilePicUrl: data.groupPicUrl || data.profilePicUrl || '',
          },
        });
        toast.info(`💬 ${senderName}: ${preview}`, 5000, {
          onClick: openInboxMessage,
          ariaLabel: `Buka pesan dari ${senderName}`,
        });
        void playNotificationSound();
      };

      socket.on(eventName, handler);
      handlers.push({ eventName, handler });
    });

    socketCleanup = () => {
      handlers.forEach(({ eventName, handler }) => socket.off(eventName, handler));
    };
  };

  const scheduleListenerRefresh = () => {
    if (!localStorage.getItem('token')) return;
    connectSocket();
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      void setupGlobalListener();
    }, 100);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') scheduleListenerRefresh();
  };

  onMounted(async () => {
    // Register lifecycle events even on the login page. App.vue remains
    // mounted after login, so returning before this point would permanently
    // disable global notifications for that browser session.
    window.addEventListener('deviceChanged', scheduleListenerRefresh);
    window.addEventListener('device:changed', scheduleListenerRefresh);
    window.addEventListener('devices:loaded', scheduleListenerRefresh);
    window.addEventListener('user:logged-in', scheduleListenerRefresh);
    window.addEventListener('wa:device-session-closed', scheduleListenerRefresh);
    window.addEventListener('focus', scheduleListenerRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('pointerdown', unlockNotificationSound);
    document.addEventListener('keydown', unlockNotificationSound);

    if (!localStorage.getItem('token')) return;

    const socket = connectSocket();
    if (socket) {
      const handleConnect = () => scheduleListenerRefresh();
      if (socket.connected) await setupGlobalListener();
      socket.on('connect', handleConnect);
      connectionCleanup = () => socket.off('connect', handleConnect);
    }
  });

  onUnmounted(() => {
    if (socketCleanup) socketCleanup();
    if (connectionCleanup) connectionCleanup();
    if (refreshTimer) clearTimeout(refreshTimer);
    setupGeneration++;
    recentNotifications.clear();

    window.removeEventListener('deviceChanged', scheduleListenerRefresh);
    window.removeEventListener('device:changed', scheduleListenerRefresh);
    window.removeEventListener('devices:loaded', scheduleListenerRefresh);
    window.removeEventListener('user:logged-in', scheduleListenerRefresh);
    window.removeEventListener('wa:device-session-closed', scheduleListenerRefresh);
    window.removeEventListener('focus', scheduleListenerRefresh);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('pointerdown', unlockNotificationSound);
    document.removeEventListener('keydown', unlockNotificationSound);

    if (audioContext && audioContext.state !== 'closed') {
      void audioContext.close().catch(() => {});
    }
    audioContext = null;
  });

  return { devices };
}
