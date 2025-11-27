<template>
  <div class="wrapper">
    <h2>Broadcast</h2>

    <section class="form card">
      <form @submit.prevent="submit" class="grid">
        <div class="field">
          <label>Nama</label>
          <input v-model.trim="form.name" placeholder="Contoh: EC Minggu" required />
        </div>

        <div class="field span-2">
          <label>Pesan</label>
          <textarea v-model.trim="form.message" rows="4" placeholder="Tulis pesan yang akan dikirim" required />
        </div>

        <div class="field">
          <label>Jadwal</label>
          <input v-model="form.schedule" type="datetime-local" />
          <small class="dim" v-if="form.schedule">Tanggal terpilih: {{ formatLocalTime(convertToServerTime(form.schedule)) }}</small>
        </div>

        <div class="field">
          <label>Media (opsional)</label>
          <input type="file" @change="onFile" :accept="acceptTypes" />
          <div v-if="mediaPreview" class="preview">
            <img v-if="isImage" :src="mediaPreview" alt="preview" />
            <div v-else class="file-chip">{{ mediaName }}</div>
          </div>
        </div>

        <div class="field span-2">
          <label>Penerima</label>
          <div class="recipients">
            <div class="chips">
              <span v-for="(r, i) in recipients" :key="r + i" class="chip">
                {{ chipLabel(r) }}
                <button type="button" class="chip-x" @click="removeRecipient(i)">×</button>
              </span>
            </div>
            <div class="add">
              <input
                v-model="recipientInput"
                @keydown.enter.prevent="addRecipientsFromInput"
                placeholder="cth: 62812... jika banyak: 62812...,62813...,62814..."
              />
              <button type="button" class="btn" @click="addRecipientsFromInput">Tambah</button>
            </div>
          </div>
        </div>

        <div class="field span-2">
          <label>Tambah Kontak (opsional)</label>
          <div class="recipients">
            <div class="add">
              <select v-model="selectedContactId">
                <option value="" disabled>Pilih kontak</option>
                <option v-for="c in filteredContacts" :key="c.id" :value="c.phone">
                  {{ contactDisplay(c) }}
                </option>
              </select>
              <button type="button" class="btn" @click="addSelectedContact" :disabled="!selectedContactId">Tambah Kontak</button>
              <button type="button" class="btn outline" @click="loadContacts" :disabled="loadingContacts">{{ loadingContacts ? 'Memuat...' : 'Muat Kontak' }}</button>
            </div>
          </div>
        </div>

        <div class="field span-2">
          <label>Tambah Grup (opsional)</label>
          <div class="recipients">
            <div class="add">
              <select v-model="selectedGroupId">
                <option value="" disabled>Pilih group</option>
                <option v-for="g in groups" :key="g.value" :value="g.value">{{ g.label }}</option>
              </select>
              <button type="button" class="btn" @click="addSelectedGroup" :disabled="!selectedGroupId">Tambah Grup</button>
              <button type="button" class="btn outline" @click="loadGroups" :disabled="loadingGroups">{{ loadingGroups ? 'Memuat...' : 'Muat Ulang Grup' }}</button>
            </div>
          </div>
        </div>

        <div class="field span-2">
          <label>Tambah Kelas (Label) (opsional)</label>
          <div class="recipients">
            <div class="add">
              <select v-model="selectedLabelValue">
                <option value="" disabled>Pilih label</option>
                <option v-for="l in filteredLabels" :key="l.value" :value="l.value">{{ l.label }}</option>
              </select>
              <button type="button" class="btn" @click="addSelectedLabel" :disabled="!selectedLabelValue">Tambah Label</button>
              <button type="button" class="btn outline" @click="loadLabels" :disabled="loadingLabels">{{ loadingLabels ? 'Memuat...' : 'Muat Label' }}</button>
            </div>
          </div>
        </div>

        <div class="actions span-2">
          <button class="btn primary" :disabled="loading || !!validationError">{{ loading ? 'Memproses...' : 'Kirim Broadcast' }}</button>
        </div>
      </form>

      <p v-if="validationError" class="error">{{ validationError }}</p>
      <p v-if="msg" class="success">{{ msg }}</p>
      <p v-if="err" class="error">{{ err }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { deviceApi, userApi } from '../api/http.js';
import { useGroups } from '../composables/useGroups.js';
import { useToast } from '../composables/useToast.js';
import { 
  convertToServerTime, 
  formatLocalTime, 
  isValidDateTime 
} from '../utils/datetime.js';

const toast = useToast();

const ensureDeviceId = async () => {
  let deviceId = localStorage.getItem('device_selected_id');
  if (deviceId) return deviceId;
  try {
    const { data } = await userApi.get('/devices');
    const devices = Array.isArray(data) ? data : [];
    const current = devices.find((d) => d.status === 'open') || devices[0];
    if (current) {
      if (current.id) localStorage.setItem('device_selected_id', current.id);
      if (current.name) localStorage.setItem('device_selected_name', current.name);
      if (current.apiKey) localStorage.setItem('device_api_key', current.apiKey);
      return current.id || '';
    }
  } catch (_) {}
  return '';
};

const form = ref({
  name: '',
  delay: 5000,
  message: '',
  schedule: ''
});

const recipients = ref([]);
const recipientInput = ref('');
const mediaFile = ref(null);
const mediaPreview = ref('');

const acceptTypes = '.png,.jpg,.jpeg,.webp,.gif,.mp4,.mp3,.wav,.pdf,.doc,.docx,.xls,.xlsx,.txt';

const isImage = computed(() => mediaFile.value && mediaFile.value.type?.startsWith('image'));
const mediaName = computed(() => mediaFile.value?.name || '');

const loading = ref(false);
const msg = ref('');
const err = ref('');

function onFile(e) {
  const file = e.target.files?.[0];
  mediaFile.value = file || null;
  if (file && file.type?.startsWith('image')) {
    mediaPreview.value = URL.createObjectURL(file);
  } else {
    mediaPreview.value = '';
  }
}

function addRecipientsFromInput() {
  if (!recipientInput.value) return;
  const items = recipientInput.value
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const set = new Set([...recipients.value, ...items]);
  recipients.value = Array.from(set);
  recipientInput.value = '';
}

function removeRecipient(index) {
  recipients.value.splice(index, 1);
}

const { groups, loadingGroups, loadGroups, ensureFullGroupJid, syncGroups } = useGroups();
const selectedGroupId = ref('');
const recipientLabels = ref({});

const chipLabel = (r) => recipientLabels.value[r] || r;

const addSelectedGroup = async () => {
  if (!selectedGroupId.value) return;
  const fullJid = await ensureFullGroupJid(selectedGroupId.value);
  if (!fullJid) return;
  if (!recipients.value.includes(fullJid)) {
    recipients.value.push(fullJid);
    const found = groups.value.find((g) => g.value === selectedGroupId.value);
    if (found) recipientLabels.value[fullJid] = `Group: ${found.label}`;
  }
  selectedGroupId.value = '';
};

const handleSyncGroups = async () => {
  try {
    err.value = '';
    await syncGroups();
    toast.success('Grup berhasil disinkronkan dari WhatsApp');
  } catch (e) {
    toast.error(e?.message || 'Gagal sinkronisasi grup');
  }
};

loadGroups().catch(() => {});

const contacts = ref([]);
const selectedContactId = ref('');
const loadingContacts = ref(false);
const contactSearch = ref('');
const filteredContacts = computed(() => {
  const q = contactSearch.value.toLowerCase();
  if (!q) return contacts.value;
  return contacts.value.filter((c) =>
    [c.firstName, c.lastName, c.phone]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q))
  );
});

