import { onMounted, onUnmounted, ref } from 'vue';
import { connectSocket, getSocket } from '../api/socket.js';
import { useToast } from './useToast.js';
import { userApi } from '../api/http.js';
import { useRouter } from 'vue-router';
import { useInboxUnread } from './useInboxUnread.js';
import { buildIncomingNotification } from '../utils/incomingNotification.js';
import { mediaUrl } from '../utils/mediaUrl.js';

const NOTIFICATION_DEDUP_TTL_MS = 10 * 60 * 1000;
const MAX_RECENT_NOTIFICATIONS = 1000;
const SYSTEM_NOTIFICATION_AVATAR_WAIT_MS = 2500;
const ACTIVE_NOTIFICATION_TTL_MS = 10_000;

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
  let notificationPermissionRequested = false;
  const recentNotifications = new Map();
  const activeNotifications = new Map();

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
    if (
      localStorage.getItem('token')
      && 'Notification' in window
      && window.Notification.permission === 'default'
      && !notificationPermissionRequested
    ) {
      notificationPermissionRequested = true;
      try {
        await window.Notification.requestPermission();
      } catch (_) {}
    }
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

  const absoluteNotificationIcon = avatarUrl => {
    if (!avatarUrl) return undefined;
    try {
      return new URL(mediaUrl(avatarUrl), window.location.origin).href;
    } catch (_) {
      return undefined;
    }
  };

  const showSystemNotification = ({ data, device, notification, openInboxMessage }) => {
    if (!('Notification' in window) || window.Notification.permission !== 'granted') return false;

    try {
      const systemNotification = new window.Notification(notification.title, {
        body: notification.description,
        icon: absoluteNotificationIcon(notification.avatarUrl),
        tag: `inbox:${device?.id || 'device'}:${data.from || data.id || 'message'}`,
        renotify: true,
        data: {
          deviceId: device?.id || '',
          conversationJid: data.from || '',
          messageId: data.id || '',
        },
      });
      systemNotification.onclick = () => {
        window.focus();
        systemNotification.close();
        void openInboxMessage();
      };
      return true;
    } catch (_) {
      // Toast and sound remain available when native notifications are rejected.
      return false;
    }
  };

  const clearActiveNotification = key => {
    const entry = activeNotifications.get(key);
    if (!entry) return;
    if (entry.systemTimer) clearTimeout(entry.systemTimer);
    if (entry.expiryTimer) clearTimeout(entry.expiryTimer);
    activeNotifications.delete(key);
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
      const profileEventName = `incoming:${sessionId}:profile-updated`;
      const device = userDevices.find(item => item.sessionId === sessionId);
      const handler = (data) => {
        if (isDuplicateNotification(sessionId, data?.id)) return;

        incrementUnreadCount(device?.id, 1);

        const notification = buildIncomingNotification(data);
        const openInboxMessage = () => router.push({
          name: 'inbox',
          query: {
            device: device?.id || '',
            conversation: data.from || '',
            message: data.id || '',
            displayName: notification.title,
            isGroup: String(notification.isGroup),
            profilePicUrl: data.groupPicUrl || data.profilePicUrl || '',
          },
        });
        const toastId = toast.info(notification.description, 6000, {
          title: notification.title,
          description: notification.description,
          avatarUrl: notification.avatarUrl,
          avatarStatus: data.profilePictureStatus || '',
          avatarFallback: notification.avatarFallback,
          onClick: openInboxMessage,
          ariaLabel: `Buka pesan dari ${notification.title}`,
        });
        const notificationKey = `${sessionId}:${data.id || data.from || Date.now()}`;
        const entry = {
          data,
          device,
          notification,
          openInboxMessage,
          toastId,
          systemShown: false,
          systemTimer: null,
          expiryTimer: null,
        };
        activeNotifications.set(notificationKey, entry);
        entry.expiryTimer = setTimeout(
          () => clearActiveNotification(notificationKey),
          ACTIVE_NOTIFICATION_TTL_MS,
        );
        if (notification.avatarUrl) {
          entry.systemShown = showSystemNotification(entry);
        } else {
          entry.systemTimer = setTimeout(() => {
            entry.systemTimer = null;
            entry.systemShown = showSystemNotification(entry);
          }, SYSTEM_NOTIFICATION_AVATAR_WAIT_MS);
        }
        void playNotificationSound();
      };

      const profileHandler = (profileData) => {
        const matchingEntries = [...activeNotifications.entries()].filter(([key, entry]) => (
          key.startsWith(`${sessionId}:`)
          && entry.data
          && (
            (profileData?.id && entry.data.id === profileData.id)
            || (profileData?.from && entry.data.from === profileData.from)
          )
        ));

        for (const [, entry] of matchingEntries) {
          entry.data = { ...entry.data, ...profileData };
          entry.notification = buildIncomingNotification(entry.data);
          toast.update(entry.toastId, {
            avatarUrl: entry.notification.avatarUrl,
            avatarStatus: profileData.profilePictureStatus || '',
            avatarFallback: entry.notification.avatarFallback,
          });

          if (!entry.systemShown && entry.notification.avatarUrl) {
            if (entry.systemTimer) clearTimeout(entry.systemTimer);
            entry.systemTimer = null;
            entry.systemShown = showSystemNotification(entry);
          }
        }
      };

      socket.on(eventName, handler);
      socket.on(profileEventName, profileHandler);
      handlers.push(
        { eventName, handler },
        { eventName: profileEventName, handler: profileHandler },
      );
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
    for (const key of activeNotifications.keys()) clearActiveNotification(key);

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
