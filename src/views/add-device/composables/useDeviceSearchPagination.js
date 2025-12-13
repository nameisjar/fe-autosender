import { computed, ref, watch } from "vue";

export function useDeviceSearchPagination({ devices, humanStatus }) {
  const searchQuery = ref("");

  const filteredDevices = computed(() => {
    if (!searchQuery.value.trim()) return devices.value;

    const query = searchQuery.value.toLowerCase().trim();
    return devices.value.filter((device) => {
      const nameMatch = device.name && String(device.name).toLowerCase().includes(query);
      const phoneMatch = device.phone && String(device.phone).includes(query);
      const statusMatch = String(humanStatus(device.status)).toLowerCase().includes(query);
      return nameMatch || phoneMatch || statusMatch;
    });
  });

  // Pagination
  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredDevices.value.length / itemsPerPage.value))
  );

  const paginatedDevices = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredDevices.value.slice(start, end);
  });

  watch(
    () => devices.value.length,
    () => {
      if (currentPage.value > totalPages.value) currentPage.value = 1;
    }
  );

  return {
    searchQuery,
    filteredDevices,
    paginatedDevices,
    currentPage,
    itemsPerPage,
    totalPages,
  };
}
