import { ref } from 'vue';

// Global toast instance
let toastInstance = null;

export function setToastInstance(instance) {
  toastInstance = instance;
}

export function useToast() {
  const show = (message, type = 'info', duration = 3000) => {
    if (!toastInstance) {
      console.warn('Toast instance not found. Make sure ToastContainer is mounted in App.vue');
      return;
    }
    return toastInstance.addToast({ message, type, duration });
  };

  const success = (message, duration = 3000) => {
    return show(message, 'success', duration);
  };

  const error = (message, duration = 3000) => {
    return show(message, 'error', duration);
  };

  const warning = (message, duration = 3000) => {
    return show(message, 'warning', duration);
  };

  const info = (message, duration = 3000) => {
    return show(message, 'info', duration);
  };

  return {
    show,
    success,
    error,
    warning,
    info
  };
}
