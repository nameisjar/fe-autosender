<template>
  <div class="wrapper">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg
            class="header-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Monitoring System
        </h2>
        <p class="subtitle">Pantau kesehatan sistem dan analitik pesan secara real-time</p>
      </div>

      <!-- Connection Status -->
      <div class="connection-status" :class="{ connected: isSocketConnected }">
        <span class="status-dot"></span>
        <span>{{ isSocketConnected ? 'Real-time Connected' : 'Connecting...' }}</span>
      </div>
    </div>

    <!-- System Health Section -->
    <section class="health-section">
      <div class="section-header">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          System Health
        </h3>
        <button class="btn-refresh" @click="loadOverview" :disabled="loading">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            :class="{ spinning: loading }"
          >
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path
              d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
            />
          </svg>
          Refresh
        </button>
      </div>

      <!-- Health Cards Grid -->
      <div class="health-grid">
        <!-- Server Status -->
        <div class="health-card" :class="getStatusClass(overview?.status)">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-label">Server Status</div>
            <div class="card-value">{{ overview?.status || 'Loading...' }}</div>
            <div class="card-meta">Uptime: {{ overview?.uptime?.formatted || '-' }}</div>
          </div>
        </div>

        <!-- Database Status -->
        <div class="health-card" :class="getStatusClass(overview?.database?.status)">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-label">Database</div>
            <div class="card-value">{{ overview?.database?.status || 'Loading...' }}</div>
            <div class="card-meta">Latency: {{ overview?.database?.latencyMs || 0 }}ms</div>
          </div>
        </div>

        <!-- PDF Generator Status -->
        <div class="health-card" :class="getStatusClass(overview?.pdfGenerator?.status)">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-label">PDF Generator</div>
            <div class="card-value">{{ overview?.pdfGenerator?.status || 'Loading...' }}</div>
            <div class="card-meta">
              Queue: {{ overview?.pdfGenerator?.queue?.queueLength || 0 }} pending
            </div>
          </div>
        </div>

        <!-- WhatsApp Sessions -->
        <div class="health-card" :class="overview?.whatsapp?.connectedSessions > 0 ? 'healthy' : 'warning'">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-label">WhatsApp Sessions</div>
            <div class="card-value">{{ overview?.whatsapp?.connectedSessions || 0 }} Connected</div>
            <div class="card-meta">
              Total Devices: {{ overview?.devices?.total || 0 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <div>
            <div class="stat-value">{{ overview?.devices?.total || 0 }}</div>
            <div class="stat-label">Total Devices</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <div>
            <div class="stat-value">{{ overview?.messages?.last24h?.total || 0 }}</div>
            <div class="stat-label">Pesan (24 Jam)</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <div class="stat-value">{{ overview?.broadcasts?.pending || 0 }}</div>
            <div class="stat-label">Broadcast Pending</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <div class="stat-value">{{ overview?.responseTime || 0 }}ms</div>
            <div class="stat-label">Response Time</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Device Status Section -->
    <section class="devices-section">
      <div class="section-header">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          Device Status
        </h3>
        <div class="device-summary">
          <span class="connected">
            <span class="dot green"></span>
            {{ deviceSummary.connected }} Connected
          </span>
          <span class="disconnected">
            <span class="dot red"></span>
            {{ deviceSummary.disconnected }} Disconnected
          </span>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="table-filters">
        <div class="filter-group">
          <div class="search-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              v-model="deviceFilters.search"
              placeholder="Cari nama atau nomor..."
              @input="debouncedLoadDevices"
            />
          </div>

          <select v-model="deviceFilters.status" @change="loadDevices" class="filter-select">
            <option value="all">Semua Status</option>
            <option value="connected">Connected</option>
            <option value="disconnected">Disconnected</option>
          </select>

          <select v-model="deviceFilters.sortBy" @change="loadDevices" class="filter-select">
            <option value="updatedAt">Terakhir Update</option>
            <option value="name">Nama</option>
            <option value="phone">Nomor</option>
            <option value="messageCount">Total Pesan</option>
          </select>

          <select v-model="deviceFilters.sortOrder" @change="loadDevices" class="filter-select">
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </select>

          <select v-model="deviceFilters.limit" @change="loadDevices" class="filter-select">
            <option :value="5">5 / halaman</option>
            <option :value="10">10 / halaman</option>
            <option :value="25">25 / halaman</option>
            <option :value="50">50 / halaman</option>
          </select>
        </div>
      </div>

      <!-- Device Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Nama Device</th>
              <th>Nomor Telepon</th>
              <th>User</th>
              <th>Total Pesan</th>
              <th>Terakhir Update</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingDevices">
              <td colspan="6" class="loading-row">
                <div class="spinner"></div>
                <span>Memuat data...</span>
              </td>
            </tr>
            <tr
              v-else
              v-for="device in devices"
              :key="device.id"
              :class="{ 'row-connected': device.isConnected, 'row-disconnected': !device.isConnected }"
            >
              <td>
                <span class="status-badge" :class="device.isConnected ? 'online' : 'offline'">
                  <span class="status-dot"></span>
                  {{ device.isConnected ? 'Connected' : 'Disconnected' }}
                </span>
              </td>
              <td class="device-name-cell">{{ device.name || 'Unnamed Device' }}</td>
              <td>{{ device.phone || '-' }}</td>
              <td>{{ device.user?.firstName || 'No User' }}</td>
              <td class="message-count-cell">
                <span class="message-count" :title="`Broadcast: ${device.broadcastCount || 0}, Outgoing: ${device.outgoingCount || 0}`">
                  {{ formatNumber(device.messageCount || 0) }}
                </span>
              </td>
              <td class="date-cell">{{ formatDateTime(device.updatedAt) }}</td>
            </tr>
            <tr v-if="!loadingDevices && devices.length === 0">
              <td colspan="6" class="empty-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <span>Tidak ada device ditemukan</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="pagination.totalPages > 1">
        <div class="pagination-info">
          Menampilkan {{ paginationStart }}-{{ paginationEnd }} dari {{ pagination.totalItems }} device
        </div>
        <div class="pagination-controls">
          <button
            class="pagination-btn"
            :disabled="!pagination.hasPrev"
            @click="goToPage(pagination.page - 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          <button
            v-for="pageNum in visiblePages"
            :key="pageNum"
            class="pagination-btn"
            :class="{ active: pageNum === pagination.page }"
            @click="goToPage(pageNum)"
          >
            {{ pageNum }}
          </button>

          <button
            class="pagination-btn"
            :disabled="!pagination.hasNext"
            @click="goToPage(pagination.page + 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Message Analytics Section -->
    <section class="analytics-section">
      <div class="section-header">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Message Analytics ({{ analytics?.period?.days || 7 }} Hari Terakhir)
        </h3>
        <div class="period-selector">
          <button
            v-for="days in [7, 14, 30]"
            :key="days"
            class="period-btn"
            :class="{ active: selectedPeriod === days }"
            @click="loadAnalytics(days)"
          >
            {{ days }} Hari
          </button>
        </div>
      </div>

      <!-- Analytics Summary Cards -->
      <div class="analytics-summary">
        <div class="summary-card">
          <div class="summary-value">{{ analytics?.totals?.total || 0 }}</div>
          <div class="summary-label">Total Pesan</div>
        </div>
        <div class="summary-card success">
          <div class="summary-value">{{ analytics?.totals?.delivered || 0 }}</div>
          <div class="summary-label">Terkirim</div>
          <div class="summary-rate">{{ analytics?.rates?.deliveryRate || 0 }}%</div>
        </div>
        <div class="summary-card info">
          <div class="summary-value">{{ analytics?.totals?.read || 0 }}</div>
          <div class="summary-label">Dibaca</div>
          <div class="summary-rate">{{ analytics?.rates?.readRate || 0 }}%</div>
        </div>
        <div class="summary-card danger">
          <div class="summary-value">{{ analytics?.totals?.failed || 0 }}</div>
          <div class="summary-label">Gagal</div>
          <div class="summary-rate">{{ analytics?.rates?.failureRate || 0 }}%</div>
        </div>
      </div>

      <!-- Simple Chart -->
      <div class="chart-container">
        <div class="chart-header">
          <div class="chart-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Volume Pesan Harian</span>
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color total"></span> Total
            </span>
            <span class="legend-item">
              <span class="legend-color delivered"></span> Terkirim
            </span>
            <span class="legend-item">
              <span class="legend-color read"></span> Dibaca
            </span>
          </div>
        </div>
        
        <div class="chart-wrapper" v-if="analytics?.daily?.length">
          <!-- Y-axis labels -->
          <div class="chart-y-axis">
            <span class="y-label" v-for="n in 5" :key="n">{{ getYAxisLabel(n - 1) }}</span>
          </div>
          
          <!-- Grid and Bars -->
          <div class="chart-area">
            <!-- Grid lines -->
            <div class="chart-grid">
              <div class="grid-line" v-for="n in 5" :key="n"></div>
            </div>
            
            <!-- Bars -->
            <div class="chart-bars">
              <div
                v-for="(day, index) in analytics?.daily || []"
                :key="index"
                class="bar-wrapper"
              >
                <div class="bar-group">
                  <div
                    class="bar total"
                    :style="{ height: getBarHeight(day.total) + '%' }"
                  >
                    <span class="bar-tooltip">Total: {{ day.total }}</span>
                  </div>
                  <div
                    class="bar delivered"
                    :style="{ height: getBarHeight(day.delivered) + '%' }"
                  >
                    <span class="bar-tooltip">Terkirim: {{ day.delivered }}</span>
                  </div>
                  <div
                    class="bar read"
                    :style="{ height: getBarHeight(day.read) + '%' }"
                  >
                    <span class="bar-tooltip">Dibaca: {{ day.read }}</span>
                  </div>
                </div>
                <div class="bar-label">{{ formatDate(day.date) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- No data message -->
        <div v-else class="chart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          <span>Belum ada data pesan</span>
        </div>
      </div>
    </section>

    <!-- PDF Generator Details -->
    <section class="pdf-section" v-if="overview?.pdfGenerator">
      <div class="section-header">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          PDF Generator Details
        </h3>
      </div>

      <div class="pdf-stats">
        <div class="pdf-stat">
          <span class="label">Browser Status:</span>
          <span class="value" :class="overview.pdfGenerator.browser?.isHealthy ? 'success' : 'danger'">
            {{ overview.pdfGenerator.browser?.isRunning ? 'Running' : 'Stopped' }}
            {{ overview.pdfGenerator.browser?.isHealthy ? '(Healthy)' : '(Unhealthy)' }}
          </span>
        </div>
        <div class="pdf-stat">
          <span class="label">Queue Length:</span>
          <span class="value">{{ overview.pdfGenerator.queue?.queueLength || 0 }}</span>
        </div>
        <div class="pdf-stat">
          <span class="label">Active Tasks:</span>
          <span class="value">{{ overview.pdfGenerator.queue?.activeCount || 0 }} / {{ overview.pdfGenerator.queue?.maxConcurrent || 10 }}</span>
        </div>
        <div class="pdf-stat">
          <span class="label">Processed:</span>
          <span class="value success">{{ overview.pdfGenerator.queue?.processedCount || 0 }}</span>
        </div>
        <div class="pdf-stat">
          <span class="label">Failed:</span>
          <span class="value" :class="overview.pdfGenerator.queue?.failedCount > 0 ? 'danger' : ''">
            {{ overview.pdfGenerator.queue?.failedCount || 0 }}
          </span>
        </div>
        <div class="pdf-stat">
          <span class="label">Consecutive Failures:</span>
          <span class="value" :class="overview.pdfGenerator.browser?.consecutiveFailures > 0 ? 'warning' : ''">
            {{ overview.pdfGenerator.browser?.consecutiveFailures || 0 }}
          </span>
        </div>
      </div>
    </section>

    <!-- Last Update -->
    <div class="last-update">
      Last updated: {{ lastUpdate }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { userApi } from "../api/http.js";
import { connectSocket } from "../api/socket.js";
import { useToast } from "../composables/useToast.js";

const { showToast } = useToast();

// State
const loading = ref(false);
const loadingDevices = ref(false);
const overview = ref(null);
const devices = ref([]);
const analytics = ref(null);
const selectedPeriod = ref(7);
const lastUpdate = ref("-");
const isSocketConnected = ref(false);

// Pagination state
const pagination = ref({
  page: 1,
  limit: 10,
  totalPages: 1,
  totalItems: 0,
  hasNext: false,
  hasPrev: false,
});

// Device filters
const deviceFilters = ref({
  search: "",
  status: "all",
  sortBy: "updatedAt",
  sortOrder: "desc",
  limit: 10,
});

// Device summary from API (more accurate than local calculation)
const deviceSummaryFromApi = ref({
  connected: 0,
  disconnected: 0,
  total: 0,
});

// Debounce timer
let searchDebounceTimer = null;

// Socket instance
let socket = null;

// Computed - Use API summary for accurate counts across all pages
const deviceSummary = computed(() => ({
  connected: deviceSummaryFromApi.value.connected,
  disconnected: deviceSummaryFromApi.value.disconnected,
  total: deviceSummaryFromApi.value.total,
}));

const paginationStart = computed(() => {
  return (pagination.value.page - 1) * pagination.value.limit + 1;
});

const paginationEnd = computed(() => {
  return Math.min(
    pagination.value.page * pagination.value.limit,
    pagination.value.totalItems
  );
});

const visiblePages = computed(() => {
  const total = pagination.value.totalPages;
  const current = pagination.value.page;
  const pages = [];

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i);
    }
  }

  return pages;
});

// Methods
const getStatusClass = (status) => {
  if (!status) return "";
  if (status === "healthy" || status === "ok") return "healthy";
  if (status === "degraded" || status === "warning") return "warning";
  return "error";
};

const getBarHeight = (value) => {
  if (!analytics.value?.daily?.length) return 0;
  const maxValue = Math.max(...analytics.value.daily.map((d) => d.total), 1);
  return (value / maxValue) * 100;
};

const getYAxisLabel = (index) => {
  if (!analytics.value?.daily?.length) return 0;
  const maxValue = Math.max(...analytics.value.daily.map((d) => d.total), 1);
  const step = maxValue / 4;
  return formatNumber(Math.round(step * (4 - index)));
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const updateLastUpdate = () => {
  lastUpdate.value = new Date().toLocaleTimeString("id-ID");
};

// Debounced search
const debouncedLoadDevices = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(() => {
    pagination.value.page = 1;
    loadDevices();
  }, 300);
};

// Pagination
const goToPage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  pagination.value.page = page;
  loadDevices();
};

// API calls
const loadOverview = async () => {
  loading.value = true;
  try {
    const response = await userApi.get("/health/overview");
    overview.value = response.data;
    updateLastUpdate();
  } catch (error) {
    console.error("Failed to load overview:", error);
    const message = error.response?.status === 403 
      ? "Anda tidak memiliki akses ke halaman ini (Admin only)"
      : error.response?.status === 401
      ? "Sesi Anda telah berakhir, silakan login ulang"
      : "Gagal memuat data overview";
    showToast(message, "error");
  } finally {
    loading.value = false;
  }
};

const loadDevices = async () => {
  loadingDevices.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: deviceFilters.value.limit.toString(),
      status: deviceFilters.value.status,
      search: deviceFilters.value.search,
      sortBy: deviceFilters.value.sortBy,
      sortOrder: deviceFilters.value.sortOrder,
    });
    
    const response = await userApi.get(`/health/devices?${params.toString()}`);
    devices.value = response.data.devices || [];
    
    if (response.data.pagination) {
      pagination.value = response.data.pagination;
    }
    
    // Update summary from API for accurate total counts
    if (response.data.summary) {
      deviceSummaryFromApi.value = response.data.summary;
    }
  } catch (error) {
    console.error("Failed to load devices:", error);
    const message = error.response?.status === 403 
      ? "Anda tidak memiliki akses ke data perangkat (Admin only)"
      : "Gagal memuat data perangkat";
    showToast(message, "error");
  } finally {
    loadingDevices.value = false;
  }
};

