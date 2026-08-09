<template>
  <div class="wrapper">
    <AddDeviceHeader :devices="devices" />

    <section class="device-panel pairing">
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
        :canManageSelected="selectedDevice?.canManage !== false"
        @startPairing="startPairing"
        @stopPairing="stopPairing"
        @quickRetryPairing="quickRetryPairing"
        @selectNextDisconnectedDevice="selectNextDisconnectedDevice"
        @qrImageError="onQRImageError"
      />
    </section>

    <section class="device-panel list">
      <DeviceListTable
        :devices="devices"
        :deviceStats="deviceStats"
        :messageStats="messageStats"
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
        :canAssignDevices="canAssignDevices"
        @reload="fetchDevices(true)"
        @openAddDeviceModal="openAddDeviceModal"
        @deleteOne="deleteOne"
        @openAssignments="openAssignments"
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

    <AssignDeviceModal
      :modelValue="showAssignModal"
      :device="assignmentDevice"
      :users="assignmentUsers"
      :assignments="deviceAssignments"
      :loading="assignmentLoading"
      :saving="assignmentSaving"
      @close="closeAssignments"
      @assign="assignDeviceToUser"
      @revoke="revokeDeviceAccess"
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
import AssignDeviceModal from "./add-device/components/AssignDeviceModal.vue";

import { useDevicePairing } from "./add-device/composables/useDevicePairing.js";
import { useDeviceStats } from "./add-device/composables/useDeviceStats.js";
import { useDeviceSearchPagination } from "./add-device/composables/useDeviceSearchPagination.js";
import { useDevices } from "../composables/useDevices.js";

const toast = useToast();
const auth = useAuthStore();
const { clearGroups } = useGroups();

const CACHE_KEY = "devices_list";

const isTutor = computed(() => auth.roleName === "cs");
const canAssignDevices = computed(() => auth.isAdmin);

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

const tutorReachedLimit = computed(
  () => isTutor.value && devices.value.filter((device) => device.isOwner !== false).length >= 1
);
const tutorHasConnectedDevice = computed(
  () =>
    isTutor.value &&
    devices.value.some(
      (d) => d.isOwner !== false && String(d.status).toLowerCase() === "open"
    )
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

// ------- Device stats (contacts/groups + messages) -------
const { deviceStats, messageStats, fetchDeviceStats, fetchAllDeviceStats, fetchAllMessageStats } = useDeviceStats({
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

const showAssignModal = ref(false);
const assignmentDevice = ref(null);
const assignmentUsers = ref([]);
const deviceAssignments = ref([]);
const assignmentLoading = ref(false);
const assignmentSaving = ref(false);

const loadAssignmentData = async () => {
  if (!assignmentDevice.value?.id) return;
  assignmentLoading.value = true;
  try {
    const [usersResponse, assignmentsResponse] = await Promise.all([
      userApi.get("/devices/assignment-users"),
      userApi.get(`/devices/${assignmentDevice.value.id}/assignments`),
    ]);
    assignmentUsers.value = Array.isArray(usersResponse.data) ? usersResponse.data : [];
    deviceAssignments.value = Array.isArray(assignmentsResponse.data?.assignments)
      ? assignmentsResponse.data.assignments
      : [];
  } catch (error) {
    toast.error(error?.response?.data?.message || "Gagal memuat assignment device");
    closeAssignments();
  } finally {
    assignmentLoading.value = false;
  }
};

const openAssignments = async (device) => {
  if (!canAssignDevices.value || device?.canManage === false) return;
  assignmentDevice.value = device;
  showAssignModal.value = true;
  await loadAssignmentData();
};

const closeAssignments = () => {
  showAssignModal.value = false;
  assignmentDevice.value = null;
  assignmentUsers.value = [];
  deviceAssignments.value = [];
};

const assignDeviceToUser = async (userId) => {
  if (!assignmentDevice.value?.id || !userId) return;
  assignmentSaving.value = true;
  try {
    await userApi.post(`/devices/${assignmentDevice.value.id}/assignments`, { userId });
    toast.success("Akses device berhasil diberikan");
    await Promise.all([loadAssignmentData(), loadDevices()]);
  } catch (error) {
    toast.error(error?.response?.data?.message || "Gagal memberikan akses device");
  } finally {
    assignmentSaving.value = false;
  }
};

const revokeDeviceAccess = async (userId) => {
  if (!assignmentDevice.value?.id || !userId) return;
  assignmentSaving.value = true;
  try {
    await userApi.delete(`/devices/${assignmentDevice.value.id}/assignments/${userId}`);
    toast.success("Akses device berhasil dicabut");
    await Promise.all([loadAssignmentData(), loadDevices()]);
  } catch (error) {
    toast.error(error?.response?.data?.message || "Gagal mencabut akses device");
  } finally {
    assignmentSaving.value = false;
  }
};

const deleteOne = (d) => {
  if (d?.canManage === false) return;
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
  await loadDevices().catch((e) => {
    console.error('Failed to load devices:', e);
    toast.error('Gagal memuat daftar device. Silakan refresh halaman.');
  });
  // 🆕 Pass devices.value ke fetchAllDeviceStats
  await fetchAllDeviceStats(devices.value);
  await fetchAllMessageStats();
});

watch(
  () => devices.value,
  async (newDevices) => {
    // keep stats fresh for connected devices
    // 🆕 Pass newDevices ke fetchAllDeviceStats
    await fetchAllDeviceStats(newDevices);
    await fetchAllMessageStats();
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
.wrapper {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.device-panel {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin-bottom: 24px;
  padding: 24px;
  overflow: hidden;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  box-shadow: 0 6px 20px var(--theme-shadow);
}

/* Toolbar pairing adalah isi panel, bukan panel visual yang terpisah. */
:global(html.dark) .pairing :deep(.toolbar) {
  background-color: transparent !important;
}

@media (max-width: 768px) {
  .device-panel {
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 12px;
  }
}
</style>
