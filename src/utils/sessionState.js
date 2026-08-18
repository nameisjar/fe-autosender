import { clearDeviceAccessTokenCache } from '../api/http.js';
import { resetSocket } from '../api/socket.js';
import { resetDevicesState } from '../composables/useDevices.js';
import { clearGroupsCache } from '../composables/useGroups.js';
import { resetRecipientsCache } from '../composables/useRecipients.js';
import { resetTemplatesCache } from '../composables/useTemplates.js';
import { resetChatTemplatesCache } from '../composables/useChatTemplates.js';
import { cache } from './cache.js';
import { clearProfileImageCache } from './profileImageCache.js';

export function clearUserSessionState() {
  // Hapus token dahulu agar respons request lama tidak mengisi kembali state.
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('device_selected_id');
    localStorage.removeItem('device_selected_name');
  } catch (_) {}

  resetDevicesState();
  clearGroupsCache();
  resetRecipientsCache();
  resetTemplatesCache();
  resetChatTemplatesCache();
  cache.invalidate();
  clearDeviceAccessTokenCache();
  clearProfileImageCache();
  resetSocket();
}