const loadAnalytics = async (days = 7) => {
  selectedPeriod.value = days;
  try {
    const response = await userApi.get(`/health/analytics/messages?days=${days}`);
    analytics.value = response.data;
  } catch (error) {
    console.error("Failed to load analytics:", error);
    const message = error.response?.status === 403 
      ? "Anda tidak memiliki akses ke data analitik (Admin only)"
      : "Gagal memuat data analitik";
    showToast(message, "error");
  }
};

// Socket setup
const setupSocket = () => {
  socket = connectSocket();

  socket.on("connect", () => {
    isSocketConnected.value = true;
    socket.emit("monitoring:subscribe");
  });

  socket.on("disconnect", () => {
    isSocketConnected.value = false;
  });

  // Handle socket errors (e.g., access denied)
  socket.on("error", (error) => {
    if (error.code === "ACCESS_DENIED") {
      console.warn("Socket monitoring access denied:", error.message);
      // Don't show toast for socket errors - API errors already shown
    }
  });

  socket.on("monitoring:update", (data) => {
    if (overview.value && data.pdfGenerator) {
      overview.value.pdfGenerator = data.pdfGenerator;
    }
    updateLastUpdate();
  });

  socket.on("monitoring:device", (data) => {
    const device = devices.value.find((d) => d.id === data.deviceId);
    if (device) {
      device.isConnected = data.isConnected;
      device.status = data.status;
    }
    updateLastUpdate();
  });

  socket.on("monitoring:message", () => {
    // Increment message count in overview
    if (overview.value?.messages?.last24h) {
      overview.value.messages.last24h.total =
        (overview.value.messages.last24h.total || 0) + 1;
    }
    updateLastUpdate();
  });

  // If already connected, subscribe immediately
  if (socket.connected) {
    isSocketConnected.value = true;
    socket.emit("monitoring:subscribe");
  }
};

