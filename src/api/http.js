import axios from 'axios';

// Prefer explicit API base if provided (works for both dev & prod).
// Fall back to Vite proxy in dev, or current origin in prod.
const API_BASE =
    (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    (import.meta.env && import.meta.env.DEV
        ? ''
        : typeof window !== 'undefined'
          ? window.location.origin
          : '');

export { API_BASE };

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
    // Optimasi: Hanya throttle request non-GET (POST, PUT, DELETE)
    // Request GET (baca data) dibiarkan langsung jalan agar UI responsif
    if (config.method && config.method.toLowerCase() !== 'get') {
        await scheduler.schedule();
    }

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

// NOTE: internal FE uses /api as token-only (device access token).
// FE must NOT send X-Forwardin-Key-Device or call /api-external.
export const deviceApi = axios.create({ baseURL: API_BASE + '/api' });

// Cache device access token (in-memory) per deviceId
const deviceAccessTokenCache = new Map();

async function fetchDeviceAccessToken(deviceId) {
    if (!deviceId) return null;

    const cached = deviceAccessTokenCache.get(deviceId);
    const now = Date.now();
    if (cached && cached.token && cached.expiresAtMs && cached.expiresAtMs - now > 15_000) {
        return cached.token;
    }

    try {
        const { data } = await userApi.post(`/devices/${encodeURIComponent(deviceId)}/access-token`);
        const token = data && data.token;
        const ttl = (data && data.expiresIn) || '2m';

        // best-effort parse ttl
        let ttlMs = 120_000;
        if (typeof ttl === 'number') ttlMs = ttl * 1000;
        if (typeof ttl === 'string') {
            const m = ttl.match(/^\s*(\d+)\s*(ms|s|m|h)\s*$/i);
            if (m) {
                const n = Number(m[1]);
                const unit = m[2].toLowerCase();
                ttlMs = unit === 'ms' ? n : unit === 's' ? n * 1000 : unit === 'm' ? n * 60_000 : n * 3_600_000;
            }
        }

        if (token) {
            deviceAccessTokenCache.set(deviceId, { token, expiresAtMs: now + ttlMs });
            return token;
        }
    } catch (e) {
        // silent; caller will proceed without token and backend will reject
    }

    return null;
}

// Clear device access token cache (called on logout or device change)
export function clearDeviceAccessTokenCache() {
    deviceAccessTokenCache.clear();
}

// Enhanced deviceApi interceptor - token-only approach
deviceApi.interceptors.request.use(async (config) => {
    // Optimasi: Hanya throttle request non-GET untuk device API juga
    if (config.method && config.method.toLowerCase() !== 'get') {
        await scheduler.schedule();
    }

    const deviceId = localStorage.getItem('device_selected_id');

    if (deviceId) {
        // Attach device access token
        const dat = await fetchDeviceAccessToken(deviceId);
        if (dat) {
            config.headers.Authorization = `Bearer ${dat}`;
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

                    const dat = await fetchDeviceAccessToken(current.id);
                    if (dat) {
                        config.headers.Authorization = `Bearer ${dat}`;
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
            
            // Clear memory cache (not localStorage)
            const deviceId = localStorage.getItem('device_selected_id');
            if (deviceId) {
                deviceAccessTokenCache.delete(deviceId);
            }
            
            // Notify app that device session is closed
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

export default { userApi, deviceApi, clearDeviceAccessTokenCache };