const contactLabelNames = (c) => {
  try {
    const arr = (c?.ContactLabel || []).map((x) => x?.label?.name).filter((n) => n && !String(n).startsWith('device_'));
    return arr.join(', ');
  } catch { return ''; }
};
const contactDisplay = (c) => {
  const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.phone || '-';
  const labels = contactLabelNames(c);
  return labels ? `${name} (${c.phone}) — [${labels}]` : `${name} (${c.phone})`;
};

const loadContacts = async () => {
  try {
    loadingContacts.value = true;
    err.value = '';
    const deviceId = (await ensureDeviceId()) || undefined;
    const res = await userApi.get('/contacts', { params: deviceId ? { deviceId } : {} });
    contacts.value = Array.isArray(res?.data) ? res.data : [];
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'Gagal memuat kontak');
  } finally {
    loadingContacts.value = false;
  }
};

const addSelectedContact = () => {
  if (!selectedContactId.value) return;
  if (!recipients.value.includes(selectedContactId.value)) {
    recipients.value.push(selectedContactId.value);
    const found = contacts.value.find((c) => c.phone === selectedContactId.value);
    if (found) {
      const labels = contactLabelNames(found);
      recipientLabels.value[selectedContactId.value] = `Kontak: ${found.firstName} ${found.lastName || ''}${labels ? ' [' + labels + ']' : ''}`;
    }
  }
  selectedContactId.value = '';
};

