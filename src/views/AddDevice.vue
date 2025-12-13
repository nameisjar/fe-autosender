<template>
  <div class="wrapper">
    <AddDeviceHeader :devices="devices" />

    <section class="pairing card">
      <DevicePairingPanel
        v-model:deviceId="deviceId"
        :devices="devices"
        :selectedDevice="selectedDevice"
        :selectedStatus="selectedStatus"
        :isTutor="isTutor"
        :tutorHasConnectedDevice="tutorHasConnectedDevice"
        :pairingLoading="pairingLoading"
        :apiError="apiError"
        :statusText="statusText"
        :qr="qr"
        :asciiQr="asciiQr"
        :qrExpired="qrExpired"
        :qrTimeLeft="qrTimeLeft"
        :waitingDisconnect="waitingDisconnect"
        :disconnectCountdown="disconnectCountdown"
        :controllerActive="controllerActive"
        :humanStatus="humanStatus"
        @startPairing="startPairing"
        @stopPairing="stopPairing"
        @quickRetryPairing="quickRetryPairing"
        @selectNextDisconnectedDevice="selectNextDisconnectedDevice"
        @qrImageError="onQRImageError"
      />
    </section>

    <section class="list card">
      <DeviceListTable
        :devices="devices"
        :deviceStats="deviceStats"
        :deleting="deleting"
        :isTutor="isTutor"
        :tutorReachedLimit="tutorReachedLimit"
        :loading="devicesLoading"
        v-model:searchQuery="searchQuery"
        :filteredDevices="filteredDevices"
        :paginatedDevices="paginatedDevices"
        :itemsPerPage="itemsPerPage"
        :currentPage="currentPage"
        :totalPages="totalPages"
        :humanStatus="humanStatus"
        :statusClass="statusClass"
        @reload="fetchDevices(true)"
        @openAddDeviceModal="openAddDeviceModal"
        @deleteOne="deleteOne"
        @nextPage="nextPage"
        @prevPage="prevPage"
      />
    </section>

    <AddDeviceModal
      v-model="showAddDeviceModal"
      v-model:name="name"
      :loading="loading"
      :tutorReachedLimit="tutorReachedLimit"
      @submit="handleCreateDevice"
    />

    <DeleteDeviceModal
      :modelValue="showDeleteModal"
      :device="deviceToDelete"
      :deleting="deleting"
      :humanStatus="humanStatus"
      :statusClass="statusClass"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { userApi } from "../api/http.js";
import { useAuthStore } from "../stores/auth.js";
import { useGroups } from "../composables/useGroups.js";
import { useToast } from "../composables/useToast.js";

import AddDeviceHeader from "./add-device/components/AddDeviceHeader.vue";
import DevicePairingPanel from "./add-device/components/DevicePairingPanel.vue";
import DeviceListTable from "./add-device/components/DeviceListTable.vue";
import AddDeviceModal from "./add-device/components/AddDeviceModal.vue";
import DeleteDeviceModal from "./add-device/components/DeleteDeviceModal.vue";

import { useDevicePairing } from "./add-device/composables/useDevicePairing.js";
import { useDeviceStats } from "./add-device/composables/useDeviceStats.js";
import { useDeviceSearchPagination } from "./add-device/composables/useDeviceSearchPagination.js";
import { useDevices } from "../composables/useDevices.js";

const toast = useToast();
const auth = useAuthStore();
const { clearGroups } = useGroups();

const CACHE_KEY = "devices_list";

const isTutor = computed(() => auth.roleName === "cs");

// ------- Devices (GLOBAL single source of truth) -------
const {
  devices,
  selectedDeviceId,
  selectedDevice,
  loading: devicesLoading,
  loadDevices,
  selectDevice,
  clearDevice,
} = useDevices();

// Use string id for v-model in UI
const deviceId = computed({
  get: () => String(selectedDeviceId.value || ""),
  set: (val) => selectDevice(val),
});

const selectedStatus = computed(() => selectedDevice.value?.status || "");

const tutorReachedLimit = computed(() => isTutor.value && devices.value.length >= 1);
const tutorHasConnectedDevice = computed(
  () => isTutor.value && devices.value.some((d) => String(d.status).toLowerCase() === "open")
);

// Provide a compatibility wrapper for the new pairing/stats composables
const fetchDevices = async (forceRefresh = false) => {
  // global composable already refreshes from API; forceRefresh kept for signature compatibility
  await loadDevices();
};

// ------- Search + pagination -------
const {
  searchQuery,
  filteredDevices,
  paginatedDevices,
  currentPage,
  itemsPerPage,
  totalPages,
} = useDeviceSearchPagination({ devices, humanStatus });

