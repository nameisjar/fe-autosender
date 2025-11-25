<template>
  <div class="wrapper">
    <h2>Jadwal Saya</h2>

    <div class="toolbar card">
      <input v-model="q" placeholder="Cari nama..." />
      <select v-model="statusFilter">
        <option value="all">Semua</option>
        <option value="upcoming">Proses Dikirim</option>
        <option value="sent">Sudah Dikirim</option>
        <option value="inactive">Nonaktif</option>
      </select>
      <select v-model="selectedDeviceId" @change="onDeviceChange">
        <option value="">Pilih Perangkat</option>
        <option v-for="d in devices" :key="d.id" :value="d.id">{{ d.name || d.id }} — {{ d.status }}</option>
      </select>
      <select v-model="sortBy" title="Urutkan berdasarkan">
        <option value="schedule">Jadwal Terdekat</option>
        <option value="name">Nama</option>
      </select>
      <select v-model="sortDir" title="Arah urutan">
        <option value="asc">↑</option>
        <option value="desc">↓</option>
      </select>
      <select v-model.number="pageSize" title="Jumlah baris per halaman">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
      </select>
      <button class="btn outline" @click="load" :disabled="loading">{{ loading ? 'Memuat...' : 'Muat Ulang' }}</button>
    </div>

    <div class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Jadwal</th>
            <th>Status</th>
            <th>Pesan</th>
            <th>Media</th>
            <th>Penerima</th>
            <th>Gagal Terkirim</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in visibleGroups" :key="g.name">
            <td>
              <div class="name">{{ displayName(g) }}</div>
              <small class="dim">Total: {{ g.broadcasts.length }} jadwal</small>
            </td>
            <td>
              <select v-model="selections[g.name]">
                <option v-for="b in g.broadcasts" :key="b.id" :value="b.id">
                  {{ fmtWithDay(b.schedule) }} — {{ statusShort(b) }}
                </option>
              </select>
            </td>
            <td>
              <span class="badge" :class="badgeClass(selectedOf(g))">{{ badgeText(selectedOf(g)) }}</span>
              <button
                class="btn-small danger"
                v-if="canDelete(selectedOf(g))"
                @click="confirmDelete(g.name)"
              >Hapus</button>
            </td>
           
            <td class="msg-cell">
              <div class="msg-text" v-if="selectedOf(g)?.message">{{ selectedOf(g).message }}</div>
              <div v-else class="dim">-</div>
            </td>
            <td class="media-cell">
              <template v-if="selectedOf(g)?.mediaPath">
                <a :href="mediaUrl(selectedOf(g).mediaPath)" target="_blank" rel="noopener" class="media-link">Lihat</a>
                <img
                  v-if="isImagePath(selectedOf(g).mediaPath)"
                  :src="mediaUrl(selectedOf(g).mediaPath)"
                  alt="media"
                  class="thumb"
                />
              </template>
              <span v-else class="dim">-</span>
            </td>
            <td>
              <div class="chips">
                <span v-for="lbl in groupRecipientLabels(selectedOf(g))" :key="'g-'+lbl" class="chip">{{ lbl }}</span>
                <span v-for="lbl in labelRecipientLabels(selectedOf(g))" :key="'l-'+lbl" class="chip chip-label">Label: {{ lbl }}</span>
                <span v-for="num in phoneRecipients(selectedOf(g))" :key="'p-'+num" class="chip chip-num">{{ getPhoneDisplay(num) }}</span>
              </div>
            </td>
            <td class="failed-cell">
              <template v-if="getFailedInfo(selectedOf(g)).count > 0">
                <div class="failed-info">
                  <!-- <div class="failed-count">
                    <span class="badge-failed">{{ getFailedInfo(selectedOf(g)).count }} gagal</span>
                  </div> -->
                  <div class="failed-groups" v-if="getFailedInfo(selectedOf(g)).groups.length > 0">
                    <!-- <small class="dim">Group:</small> -->
                    <div class="chips">
                      <span v-for="grp in getFailedInfo(selectedOf(g)).groups" :key="grp" class="chip chip-failed">
                        {{ grp }}
                      </span>
                    </div>
                  </div>
                  <div class="failed-phones" v-if="getFailedInfo(selectedOf(g)).phones.length > 0">
                    <!-- <small class="dim">Nomor:</small> -->
                    <div class="chips">
                      <span v-for="phone in getFailedInfo(selectedOf(g)).phones" :key="phone" class="chip chip-failed-phone">
                        {{ phone }}
                      </span>
                    </div>
                  </div>
                  <!-- <div v-if="selectedOf(g)?.lastError" class="failed-error">
                    <small class="error-text" :title="selectedOf(g).lastError">
                      {{ truncateError(selectedOf(g).lastError) }}
                    </small>
                  </div> -->
                </div>
              </template>
              <span v-else class="dim">-</span>
            </td>
          </tr>
          <tr v-if="!loading && visibleGroups.length === 0">
            <td colspan="7" class="empty">Tidak ada data</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager" v-if="meta.totalPages > 1">
      <button class="btn" :disabled="page<=1 || loading" @click="goPrev">Prev</button>
      <span>Halaman {{ page }} / {{ meta.totalPages }}</span>
      <button class="btn" :disabled="!meta.hasMore || loading" @click="goNext">Next</button>
    </div>

    <p v-if="msg" class="success">{{ msg }}</p>
    <p v-if="err" class="error">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { deviceApi, userApi } from '../api/http.js';

