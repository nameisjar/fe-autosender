// Shared composable for Templates and MonthlyTemplates
import { ref } from 'vue';
import { userApi } from '../api/http.js';

// Singleton state untuk course feedbacks (Templates, ScheduleFeedback)
const feedbackTemplates = ref([]);
const loadingFeedbackTemplates = ref(false);
const feedbackTemplatesError = ref('');

// Singleton state untuk monthly templates (MonthlyTemplates, MonthlyFeedback)
const monthlyTemplates = ref([]);
const loadingMonthlyTemplates = ref(false);
const monthlyTemplatesError = ref('');
let stateGeneration = 0;

export function resetTemplatesCache() {
  stateGeneration += 1;
  feedbackTemplates.value = [];
  loadingFeedbackTemplates.value = false;
  feedbackTemplatesError.value = '';
  monthlyTemplates.value = [];
  loadingMonthlyTemplates.value = false;
  monthlyTemplatesError.value = '';
}

/**
 * Load course feedback templates
 */
export async function loadFeedbackTemplates() {
  const requestGeneration = stateGeneration;
  loadingFeedbackTemplates.value = true;
  feedbackTemplatesError.value = '';
  
  try {
    const { data } = await userApi.get('/course/feedbacks');
    const templates = Array.isArray(data?.data) ? data.data : [];
    if (requestGeneration !== stateGeneration) return [];
    feedbackTemplates.value = templates;
    return templates;
  } catch (e) {
    if (requestGeneration === stateGeneration) {
      feedbackTemplatesError.value = e?.response?.data?.message || e?.message || 'Failed to load templates';
    }
    return [];
  } finally {
    if (requestGeneration === stateGeneration) loadingFeedbackTemplates.value = false;
  }
}

/**
 * Load monthly templates
 */
export async function loadMonthlyTemplates() {
  const requestGeneration = stateGeneration;
  loadingMonthlyTemplates.value = true;
  monthlyTemplatesError.value = '';
  
  try {
    const { data } = await userApi.get('/algorithmics/monthly-templates');
    const templates = Array.isArray(data?.data) ? data.data : [];
    if (requestGeneration !== stateGeneration) return [];
    monthlyTemplates.value = templates;
    return templates;
  } catch (e) {
    if (requestGeneration === stateGeneration) {
      monthlyTemplatesError.value = e?.response?.data?.message || e?.message || 'Failed to load monthly templates';
    }
    return [];
  } finally {
    if (requestGeneration === stateGeneration) loadingMonthlyTemplates.value = false;
  }
}

/**
 * Composable hook
 */
export function useTemplates() {
  return {
    // Feedback templates (course feedbacks)
    feedbackTemplates,
    loadingFeedbackTemplates,
    feedbackTemplatesError,
    loadFeedbackTemplates,
    
    // Monthly templates
    monthlyTemplates,
    loadingMonthlyTemplates,
    monthlyTemplatesError,
    loadMonthlyTemplates,
  };
}

export default useTemplates;
