import { ref, computed, watch } from "vue";
import { normalizePhoneNumber, isValidPhoneNumber } from "../utils/phone.js";
import { useToast } from "./useToast.js";
import { useGroups } from "./useGroups.js";
import { userApi } from "../api/http.js";
import { debounce } from "../utils/debounce.js";
import { indexedDBCache, CACHE_TTL, CACHE_KEYS } from "../utils/indexedDBCache.js";

// 🆕 Shared state untuk contacts dan labels (di luar fungsi agar persistent)
const contacts = ref([]); // Initial 100 contacts for dropdown
const searchedContacts = ref([]); // Server-side search results
const isSearchingContacts = ref(false); // Flag for server-side search mode
const loadingContacts = ref(false);
const labels = ref([]); // Initial 100 labels for dropdown
const searchedLabels = ref([]); // Server-side search results for labels
const isSearchingLabels = ref(false); // Flag for server-side search mode
const loadingLabels = ref(false);

// 🔧 Track device untuk auto-reload saat device berubah
let lastContactsDeviceId = null;
let lastLabelsDeviceId = null;

export function useRecipients() {
  const toast = useToast();
  const recipients = ref([]);
  const recipientLabels = ref({}); // map recipient string -> label for chip
  const recipientInput = ref("");
  const activeTab = ref("manual");

  // Groups
  const { groups, searchedGroups, isSearchingGroups, loadingGroups, loadGroups, ensureFullGroupJid, syncGroups, searchGroupsOnServer } = useGroups();
  const selectedGroupId = ref("");
  const groupSearch = ref("");

  // 🆕 Hybrid approach for groups: show searched results if searching, otherwise show initial groups
  const filteredGroups = computed(() => {
    const q = groupSearch.value.toLowerCase();
    
    // If no search query, show initial groups
    if (!q) {
      isSearchingGroups.value = false;
      return groups.value;
    }
    
    // If we have server-side search results, use them
    if (isSearchingGroups.value && searchedGroups.value.length > 0) {
      return searchedGroups.value;
    }
    
    // While waiting for server response, filter locally from initial groups
    return groups.value.filter((g) => g.label.toLowerCase().includes(q));
  });

  // 🆕 Watch groupSearch and trigger server-side search
  watch(groupSearch, (newQuery) => {
    if (!newQuery) {
      isSearchingGroups.value = false;
    } else {
      searchGroupsOnServer(newQuery);
    }
  });

  // Contacts (🆕 menggunakan shared state)
  const selectedContactId = ref("");
  const contactSearch = ref("");
  
  // 🆕 Hybrid approach: show searched results if searching, otherwise show initial contacts
  const filteredContacts = computed(() => {
    const q = contactSearch.value.toLowerCase();
    
    // If no search query, show initial contacts
    if (!q) {
      isSearchingContacts.value = false;
      return contacts.value;
    }
    
    // If we have server-side search results, use them
    if (isSearchingContacts.value && searchedContacts.value.length > 0) {
      return searchedContacts.value;
    }
    
    // While waiting for server response, filter locally from initial contacts
    return contacts.value.filter((c) => {
      const basicMatch = [c.firstName, c.lastName, c.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
      if (basicMatch) return true;
      const labelMatch = (c.ContactLabel || [])
        .map((cl) => cl?.label?.name)
        .filter(Boolean)
        .some((name) => String(name).toLowerCase().includes(q));
      return labelMatch;
    });
  });

  // 🆕 Server-side search function with debounce
  const searchContactsOnServer = debounce(async (query) => {
    if (!query || query.length < 2) {
      isSearchingContacts.value = false;
      searchedContacts.value = [];
      return;
    }
    
    try {
      loadingContacts.value = true;
      const deviceId = await ensureDeviceId();
      
      const res = await userApi.get("/contacts", {
        params: {
          ...(deviceId ? { deviceId } : {}),
          q: query,
          pageSize: 50,
        },
      });
      
      const responseData = res?.data;
      searchedContacts.value = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
          ? responseData
          : [];
      isSearchingContacts.value = true;
    } catch (e) {
      console.error("Failed to search contacts", e);
    } finally {
      loadingContacts.value = false;
    }
  }, 300);

  // 🆕 Watch contactSearch and trigger server-side search
  watch(contactSearch, (newQuery) => {
    if (!newQuery) {
      isSearchingContacts.value = false;
      searchedContacts.value = [];
    } else {
      searchContactsOnServer(newQuery);
    }
  });

  // Labels (🆕 menggunakan shared state)
  const selectedLabelValue = ref("");
  const labelSearch = ref("");
  
  // 🆕 Hybrid approach for labels: show searched results if searching, otherwise show initial labels
  const filteredLabels = computed(() => {
    const q = labelSearch.value.toLowerCase();
    
    // If no search query, show initial labels
    if (!q) {
      isSearchingLabels.value = false;
      return labels.value;
    }
    
    // If we have server-side search results, use them
    if (isSearchingLabels.value && searchedLabels.value.length > 0) {
      return searchedLabels.value;
    }
    
    // While waiting for server response, filter locally from initial labels
    return labels.value.filter((l) => l.label.toLowerCase().includes(q));
  });

  // 🆕 Server-side search function for labels with debounce
  const searchLabelsOnServer = debounce(async (query) => {
    if (!query || query.length < 2) {
      isSearchingLabels.value = false;
      searchedLabels.value = [];
      return;
    }
    
    try {
      loadingLabels.value = true;
      const deviceId = await ensureDeviceId();
      
      const res = await userApi.get("/contacts/labels", {
        params: {
          ...(deviceId ? { deviceId } : {}),
          q: query,
          pageSize: 50,
        },
      });
      
      const data = res?.data;
      const labelList = Array.isArray(data?.labels)
        ? data.labels
        : Array.isArray(data)
          ? data
          : [];
      searchedLabels.value = mapLabels(labelList);
      isSearchingLabels.value = true;
    } catch (e) {
      console.error("Failed to search labels", e);
    } finally {
      loadingLabels.value = false;
    }
  }, 300);

  // 🆕 Watch labelSearch and trigger server-side search
  watch(labelSearch, (newQuery) => {
    if (!newQuery) {
      isSearchingLabels.value = false;
      searchedLabels.value = [];
    } else {
      searchLabelsOnServer(newQuery);
    }
  });

  // --- Helpers ---

  const chipLabel = (r) => recipientLabels.value[r] || r;

  const contactLabelNames = (c) => {
    try {
      const arr = (c?.ContactLabel || [])
        .map((x) => x?.label?.name)
        .filter((n) => n && !String(n).startsWith("device_"));
      return arr.join(", ");
    } catch {
      return "";
    }
  };

  const contactDisplay = (c) => {
    const name = `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.phone || "-";
    const labelNames = contactLabelNames(c);
    return labelNames ? `${name} (${c.phone}) - [${labelNames}]` : `${name} (${c.phone})`;
  };

  const mapLabels = (items) => {
    const arr = Array.isArray(items) ? items : [];
    return arr
      .map((it) => {
        if (typeof it === "string") {
          const name = it;
          return { value: `label_${name}`, label: name };
        }
        const name = it.name || it.label || it.title || "";
        const slug = it.slug || "";
        const value = `label_${slug || name}`;
        return name ? { value, label: name } : null;
      })
      .filter(Boolean);
  };

  const deriveLabelsFromContacts = () => {
    const names = new Set();
    (contacts.value || []).forEach((c) => {
      (c.ContactLabel || []).forEach((cl) => {
        const n = cl?.label?.name;
        if (n && !String(n).startsWith("device_")) names.add(n);
      });
    });
    return Array.from(names);
  };

  // --- Actions ---

  function addRecipientsFromInput() {
    if (!recipientInput.value) return;

    // Split only by comma, not by space (to allow formats like "+62 (812) 215-24-351")
    const items = recipientInput.value
      .split(/,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const validNumbers = [];
    const invalidNumbers = [];

    items.forEach((item) => {
      const normalized = normalizePhoneNumber(item);
      if (isValidPhoneNumber(normalized)) {
        validNumbers.push(normalized);
      } else {
        invalidNumbers.push(item);
      }
    });

    if (validNumbers.length > 0) {
      const set = new Set([...recipients.value, ...validNumbers]);
      recipients.value = Array.from(set);
    }

    if (validNumbers.length > 0 && invalidNumbers.length > 0) {
      toast.success(`${validNumbers.length} nomor berhasil ditambahkan`);
      toast.error(
        `${invalidNumbers.length} nomor tidak valid: ${invalidNumbers.join(", ")}`
      );
    } else if (validNumbers.length > 0) {
      toast.success(`${validNumbers.length} nomor berhasil ditambahkan`);
    } else if (invalidNumbers.length > 0) {
      toast.error(
        `Nomor tidak valid: ${invalidNumbers.join(
          ", "
        )}. Format harus: 62xxx (minimal 10 digit)`
      );
    }

    recipientInput.value = "";
  }

  function removeRecipient(index) {
    recipients.value.splice(index, 1);
  }

  async function addSelectedGroup() {
    if (!selectedGroupId.value) return;
    const fullJid = await ensureFullGroupJid(selectedGroupId.value);
    if (!fullJid) return;
    if (!recipients.value.includes(fullJid)) {
      recipients.value.push(fullJid);
      const found = groups.value.find((g) => g.value === selectedGroupId.value);
      if (found) recipientLabels.value[fullJid] = `Group: ${found.label}`;
    }
    selectedGroupId.value = "";
  }

  function addSelectedContact() {
    if (!selectedContactId.value) return;
    if (!recipients.value.includes(selectedContactId.value)) {
      recipients.value.push(selectedContactId.value);
      const found = contacts.value.find((c) => c.phone === selectedContactId.value);
      if (found) {
        const labels = contactLabelNames(found);
        recipientLabels.value[selectedContactId.value] = `Contact: ${found.firstName} ${
          found.lastName || ""
        }${labels ? " [" + labels + "]" : ""}`;
      }
    }
    selectedContactId.value = "";
  }

  function addSelectedLabel() {
    if (!selectedLabelValue.value) return;
    const val = selectedLabelValue.value;
    if (!recipients.value.includes(val)) {
      recipients.value.push(val);
      const found = labels.value.find((l) => l.value === val);
      if (found) recipientLabels.value[val] = `Label: ${found.label}`;
    }
    selectedLabelValue.value = "";
  }

  // --- Loaders ---

  const ensureDeviceId = async () => {
    let deviceId = localStorage.getItem("device_selected_id");
    if (deviceId) return deviceId;
    try {
      const { data } = await userApi.get("/devices");
      const devices = Array.isArray(data) ? data : [];
      const current = devices.find((d) => d.status === "open") || devices[0];
      if (current) {
        if (current.id) localStorage.setItem("device_selected_id", current.id);
        if (current.name) localStorage.setItem("device_selected_name", current.name);
        return current.id || "";
      }
    } catch (_) {}
    return "";
  };

  const loadContacts = async (deviceIdOverride, { force = false } = {}) => {
    try {
      const deviceId = deviceIdOverride || (await ensureDeviceId()) || undefined;
      if (!deviceId) return;
      
      const cacheKey = CACHE_KEYS.CONTACTS(deviceId);
      
      // 🔥 Check IndexedDB cache first (instant load)
      if (!force) {
        const cached = await indexedDBCache.get(cacheKey);
        if (cached.fromCache && cached.data) {
          contacts.value = cached.data;
          lastContactsDeviceId = deviceId;
          
          // If stale, refresh in background
          if (cached.isStale) {
            indexedDBCache.backgroundRefresh(cacheKey, async () => {
              const res = await userApi.get("/contacts", {
                params: { deviceId, pageSize: 50 },
              });
              const responseData = res?.data;
              const freshData = Array.isArray(responseData?.data)
                ? responseData.data
                : Array.isArray(responseData)
                  ? responseData
                  : [];
              contacts.value = freshData;
              return freshData;
            }, CACHE_TTL.CONTACTS);
          }
          return;
        }
      }
      
      loadingContacts.value = true;
      
      // Fetch from server
      const res = await userApi.get("/contacts", {
        params: {
          ...(deviceId ? { deviceId } : {}),
          pageSize: 50,
        },
      });
      
      const responseData = res?.data;
      const contactsData = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
          ? responseData
          : [];
      
      contacts.value = contactsData;
      lastContactsDeviceId = deviceId;
      
      // 🔥 Save to IndexedDB cache
      await indexedDBCache.set(cacheKey, contactsData, CACHE_TTL.CONTACTS);
    } catch (e) {
      console.error("Failed to load contacts", e);
    } finally {
      loadingContacts.value = false;
    }
  };

  const loadLabels = async (deviceIdOverride, { force = false } = {}) => {
    try {
      const deviceId = deviceIdOverride || (await ensureDeviceId()) || undefined;
      if (!deviceId) return;
      
      const cacheKey = CACHE_KEYS.LABELS(deviceId);
      
      // 🔥 Check IndexedDB cache first (instant load)
      if (!force) {
        const cached = await indexedDBCache.get(cacheKey);
        if (cached.fromCache && cached.data) {
          labels.value = cached.data;
          lastLabelsDeviceId = deviceId;
          
          // If stale, refresh in background
          if (cached.isStale) {
            indexedDBCache.backgroundRefresh(cacheKey, async () => {
              const res = await userApi.get("/contacts/labels", {
                params: { deviceId, pageSize: 50 },
              });
              const data = res?.data;
              let list = Array.isArray(data?.labels)
                ? data.labels
                : Array.isArray(data)
                ? data
                : [];
              const mappedLabels = mapLabels(list);
              labels.value = mappedLabels;
              return mappedLabels;
            }, CACHE_TTL.LABELS);
          }
          return;
        }
      }
      
      loadingLabels.value = true;
      
      // Fetch from server
      const res = await userApi.get("/contacts/labels", {
        params: {
          ...(deviceId ? { deviceId } : {}),
          pageSize: 50,
        },
      });
      const data = res?.data;
      let list = Array.isArray(data?.labels)
        ? data.labels
        : Array.isArray(data)
        ? data
        : [];
      
      if (!Array.isArray(list) || list.length === 0) {
        if (!contacts.value || contacts.value.length === 0) {
          await loadContacts(deviceId, { force }).catch(() => {});
        }
        list = deriveLabelsFromContacts();
      }
      const mappedLabels = mapLabels(list);
      labels.value = mappedLabels;
      lastLabelsDeviceId = deviceId;
      
      // 🔥 Save to IndexedDB cache
      await indexedDBCache.set(cacheKey, mappedLabels, CACHE_TTL.LABELS);
    } catch (_) {
      if (!contacts.value || contacts.value.length === 0) {
        await loadContacts(deviceIdOverride, { force }).catch(() => {});
      }
      const list = deriveLabelsFromContacts();
      labels.value = mapLabels(list);
      lastLabelsDeviceId = deviceIdOverride || lastContactsDeviceId;
    } finally {
      loadingLabels.value = false;
    }
  };

  const handleSyncGroups = async () => {
    try {
      await syncGroups();
      toast.success("Grup berhasil disinkronkan dari WhatsApp");
    } catch (e) {
      toast.error(e?.message || "Gagal sinkronisasi grup");
    }
  };

  // Reset function when device changes or form submitted
  const resetRecipients = () => {
    recipients.value = [];
    recipientLabels.value = {};
    selectedContactId.value = "";
    selectedGroupId.value = "";
    selectedLabelValue.value = "";
    // 🔧 Reset device tracking agar data di-reload saat dibutuhkan
    // JANGAN clear contacts/labels agar dropdown tidak kosong
    lastContactsDeviceId = null;
    lastLabelsDeviceId = null;
  };

  return {
    // State
    recipients,
    recipientLabels,
    recipientInput,
    activeTab,
    
    // Groups
    groups,
    loadingGroups,
    selectedGroupId,
    groupSearch,
    filteredGroups,
    
    // Contacts
    contacts,
    selectedContactId,
    loadingContacts,
    contactSearch,
    filteredContacts,
    
    // Labels
    labels,
    selectedLabelValue,
    loadingLabels,
    labelSearch,
    filteredLabels,

    // Actions
    addRecipientsFromInput,
    removeRecipient,
    addSelectedGroup,
    addSelectedContact,
    addSelectedLabel,
    handleSyncGroups,
    loadGroups,
    loadContacts,
    loadLabels,
    resetRecipients,
    chipLabel,
    contactDisplay,
    ensureFullGroupJid
  };
}
