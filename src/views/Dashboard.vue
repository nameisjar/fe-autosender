<template>
  <div class="layout">
    <!-- Hamburger Button (Mobile Only) -->
    <button class="hamburger" @click="toggleSidebar" :class="{ active: sidebarOpen }">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Overlay (Mobile Only) -->
    <div class="overlay" v-if="sidebarOpen" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <aside :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="brand">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Messages Square Icon - Multiple Chat Bubbles -->
            <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/>
          </svg>
          <h3>Autosender</h3>
        </div>
        <button class="close-btn" @click="closeSidebar">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <nav>
        <div class="nav-section">
          <span class="nav-label">MENU UTAMA</span>
          <router-link to="/add-device" @click="closeSidebar">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Device</span>
          </router-link>
          <router-link to="/contacts" @click="closeSidebar">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Kontak</span>
          </router-link>
          <router-link to="/broadcasts" @click="closeSidebar">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
              <path d="m21.854 2.147-10.94 10.939"/>
            </svg>
            <span>Broadcast</span>
          </router-link>
          <router-link to="/schedule-reminder" @click="closeSidebar">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M3.05 11H5M3.05 13H5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Broadcast Berulang</span>
          </router-link>
          <router-link to="/schedule-feedback" @click="closeSidebar">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <circle cx="9" cy="10" r="1"/>
              <circle cx="12" cy="10" r="1"/>
              <circle cx="15" cy="10" r="1"/>
            </svg>
            <span>Feedback (Algo)</span>
          </router-link>
          <router-link to="/reminder-algo" @click="closeSidebar">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Reminder (Algo)</span>
          </router-link>
          <router-link to="/schedules" @click="closeSidebar">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Jadwal Saya</span>
          </router-link>
        </div>

        <!-- Admin-only menus -->
        <template v-if="isAdmin">
          <div class="nav-divider"></div>
          <div class="nav-section">
            <span class="nav-label">ADMIN</span>
            <router-link to="/templates" @click="closeSidebar">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Templates</span>
            </router-link>
            <router-link to="/admin/tutors" @click="closeSidebar">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Kelola Tutor</span>
            </router-link>
            <router-link to="/admin/sent-history" @click="closeSidebar">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 8L12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Semua Pesan Terkirim</span>
            </router-link>
          </div>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" v-if="me">
          <div class="avatar">
            <img v-if="profilePictureUrl" :src="profilePictureUrl" alt="Profile" class="avatar-img" />
            <span v-else>{{ getInitials(me.firstName) }}</span>
          </div>
          <div class="user-details">
            <div class="user-name">{{ me.firstName }}</div>
            <div class="user-role">
              <span v-if="me.privilege?.name === 'cs'">Tutor</span>
              <span v-else-if="me.privilege?.name === 'super admin'">Admin</span>
              <span v-else>User</span>
            </div>
          </div>
        </div>
        <button class="logout-btn" @click="logout">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17L21 12L16 7M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { useGroups } from '../composables/useGroups.js';
import { deviceApi } from '../api/http.js';

const router = useRouter();
const auth = useAuthStore();
const { clearGroups } = useGroups();

const sidebarOpen = ref(false);
const profilePictureUrl = ref(null);

// 🆕 Watch untuk device_selected_id dari localStorage
const selectedDeviceId = ref(localStorage.getItem('device_selected_id'));

onMounted(async () => {
  await auth.fetchMe();
  await fetchProfilePicture();
});

const me = computed(() => auth.me);
const isAdmin = computed(() => auth.isAdmin);

// Fungsi untuk mengambil foto profil WhatsApp
const fetchProfilePicture = async () => {
  try {
    const { data } = await deviceApi.get('/messages/get-profile', {
      params: { recipient: 'me', resolution: 'high' }
    });
    if (data && data.profilePictureUrl) {
      profilePictureUrl.value = data.profilePictureUrl;
    } else {
      // Reset ke null jika tidak ada foto profil
      profilePictureUrl.value = null;
    }
  } catch (error) {
    console.warn('Failed to fetch profile picture:', error);
    // Reset ke null jika gagal
    profilePictureUrl.value = null;
  }
};