const items = ref([]);
const loading = ref(false);
const err = ref('');
const msg = ref('');
const q = ref('');
const statusFilter = ref('upcoming');

const groupsMap = ref({});
const loadGroupNames = async () => {
  try {
    const deviceId = localStorage.getItem('device_selected_id') || '';
    if (!deviceId) {
      console.log('No device selected');
      return;
    }

    // Ambil data group dari database melalui API
    const { data } = await userApi.get(`/whatsapp-groups/device/${deviceId}/active`);
    const groups = Array.isArray(data?.data) ? data.data : [];
    
    const map = {};
    for (const g of groups) {
      const groupId = g.groupId || '';
      const groupName = g.groupName || 'Tanpa Nama';
      
      // Simpan dengan berbagai format ID untuk memudahkan pencarian
      map[groupId] = groupName;
      
      // Jika groupId tidak mengandung @g.us, tambahkan juga versi dengan @g.us
      if (!groupId.includes('@')) {
        map[`${groupId}@g.us`] = groupName;
      }
    }
    
    groupsMap.value = map;
    console.log(`Loaded ${groups.length} groups from database`);
  } catch (error) {
    console.error('Error loading groups from database:', error);
    // Fallback ke method lama jika API database gagal
    try {
      let res;
      try { res = await deviceApi.get('/messages/get-groups/detail'); }
      catch { res = await deviceApi.get('/messages/get-groups'); }
      const raw = Array.isArray(res.data) ? res.data : (res.data?.results || res.data?.data || []);
      const map = {};
      for (const g of raw) {
        const id = (g.id || g.jid || '').toString();
        const full = id.includes('@') ? id : `${id}@g.us`;
        const name = g.subject || g.name || g.title || g.id || 'Tanpa Nama';
        map[full] = name;
      }
      groupsMap.value = map;
    } catch (_) { /* ignore */ }
  }
};

const contacts = ref([]);
const loadingContacts = ref(false);
const loadContacts = async () => {
  try {
    loadingContacts.value = true;
    const deviceId = localStorage.getItem('device_selected_id') || '';
    const { data } = await userApi.get('/contacts', { params: deviceId ? { deviceId } : {} });
    contacts.value = Array.isArray(data) ? data : [];
  } catch (_) {
    contacts.value = [];
  } finally {
    loadingContacts.value = false;
  }
};

