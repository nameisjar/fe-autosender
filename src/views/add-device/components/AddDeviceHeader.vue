<template>
  <div class="page-header">
    <div class="header-content">
      <h2>
        <svg class="header-icon" viewBox="0 0 24 24" fill="none">
          <rect
            x="5"
            y="2"
            width="14"
            height="20"
            rx="2"
            ry="2"
            stroke="currentColor"
            stroke-width="2"
          />
          <line
            x1="12"
            y1="18"
            x2="12.01"
            y2="18"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
        Kelola Device WhatsApp
      </h2>
      <p class="subtitle">Kelola dan hubungkan perangkat WhatsApp untuk mengirim pesan</p>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        <div>
          <div class="stat-value">{{ devices.length }}</div>
          <div class="stat-label">Total Device</div>
        </div>
      </div>

      <div class="stat-card stat-success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div>
          <div class="stat-value">
            {{ devices.filter((d) => String(d.status).toLowerCase() === 'open').length }}
          </div>
          <div class="stat-label">Terhubung</div>
        </div>
      </div>

      <div class="stat-card stat-warning">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12" y2="16" />
        </svg>

        <div>
          <div class="stat-value">
            {{ devices.filter((d) => String(d.status).toLowerCase() !== 'open').length }}
          </div>
          <div class="stat-label">Belum Terhubung</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  devices: { type: Array, default: () => [] },
});
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.header-content {
  margin-bottom: 24px;
}

.header-content h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.header-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
  stroke-width: 2.5;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.stat-card svg {
  width: 40px;
  height: 40px;
  color: #3b82f6;
  flex-shrink: 0;
}

.stat-card.stat-success svg {
  color: #10b981;
}

.stat-card.stat-warning svg {
  color: #f59e0b;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}
</style>
