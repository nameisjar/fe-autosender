import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';
import { initializeTheme } from './composables/useTheme.js';
import './styles/theme.css';

initializeTheme();

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