const labelToPhones = computed(() => {
  const map = {};
  for (const c of contacts.value || []) {
    const phone = String(c.phone || '').trim();
    if (!phone) continue;
    const cLabels = Array.isArray(c.ContactLabel) ? c.ContactLabel : [];
    for (const cl of cLabels) {
      const name = cl?.label?.name;
      if (!name || String(name).startsWith('device_')) continue;
      if (!map[name]) map[name] = new Set();
      map[name].add(phone);
    }
  }
  return map;
});

// Map nomor telepon ke nama kontak
const phoneToContactMap = computed(() => {
  const map = {};
  for (const c of contacts.value || []) {
    const phone = String(c.phone || '').trim();
    if (!phone) continue;
    
    // Gabungkan firstName dan lastName untuk nama lengkap
    const firstName = String(c.firstName || '').trim();
    const lastName = String(c.lastName || '').trim();
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    const displayName = fullName || phone;
    
    // Normalisasi nomor untuk pencocokan yang lebih baik
    const normalized = phone.replace(/@s\.whatsapp\.net$/i, '').replace(/\D/g, '');
    
    // Simpan dengan berbagai format untuk matching yang lebih baik
    map[phone] = displayName;
    map[normalized] = displayName;
    map[`${phone}@s.whatsapp.net`] = displayName;
    map[`${normalized}@s.whatsapp.net`] = displayName;
    
    // Tambahkan format dengan +62 jika dimulai dengan 62
    if (normalized.startsWith('62')) {
      map[`+${normalized}`] = displayName;
    }
  }
  return map;
});

// Fungsi untuk mendapatkan display name dari nomor (nama kontak atau nomor)
const getPhoneDisplay = (phoneNum) => {
  if (!phoneNum) return '';
  
  const phoneStr = String(phoneNum).trim();
  
  // Coba cari langsung
  if (phoneToContactMap.value[phoneStr]) {
    return phoneToContactMap.value[phoneStr];
  }
  
  // Coba dengan normalisasi
  const normalized = phoneStr.replace(/@s\.whatsapp\.net$/i, '').replace(/\D/g, '');
  if (phoneToContactMap.value[normalized]) {
    return phoneToContactMap.value[normalized];
  }
  
  // Coba cari dengan suffix @s.whatsapp.net
  if (phoneToContactMap.value[`${phoneStr}@s.whatsapp.net`]) {
    return phoneToContactMap.value[`${phoneStr}@s.whatsapp.net`];
  }
  
  if (phoneToContactMap.value[`${normalized}@s.whatsapp.net`]) {
    return phoneToContactMap.value[`${normalized}@s.whatsapp.net`];
  }
  
  // Jika tidak ditemukan di kontak, tampilkan nomor yang sudah dinormalisasi
  return normalizeNumber(phoneStr);
};

const selections = ref({});
const pickDefault = (arr) => {
  const upcoming = arr.find((b) => !b.isSent && b.status !== false && new Date(b.schedule).getTime() > Date.now());
  return upcoming?.id || arr[arr.length - 1]?.id;
};

const grouped = computed(() => {
  const byName = {};
  for (const b of items.value) {
    const n = b.name || '(Tanpa Nama)';
    (byName[n] ||= []).push(b);
  }
  const groups = Object.keys(byName).map((name) => {
    const arr = byName[name].slice().sort((a, b) => new Date(a.schedule) - new Date(b.schedule));
    if (!selections.value[name]) selections.value[name] = pickDefault(arr);
    return { name, broadcasts: arr };
  });
  const qq = q.value.toLowerCase();
  const filteredByName = groups.filter((g) => g.name.toLowerCase().includes(qq));
  return filteredByName;
});

const selectedOf = (g) => g.broadcasts.find((b) => b.id === selections.value[g.name]) || g.broadcasts[g.broadcasts.length - 1];

