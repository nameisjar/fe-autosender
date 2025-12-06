<template>
  <router-view />
  <ToastContainer ref="toastContainer" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useGroups } from "./composables/useGroups.js";
import { useDevices } from "./composables/useDevices.js";
import { clearDeviceApiKeyCache, userApi } from "./api/http.js";
import ToastContainer from "./components/ToastContainer.vue";
import { setToastInstance } from "./composables/useToast.js";

const { loadGroups } = useGroups();
const { loadDevices } = useDevices();
const toastContainer = ref(null);

// 🔔 Handle device session closed event
function handleDeviceSessionClosed(event) {
  const { deviceId } = event.detail || {};
  // console.warn("Device session closed:", deviceId);

  // Clear cache untuk device yang disconnect
  clearDeviceApiKeyCache();

  // Reload devices untuk update status
  loadDevices().catch(() => {});
}

// 🔔 Handle device changed event
function handleDeviceChanged(event) {
  const { deviceId, deviceName } = event.detail || {};
  // console.log('Device changed:', deviceId, deviceName);

  // Clear old cache, akan di-fetch ulang saat request berikutnya
  clearDeviceApiKeyCache();
}

async function ensureDefaultDeviceSelected() {
  const current = localStorage.getItem("device_selected_id");
  if (current) return;
  try {
    const { data } = await userApi.get("/devices");
    const list = Array.isArray(data) ? data : [];
    const dev = list.find((d) => d.status === "open") || list[0];
    if (dev) {
      if (dev.apiKey) localStorage.setItem("device_api_key", dev.apiKey);
      localStorage.setItem("device_selected_id", dev.id);
      localStorage.setItem("device_selected_name", dev.name || "");
    }
  } catch (_) {}
}

onMounted(async () => {
  // Setup toast instance
  if (toastContainer.value) {
    setToastInstance(toastContainer.value);
  }

  const token = localStorage.getItem("token");
  if (!token) return; // skip auto-calls on login page

  // 🆕 Load devices untuk auto-select
  await loadDevices().catch(() => {});

  // Load groups
  loadGroups().catch(() => {});

  // 🔔 Setup event listeners
  window.addEventListener("wa:device-session-closed", handleDeviceSessionClosed);
  window.addEventListener("device:changed", handleDeviceChanged);
});

onUnmounted(() => {
  // 🧹 Cleanup event listeners
  window.removeEventListener("wa:device-session-closed", handleDeviceSessionClosed);
  window.removeEventListener("device:changed", handleDeviceChanged);
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
