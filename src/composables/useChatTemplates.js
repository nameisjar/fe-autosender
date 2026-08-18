import { ref } from 'vue';
import { userApi } from '../api/http.js';

const CACHE_TTL_MS = 5 * 60 * 1000;
const chatTemplates = ref([]);
const loadingChatTemplates = ref(false);
const chatTemplatesError = ref('');
let loadedAt = 0;
let pendingRequest = null;
let stateGeneration = 0;

export function resetChatTemplatesCache() {
  stateGeneration += 1;
  chatTemplates.value = [];
  loadingChatTemplates.value = false;
  chatTemplatesError.value = '';
  loadedAt = 0;
  pendingRequest = null;
}

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export async function loadChatTemplates({ force = false } = {}) {
  if (!force && loadedAt && Date.now() - loadedAt < CACHE_TTL_MS) {
    return chatTemplates.value;
  }
  if (pendingRequest) return pendingRequest;

  loadingChatTemplates.value = true;
  chatTemplatesError.value = '';
  const requestGeneration = stateGeneration;
  pendingRequest = userApi
    .get('/chat-templates')
    .then(({ data }) => {
      if (requestGeneration !== stateGeneration) return [];
      chatTemplates.value = Array.isArray(data?.data) ? data.data : [];
      loadedAt = Date.now();
      return chatTemplates.value;
    })
    .catch((error) => {
      if (requestGeneration === stateGeneration) {
        chatTemplatesError.value = errorMessage(error, 'Gagal memuat template chat');
      }
      throw error;
    })
    .finally(() => {
      if (requestGeneration === stateGeneration) {
        loadingChatTemplates.value = false;
        pendingRequest = null;
      }
    });

  return pendingRequest;
}

export async function createChatTemplate(payload) {
  const { data } = await userApi.post('/chat-templates', payload);
  if (data?.data) chatTemplates.value = [data.data, ...chatTemplates.value];
  loadedAt = Date.now();
  return data?.data;
}

export async function updateChatTemplate(id, payload) {
  const { data } = await userApi.put(`/chat-templates/${encodeURIComponent(id)}`, payload);
  if (data?.data) {
    chatTemplates.value = [
      data.data,
      ...chatTemplates.value.filter((template) => template.id !== id),
    ];
  }
  loadedAt = Date.now();
  return data?.data;
}

export async function deleteChatTemplate(id) {
  await userApi.delete(`/chat-templates/${encodeURIComponent(id)}`);
  chatTemplates.value = chatTemplates.value.filter((template) => template.id !== id);
  loadedAt = Date.now();
}

export async function importChatTemplates(rows, { dryRun = false } = {}) {
  const { data } = await userApi.post('/chat-templates/import', { rows, dryRun });
  if (!dryRun && Array.isArray(data?.data)) {
    chatTemplates.value = data.data;
    loadedAt = Date.now();
  }
  return data;
}

export function useChatTemplates() {
  return {
    chatTemplates,
    loadingChatTemplates,
    chatTemplatesError,
    loadChatTemplates,
    createChatTemplate,
    updateChatTemplate,
    deleteChatTemplate,
    importChatTemplates,
  };
}

export default useChatTemplates;
