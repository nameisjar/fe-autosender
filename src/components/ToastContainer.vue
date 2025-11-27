<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          @mouseenter="pauseTimer(toast.id)"
          @mouseleave="resumeTimer(toast.id)"
        >
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="toast.type === 'warning'" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V13M12 17H12.01M5.07 19H18.93C20.12 19 20.94 17.74 20.41 16.69L13.48 4.33C12.95 3.28 11.05 3.28 10.52 4.33L3.59 16.69C3.06 17.74 3.88 19 5.07 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="toast.type === 'info'" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          
          <div class="toast-content">
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          
          <button class="toast-close" @click="removeToast(toast.id)" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);
const timers = ref({});

const addToast = (toast) => {
  const id = Date.now() + Math.random();
  const duration = toast.duration || 3000;
  
  toasts.value.push({
    id,
    message: toast.message,
    type: toast.type || 'info',
    duration
  });

  // Auto dismiss
  timers.value[id] = setTimeout(() => {
    removeToast(id);
  }, duration);

  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
  if (timers.value[id]) {
    clearTimeout(timers.value[id]);
    delete timers.value[id];
  }
};

const pauseTimer = (id) => {
  if (timers.value[id]) {
    clearTimeout(timers.value[id]);
  }
};

const resumeTimer = (id) => {
  const toast = toasts.value.find(t => t.id === id);
  if (toast) {
    timers.value[id] = setTimeout(() => {
      removeToast(id);
    }, 1000); // Resume dengan 1 detik sisa
  }
};

defineExpose({ addToast, removeToast });
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  max-width: 420px;
  padding: 14px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
  pointer-events: auto;
  backdrop-filter: blur(8px);
  border: 1px solid;
  transition: all 0.2s ease;
}

.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 3px 8px rgba(0, 0, 0, 0.06);
}

/* Success - Green */
.toast-success {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
  color: #166534;
}

.toast-success .toast-icon {
  color: #16a34a;
  background: #bbf7d0;
}

/* Error - Red */
.toast-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
  color: #991b1b;
}

.toast-error .toast-icon {
  color: #dc2626;
  background: #fecaca;
}

/* Warning - Yellow */
.toast-warning {
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
  border-color: #fde047;
  color: #854d0e;
}

.toast-warning .toast-icon {
  color: #ca8a04;
  background: #fef08a;
}

/* Info - Blue */
.toast-info {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #93c5fd;
  color: #1e40af;
}

.toast-info .toast-icon {
  color: #2563eb;
  background: #bfdbfe;
}

.toast-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-icon svg {
  width: 18px;
  height: 18px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  color: currentColor;
  opacity: 0.6;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.toast-close svg {
  width: 14px;
  height: 14px;
}

/* Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .toast-container {
    top: 16px;
    right: 16px;
    left: 16px;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .toast-container {
    top: 12px;
    right: 12px;
    left: 12px;
  }
  
  .toast {
    padding: 12px 14px;
    gap: 10px;
  }
  
  .toast-icon {
    width: 28px;
    height: 28px;
  }
  
  .toast-icon svg {
    width: 16px;
    height: 16px;
  }
  
  .toast-message {
    font-size: 13px;
  }
}
</style>