const cleanupSocket = () => {
  if (socket) {
    socket.emit("monitoring:unsubscribe");
    socket.off("connect");
    socket.off("disconnect");
    socket.off("error");
    socket.off("monitoring:update");
    socket.off("monitoring:device");
    socket.off("monitoring:message");
  }
};

// Auto-refresh interval
let refreshInterval = null;

onMounted(async () => {
  // Load initial data
  await Promise.all([loadOverview(), loadDevices(), loadAnalytics()]);

  // Setup socket for real-time updates
  setupSocket();

  // Auto-refresh every 60 seconds as fallback (only when socket disconnected)
  refreshInterval = setInterval(() => {
    // Skip polling if socket is connected (real-time updates active)
    if (isSocketConnected.value) return;
    
    loadOverview();
    loadDevices();
  }, 60000); // Increased to 60 seconds to reduce server load
});

onUnmounted(() => {
  cleanupSocket();
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});
</script>

<style scoped>
/* Base Styles */
.wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e293b;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.header-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.subtitle {
  color: #64748b;
  margin: 8px 0 0 0;
  font-size: 0.95rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fef3c7;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #92400e;
}

.connection-status.connected {
  background: #d1fae5;
  color: #065f46;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  animation: pulse 2s infinite;
}

.connection-status.connected .status-dot {
  background: #10b981;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Section Styles */
section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-header h3 svg {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

/* Refresh Button */
.btn-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh svg {
  width: 16px;
  height: 16px;
}

.btn-refresh svg.spinning {
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

/* Health Grid */
.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.health-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;
}

.health-card.healthy {
  border-color: #10b981;
  background: #ecfdf5;
}

.health-card.warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.health-card.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-icon svg {
  width: 24px;
  height: 24px;
  color: #64748b;
}

.health-card.healthy .card-icon svg {
  color: #10b981;
}

.health-card.warning .card-icon svg {
  color: #f59e0b;
}

.health-card.error .card-icon svg {
  color: #ef4444;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 4px;
}

.card-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  text-transform: capitalize;
}

.card-meta {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 4px;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.stat-card svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
}

/* Device Grid */
.device-summary {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
}

.device-summary .connected,
.device-summary .disconnected {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.green {
  background: #10b981;
}

.dot.red {
  background: #ef4444;
}

/* Table Filters */
.table-filters {
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.search-input {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-input svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-input input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 10px 32px 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center;
  cursor: pointer;
  appearance: none;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Message Count Cell */
.message-count-cell {
  text-align: center;
}

.message-count {
  display: inline-block;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

/* Loading Row */
.loading-row {
  text-align: center;
  padding: 40px !important;
  color: #64748b;
}

.loading-row .spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0;
}

.pagination-info {
  font-size: 0.85rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  gap: 4px;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.pagination-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 16px;
  height: 16px;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.data-table tbody tr {
  transition: background 0.15s;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.data-table tbody tr.row-connected {
  background: #f0fdf4;
}

.data-table tbody tr.row-connected:hover {
  background: #dcfce7;
}

.data-table tbody tr.row-disconnected {
  background: #fef2f2;
}

.data-table tbody tr.row-disconnected:hover {
  background: #fee2e2;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.online {
  background: #dcfce7;
  color: #166534;
}

.status-badge.offline {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.device-name-cell {
  font-weight: 600;
  color: #1e293b;
}

.date-cell {
  color: #64748b;
  font-size: 0.85rem;
}

.empty-row {
  text-align: center;
  padding: 40px !important;
  color: #94a3b8;
}

.empty-row svg {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-row span {
  display: block;
}

/* Period Selector */
.period-selector {
  display: flex;
  gap: 8px;
}

.period-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.period-btn:hover {
  background: #f8fafc;
}

.period-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* Analytics Summary */
.analytics-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.summary-card.success {
  background: #ecfdf5;
}

.summary-card.info {
  background: #eff6ff;
}

.summary-card.danger {
  background: #fef2f2;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.summary-card.success .summary-value {
  color: #059669;
}

.summary-card.info .summary-value {
  color: #2563eb;
}

.summary-card.danger .summary-value {
  color: #dc2626;
}

.summary-label {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
}

.summary-rate {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 4px;
}

/* Chart */
.chart-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1rem;
  color: #1e293b;
}

.chart-title i {
  font-size: 1.1rem;
  color: #3b82f6;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748b;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-color.total {
  background: #94a3b8;
}

.legend-color.delivered {
  background: #22c55e;
}

.legend-color.read {
  background: #3b82f6;
}

.chart-wrapper {
  display: flex;
  gap: 12px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 32px;
  min-width: 40px;
  text-align: right;
}

.y-label {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 500;
}

.chart-area {
  flex: 1;
  position: relative;
  height: 220px;
}

.chart-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.grid-line {
  height: 1px;
  background: #f1f5f9;
  width: 100%;
}

.chart-bars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  padding-bottom: 32px;
  gap: 4px;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.bar-group {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  width: 100%;
  height: calc(220px - 32px);
}

.bar {
  width: 28%;
  max-width: 24px;
  min-width: 8px;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.bar:hover {
  opacity: 0.85;
  transform: scaleY(1.02);
  transform-origin: bottom;
}

.bar.total {
  background: linear-gradient(180deg, #94a3b8 0%, #cbd5e1 100%);
}

.bar.delivered {
  background: linear-gradient(180deg, #22c55e 0%, #4ade80 100%);
}

.bar.read {
  background: linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%);
}

.bar-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bar-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1e293b;
}

.bar:hover .bar-tooltip {
  opacity: 1;
  visibility: visible;
}

.bar-label {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 8px;
  text-align: center;
  font-weight: 500;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #94a3b8;
}

.chart-empty i {
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.chart-empty span {
  font-size: 0.9rem;
}

/* PDF Section */
.pdf-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.pdf-stat {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.pdf-stat .label {
  color: #64748b;
  font-size: 0.9rem;
}

.pdf-stat .value {
  font-weight: 600;
  color: #1e293b;
}

.pdf-stat .value.success {
  color: #059669;
}

.pdf-stat .value.warning {
  color: #d97706;
}

.pdf-stat .value.danger {
  color: #dc2626;
}

/* Last Update */
.last-update {
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
  padding: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .health-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: none;
  }

  .filter-select {
    width: 100%;
  }

  .table-container {
    margin: 0 -16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .data-table th,
  .data-table td {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .analytics-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-bars {
    overflow-x: auto;
    padding-bottom: 50px;
  }

  .bar-wrapper {
    min-width: 50px;
  }
}
</style>