const statusShort = (b) => {
  if (!b) return '';
  if (b.status === false) return 'Nonaktif';
  if (b.isSent) return 'Terkirim';
  const due = new Date(b.schedule).getTime();
  return due > Date.now() ? 'Terjadwal' : 'Tertunda';
};

const matchesStatus = (g) => {
  const b = selectedOf(g);
  if (!b) return false;
  if (statusFilter.value === 'all') return true;
  if (statusFilter.value === 'inactive') return b.status === false;
  const isSent = !!b.isSent;
  const sched = new Date(b.schedule).getTime();
  if (statusFilter.value === 'sent') return isSent;
  if (statusFilter.value === 'upcoming') return !isSent && b.status !== false && sched > Date.now();
  return true;
};

const filtered = computed(() => grouped.value.filter(matchesStatus));

const fmt = (d) => {
  try {
    const dd = new Date(d);
    if (isNaN(dd.getTime())) return '-';
    return dd.toLocaleString();
  } catch {
    return '-';
  }
};

const fmtWithDay = (d) => {
  try {
    const dd = new Date(d);
    if (isNaN(dd.getTime())) return '-';
    const hari = dd.toLocaleDateString('id-ID', { weekday: 'long' });
    const tanggal = dd.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    const jam = dd.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${hari}, ${tanggal} ${jam}`;
  } catch { return '-'; }
};

const badgeClass = (b) => {
  if (b.status === false) return 'warn';
  if (b.isSent) return 'ok';
  const due = new Date(b.schedule).getTime();
  return due > Date.now() ? 'info' : 'warn';
};

const badgeText = (b) => {
  if (b.status === false) return 'Nonaktif';
  if (b.isSent) return 'Terkirim';
  const due = new Date(b.schedule).getTime();
  return due > Date.now() ? 'Terjadwal' : 'Tertunda';
};

const groupRecipientLabels = (b) => {
  if (!b) return [];
  const arr = Array.isArray(b.recipients) ? b.recipients : [];
  return arr
    .filter((r) => typeof r === 'string' && r.includes('@g.us'))
    .map((jid) => {
      // Normalisasi jid untuk mencocokkan dengan groupsMap
      const normalizedJid = jid.includes('@') ? jid : `${jid}@g.us`;
      
      // Cek di groupsMap dengan berbagai variasi
      if (groupsMap.value[normalizedJid]) {
        return groupsMap.value[normalizedJid];
      }
      
      // Coba cari dengan ID tanpa suffix
      const idOnly = jid.split('@')[0];
      for (const [key, value] of Object.entries(groupsMap.value)) {
        if (key.startsWith(idOnly)) {
          return value;
        }
      }
      
      // Jika tidak ditemukan, tampilkan ID yang lebih bersih (tanpa @g.us)
      return idOnly;
    });
};

const labelRecipientLabels = (b) => {
  if (!b) return [];
  const arr = Array.isArray(b.recipients) ? b.recipients : [];
  return arr
    .filter((r) => typeof r === 'string' && r.toLowerCase().startsWith('label_'))
    .map((r) => String(r).slice('label_'.length));
};

const canDelete = (b) => b && !b.isSent && b.status !== false;

const confirmDelete = async (name) => {
  if (!window.confirm(`Hapus semua jadwal dengan nama "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
  msg.value = '';
  err.value = '';
  try {
    await deviceApi.delete('/messages/broadcast-name', { data: { name } });
    msg.value = `Jadwal dengan nama "${name}" berhasil dihapus.`;
    await load();
  } catch (e) {
    err.value = e?.response?.data?.message || e?.message || 'Gagal menghapus jadwal';
  }
};

const load = async () => {
  loading.value = true;
  err.value = '';
  try {
    const { data } = await deviceApi.get('/messages/broadcasts');
    items.value = Array.isArray(data) ? data : [];
    await loadGroupNames(); // Reload group names when loading broadcasts
  } catch (e) {
    // err.value = '';
    err.value = 'Gagal memuat jadwal (silahkan login WhatsApp)' || e?.response?.data?.message || e?.message;
  } finally {
    loading.value = false;
  }
};

const displayName = (g) => {
  const n = g?.name || '';
  return n || 'Tanpa Nama';
};

const phoneRecipients = (b) => {
  if (!b) return [];
  const arr = Array.isArray(b.recipients) ? b.recipients : [];
  const set = new Set(
    arr
      .map((r) => String(r))
      .filter((r) => !r.includes('@g.us'))
      .filter((r) => r.toLowerCase() !== 'all')
      .filter((r) => !r.toLowerCase().startsWith('label'))
      .filter((r) => r.trim().length > 0),
  );

  if (arr.some((r) => String(r).toLowerCase() === 'all')) {
    for (const c of contacts.value || []) {
      if (c?.phone) set.add(String(c.phone));
    }
  }

  for (const r of arr) {
    const s = String(r).toLowerCase();
    if (s.startsWith('label_')) {
      const labelName = String(r).slice('label_'.length);
      const phones = labelToPhones.value[labelName];
      if (phones) {
        for (const p of phones) set.add(String(p));
      }
    }
  }

  return Array.from(set);
};

const normalizeNumber = (num) => String(num).trim().replace(/@s\.whatsapp\.net$/i, '');

const devices = ref([]);
const selectedDeviceId = ref(localStorage.getItem('device_selected_id') || '');

const fetchDevices = async () => {
  try {
    const { data } = await userApi.get('/devices');
    devices.value = Array.isArray(data) ? data : [];
  } catch { devices.value = []; }
};

const ensureDeviceKeyValid = () => {
  const key = localStorage.getItem('device_api_key');
  const selId = localStorage.getItem('device_selected_id');
  if (!key || !selId) return false;
  const ok = devices.value.some((d) => d.id === selId && d.apiKey === key);
  if (!ok) {
    localStorage.removeItem('device_api_key');
    localStorage.removeItem('device_selected_id');
    localStorage.removeItem('device_selected_name');
    selectedDeviceId.value = '';
  }
  return ok;
};

const pickDefaultDevice = () => {
  if (!devices.value.length) return;
  const current = devices.value.find((d) => d.status === 'open') || devices.value[0];
  if (current) {
    localStorage.setItem('device_api_key', current.apiKey);
    localStorage.setItem('device_selected_id', current.id);
    localStorage.setItem('device_selected_name', current.name || '');
    selectedDeviceId.value = current.id;
  }
};

const onDeviceChange = () => {
  const dev = devices.value.find((d) => d.id === selectedDeviceId.value);
  if (dev && dev.apiKey) {
    localStorage.setItem('device_api_key', dev.apiKey);
    localStorage.setItem('device_selected_id', dev.id);
    localStorage.setItem('device_selected_name', dev.name || '');
    load();
    loadContacts();
    loadGroupNames(); // Reload group names when device changes
  }
};

const page = ref(1);
const pageSize = ref(25);
const sortBy = ref('schedule');
const sortDir = ref('asc');
const meta = ref({ totalGroups: 0, currentPage: 1, totalPages: 1, hasMore: false });

const sortedGroups = computed(() => {
  const arr = filtered.value.slice();
  if (sortBy.value === 'name') {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    arr.sort((a, b) => {
      const sa = new Date(selectedOf(a)?.schedule || 0).getTime();
      const sb = new Date(selectedOf(b)?.schedule || 0).getTime();
      return sa - sb;
    });
  }
  if (sortDir.value === 'desc') arr.reverse();
  return arr;
});

const visibleGroups = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  const total = sortedGroups.value.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize.value));
  meta.value = { totalGroups: total, currentPage: page.value, totalPages, hasMore: page.value < totalPages };
  return sortedGroups.value.slice(start, end);
});

