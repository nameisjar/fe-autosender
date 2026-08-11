import { ref } from 'vue';

// Global toast instance
let toastInstance = null;

export function setToastInstance(instance) {
  toastInstance = instance;
}

export function useToast() {
  const show = (message, type = 'info', duration = 3000, options = {}) => {
    if (!toastInstance) {
      // console.warn('Toast instance not found. Make sure ToastContainer is mounted in App.vue');
      return;
    }
    return toastInstance.addToast({ message, type, duration, ...options });
  };

  const success = (message, duration = 3000, options = {}) => {
    return show(message, 'success', duration, options);
  };

  const error = (message, duration = 3000, options = {}) => {
    return show(message, 'error', duration, options);
  };

  const warning = (message, duration = 3000, options = {}) => {
    return show(message, 'warning', duration, options);
  };

  const info = (message, duration = 3000, options = {}) => {
    return show(message, 'info', duration, options);
  };

  return {
    show,
    success,
    error,
    warning,
    info
  };
}