const labels = ref([]);
const selectedLabelValue = ref('');
const loadingLabels = ref(false);
const labelSearch = ref('');
const filteredLabels = computed(() => {
  const q = labelSearch.value.toLowerCase();
  if (!q) return labels.value;
  return labels.value.filter((l) => l.label.toLowerCase().includes(q));
});

const mapLabels = (items) => {
  const arr = Array.isArray(items) ? items : [];
  return arr
    .map((it) => {
      if (typeof it === 'string') {
        const name = it;
        return { value: `label_${name}`, label: name };
      }
      const name = it.name || it.label || it.title || '';
      const slug = it.slug || '';
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
      if (n && !String(n).startsWith('device_')) names.add(n);
    });
  });
  return Array.from(names);
};

const loadLabels = async () => {
  try {
    loadingLabels.value = true;
    const deviceId = (await ensureDeviceId()) || undefined;
    const res = await userApi.get('/contacts/labels', { params: deviceId ? { deviceId } : {} });
    const data = res?.data;
    let list = Array.isArray(data?.labels) ? data.labels : Array.isArray(data) ? data : [];
    if (!Array.isArray(list) || list.length === 0) {
      if (!contacts.value || contacts.value.length === 0) {
        await loadContacts();
      }
      list = deriveLabelsFromContacts();
    }
    labels.value = mapLabels(list);
  } catch (_) {
    if (!contacts.value || contacts.value.length === 0) {
      await loadContacts().catch(() => {});
    }
    const list = deriveLabelsFromContacts();
    labels.value = mapLabels(list);
  } finally {
    loadingLabels.value = false;
  }
};

const addSelectedLabel = () => {
  if (!selectedLabelValue.value) return;
  const val = selectedLabelValue.value;
  if (!recipients.value.includes(val)) {
    recipients.value.push(val);
    const found = labels.value.find((l) => l.value === val);
    if (found) recipientLabels.value[val] = `Label: ${found.label}`;
  }
  selectedLabelValue.value = '';
};

loadGroups().catch(() => {});
loadContacts().catch(() => {});
loadLabels().catch(() => {});

const validationError = computed(() => {
  if (!form.value.name) return 'Nama wajib diisi';
  if (!form.value.message) return 'Pesan wajib diisi';
  if (recipients.value.length === 0) return 'Minimal satu penerima';
  
  if (form.value.schedule && !isValidDateTime(form.value.schedule)) {
    return 'Format jadwal tidak valid';
  }
  
  const hasAll = recipients.value.includes('all');
  const hasLabel = recipients.value.some((r) => String(r).startsWith('label'));
  if (hasAll && hasLabel) return 'Tidak boleh mencampur all dan label_* dalam penerima';
  return '';
});

