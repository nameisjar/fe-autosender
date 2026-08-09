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

    <!-- Sidebar Component -->
    <Sidebar :is-open="sidebarOpen" @close="closeSidebar" />

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "../components/layout/Sidebar.vue";

const sidebarOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};
</script>

<style scoped>
/* Layout */
.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100vh;
  background: var(--theme-bg);
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
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.hamburger:hover {
  background: var(--theme-surface-hover);
  border-color: var(--theme-border-strong);
}

.hamburger:active {
  transform: scale(0.95);
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--theme-text-secondary);
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Main Content */
main {
  padding: 32px;
  overflow: auto;
  background: var(--theme-bg);
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

  main {
    padding: 80px 16px 16px 16px;
  }
}

@media (max-width: 480px) {
  main {
    padding: 72px 12px 12px 12px;
  }
}
</style>
