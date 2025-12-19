import { ref } from "vue";

export function useDeviceStats({ userApi, toast }) {
  const deviceStats = ref({});
  const messageStats = ref({});

  const fetchDeviceStats = async (deviceId, deviceStatus = 'open') => {
    // 🆕 Skip fetch jika device tidak open
    if (String(deviceStatus).toLowerCase() !== 'open') {
      deviceStats.value = {
        ...deviceStats.value,
        [deviceId]: { contacts: 0, groups: 0 },
      };
      return;
    }

    try {
      // Contacts: existing endpoint returns array
      const contactsRes = await userApi.get(`/contacts?deviceId=${deviceId}`);
      const contactsCount = Array.isArray(contactsRes.data) ? contactsRes.data.length : (contactsRes.data?.data?.length || 0);

      // WhatsApp Groups: controller returns { status: true, data: [...] }
      let groupsCount = 0;
      try {
        const waGroupsRes = await userApi.get(`/whatsapp-groups/device/${deviceId}/active`);
        const list = Array.isArray(waGroupsRes.data)
          ? waGroupsRes.data
          : Array.isArray(waGroupsRes.data?.data)
            ? waGroupsRes.data.data
            : [];
        groupsCount = list.length;
      } catch (_) {
        // Fallback to /all
        try {
          const waGroupsRes = await userApi.get(`/whatsapp-groups/device/${deviceId}/all`);
          const list = Array.isArray(waGroupsRes.data)
            ? waGroupsRes.data
            : Array.isArray(waGroupsRes.data?.data)
              ? waGroupsRes.data.data
              : [];
          groupsCount = list.length;
        } catch (_) {
          groupsCount = 0;
        }
      }

      deviceStats.value = {
        ...deviceStats.value,
        [deviceId]: { contacts: contactsCount, groups: groupsCount },
      };
    } catch (e) {
      deviceStats.value = {
        ...deviceStats.value,
        [deviceId]: { contacts: 0, groups: 0 },
      };
      // keep silent
    }
  };

  // 🆕 Perbaikan: gunakan devices dari parameter atau ambil dari argument
  const fetchAllDeviceStats = async (devicesList = []) => {
    if (!devicesList || devicesList.length === 0) return;
    
    const connected = devicesList.filter((d) => String(d.status).toLowerCase() === "open");
    await Promise.all(connected.map((d) => fetchDeviceStats(d.id, d.status)));
  };

  /**
   * Fetch message statistics for a specific device
   */
  const fetchDeviceMessageStats = async (deviceId) => {
    try {
      const res = await userApi.get(`/tutors/devices/${deviceId}/message-stats`);
      const data = res.data || {};
      messageStats.value = {
        ...messageStats.value,
        [deviceId]: {
          sent: data.sent || 0,
          scheduled: data.scheduled || 0,
          total: data.total || 0,
        },
      };
    } catch (e) {
      messageStats.value = {
        ...messageStats.value,
        [deviceId]: { sent: 0, scheduled: 0, total: 0 },
      };
    }
  };

  /**
   * Fetch message statistics for all devices (batch)
   */
  const fetchAllMessageStats = async () => {
    try {
      const res = await userApi.get(`/tutors/devices/message-stats`);
      const data = res.data || {};
      // data is { [devicePkId]: { sent, scheduled, total } }
      messageStats.value = { ...messageStats.value, ...data };
    } catch (e) {
      // keep silent, stats will show 0
    }
  };

  return {
    deviceStats,
    messageStats,
    fetchDeviceStats,
    fetchAllDeviceStats,
    fetchDeviceMessageStats,
    fetchAllMessageStats,
  };
}
