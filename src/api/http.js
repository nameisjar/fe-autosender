import axios from 'axios';

// Prefer explicit API base if provided (works for both dev & prod).
// Fall back to Vite proxy in dev, or current origin in prod.
const API_BASE =
    (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    (import.meta.env && import.meta.env.DEV ? '' : window.location.origin);

// Lightweight global request scheduler to avoid bursts across all API instances
const MIN_INTERVAL_MS = Number(
    (import.meta.env && import.meta.env.VITE_API_MIN_INTERVAL_MS) || 300,
); // default ~3 req/s
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scheduler = (() => {
    const queue = [];
    let pumping = false;
    const schedule = () =>
        new Promise((resolve) => {
            queue.push(resolve);
            if (!pumping) pump();
        });
    const pump = () => {
        if (queue.length === 0) {
            pumping = false;
            return;
        }
        pumping = true;
        const resolve = queue.shift();
        resolve();
        setTimeout(pump, MIN_INTERVAL_MS);
    };
    return { schedule };
})();

// Simple retry/backoff helper for 429/503
async function maybeRetry(err, instance) {
    const config = err && err.config;
    const status = err && err.response && err.response.status;
    if (!config || !instance) throw err;
    // avoid retrying non-idempotent methods (POST)
    const method = (config.method || 'get').toLowerCase();
    if (!['get', 'delete', 'put', 'patch'].includes(method)) throw err;

    const shouldRetry = status === 429 || status === 503;
    if (!shouldRetry) throw err;

    config.__retryCount = (config.__retryCount || 0) + 1;
    const maxRetries = Number((import.meta.env && import.meta.env.VITE_API_MAX_RETRIES) || 3);
    if (config.__retryCount > maxRetries) throw err;

    // Honor Retry-After header (seconds) if present
    const ra =
        err.response &&
        (err.response.headers?.['retry-after'] || err.response.headers?.['Retry-After']);
    let delayMs = 0;
    if (ra) {
        const sec = Number(ra);
        delayMs = isNaN(sec) ? 0 : sec * 1000;
    }
    // Fallback exponential backoff with jitter
    if (!delayMs) {
        const base = 750 * Math.pow(2, config.__retryCount - 1);
        const jitter = Math.random() * 250;
        delayMs = base + jitter;
    }

    await sleep(delayMs);
    // Respect scheduler before retry
    await scheduler.schedule();
    return instance(config);
}

export const userApi = axios.create({ baseURL: API_BASE });

userApi.interceptors.request.use(async (config) => {
    // space out requests globally
    await scheduler.schedule();
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

userApi.interceptors.response.use(
    (r) => r,
    async (err) => {
        if (err && err.response && err.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(err);
        }
        // Retry/backoff
        try {
            return await maybeRetry(err, userApi);
        } catch (e) {
            return Promise.reject(e);
        }
    },
);

export const deviceApi = axios.create({ baseURL: API_BASE + '/api' });

// 🆕 Cache untuk API key per session (dalam memory, tidak di localStorage)
const deviceApiKeyCache = new Map();

// Helper to fetch device detail and get API key securely
async function fetchDeviceApiKey(deviceId) {
    if (!deviceId) {
        console.error('[fetchDeviceApiKey] No deviceId provided');
        return null;
    }
    
    // Check memory cache first
    if (deviceApiKeyCache.has(deviceId)) {
        // console.log('[fetchDeviceApiKey] Using cached API key for device:', deviceId);
        return deviceApiKeyCache.get(deviceId);
    }
    
    // console.log('[fetchDeviceApiKey] Fetching API key for device:', deviceId);
    
    // Fetch from backend
    const paths = [
        `/devices/${encodeURIComponent(deviceId)}`,
        `/tutors/devices/${encodeURIComponent(deviceId)}`,
    ];
    
    for (const p of paths) {
        try {
            // console.log('[fetchDeviceApiKey] Trying path:', p);
            const { data } = await userApi.get(p);
            
            if (data && data.apiKey) {
                // console.log('[fetchDeviceApiKey] ✅ API key found for device:', deviceId);
                // ✅ Cache in memory only (not localStorage)
                deviceApiKeyCache.set(deviceId, data.apiKey);
                return data.apiKey;
            } else {
                // console.warn('[fetchDeviceApiKey] ⚠️ Response has no apiKey:', data);
            }
        } catch (error) {
            // console.warn('[fetchDeviceApiKey] Failed to fetch from path:', p, error?.response?.status || error?.message);
        }
    }
    
    console.error('[fetchDeviceApiKey] ❌ Could not retrieve API key for device:', deviceId);
    return null;
}

// 🆕 Clear API key cache (called on logout or device change)
export function clearDeviceApiKeyCache() {
    deviceApiKeyCache.clear();
}

// Enhanced deviceApi interceptor - Session-based approach
deviceApi.interceptors.request.use(async (config) => {
    await scheduler.schedule();
    
    // 🆕 Get deviceId from localStorage (only ID, not API key)
    const deviceId = localStorage.getItem('device_selected_id');
    
    if (deviceId) {
        // 🔐 Fetch API key securely from backend (cached in memory)
        const apiKey = await fetchDeviceApiKey(deviceId);
        if (apiKey) {
            config.headers['X-Forwardin-Key-Device'] = apiKey;
        } else {
            // console.warn('Could not retrieve API key for device:', deviceId);
        }
    } else {
        // Fallback: auto-select first available device
        try {
            const { data: devices } = await userApi.get('/devices');
            const list = Array.isArray(devices) ? devices : [];
            if (list.length > 0) {
                const current = list.find((d) => d.status === 'open') || list[0];
                if (current && current.id) {
                    localStorage.setItem('device_selected_id', current.id);
                    localStorage.setItem('device_selected_name', current.name || '');
                    
                    const apiKey = await fetchDeviceApiKey(current.id);
                    if (apiKey) {
                        config.headers['X-Forwardin-Key-Device'] = apiKey;
                    }
                }
            }
        } catch (err) {
            console.error('Error auto-selecting device:', err);
        }
    }
    
    return config;
});

deviceApi.interceptors.response.use(
    (r) => r,
    async (err) => {
        if (err && err.response && err.response.status === 401) {
            // console.warn('Device API unauthorized. Device session may be closed.');
            
            // 🔐 Clear memory cache (not localStorage)
            const deviceId = localStorage.getItem('device_selected_id');
            if (deviceId) {
                deviceApiKeyCache.delete(deviceId);
            }
            
            // 🔔 Notify app that device session is closed
            try {
                window.dispatchEvent(new CustomEvent('wa:device-session-closed', {
                    detail: { deviceId }
                }));
            } catch (_) {}
            
            return Promise.reject(err);
        }
        
        // Retry/backoff for 429/503
        try {
            return await maybeRetry(err, deviceApi);
        } catch (e) {
            return Promise.reject(e);
        }
    },
);

export default { userApi, deviceApi, clearDeviceApiKeyCache };