const mediaUrl = (p) => {
  if (!p) return '';
  
  // Get API base URL from environment
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = p.startsWith('/') ? p.slice(1) : p;
  
  // Construct full URL with API base
  return `${API_BASE}/${cleanPath}`;
};

const isImagePath = (p) => /\.(png|jpe?g|webp|gif)$/i.test(p || '');

// Fungsi untuk mendapatkan informasi pesan yang gagal terkirim
const getFailedInfo = (b) => {
  if (!b) return { count: 0, groups: [], phones: [] };
  
  const failedCount = b.failedCount || 0;
  
  if (failedCount === 0) {
    return { count: 0, groups: [], phones: [] };
  }
  
  const failedGroups = [];
  const failedPhones = [];
  
  // Ekstrak JID dari lastError jika ada
  const lastError = b.lastError || '';
  const jidMatches = lastError.match(/(\d+)@g\.us/g) || [];
  
  if (jidMatches.length > 0) {
    // Ada JID group di error message, ekstrak dan konversi ke nama
    for (const jidMatch of jidMatches) {
      const groupName = groupsMap.value[jidMatch];
      
      if (groupName) {
        if (!failedGroups.includes(groupName)) {
          failedGroups.push(groupName);
        }
      } else {
        // Coba cari dengan ID saja (tanpa @g.us)
        const idOnly = jidMatch.split('@')[0];
        let found = false;
        
        for (const [key, value] of Object.entries(groupsMap.value)) {
          if (key.includes(idOnly)) {
            if (!failedGroups.includes(value)) {
              failedGroups.push(value);
            }
            found = true;
            break;
          }
        }
        
        // Jika tetap tidak ditemukan, tampilkan nama generic
        if (!found) {
          failedGroups.push(`Group (${idOnly.substring(0, 8)}...)`);
        }
      }
    }
  } else {
    // Tidak ada JID di error, gunakan logic lama
    const groupRecipients = (b.recipients || [])
      .filter((r) => typeof r === 'string' && r.includes('@g.us'));
    
    const phoneRecipients = (b.recipients || [])
      .filter((r) => typeof r === 'string' && !r.includes('@g.us') && !r.toLowerCase().startsWith('label'));
    
    if (failedCount >= groupRecipients.length && groupRecipients.length > 0) {
      for (const jid of groupRecipients) {
        const normalizedJid = jid.includes('@') ? jid : `${jid}@g.us`;
        const groupName = groupsMap.value[normalizedJid];
        
        if (groupName) {
          failedGroups.push(groupName);
        } else {
          const idOnly = jid.split('@')[0];
          let found = false;
          for (const [key, value] of Object.entries(groupsMap.value)) {
            if (key.startsWith(idOnly)) {
              failedGroups.push(value);
              found = true;
              break;
            }
          }
          if (!found) {
            failedGroups.push(`Group (${idOnly.substring(0, 8)}...)`);
          }
        }
      }
    }
    
    const remainingFailed = failedCount - failedGroups.length;
    if (remainingFailed > 0 && phoneRecipients.length > 0) {
      const phonesToShow = Math.min(remainingFailed, 3);
      for (let i = 0; i < phonesToShow && i < phoneRecipients.length; i++) {
        const phone = normalizeNumber(phoneRecipients[i]);
        failedPhones.push(phone);
      }
      
      if (phoneRecipients.length > phonesToShow) {
        failedPhones.push(`+${phoneRecipients.length - phonesToShow} lainnya`);
      }
    }
  }
  
  return {
    count: failedCount,
    groups: failedGroups,
    phones: failedPhones
  };
};

