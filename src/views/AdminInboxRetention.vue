<template>
  <div class="retention-page">
    <header class="page-header">
      <div>
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5M14 11v5" />
          </svg>
          Retensi Inbox
        </h2>
        <p>Atur kapan chat lama otomatis dibersihkan dari Inbox seluruh akun.</p>
      </div>
      <button class="btn-secondary" :disabled="loading" @click="loadConfiguration">
        {{ loading ? 'Memuat...' : 'Muat Ulang' }}
      </button>
    </header>

    <div v-if="loading && !setting" class="loading-card">Memuat pengaturan retensi...</div>

    <template v-else-if="setting">
      <section class="settings-card">
        <div class="section-title">
          <div>
            <h3>Pengaturan Otomatis</h3>
            <p>Pemeriksaan dijalankan setiap hari pukul {{ schedule.time }} ({{ schedule.timezone }}).</p>
          </div>
          <label class="switch-row">
            <span>{{ form.enabled ? 'Aktif' : 'Nonaktif' }}</span>
            <input v-model="form.enabled" type="checkbox" />
            <span class="switch" aria-hidden="true"></span>
          </label>
        </div>

        <div class="setting-grid">
          <label class="field">
            <span>Masa penyimpanan chat</span>
            <div class="input-suffix">
              <input
                v-model.number="form.retentionDays"
                type="number"
                min="1"
                max="3650"
                :disabled="!form.enabled"
              />
              <span>hari</span>
            </div>
            <small>Contoh: 90 berarti pesan berumur lebih dari 90 hari hilang dari Inbox.</small>
          </label>

          <div class="preset-field">
            <span>Pilihan cepat</span>
            <div class="preset-buttons">
              <button
                v-for="days in [30, 60, 90, 180, 365]"
                :key="days"
                :class="{ active: form.retentionDays === days }"
                :disabled="!form.enabled"
                @click="form.retentionDays = days"
              >
                {{ days }} hari
              </button>
            </div>
          </div>
        </div>

        <div class="info-box">
          <strong>Data WhatsApp asli tidak terhapus.</strong>
          Pesan masuk disimpan selama {{ setting.graceDays }} hari setelah hilang dari Inbox sebelum
          dihapus permanen. Pesan keluar tetap tersimpan untuk riwayat broadcast dan feedback.
        </div>

        <div class="settings-footer">
          <span v-if="setting.lastCleanupAt">
            Pembersihan terakhir: {{ formatDate(setting.lastCleanupAt) }}
          </span>
          <span v-else>Belum pernah dibersihkan</span>
          <button class="btn-primary" :disabled="saving" @click="saveConfiguration">
            {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </div>
      </section>

      <section class="preview-card">
        <div class="section-title">
          <div>
            <h3>Pratinjau Pembersihan</h3>
            <p>Pesan yang lebih lama dari {{ setting.retentionDays }} hari berdasarkan data saat ini.</p>
          </div>
          <button
            class="btn-danger"
            :disabled="cleaning || eligibleTotal === 0 || hasUnsavedChanges"
            :title="hasUnsavedChanges ? 'Simpan perubahan pengaturan terlebih dahulu' : ''"
            @click="confirmOpen = true"
          >
            {{ cleaning ? 'Membersihkan...' : 'Bersihkan Sekarang' }}
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card accent">
            <span>Total dari Inbox</span>
            <strong>{{ formatNumber(eligibleTotal) }}</strong>
          </div>
          <div class="stat-card">
            <span>Pesan masuk</span>
            <strong>{{ formatNumber(preview.incomingToHide) }}</strong>
          </div>
          <div class="stat-card">
            <span>Pesan terkirim</span>
            <strong>{{ formatNumber(preview.outgoingToHide) }}</strong>
          </div>
          <div class="stat-card">
            <span>Device terdampak</span>
            <strong>{{ formatNumber(preview.affectedDevices) }}</strong>
          </div>
          <div class="stat-card warning">
            <span>Siap dihapus permanen</span>
            <strong>{{ formatNumber(preview.incomingPendingDeletion) }}</strong>
          </div>
        </div>
        <p v-if="hasUnsavedChanges" class="unsaved-text">
          Simpan perubahan pengaturan terlebih dahulu untuk memperbarui pratinjau.
        </p>
        <p class="cutoff-text">Batas waktu saat ini: sebelum {{ formatDate(preview.cutoffAt) }}</p>
      </section>

      <section class="logs-card">
        <div class="section-title">
          <div>
            <h3>Log Pembersihan</h3>
            <p>20 aktivitas pembersihan terbaru.</p>
          </div>
        </div>

        <div v-if="logs.length" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pemicu</th>
                <th>Pelaksana</th>
                <th>Disembunyikan</th>
                <th>Dihapus Permanen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.pkId">
                <td>{{ formatDate(log.createdAt) }}</td>
                <td>
                  <span class="trigger-badge" :class="log.triggerType">
                    {{ log.triggerType === 'automatic' ? 'Otomatis' : 'Manual' }}
                  </span>
                </td>
                <td>{{ log.triggeredBy || 'Sistem' }}</td>
                <td>
                  {{ formatNumber(log.incomingHiddenCount + log.outgoingHiddenCount) }} pesan
                </td>
                <td>{{ formatNumber(log.incomingDeletedCount) }} pesan masuk</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-log">Belum ada aktivitas pembersihan.</div>
      </section>
    </template>

    <div v-if="confirmOpen" class="modal-overlay" @click.self="confirmOpen = false">
      <div class="confirm-modal" role="dialog" aria-modal="true">
        <div class="modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.7L2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z" />
          </svg>
        </div>
        <h3>Bersihkan Inbox sekarang?</h3>
        <p>
          Sebanyak <strong>{{ formatNumber(eligibleTotal) }} pesan</strong> akan langsung
          dihilangkan dari Inbox seluruh akun sesuai batas {{ setting.retentionDays }} hari.
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="confirmOpen = false">Batal</button>
          <button class="btn-danger" :disabled="cleaning" @click="cleanupNow">
            {{ cleaning ? 'Membersihkan...' : 'Ya, Bersihkan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { userApi } from '../api/http.js';
import { useToast } from '../composables/useToast.js';

const toast = useToast();
const loading = ref(false);
const saving = ref(false);
const cleaning = ref(false);
const confirmOpen = ref(false);
const setting = ref(null);
const preview = ref({
  cutoffAt: null,
  incomingToHide: 0,
  outgoingToHide: 0,
  incomingPendingDeletion: 0,
  affectedDevices: 0,
});
const logs = ref([]);
const schedule = ref({ time: '02:30', timezone: 'Asia/Jayapura' });
const form = reactive({ enabled: true, retentionDays: 90 });

const eligibleTotal = computed(
  () => Number(preview.value.incomingToHide || 0) + Number(preview.value.outgoingToHide || 0),
);
const hasUnsavedChanges = computed(
  () =>
    Boolean(setting.value) &&
    (form.enabled !== Boolean(setting.value.enabled) ||
      Number(form.retentionDays) !== Number(setting.value.retentionDays)),
);

function applyPayload(data) {
  setting.value = data.setting;
  preview.value = data.preview || preview.value;
  logs.value = data.logs || logs.value;
  schedule.value = data.schedule || schedule.value;
  form.enabled = Boolean(data.setting.enabled);
  form.retentionDays = Number(data.setting.retentionDays);
}

async function loadConfiguration() {
  loading.value = true;
  try {
    const { data } = await userApi.get('/admin/inbox-retention');
    applyPayload(data);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal memuat pengaturan retensi Inbox');
  } finally {
    loading.value = false;
  }
}

async function saveConfiguration() {
  const days = Number(form.retentionDays);
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    toast.error('Masa penyimpanan harus antara 1 sampai 3650 hari');
    return;
  }

  saving.value = true;
  try {
    const { data } = await userApi.put('/admin/inbox-retention', {
      enabled: form.enabled,
      retentionDays: days,
    });
    setting.value = data.setting;
    preview.value = data.preview;
    toast.success(data.message || 'Pengaturan retensi berhasil disimpan');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan retensi Inbox');
  } finally {
    saving.value = false;
  }
}

async function cleanupNow() {
  cleaning.value = true;
  try {
    const { data } = await userApi.post('/admin/inbox-retention/cleanup');
    confirmOpen.value = false;
    toast.success(data.message || 'Pembersihan Inbox selesai');
    await loadConfiguration();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal membersihkan Inbox');
  } finally {
    cleaning.value = false;
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jayapura',
  }).format(new Date(value));
}

onMounted(loadConfiguration);
</script>

<style scoped>
.retention-page { padding: 28px 32px 48px; color: var(--theme-text); }
.page-header, .section-title, .settings-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { margin-bottom: 24px; }
.page-header h2 { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 28px; }
.page-header h2 svg { width: 30px; color: var(--theme-accent); }
.page-header p, .section-title p { margin: 7px 0 0; color: var(--theme-text-muted); }
.settings-card, .preview-card, .logs-card, .loading-card { background: var(--theme-surface); border: 1px solid var(--theme-border); border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 8px 24px var(--theme-shadow); }
.section-title h3 { margin: 0; font-size: 18px; }
.switch-row { display: flex; align-items: center; gap: 10px; font-weight: 700; cursor: pointer; }
.switch-row input { position: absolute; opacity: 0; pointer-events: none; }
.switch { width: 48px; height: 26px; border-radius: 999px; background: var(--theme-border-strong); position: relative; transition: .2s; }
.switch::after { content: ''; position: absolute; width: 20px; height: 20px; top: 3px; left: 3px; border-radius: 50%; background: white; transition: .2s; box-shadow: 0 1px 4px rgba(0,0,0,.25); }
.switch-row input:checked + .switch { background: #2563eb; }
.switch-row input:checked + .switch::after { transform: translateX(22px); }
.setting-grid { display: grid; grid-template-columns: minmax(280px, .8fr) 1.2fr; gap: 28px; margin-top: 24px; }
.field, .preset-field { display: flex; flex-direction: column; gap: 9px; font-weight: 700; }
.field small { font-weight: 400; color: var(--theme-text-muted); line-height: 1.45; }
.input-suffix { display: flex; border: 1px solid var(--theme-border-strong); border-radius: 10px; overflow: hidden; background: var(--theme-input); }
.input-suffix input { flex: 1; min-width: 0; border: 0; padding: 12px 14px; background: transparent; color: var(--theme-text); font: inherit; outline: none; }
.input-suffix span { display: flex; align-items: center; padding: 0 14px; background: var(--theme-surface-soft); color: var(--theme-text-muted); }
.preset-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
.preset-buttons button { padding: 10px 14px; border: 1px solid var(--theme-border-strong); border-radius: 9px; background: var(--theme-surface-soft); color: var(--theme-text-secondary); cursor: pointer; }
.preset-buttons button.active { background: #2563eb; color: white; border-color: #2563eb; }
button:disabled { opacity: .55; cursor: not-allowed; }
.info-box { margin-top: 22px; padding: 14px 16px; border: 1px solid var(--theme-info-border); border-radius: 10px; background: var(--theme-info-soft); color: var(--theme-info-text); line-height: 1.55; }
.settings-footer { margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--theme-border); color: var(--theme-text-muted); font-size: 13px; }
.btn-primary, .btn-secondary, .btn-danger { border: 0; border-radius: 9px; padding: 11px 16px; font-weight: 700; cursor: pointer; }
.btn-primary { background: #2563eb; color: white; }
.btn-secondary { background: var(--theme-gradient-neutral); color: var(--theme-text-secondary); border: 1px solid var(--theme-border-strong); }
.btn-danger { background: #dc2626; color: white; }
.stats-grid { display: grid; grid-template-columns: repeat(5, minmax(130px, 1fr)); gap: 12px; margin-top: 22px; }
.stat-card { padding: 17px; border-radius: 12px; background: var(--theme-surface-soft); border: 1px solid var(--theme-border); }
.stat-card span { display: block; color: var(--theme-text-muted); font-size: 12px; margin-bottom: 8px; }
.stat-card strong { font-size: 25px; }
.stat-card.accent { border-color: var(--theme-info-border); background: var(--theme-info-soft); }
.stat-card.warning { border-color: var(--theme-warning-border); background: var(--theme-warning-soft); }
.cutoff-text { margin: 14px 0 0; color: var(--theme-text-muted); font-size: 13px; }
.unsaved-text { margin: 14px 0 0; color: var(--theme-warning-text); font-size: 13px; font-weight: 700; }
.table-wrap { overflow-x: auto; margin-top: 18px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 13px 12px; border-bottom: 1px solid var(--theme-border); text-align: left; white-space: nowrap; }
th { color: var(--theme-text-muted); font-size: 12px; text-transform: uppercase; }
td { color: var(--theme-text-secondary); font-size: 13px; }
.trigger-badge { display: inline-block; padding: 5px 9px; border-radius: 999px; background: var(--theme-info-soft); color: var(--theme-info-text); font-weight: 700; }
.trigger-badge.automatic { background: var(--theme-purple-soft); color: var(--theme-purple-text); }
.empty-log, .loading-card { text-align: center; color: var(--theme-text-muted); }
.modal-overlay { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: var(--theme-overlay); }
.confirm-modal { width: min(440px, 100%); padding: 28px; border-radius: 16px; background: var(--theme-surface); border: 1px solid var(--theme-border); text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,.35); }
.modal-icon { width: 52px; height: 52px; display: grid; place-items: center; margin: 0 auto 14px; border-radius: 50%; background: var(--theme-danger-soft); color: var(--theme-danger-text); }
.modal-icon svg { width: 28px; }
.confirm-modal h3 { margin: 0 0 10px; }
.confirm-modal p { color: var(--theme-text-secondary); line-height: 1.55; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }
@media (max-width: 900px) { .retention-page { padding: 20px 16px 36px; } .setting-grid { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .page-header, .section-title, .settings-footer { align-items: stretch; flex-direction: column; } .stats-grid { grid-template-columns: 1fr; } .modal-actions { flex-direction: column-reverse; } }
</style>
