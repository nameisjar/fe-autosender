import { defineStore } from 'pinia';
import { userApi, clearDeviceAccessTokenCache } from '../api/http.js';

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
            
            // 🧹 Clear localStorage (except device selection for faster re-login)
            localStorage.removeItem('token');
            // Optionally clear device selection too:
            // localStorage.removeItem('device_selected_id');
            // localStorage.removeItem('device_selected_name');
            
            // Redirect to login
            window.location.href = '/login';
        },
    },
});