// Fungsi untuk memotong pesan error jika terlalu panjang
const truncateError = (error) => {
  if (!error) return '';
  const maxLength = 100;
  if (error.length <= maxLength) return error;
  return error.substring(0, maxLength) + '...';
};

watch([q, statusFilter, sortBy, sortDir, pageSize], () => { page.value = 1; });

const goPrev = () => { if (page.value > 1) page.value -= 1; };
const goNext = () => { if (meta.value.hasMore) page.value += 1; };

onMounted(async () => {
  await fetchDevices();
  if (!ensureDeviceKeyValid()) pickDefaultDevice();
  await Promise.allSettled([load(), loadGroupNames(), loadContacts()]);
});
</script>

<style scoped>
.wrapper { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.toolbar { display: flex; gap: 8px; margin: 8px 0 16px; align-items: center; flex-wrap: wrap; }
.card { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 1px 2px rgba(16,24,40,0.04); padding: 10px; }
.toolbar input, .toolbar select { padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
.btn { height: 36px; padding: 0 12px; border: 1px solid #d0d5dd; background: #f9fafb; border-radius: 8px; cursor: pointer; font-weight: 500; }
.btn.outline { background: #fff; }
.table-wrap { overflow: auto; border: 1px solid #eee; border-radius: 12px; }
 table { width: 100%; border-collapse: collapse; }
 thead th { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
 th, td { padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: left; }
.name { font-weight: 600; }
.dim { color: #777; }
.badge { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.badge.ok { background: #e7f8ec; color: #1a7f37; }
.badge.info { background: #eaf2ff; color: #1d4ed8; }
.badge.warn { background: #fff4e5; color: #8a4b0f; }
.empty { text-align: center; color: #777; }
.error { color: #c00; margin-top: 8px; }
.success { color: #0a0; margin-top: 8px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.chip { background: #eef6ff; color: #0a4; border: 1px solid #bfe; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
.more { color: #555; font-size: 12px; }
.btn-small { margin-left: 8px; padding: 4px 8px; border-radius: 6px; border: 1px solid #c33; background: #e74c3c; color: #fff; cursor: pointer; font-size: 12px; }
.btn-small.danger { border-color: #c33; background: #e74c3c; }
.chip-num { background: #f7fff2; border-color: #cfe9bf; color: #2f7a1f; }
.chip-label { background: #fff7f0; border-color: #ffd8b5; color: #8a4b0f; }
.pager { display:flex; gap:8px; align-items:center; margin-top:12px; justify-content: center; }
.msg-cell { max-width: 280px; }
.msg-text { white-space: nowrap; font-size: 13px; overflow: hidden; text-overflow: ellipsis; }
.media-cell { min-width: 120px; }
.media-link { display:inline-block; margin-right:6px; font-size:12px; }
.thumb { max-height: 48px; max-width: 80px; border:1px solid #ddd; border-radius:4px; display:block; margin-top:4px; }

/* Failed Cell Styles */
.failed-cell { min-width: 200px; max-width: 300px; }
.failed-info { display: flex; flex-direction: column; gap: 8px; }
.failed-count { display: flex; align-items: center; }
.badge-failed { 
  background: #fee; 
  color: #c00; 
  border: 1px solid #fcc;
  padding: 4px 10px; 
  border-radius: 12px; 
  font-size: 12px; 
  font-weight: 600;
}
.failed-groups { 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
  margin-top: 4px;
}
.chip-failed { 
  background: #fff0f0; 
  border-color: #ffcccc; 
  color: #cc0000; 
  font-weight: 500;
}
.failed-error { 
  margin-top: 4px; 
  padding: 6px 8px;
  background: #fff9e6;
  border-left: 3px solid #ffa500;
  border-radius: 4px;
}
.error-text { 
  color: #8a4b0f; 
  font-size: 11px; 
  font-style: italic;
  word-break: break-word;
}
.failed-phones { 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
  margin-top: 4px;
}
.chip-failed-phone { 
  background: #fff0f0; 
  border-color: #ffcccc; 
  color: #cc0000; 
  font-weight: 500;
}
</style>
