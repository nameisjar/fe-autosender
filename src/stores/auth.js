import { defineStore } from 'pinia';
import { userApi, clearDeviceAccessTokenCache } from '../api/http.js';
import { refreshSocketAuth, resetSocket } from '../api/socket.js';
import { prefetchAfterLogin } from '../utils/prefetch.js';
import { indexedDBCache } from '../utils/indexedDBCache.js';

export const useAuthStore = defineStore('auth', {
    state: () => ({ me: null }),
    getters: {
        isAdmin: (state) => {
            const name = state.me?.privilege?.name || '';
            return name === 'admin' || name === 'super admin';
        },
        roleName: (state) => state.me?.privilege?.name || '',
    },
    actions: {
        async fetchMe() {
            try {
                const { data } = await userApi.get('/tutors/me');
                this.me = data;
                // 🔄 Refresh socket auth after successful login/fetch
                refreshSocketAuth();
                // 🚀 Prefetch data in background for instant loading
                prefetchAfterLogin();
            } catch (_) {
                this.me = null;
            }
        },
        // 🆕 Logout action dengan clear cache
        logout() {
            // Clear user state
            this.me = null;
            
            // 🔐 Clear device access token cache from memory
            clearDeviceAccessTokenCache();
            
            // 🔌 Reset socket connection
            resetSocket();
            
            // 🧹 Clear IndexedDB cache
            indexedDBCache.invalidate();
            
            // 🧹 Clear localStorage (except device selection for faster re-login)
            try {
                localStorage.removeItem('token');
                // Optionally clear device selection too:
                // localStorage.removeItem('device_selected_id');
                // localStorage.removeItem('device_selected_name');
            } catch (e) {
                // localStorage may not be available in incognito mode
                console.warn('Could not clear localStorage:', e);
            }
            
            // Redirect to login
            window.location.href = '/login';
        },
    },
});
