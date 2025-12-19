import { ref, computed } from "vue";
import { normalizePhoneNumber, isValidPhoneNumber } from "../utils/phone.js";
import { useToast } from "./useToast.js";
import { useGroups } from "./useGroups.js";
import { userApi } from "../api/http.js";

export function useRecipients() {
  const toast = useToast();
  const recipients = ref([]);
  const recipientLabels = ref({}); // map recipient string -> label for chip
  const recipientInput = ref("");
  const activeTab = ref("manual");

  // Groups
  const { groups, loadingGroups, loadGroups, ensureFullGroupJid, syncGroups } = useGroups();
  const selectedGroupId = ref("");
  const groupSearch = ref("");

  const filteredGroups = computed(() => {
    const q = groupSearch.value.toLowerCase();
    if (!q) return groups.value;
    return groups.value.filter((g) => g.label.toLowerCase().includes(q));
  });

  // Contacts
  const contacts = ref([]);
  const selectedContactId = ref("");
  const loadingContacts = ref(false);
  const contactSearch = ref("");
  
  const filteredContacts = computed(() => {
    const q = contactSearch.value.toLowerCase();
    if (!q) return contacts.value;
    return contacts.value.filter((c) =>
      [c.firstName, c.lastName, c.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  });

  // Labels
  const labels = ref([]);
  const selectedLabelValue = ref("");
  const loadingLabels = ref(false);
  const labelSearch = ref("");
  
  const filteredLabels = computed(() => {
    const q = labelSearch.value.toLowerCase();
    if (!q) return labels.value;
    return labels.value.filter((l) => l.label.toLowerCase().includes(q));
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

  const loadContacts = async (deviceIdOverride) => {
    try {
      loadingContacts.value = true;
      const deviceId = deviceIdOverride || (await ensureDeviceId()) || undefined;
      const res = await userApi.get("/contacts", {
        params: deviceId ? { deviceId } : {},
      });
      contacts.value = Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      // Silent fail or toast
      console.error("Failed to load contacts", e);
    } finally {
      loadingContacts.value = false;
    }
  };

  const loadLabels = async (deviceIdOverride) => {
    try {
      loadingLabels.value = true;
      const deviceId = deviceIdOverride || (await ensureDeviceId()) || undefined;
      const res = await userApi.get("/contacts/labels", {
        params: deviceId ? { deviceId } : {},
      });
      const data = res?.data;
      let list = Array.isArray(data?.labels)
        ? data.labels
        : Array.isArray(data)
        ? data
        : [];
      
      if (!Array.isArray(list) || list.length === 0) {
        if (!contacts.value || contacts.value.length === 0) {
          await loadContacts(deviceId).catch(() => {});
        }
        list = deriveLabelsFromContacts();
      }
      labels.value = mapLabels(list);
    } catch (_) {
      if (!contacts.value || contacts.value.length === 0) {
        await loadContacts(deviceIdOverride).catch(() => {});
      }
      const list = deriveLabelsFromContacts();
      labels.value = mapLabels(list);
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

  // Reset function when device changes
  const resetRecipients = () => {
    recipients.value = [];
    recipientLabels.value = {};
    selectedContactId.value = "";
    selectedGroupId.value = "";
    selectedLabelValue.value = "";
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
