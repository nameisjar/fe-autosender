<template>
  <router-view />
  <ToastContainer ref="toastContainer" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useGroups } from "./composables/useGroups.js";
import { useDevices } from "./composables/useDevices.js";
import { useGlobalNotifications } from "./composables/useGlobalNotifications.js";
import { clearDeviceAccessTokenCache, userApi } from "./api/http.js";
import ToastContainer from "./components/ToastContainer.vue";
import { setToastInstance } from "./composables/useToast.js";

const { loadGroups } = useGroups();
const { loadDevices } = useDevices();
const toastContainer = ref(null);

// ✅ Setup global notifications untuk semua page
useGlobalNotifications();

// 🔔 Handle device session closed event
function handleDeviceSessionClosed(event) {
  const { deviceId } = event.detail || {};

  // Clear cache untuk device yang disconnect
  clearDeviceAccessTokenCache();

  // Reload devices untuk update status
  loadDevices().catch(() => {});
}

// 🔔 Handle device changed event
function handleDeviceChanged(event) {
  const { deviceId, deviceName } = event.detail || {};

  // Clear old cache, akan di-fetch ulang saat request berikutnya
  clearDeviceAccessTokenCache();
}

// 🆕 Handle user logged in event
async function handleUserLoggedIn() {
  // Load devices dan auto-select setelah login
  await loadDevices().catch(() => {});
  
  // Load groups
  loadGroups().catch(() => {});
  
  // Emit event untuk memberitahu Sidebar bahwa devices sudah ter-load
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("devices:loaded"));
  }, 500);
}

async function ensureDefaultDeviceSelected() {
  const current = localStorage.getItem("device_selected_id");
  if (current) return;
  try {
    const { data } = await userApi.get("/devices");
    const list = Array.isArray(data) ? data : [];
    const dev = list.find((d) => d.status === "open") || list[0];
    if (dev) {
      localStorage.setItem("device_selected_id", dev.id);
      localStorage.setItem("device_selected_name", dev.name || "");
    }
  } catch (_) {}
}

onMounted(async () => {
  // One-time cleanup: legacy key (token-only now)
  try {
    localStorage.removeItem("device_api_key");
  } catch (_) {}

  // Setup toast instance
  if (toastContainer.value) {
    setToastInstance(toastContainer.value);
  }

  // 🔔 Setup event listeners (selalu setup, tidak hanya jika ada token)
  window.addEventListener("wa:device-session-closed", handleDeviceSessionClosed);
  window.addEventListener("device:changed", handleDeviceChanged);
  window.addEventListener("user:logged-in", handleUserLoggedIn);

  const token = localStorage.getItem("token");
  if (!token) return; // skip auto-calls on login page

  // 🆕 Load devices untuk auto-select
  await loadDevices().catch(() => {});

  // Load groups
  loadGroups().catch(() => {});
});

onUnmounted(() => {
  // 🧹 Cleanup event listeners
  window.removeEventListener("wa:device-session-closed", handleDeviceSessionClosed);
  window.removeEventListener("device:changed", handleDeviceChanged);
  window.removeEventListener("user:logged-in", handleUserLoggedIn);
});
</script>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}
html,
body,
#app {
  height: 100%;
  margin: 0;
}
* {
  box-sizing: border-box;
}
</style>
