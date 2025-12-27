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

/**
 * Load course feedback templates
 */
export async function loadFeedbackTemplates() {
  loadingFeedbackTemplates.value = true;
  feedbackTemplatesError.value = '';
  
  try {
    const { data } = await userApi.get('/course/feedbacks');
    const templates = Array.isArray(data?.data) ? data.data : [];
    feedbackTemplates.value = templates;
    return templates;
  } catch (e) {
    feedbackTemplatesError.value = e?.response?.data?.message || e?.message || 'Failed to load templates';
    return [];
  } finally {
    loadingFeedbackTemplates.value = false;
  }
}

/**
 * Load monthly templates
 */
export async function loadMonthlyTemplates() {
  loadingMonthlyTemplates.value = true;
  monthlyTemplatesError.value = '';
  
  try {
    const { data } = await userApi.get('/algorithmics/monthly-templates');
    const templates = Array.isArray(data?.data) ? data.data : [];
    monthlyTemplates.value = templates;
    return templates;
  } catch (e) {
    monthlyTemplatesError.value = e?.response?.data?.message || e?.message || 'Failed to load monthly templates';
    return [];
  } finally {
    loadingMonthlyTemplates.value = false;
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
