<template>
  <router-view />
  <ToastContainer ref="toastContainer" />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useGroups } from './composables/useGroups.js';
import { userApi } from './api/http.js';
import ToastContainer from './components/ToastContainer.vue';
import { setToastInstance } from './composables/useToast.js';

const { loadGroups } = useGroups();
const toastContainer = ref(null);

async function ensureDefaultDeviceSelected() {
  const current = localStorage.getItem('device_selected_id');
  if (current) return;
  try {
    const { data } = await userApi.get('/devices');
    const list = Array.isArray(data) ? data : [];
    const dev = list.find((d) => d.status === 'open') || list[0];
    if (dev) {
      if (dev.apiKey) localStorage.setItem('device_api_key', dev.apiKey);
      localStorage.setItem('device_selected_id', dev.id);
      localStorage.setItem('device_selected_name', dev.name || '');
    }
  } catch (_) {}
}

onMounted(async () => {
  // Setup toast instance
  if (toastContainer.value) {
    setToastInstance(toastContainer.value);
  }

  const token = localStorage.getItem('token');
  if (!token) return; // skip auto-calls on login page
  await ensureDefaultDeviceSelected();
  loadGroups().catch(() => {});
});
</script>

<style>
:root { font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; }
html, body, #app { height: 100%; margin: 0; }
* { box-sizing: border-box; }
</style>