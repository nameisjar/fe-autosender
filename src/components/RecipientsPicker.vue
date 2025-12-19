<template>
  <div class="recipients-picker">
    <!-- Selected Recipients -->
    <div v-if="recipients.length > 0" class="selected-recipients">
      <div class="recipients-chips">
        <span v-for="(r, i) in recipients" :key="r + i" class="recipient-chip">
          <span class="chip-label">{{ chipLabel(r) }}</span>
          <button type="button" class="chip-close" @click="removeRecipient(i)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      </div>
    </div>

    <!-- Add Recipients Tabs -->
    <div class="recipient-tabs">
      <button
        type="button"
        class="recipient-tab"
        :class="{ active: activeTab === 'manual' }"
        @click="activeTab = 'manual'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Manual
      </button>
      <button
        type="button"
        class="recipient-tab"
        :class="{ active: activeTab === 'contacts' }"
        @click="activeTab = 'contacts'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Kontak
      </button>
      <button
        type="button"
        class="recipient-tab"
        :class="{ active: activeTab === 'groups' }"
        @click="activeTab = 'groups'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Grup
      </button>
      <button
        type="button"
        class="recipient-tab"
        :class="{ active: activeTab === 'labels' }"
        @click="activeTab = 'labels'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
          />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        Label
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Manual Tab -->
      <div v-show="activeTab === 'manual'" class="tab-pane">
        <div class="input-with-button">
          <input
            v-model="recipientInput"
            placeholder="Masukkan nomor (pisahkan dengan koma)"
            class="form-input"
            @keyup.enter="addRecipientsFromInput"
          />
          <button type="button" class="btn-primary" @click="addRecipientsFromInput">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah
          </button>
        </div>
      </div>

      <!-- Contacts Tab -->
      <div v-show="activeTab === 'contacts'" class="tab-pane">
        <div class="input-with-button">
          <div class="select-wrapper" style="flex: 1">
            <input
              v-model="contactSearch"
              placeholder="Cari kontak..."
              class="form-input mb-2"
              style="margin-bottom: 8px"
            />
            <select v-model="selectedContactId" class="form-select">
              <option value="" disabled>Pilih kontak...</option>
              <option
                v-for="contact in filteredContacts"
                :key="contact.id"
                :value="contact.phone"
              >
                {{ contactDisplay(contact) }}
              </option>
            </select>
          </div>
          <button
            type="button"
            class="btn-primary"
            @click="addSelectedContact"
            :disabled="!selectedContactId"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah
          </button>
          <button
            v-if="showRefreshButtons"
            type="button"
            class="btn-secondary"
            @click="loadContacts"
            :disabled="loadingContacts"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :class="{ spinning: loadingContacts }"
            >
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Groups Tab -->
      <div v-show="activeTab === 'groups'" class="tab-pane">
        <div class="input-with-button">
          <div class="select-wrapper" style="flex: 1">
            <input
              v-model="groupSearch"
              placeholder="Cari grup..."
              class="form-input mb-2"
              style="margin-bottom: 8px"
            />
            <select v-model="selectedGroupId" class="form-select">
              <option value="" disabled>Pilih grup...</option>
              <option
                v-for="group in filteredGroups"
                :key="group.value"
                :value="group.value"
              >
                {{ group.label }}
              </option>
            </select>
          </div>
          <button
            type="button"
            class="btn-primary"
            @click="addSelectedGroup"
            :disabled="!selectedGroupId"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah
          </button>
          <button
            type="button"
            class="btn-secondary"
            @click="handleSyncGroups"
            title="Sync Groups"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :class="{ spinning: loadingGroups }"
            >
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Labels Tab -->
      <div v-show="activeTab === 'labels'" class="tab-pane">
        <div class="input-with-button">
          <div class="select-wrapper" style="flex: 1">
            <input
              v-model="labelSearch"
              placeholder="Cari label..."
              class="form-input mb-2"
              style="margin-bottom: 8px"
            />
            <select v-model="selectedLabelValue" class="form-select">
              <option value="" disabled>Pilih label...</option>
              <option
                v-for="label in filteredLabels"
                :key="label.value"
                :value="label.value"
              >
                {{ label.label }}
              </option>
            </select>
          </div>
          <button
            type="button"
            class="btn-primary"
            @click="addSelectedLabel"
            :disabled="!selectedLabelValue"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah
          </button>
          <button
            v-if="showRefreshButtons"
            type="button"
            class="btn-secondary"
            @click="loadLabels"
            :disabled="loadingLabels"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :class="{ spinning: loadingLabels }"
            >
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useRecipients } from "../composables/useRecipients.js";

const props = defineProps({
  showRefreshButtons: {
    type: Boolean,
    default: true,
  },
});

const {
  recipients,
  recipientLabels,
  recipientInput,
  activeTab,
  groups,
  loadingGroups,
  selectedGroupId,
  groupSearch,
  filteredGroups,
  contacts,
  selectedContactId,
  loadingContacts,
  contactSearch,
  filteredContacts,
  labels,
  selectedLabelValue,
  loadingLabels,
  labelSearch,
  filteredLabels,
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
} = useRecipients();

// Load data saat komponen di-mount
onMounted(async () => {
  await Promise.allSettled([
    loadGroups(),
    loadContacts(),
    loadLabels(),
  ]);
});

// Listen for device changes to refresh data
const handleDeviceChange = async () => {
  resetRecipients();
  await Promise.allSettled([
    loadGroups({ force: true }),
    loadContacts(),
    loadLabels(),
  ]);
};

onMounted(() => {
  window.addEventListener("deviceChanged", handleDeviceChange);
});

onUnmounted(() => {
  window.removeEventListener("deviceChanged", handleDeviceChange);
});

// Expose methods and state to parent via defineExpose
defineExpose({
  recipients,
  recipientLabels,
  loadGroups,
  loadContacts,
  loadLabels,
  resetRecipients,
});
</script>

<style scoped>
/* Selected Recipients */
.selected-recipients {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.recipients-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recipient-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  transition: all 0.2s;
}

.recipient-chip:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chip-label {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.chip-close:hover {
  color: #ef4444;
}

.chip-close svg {
  width: 16px;
  height: 16px;
}

/* Recipient Tabs */
.recipient-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
}

.recipient-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: -10px;
}

.recipient-tab:hover {
  color: #3b82f6;
  background: #f8fafc;
  border-radius: 10px 10px 0 0;
}

.recipient-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

.recipient-tab svg {
  width: 18px;
  height: 18px;
}

/* Tab Content */
.tab-content {
  margin-top: 16px;
}

.tab-pane {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Input with Button */
.input-with-button {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.input-with-button .form-input,
.input-with-button .form-select {
  flex: 1;
}

.select-wrapper {
  display: flex;
  flex-direction: column;
}

/* Form Elements */
.form-input,
.form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: #f8fafc;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Buttons */
.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 18px;
  border: 1.5px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border-color: #cbd5e1;
  padding: 12px;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary svg,
.btn-secondary svg {
  width: 18px;
  height: 18px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .recipient-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .input-with-button {
    flex-wrap: wrap;
  }

  .input-with-button .form-input,
  .input-with-button .form-select,
  .select-wrapper {
    flex: 1 1 100%;
  }

  .btn-primary {
    flex: 1;
  }
}
</style>
