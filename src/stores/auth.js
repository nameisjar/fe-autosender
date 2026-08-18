import { defineStore } from 'pinia';
import { userApi, revokeSessionInBackground, setLogoutInProgress } from '../api/http.js';
import { refreshSocketAuth } from '../api/socket.js';
import { clearUserSessionState } from '../utils/sessionState.js';

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
                refreshSocketAuth();
            } catch (_) {
                this.me = null;
            }
        },
        logout({ redirect = true } = {}) {
            setLogoutInProgress(true);
            // Revokasi cookie server berjalan paralel dan tidak menahan UI.
            void revokeSessionInBackground();

            this.me = null;
            clearUserSessionState();

            if (redirect) window.location.replace('/login');
        },
    },
});
