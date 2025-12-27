// Prefetch data saat login untuk instant loading
// Background fetch yang tidak blocking UI

import { userApi } from '../api/http.js';
import { indexedDBCache, CACHE_TTL, CACHE_KEYS } from './indexedDBCache.js';

/**
 * Prefetch all commonly used data after login
 * Runs in background, non-blocking
 */
export async function prefetchAfterLogin() {
  const deviceId = localStorage.getItem('device_selected_id') || '';
  
  console.log('[Prefetch] Starting background prefetch...');
  
  // Run all prefetches in parallel (non-blocking)
  const prefetchTasks = [
    prefetchTemplates(),
    prefetchMonthlyTemplates(),
  ];
  
  // Only prefetch device-specific data if device is selected
  if (deviceId) {
    prefetchTasks.push(
      prefetchContacts(deviceId),
      prefetchLabels(deviceId),
      prefetchGroups(deviceId),
    );
  }
  
  // Run all in parallel, don't wait
  Promise.allSettled(prefetchTasks).then((results) => {
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    console.log(`[Prefetch] Completed: ${succeeded} success, ${failed} failed`);
  });
}

/**
 * Prefetch when device is selected/changed
 */
export async function prefetchForDevice(deviceId) {
  if (!deviceId) return;
  
  console.log(`[Prefetch] Prefetching data for device ${deviceId}...`);
  
  Promise.allSettled([
    prefetchContacts(deviceId),
    prefetchLabels(deviceId),
    prefetchGroups(deviceId),
  ]).then((results) => {
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[Prefetch] Device data: ${succeeded}/3 prefetched`);
  });
}

// --- Individual prefetch functions ---

async function prefetchTemplates() {
  const cacheKey = CACHE_KEYS.TEMPLATES;
  
  // Skip if cache is fresh
  const cached = await indexedDBCache.get(cacheKey);
  if (cached.fromCache && !cached.isStale) {
    console.log('[Prefetch] Templates: using fresh cache');
    return;
  }
  
  try {
    const { data } = await userApi.get('/course/feedbacks');
    const templates = data.feedbacks || [];
    await indexedDBCache.set(cacheKey, templates, CACHE_TTL.TEMPLATES);
    console.log(`[Prefetch] Templates: ${templates.length} items cached`);
  } catch (e) {
    console.warn('[Prefetch] Templates failed:', e.message);
  }
}

async function prefetchMonthlyTemplates() {
  const cacheKey = CACHE_KEYS.MONTHLY_TEMPLATES;
  
  const cached = await indexedDBCache.get(cacheKey);
  if (cached.fromCache && !cached.isStale) {
    console.log('[Prefetch] Monthly templates: using fresh cache');
    return;
  }
  
  try {
    const { data } = await userApi.get('/algorithmics/monthly-templates');
    const templates = data.templates || [];
    await indexedDBCache.set(cacheKey, templates, CACHE_TTL.MONTHLY_TEMPLATES);
    console.log(`[Prefetch] Monthly templates: ${templates.length} items cached`);
  } catch (e) {
    console.warn('[Prefetch] Monthly templates failed:', e.message);
  }
}

async function prefetchContacts(deviceId) {
  const cacheKey = CACHE_KEYS.CONTACTS(deviceId);
  
  const cached = await indexedDBCache.get(cacheKey);
  if (cached.fromCache && !cached.isStale) {
    console.log('[Prefetch] Contacts: using fresh cache');
    return;
  }
  
  try {
    const { data } = await userApi.get('/contacts', {
      params: { deviceId, pageSize: 50 },
    });
    const contacts = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    await indexedDBCache.set(cacheKey, contacts, CACHE_TTL.CONTACTS);
    console.log(`[Prefetch] Contacts: ${contacts.length} items cached`);
  } catch (e) {
    console.warn('[Prefetch] Contacts failed:', e.message);
  }
}

async function prefetchLabels(deviceId) {
  const cacheKey = CACHE_KEYS.LABELS(deviceId);
  
  const cached = await indexedDBCache.get(cacheKey);
  if (cached.fromCache && !cached.isStale) {
    console.log('[Prefetch] Labels: using fresh cache');
    return;
  }
  
  try {
    const { data } = await userApi.get('/contacts/labels', {
      params: { deviceId, pageSize: 50 },
    });
    const labels = Array.isArray(data?.labels) ? data.labels : Array.isArray(data) ? data : [];
    await indexedDBCache.set(cacheKey, labels, CACHE_TTL.LABELS);
    console.log(`[Prefetch] Labels: ${labels.length} items cached`);
  } catch (e) {
    console.warn('[Prefetch] Labels failed:', e.message);
  }
}

async function prefetchGroups(deviceId) {
  const cacheKey = CACHE_KEYS.GROUPS(deviceId);
  
  const cached = await indexedDBCache.get(cacheKey);
  if (cached.fromCache && !cached.isStale) {
    console.log('[Prefetch] Groups: using fresh cache');
    return;
  }
  
  try {
    const { data } = await userApi.get(`/whatsapp-groups/device/${deviceId}/active`, {
      params: { pageSize: 50 },
    });
    const groups = Array.isArray(data?.data) ? data.data : [];
    
    // Map to same format as useGroups
    const normalizeGroupValue = (g) => {
      const groupId = g?.groupId || g?.id || g?.jid || '';
      if (!groupId) return '';
      return groupId.includes('@') ? groupId : `${groupId}@g.us`;
    };
    
    const mapped = groups.map((g) => ({
      value: normalizeGroupValue(g),
      label: g.name || g.subject || 'Grup',
      meta: {
        id: g.id,
        groupId: g.groupId,
        isActive: g.isActive,
        participants: g.participants || 0,
      },
    })).filter(g => g.value);
    
    await indexedDBCache.set(cacheKey, mapped, CACHE_TTL.GROUPS);
    console.log(`[Prefetch] Groups: ${mapped.length} items cached`);
  } catch (e) {
    console.warn('[Prefetch] Groups failed:', e.message);
  }
}

export default {
  prefetchAfterLogin,
  prefetchForDevice,
};