async function submit() {
  msg.value = '';
  err.value = '';
  if (validationError.value) {
    toast.error(validationError.value);
    return;
  }
  
  loading.value = true;
  try {
    // Validasi device sebelum mengirim
    const deviceId = await ensureDeviceId();
    if (!deviceId) {
      toast.error('Device tidak ditemukan atau belum login WhatsApp');
      loading.value = false;
      return;
    }
    
    const payloadDelay = form.value.delay ?? 5000;
    
    const scheduleISO = form.value.schedule ? convertToServerTime(form.value.schedule) : undefined;
    
    if (!mediaFile.value) {
      await deviceApi.post('/messages/broadcasts', {
        name: form.value.name,
        message: form.value.message,
        delay: payloadDelay,
        schedule: scheduleISO,
        recipients: recipients.value,
      });
    } else {
      const fd = new FormData();
      fd.append('name', form.value.name);
      fd.append('message', form.value.message);
      fd.append('delay', String(payloadDelay));
      if (scheduleISO) fd.append('schedule', scheduleISO);
      recipients.value.forEach((r) => fd.append('recipients', r));
      fd.append('media', mediaFile.value);
      await deviceApi.post('/messages/broadcasts', fd);
    }

    toast.success('Broadcast berhasil dikirim/dijadwalkan');
    form.value.name = '';
    form.value.message = '';
    form.value.delay = 5000;
    form.value.schedule = '';
    recipients.value = [];
    mediaFile.value = null;
    mediaPreview.value = '';
  } catch (e) {
    toast.error('Gagal mengirim broadcast. Pastikan WhatsApp sudah terhubung' || e?.response?.data?.message || e?.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.wrapper { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.card { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 1px 2px rgba(16,24,40,0.04); padding: 12px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.field { display: flex; flex-direction: column; }
.field input, .field textarea, .field select { padding: 8px 10px; border: 1px solid #d6d6d6; border-radius: 8px; }
.span-2 { grid-column: span 2; }
.actions { display: flex; justify-content: flex-end; }

.btn { height: 36px; padding: 0 12px; border: 1px solid #d0d5dd; background: #f9fafb; border-radius: 8px; cursor: pointer; font-weight: 500; }
.btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
.btn.outline { background: #fff; }
.btn:disabled { opacity: .6; cursor: not-allowed; }

.dim { color: #666; }
.error { color: #c00; margin-top: 8px; }
.success { color: #070; margin-top: 8px; }
.recipients .chips { margin-bottom: 6px; }
.chip { display: inline-flex; align-items: center; background: #eef6ff; color: #0a4; border: 1px solid #bfe; padding: 4px 8px; border-radius: 16px; margin: 2px; }
.chip-x { margin-left: 6px; border: none; background: transparent; color: #555; cursor: pointer; }
.recipients .add { display: flex; gap: 6px; }
.preview { margin-top: 8px; }
.preview img { max-width: 220px; max-height: 140px; border-radius: 6px; border: 1px solid #ddd; }
.file-chip { display: inline-block; background: #f3f3f3; padding: 4px 8px; border-radius: 6px; border: 1px solid #ddd; }
.recipients .add select { flex: 1; }
.recipients .add input { flex: 1; }

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .span-2 {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .wrapper {
    padding: 0 12px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  .card {
    padding: 10px;
  }
  
  .grid {
    gap: 10px;
  }
  
  .field input,
  .field textarea,
  .field select {
    font-size: 14px;
  }
  
  .recipients .add {
    flex-direction: column;
    align-items: stretch;
  }
  
  .recipients .add button {
    width: 100%;
  }
  
  .btn {
    height: 34px;
    font-size: 13px;
  }
  
  .preview img {
    max-width: 180px;
    max-height: 120px;
  }
}

@media (max-width: 480px) {
  h2 {
    font-size: 18px;
  }
  
  .card {
    padding: 8px;
  }
  
  .field input,
  .field textarea,
  .field select {
    padding: 6px 8px;
    font-size: 13px;
  }
  
  .btn {
    height: 32px;
    padding: 0 10px;
    font-size: 12px;
  }
  
  .chip {
    font-size: 11px;
    padding: 3px 6px;
  }
}
</style>