function humanStatus(s) {
  const key = String(s || "").toLowerCase();

  // Use canonical status labels consistent across the app (other menus show raw status like open/close/etc.)
  const map = {
    open: "open",
    connected: "open",
    connecting: "connecting",
    pending: "pending",
    closed: "close",
    disconnected: "close",
    close: "close",
  };

  return map[key] || key || "-";
}

function statusClass(s) {
  const key = String(s || "").toLowerCase();
  if (key === "open" || key === "connected") return "is-open";
  if (key === "connecting" || key === "pending") return "is-pending";
  return "is-closed";
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

// ------- Device stats (contacts/groups) -------
const { deviceStats, fetchDeviceStats, fetchAllDeviceStats } = useDeviceStats({
  userApi,
  toast,
});

// ------- Pairing (SSE + QR timer + stop/retry) -------
const {
  qr,
  asciiQr,
  statusText,
  pairingLoading,
  apiError,
  waitingDisconnect,
  disconnectCountdown,
  qrTimeLeft,
  qrExpired,
  controllerActive,
  startPairing,
  stopPairing,
  quickRetryPairing,
  selectNextDisconnectedDevice,
  onQRImageError,
} = useDevicePairing({
  userApi,
  toast,
  clearGroups,
  fetchDevices,
  cacheKeyToInvalidate: CACHE_KEY,
  devices,
  deviceId,
  selectedDevice,
  selectedStatus,
});

// ------- Modals / CRUD -------
const name = ref("");
const loading = ref(false);
const deleting = ref(false);

const showAddDeviceModal = ref(false);
const openAddDeviceModal = () => {
  name.value = "";
  showAddDeviceModal.value = true;
};

const showDeleteModal = ref(false);
const deviceToDelete = ref(null);

const deleteOne = (d) => {
  deviceToDelete.value = d;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  deviceToDelete.value = null;
};

const confirmDelete = async () => {
  if (!deviceToDelete.value) return;

  const deletingId = String(deviceToDelete.value.id);
  const wasSelected = String(selectedDeviceId.value || "") === deletingId;

  deleting.value = true;
  try {
    await userApi.delete("/devices", { data: { deviceIds: [deviceToDelete.value.id] } });
    toast.success("Device berhasil dihapus");
    cancelDelete();

    // If user deleted the currently selected device, clear selection immediately
    // so Dashboard avatar/profile can update without waiting for a reload.
    if (wasSelected) {
      clearDevice();
      try {
        window.dispatchEvent(
          new CustomEvent("device:changed", {
            detail: { deviceId: "", deviceName: "" },
          })
        );
      } catch (_) {}

      // also notify app to clear device cache + refresh dependent state
      try {
        window.dispatchEvent(
          new CustomEvent("wa:device-session-closed", {
            detail: { deviceId: deletingId },
          })
        );
      } catch (_) {}
    }

    await loadDevices();
  } catch (e) {
    toast.error(
      (e && e.response && e.response.data && e.response.data.message) ||
        "Gagal menghapus device"
    );
  } finally {
    deleting.value = false;
  }
};

const handleCreateDevice = async () => {
  if (!name.value.trim()) {
    toast.error("Nama device tidak boleh kosong");
    return;
  }

  if (tutorReachedLimit.value) {
    toast.error("Tutor hanya dapat memiliki 1 device");
    return;
  }

  loading.value = true;
  try {
    await userApi.post("/tutors/devices", { name: name.value });
    toast.success("Device berhasil dibuat");
    showAddDeviceModal.value = false;
    name.value = "";
    await loadDevices();
  } catch (e) {
    toast.error(
      (e && e.response && e.response.data && e.response.data.message) ||
        "Gagal membuat device"
    );
  } finally {
    loading.value = false;
  }
};

// ------- Lifecycle -------
onMounted(async () => {
  if (!auth.me) {
    try {
      await auth.fetchMe();
    } catch (_) {}
  }
  await loadDevices().catch(() => {});
  await fetchAllDeviceStats();
});

watch(
  () => devices.value,
  async () => {
    // keep stats fresh for connected devices
    await fetchAllDeviceStats();
  }
);

watch(
  () => selectedStatus.value,
  async (newStatus) => {
    if (newStatus === "open" && selectedDevice.value?.id) {
      await fetchDeviceStats(selectedDevice.value.id);
    }
  }
);
</script>

<style scoped>
/* Styles moved into child components. Kept wrapper only. */
.wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}
</style>
