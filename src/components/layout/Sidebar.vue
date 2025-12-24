<template>
  <aside :class="{ open: isOpen }">
    <div class="sidebar-header">
      <div class="brand">
        <svg
          class="logo-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- Messages Square Icon - Multiple Chat Bubbles -->
          <path
            d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
          />
          <path
            d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"
          />
        </svg>
        <h3>Autosender</h3>
      </div>
      <button class="close-btn" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <nav>
      <div class="nav-section">
        <span class="nav-label">MENU UTAMA</span>
        <router-link to="/add-device" @click="$emit('close')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <rect
              x="5"
              y="2"
              width="14"
              height="20"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M12 18H12.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>Device</span>
        </router-link>
        <router-link to="/contacts" @click="$emit('close')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>Kontak</span>
        </router-link>
        <router-link to="/groups" @click="$emit('close')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
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
          <span>Grup</span>
        </router-link>
        <router-link to="/broadcasts" @click="$emit('close')">
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
            />
            <path d="m21.854 2.147-10.94 10.939" />
          </svg>
          <span>Broadcast</span>
        </router-link>
        <router-link to="/schedule-reminder" @click="$emit('close')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8V12L15 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M3.05 11H5M3.05 13H5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>Broadcast Berulang</span>
        </router-link>
        <router-link to="/schedule-feedback" @click="$emit('close')">
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" />
            <circle cx="12" cy="10" r="1" />
            <circle cx="15" cy="10" r="1" />
          </svg>
          <span>Feedback (Algo)</span>
        </router-link>
        <router-link to="/reminder-algo" @click="$emit('close')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>Reminder (Algo)</span>
        </router-link>
        <router-link to="/monthly-feedback" @click="$emit('close')">
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <!-- Clipboard dengan checklist untuk feedback -->
            <path
              d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
            />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12l2 2 4-4" />
            <line x1="9" y1="17" x2="15" y2="17" />
          </svg>
          <span>Feedback Bulanan (Algo)</span>
        </router-link>
        <router-link to="/schedules" @click="$emit('close')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M16 2V6M8 2V6M3 10H21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>Jadwal Saya</span>
        </router-link>
        <router-link to="/code-snippets" @click="$emit('close')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <polyline
              points="16 18 22 12 16 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline
              points="8 6 2 12 8 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>Code Snippets</span>
        </router-link>
      </div>

      <!-- Admin-only menus -->
      <template v-if="isAdmin">
        <div class="nav-divider"></div>
        <div class="nav-section">
          <span class="nav-label">ADMIN</span>
          <router-link to="/templates" @click="$emit('close')">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14 2V8H20M16 13H8M16 17H8M10 9H8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>Templates</span>
          </router-link>
          <router-link to="/admin/monthly-templates" @click="$emit('close')">
            <svg
              class="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <!-- File document dengan checklist untuk template -->
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 13l2 2 4-4" />
              <line x1="9" y1="17" x2="15" y2="17" />
            </svg>
            <span>Templates Bulanan</span>
          </router-link>
          <router-link to="/admin/tutors" @click="$emit('close')">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
            </svg>
            <span>Kelola Tutor</span>
          </router-link>
          <router-link to="/admin/sent-history" @click="$emit('close')">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M17 8L12 3L7 8M12 3V15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>Semua Pesan Terkirim</span>
          </router-link>
          <router-link to="/admin/monitoring" @click="$emit('close')">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 12H18L15 21L9 3L6 12H2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>Monitoring System</span>
          </router-link>
        </div>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info" v-if="me">
        <div class="avatar">
          <img
            v-if="profilePictureUrl"
            :src="profilePictureUrl"
            alt="Profile"
            class="avatar-img"
          />
          <span v-else>{{ getInitials(me.firstName) }}</span>
        </div>
        <div class="user-details">
          <div class="user-name">{{ me.firstName }}</div>
          <div class="user-role">
            <span v-if="me.privilege?.name === 'cs'">Tutor</span>
            <span v-else-if="me.privilege?.name === 'super admin'">Admin</span>
            <span v-else>User</span>
          </div>
        </div>
      </div>
      <button class="logout-btn" @click="logout">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16 17L21 12L16 7M21 12H9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, computed, ref, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth.js";
import { useGroups } from "../../composables/useGroups.js";
import { useDevices } from "../../composables/useDevices.js";
import { deviceApi } from "../../api/http.js";
import { listenToDeviceStatus } from "../../api/socket.js";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const { clearGroups } = useGroups();

