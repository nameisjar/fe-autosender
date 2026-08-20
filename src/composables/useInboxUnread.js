import { ref } from 'vue';

const unreadByDevice = ref({});

const normalizeCount = value => Math.max(0, Number(value) || 0);

export function useInboxUnread() {
  const setUnreadCount = (deviceId, count) => {
    if (!deviceId) return;
    unreadByDevice.value = {
      ...unreadByDevice.value,
      [String(deviceId)]: normalizeCount(count),
    };
  };

  const incrementUnreadCount = (deviceId, amount = 1) => {
    if (!deviceId) return;
    const key = String(deviceId);
    setUnreadCount(key, normalizeCount(unreadByDevice.value[key]) + normalizeCount(amount));
  };

  const decrementUnreadCount = (deviceId, amount = 1) => {
    if (!deviceId) return;
    const key = String(deviceId);
    setUnreadCount(key, normalizeCount(unreadByDevice.value[key]) - normalizeCount(amount));
  };

  return {
    unreadByDevice,
    setUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
  };
}
