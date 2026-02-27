import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the http module before importing the composable
vi.mock('../../api/http.js', () => ({
  userApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import {
  useTemplates,
  loadFeedbackTemplates,
  loadMonthlyTemplates,
} from '../../composables/useTemplates.js';
import { userApi } from '../../api/http.js';

describe('useTemplates Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadFeedbackTemplates', () => {
    it('should load feedback templates successfully', async () => {
      const mockTemplates = [
        { id: 1, name: 'Template 1', content: 'Content 1' },
        { id: 2, name: 'Template 2', content: 'Content 2' },
      ];

      userApi.get.mockResolvedValue({
        data: { data: mockTemplates },
      });

      const result = await loadFeedbackTemplates();

      expect(userApi.get).toHaveBeenCalledWith('/course/feedbacks');
      expect(result).toEqual(mockTemplates);
    });

    it('should handle API errors', async () => {
      userApi.get.mockRejectedValue({
        response: { data: { message: 'Server error' } },
      });

      const result = await loadFeedbackTemplates();

      expect(result).toEqual([]);
    });

    it('should handle empty response', async () => {
      userApi.get.mockResolvedValue({ data: { data: null } });

      const result = await loadFeedbackTemplates();

      expect(result).toEqual([]);
    });
  });

  describe('loadMonthlyTemplates', () => {
    it('should load monthly templates successfully', async () => {
      const mockTemplates = [
        { id: 1, name: 'Monthly Template 1' },
        { id: 2, name: 'Monthly Template 2' },
      ];

      userApi.get.mockResolvedValue({
        data: { data: mockTemplates },
      });

      const result = await loadMonthlyTemplates();

      expect(userApi.get).toHaveBeenCalledWith('/algorithmics/monthly-templates');
      expect(result).toEqual(mockTemplates);
    });

    it('should handle API errors', async () => {
      userApi.get.mockRejectedValue(new Error('Network error'));

      const result = await loadMonthlyTemplates();

      expect(result).toEqual([]);
    });
  });

  describe('useTemplates hook', () => {
    it('should return all state and functions', () => {
      const result = useTemplates();

      expect(result).toHaveProperty('feedbackTemplates');
      expect(result).toHaveProperty('loadingFeedbackTemplates');
      expect(result).toHaveProperty('feedbackTemplatesError');
      expect(result).toHaveProperty('loadFeedbackTemplates');
      expect(result).toHaveProperty('monthlyTemplates');
      expect(result).toHaveProperty('loadingMonthlyTemplates');
      expect(result).toHaveProperty('monthlyTemplatesError');
      expect(result).toHaveProperty('loadMonthlyTemplates');
    });

    it('should update loading state during API call', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      userApi.get.mockReturnValue(promise);

      const { loadingFeedbackTemplates, loadFeedbackTemplates: load } = useTemplates();

      // Start loading
      const loadPromise = load();

      // Should be loading
      expect(loadingFeedbackTemplates.value).toBe(true);

      // Resolve the API call
      resolvePromise({ data: { data: [] } });
      await loadPromise;

      // Should not be loading anymore
      expect(loadingFeedbackTemplates.value).toBe(false);
    });

    it('should set error state on failure', async () => {
      userApi.get.mockRejectedValue({
        response: { data: { message: 'Test error message' } },
      });

      const { feedbackTemplatesError, loadFeedbackTemplates: load } = useTemplates();

      await load();

      expect(feedbackTemplatesError.value).toBe('Test error message');
    });
  });
});
