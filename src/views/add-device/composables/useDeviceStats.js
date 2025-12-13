import { ref } from "vue";

export function useDeviceStats({ userApi, toast }) {
  const deviceStats = ref({});

  const fetchDeviceStats = async (deviceId) => {
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
      if (toast) {
        // keep silent
      }
    }
  };

  const fetchAllDeviceStats = async (devices = []) => {
    const connected = devices.filter((d) => String(d.status).toLowerCase() === "open");
    await Promise.all(connected.map((d) => fetchDeviceStats(d.id)));
  };

  return {
    deviceStats,
    fetchDeviceStats,
    fetchAllDeviceStats,
  };
}