// 🆕 Gunakan useDevices untuk mendapatkan data devices (shared state)
const { devices, selectedDevice, loadDevices } = useDevices();

const profilePictureUrl = ref(null);
const selectedDeviceId = ref(localStorage.getItem("device_selected_id"));
const isFetchingProfile = ref(false);
const currentDeviceStatus = ref(null);
const initialLoadDone = ref(false);
let isCheckingStatus = false;
let cleanupSocketListener = null;
let retryCount = 0;
let retryInterval = null;

onMounted(async () => {
  await auth.fetchMe();

  // First check device status before fetching profile
  await checkDeviceStatusAndFetchProfile();
  initialLoadDone.value = true;

  // Listen to storage events for cross-tab changes
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("deviceChanged", handleDeviceChange);
  window.addEventListener("device:changed", handleDeviceChangedCanonical);
  window.addEventListener("user:logged-in", handleUserLoggedIn);
  window.addEventListener("devices:loaded", handleDevicesLoaded);

  // Listen to device status changes (WhatsApp connection)
  setupDeviceStatusListener();

  // Retry mechanism: jika foto profil belum muncul setelah mount
  if (!profilePictureUrl.value) {
    retryFetchProfile();
  }
});

// Retry fetch profile dengan interval (max 2 kali)
const retryFetchProfile = () => {
  if (retryInterval) clearInterval(retryInterval);

  retryCount = 0;
  retryInterval = setInterval(async () => {
    retryCount++;

    if (retryCount > 2 || profilePictureUrl.value) {
      clearInterval(retryInterval);
      retryInterval = null;
      return;
    }

    const deviceId = localStorage.getItem("device_selected_id");
    if (!deviceId) return;

    await checkDeviceStatusAndFetchProfile();
  }, 1500);
};

// Watch route changes - hanya untuk navigasi dari login
watch(
  () => route.path,
  async (newPath, oldPath) => {
    if (oldPath === "/login" && newPath !== "/login") {
      setTimeout(() => checkDeviceStatusAndFetchProfile(), 1000);
    }
  }
);

// 🆕 Watch devices dari useDevices (shared state) - lebih efisien
watch(
  () => devices.value,
  () => {
    // Ketika devices berubah, cek ulang status dan fetch profile
    checkDeviceStatusAndFetchProfile();
  },
  { deep: true }
);

const me = computed(() => auth.me);
const isAdmin = computed(() => auth.isAdmin);

// 🆕 Optimized: Gunakan data dari useDevices (shared state) bukan request baru
const checkDeviceStatusAndFetchProfile = async () => {
  if (isCheckingStatus) return;
  isCheckingStatus = true;

  const deviceId = localStorage.getItem("device_selected_id");
  if (!deviceId) {
    profilePictureUrl.value = null;
    currentDeviceStatus.value = null;
    isCheckingStatus = false;
    return;
  }

  try {
    // 🆕 Gunakan data dari useDevices (sudah di-cache) bukan request baru
    let device = devices.value?.find?.((d) => String(d.id) === String(deviceId));

    // Jika devices belum ter-load, load dulu
    if (!device && devices.value.length === 0) {
      await loadDevices();
      device = devices.value?.find?.((d) => String(d.id) === String(deviceId));
    }

    if (device) {
      currentDeviceStatus.value = device.status;

      if (String(device.status).toLowerCase() === "open") {
        await fetchProfilePicture();
      } else {
        profilePictureUrl.value = null;
      }
    } else {
      currentDeviceStatus.value = null;
      profilePictureUrl.value = null;
    }
  } catch (error) {
    currentDeviceStatus.value = null;
    profilePictureUrl.value = null;
  } finally {
    isCheckingStatus = false;
  }
};

// Setup listener untuk status device
const setupDeviceStatusListener = () => {
  const deviceId = localStorage.getItem("device_selected_id");
  if (!deviceId) return;

  if (cleanupSocketListener) cleanupSocketListener();

  cleanupSocketListener = listenToDeviceStatus(deviceId, (status) => {
    const s = String(status || "").toLowerCase();
    currentDeviceStatus.value = s;

    if (s === "open") {
      setTimeout(() => fetchProfilePicture(), 2000);
    } else if (["close", "closed", "logged_out", "disconnected"].includes(s)) {
      profilePictureUrl.value = null;
      try {
        window.dispatchEvent(
          new CustomEvent("wa:device-session-closed", { detail: { deviceId } })
        );
      } catch (_) {}
    }
  });
};