// 🆕 Watch perubahan device dari localStorage
// Menggunakan setInterval untuk polling localStorage changes
let storageWatcher = null;
onMounted(() => {
  storageWatcher = setInterval(() => {
    const currentDeviceId = localStorage.getItem('device_selected_id');
    if (currentDeviceId !== selectedDeviceId.value) {
      console.log('[Dashboard] Device berubah dari', selectedDeviceId.value, 'ke', currentDeviceId);
      selectedDeviceId.value = currentDeviceId;
      
      // Auto-refresh foto profil
      if (currentDeviceId) {
        console.log('[Dashboard] Auto-refresh foto profil untuk device:', currentDeviceId);
        fetchProfilePicture();
      } else {
        // Jika tidak ada device, reset foto profil
        profilePictureUrl.value = null;
      }
    }
  }, 500); // Check every 500ms
});

// Cleanup saat component unmount
onUnmounted(() => {
  if (storageWatcher) {
    clearInterval(storageWatcher);
    storageWatcher = null;
  }
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

const logout = () => {
  clearGroups();
  localStorage.removeItem('token');
  localStorage.removeItem('device_api_key');
  localStorage.removeItem('device_selected_id');
  localStorage.removeItem('device_selected_name');
  closeSidebar();
  router.push('/login');
};
</script>

<style scoped>
/* Layout */
.layout { 
  display: grid; 
  grid-template-columns: 280px 1fr; 
  height: 100vh;
  background: #f8fafc;
}

/* Hamburger Button (Hidden on Desktop) */
.hamburger {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1001;
  width: 44px;
  height: 44px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.hamburger:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.hamburger:active {
  transform: scale(0.95);
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #334155;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Overlay (Mobile Only) */
.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Sidebar */
aside { 
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex; 
  flex-direction: column;
  overflow-y: auto;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 12px rgba(0,0,0,0.04);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.sidebar-header h3 { 
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #3b82f6;
  letter-spacing: -0.5px;
}

.close-btn {
  display: none;
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
}

.close-btn svg {
  width: 18px;
  height: 18px;
  color: #475569;
}

/* Navigation */
nav { 
  flex: 1;
  padding: 16px 12px;
  display: flex; 
  flex-direction: column; 
  gap: 4px;
  overflow-y: auto;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  padding: 12px 16px 8px 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 12px 16px;
}

nav a { 
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none; 
  color: #475569; 
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

nav a:hover {
  background: #f1f5f9;
  color: #1e293b;
}

nav a.router-link-active { 
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

nav a.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: #fff;
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

nav a.router-link-active .nav-icon {
  color: #ffffff;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #ffffff;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  overflow: hidden;
  position: relative;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #64748b;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #ef4444;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.logout-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.logout-btn svg {
  width: 18px;
  height: 18px;
}

/* Main Content */
main { 
  padding: 32px;
  overflow: auto;
  background: #f8fafc;
}

/* Scrollbar Styling */
aside::-webkit-scrollbar,
nav::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track,
nav::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb,
nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

aside::-webkit-scrollbar-thumb:hover,
nav::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
  
  .hamburger {
    display: flex;
  }
  
  .overlay {
    display: block;
  }
  
  aside {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    z-index: 1000;
    transform: translateX(-100%);
    box-shadow: 4px 0 24px rgba(0,0,0,0.15);
  }
  
  aside.open {
    transform: translateX(0);
  }
  
  .close-btn {
    display: flex;
  }
  
  main {
    padding: 80px 16px 16px 16px;
  }
}

@media (max-width: 480px) {
  aside {
    width: 260px;
  }
  
  .sidebar-header {
    padding: 16px;
  }
  
  .logo-icon {
    width: 28px;
    height: 28px;
  }
  
  .sidebar-header h3 {
    font-size: 18px;
  }
  
  nav a {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .nav-icon {
    width: 18px;
    height: 18px;
  }
  
  main {
    padding: 72px 12px 12px 12px;
  }
}
</style>