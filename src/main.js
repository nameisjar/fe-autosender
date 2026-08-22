import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';
import { initializeTheme } from './composables/useTheme.js';
import './styles/theme.css';

initializeTheme();

if ('serviceWorker' in navigator) {
    window.__inboxNotificationServiceWorker = navigator.serviceWorker
        .register('/inbox-notification-sw.js')
        .catch(() => null);
}

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
