<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="assign-title">
      <div class="modal-header">
        <div>
          <p class="eyebrow">AKSES DEVICE</p>
          <h3 id="assign-title">Assign {{ device?.name || "Device" }}</h3>
          <p>Akun yang dipilih dapat langsung memakai device tanpa pairing QR.</p>
        </div>
        <button class="icon-button" type="button" aria-label="Tutup" @click="$emit('close')">×</button>
      </div>

      <div v-if="loading" class="state-box">Memuat data assignment...</div>

      <template v-else>
        <form class="assign-form" @submit.prevent="submitAssignment">
          <label for="assignment-user">Pilih akun</label>
          <div class="assign-row">
            <select id="assignment-user" v-model="selectedUserId" :disabled="saving || !availableUsers.length">
              <option value="" disabled>
                {{ availableUsers.length ? "Pilih akun tujuan" : "Semua akun sudah mendapat akses" }}
              </option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                {{ displayName(user) }} — {{ user.email }}
              </option>
            </select>
            <button class="primary-button" type="submit" :disabled="saving || !selectedUserId">
              {{ saving ? "Menyimpan..." : "Berikan Akses" }}
            </button>
          </div>
        </form>

        <div class="assignment-section">
          <div class="section-heading">
            <h4>Akun dengan akses</h4>
            <span>{{ assignments.length }} akun</span>
          </div>

          <div v-if="!assignments.length" class="state-box">
            Device ini belum di-assign ke akun lain.
          </div>

          <div v-else class="assignment-list">
            <div v-for="assignment in assignments" :key="assignment.id" class="assignment-item">
              <div class="avatar">{{ initials(assignment.user) }}</div>
              <div class="account-info">
                <strong>{{ displayName(assignment.user) }}</strong>
                <span>{{ assignment.user.email }}</span>
                <small>{{ assignment.user.privilege?.name || "Akun" }}</small>
              </div>
              <button
                class="revoke-button"
                type="button"
                :disabled="saving"
                @click="$emit('revoke', assignment.user.id)"
              >
                Cabut Akses
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  device: { type: Object, default: null },
  users: { type: Array, default: () => [] },
  assignments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "assign", "revoke"]);
const selectedUserId = ref("");

const assignedUserIds = computed(() => new Set(props.assignments.map((item) => item.user?.id)));
const availableUsers = computed(() =>
  props.users.filter((user) => !assignedUserIds.value.has(user.id))
);

watch(
  () => [props.modelValue, props.assignments.length],
  () => {
    selectedUserId.value = "";
  }
);

const displayName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Akun";

const initials = (user) => {
  const name = displayName(user);
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const submitAssignment = () => {
  if (!selectedUserId.value || props.saving) return;
  emit("assign", selectedUserId.value);
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(15 23 42 / 65%);
  backdrop-filter: blur(4px);
}

.modal-card {
  width: min(680px, 100%);
  max-height: min(760px, calc(100vh - 40px));
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--theme-border);
  border-radius: 18px;
  background: var(--theme-surface);
  color: var(--theme-text);
  box-shadow: 0 24px 70px rgb(15 23 42 / 32%);
}

.modal-header,
.assign-row,
.section-heading,
.assignment-item {
  display: flex;
  align-items: center;
}

.modal-header {
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--theme-border);
}

.eyebrow {
  margin: 0 0 5px;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

h3,
h4,
p {
  margin: 0;
}

.modal-header h3 {
  font-size: 21px;
}

.modal-header p:last-child {
  margin-top: 7px;
  color: var(--theme-text-muted);
  font-size: 14px;
}

.icon-button {
  width: 38px;
  height: 38px;
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  background: var(--theme-surface-soft);
  color: var(--theme-text-secondary);
  cursor: pointer;
  font-size: 25px;
}

.assign-form {
  padding: 22px 0;
}

.assign-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
}

.assign-row {
  gap: 10px;
}

select {
  min-width: 0;
  flex: 1;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--theme-border-strong);
  border-radius: 10px;
  background: var(--theme-input);
  color: var(--theme-text);
}

.primary-button,
.revoke-button {
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.primary-button {
  height: 44px;
  padding: 0 18px;
  background: #2563eb;
  color: #fff;
}

button:disabled,
select:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.assignment-section {
  padding-top: 20px;
  border-top: 1px solid var(--theme-border);
}

.section-heading {
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-heading span {
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--theme-info-soft);
  color: var(--theme-info-text);
  font-size: 12px;
  font-weight: 700;
}

.state-box {
  padding: 20px;
  border: 1px dashed var(--theme-border-strong);
  border-radius: 12px;
  background: var(--theme-surface-soft);
  color: var(--theme-text-muted);
  text-align: center;
}

.assignment-list {
  display: grid;
  gap: 10px;
}

.assignment-item {
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface-soft);
}

.avatar {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border-radius: 50%;
  background: var(--theme-info-soft);
  color: var(--theme-info-text);
  font-weight: 800;
}

.account-info {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 2px;
}

.account-info span,
.account-info small {
  overflow: hidden;
  color: var(--theme-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-info span {
  font-size: 13px;
}

.account-info small {
  font-size: 11px;
  text-transform: capitalize;
}

.revoke-button {
  padding: 9px 12px;
  background: var(--theme-danger-soft);
  color: var(--theme-danger-text);
}

@media (max-width: 620px) {
  .assign-row,
  .assignment-item {
    align-items: stretch;
    flex-direction: column;
  }

  .avatar {
    display: none;
  }
}
</style>