// Fetch foto profil WhatsApp
const fetchProfilePicture = async () => {
  if (isFetchingProfile.value) return;

  const deviceId = localStorage.getItem("device_selected_id");
  if (!deviceId) {
    profilePictureUrl.value = null;
    return;
  }

  const status = String(currentDeviceStatus.value || "").toLowerCase();
  if (status && status !== "open") {
    profilePictureUrl.value = null;
    return;
  }

  isFetchingProfile.value = true;

  try {
    const { data } = await deviceApi.get("/messages/get-profile", {
      params: { recipient: "me", resolution: "high" },
    });

    profilePictureUrl.value = data?.profilePictureUrl || null;
  } catch (error) {
    profilePictureUrl.value = null;
  } finally {
    isFetchingProfile.value = false;
  }
};

// Event handlers
const handleStorageChange = (event) => {
  if (event.key === "device_selected_id" && event.newValue !== selectedDeviceId.value) {
    selectedDeviceId.value = event.newValue;
    checkDeviceStatusAndFetchProfile();
    setupDeviceStatusListener();
  }
};

const handleDeviceChange = () => {
  const currentDeviceId = localStorage.getItem("device_selected_id");
  if (currentDeviceId !== selectedDeviceId.value) {
    selectedDeviceId.value = currentDeviceId;
    checkDeviceStatusAndFetchProfile();
    setupDeviceStatusListener();
  }
};

function handleDeviceChangedCanonical(event) {
  const { deviceId } = event.detail || {};
  const currentDeviceId = deviceId || localStorage.getItem("device_selected_id");

  if (currentDeviceId !== selectedDeviceId.value) {
    selectedDeviceId.value = currentDeviceId;
  }

  checkDeviceStatusAndFetchProfile();
  setupDeviceStatusListener();
}

const handleUserLoggedIn = () => {
  setTimeout(() => {
    checkDeviceStatusAndFetchProfile();
    setupDeviceStatusListener();
  }, 1500);
};

const handleDevicesLoaded = () => {
  checkDeviceStatusAndFetchProfile();
  setupDeviceStatusListener();
};

// Cleanup
onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  window.removeEventListener("deviceChanged", handleDeviceChange);
  window.removeEventListener("device:changed", handleDeviceChangedCanonical);
  window.removeEventListener("user:logged-in", handleUserLoggedIn);
  window.removeEventListener("devices:loaded", handleDevicesLoaded);

  if (cleanupSocketListener) cleanupSocketListener();
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
  }
});

const getInitials = (name) => {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
};

const logout = () => {
  clearGroups();
  localStorage.removeItem("token");
  localStorage.removeItem("device_selected_id");
  localStorage.removeItem("device_selected_name");
  emit("close");
  router.push("/login");
};
</script>

<style scoped>
/* Sidebar */
aside {
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #3b82f6;
  letter-spacing: -0.5px;
}

.close-btn {
  display: none;
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
}

.close-btn svg {
  width: 18px;
  height: 18px;
  color: #475569;
}

/* Navigation */
nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  padding: 12px 16px 8px 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 12px 16px;
}

nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #475569;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

nav a:hover {
  background: #f1f5f9;
  color: #1e293b;
}

nav a.router-link-active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

nav a.router-link-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: #fff;
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

nav a.router-link-active .nav-icon {
  color: #ffffff;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #ffffff;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  overflow: hidden;
  position: relative;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #64748b;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #ef4444;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.logout-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.logout-btn svg {
  width: 18px;
  height: 18px;
}

/* Scrollbar Styling */
aside::-webkit-scrollbar,
nav::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track,
nav::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb,
nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

aside::-webkit-scrollbar-thumb:hover,
nav::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  aside {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    z-index: 1000;
    transform: translateX(-100%);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  }

  aside.open {
    transform: translateX(0);
  }

  .close-btn {
    display: flex;
  }
}

@media (max-width: 480px) {
  aside {
    width: 260px;
  }

  .sidebar-header {
    padding: 16px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .sidebar-header h3 {
    font-size: 18px;
  }

  nav a {
    padding: 10px 14px;
    font-size: 13px;
  }

  .nav-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
