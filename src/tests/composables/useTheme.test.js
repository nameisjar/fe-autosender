import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMatchMedia = (matches = false) => {
  let changeListener;
  const mediaQuery = {
    matches,
    addEventListener: vi.fn((event, listener) => {
      if (event === 'change') changeListener = listener;
    }),
  };

  window.matchMedia = vi.fn(() => mediaQuery);
  return {
    mediaQuery,
    emitChange(nextMatches) {
      mediaQuery.matches = nextMatches;
      changeListener?.({ matches: nextMatches });
    },
  };
};

describe('useTheme', () => {
  beforeEach(() => {
    vi.resetModules();
    document.documentElement.classList.remove('dark');
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themePreference;
  });

  it('follows the device preference by default', async () => {
    createMatchMedia(true);
    const { initializeTheme } = await import('../../composables/useTheme.js');

    initializeTheme();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.dataset.themePreference).toBe('system');
  });

  it('stores and applies a manual theme', async () => {
    createMatchMedia(true);
    const { initializeTheme, setTheme } = await import('../../composables/useTheme.js');
    initializeTheme();

    setTheme('light');

    expect(localStorage.setItem).toHaveBeenCalledWith('algosender_theme', 'light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('reacts to device theme changes while in automatic mode', async () => {
    const matchMedia = createMatchMedia(false);
    const { initializeTheme } = await import('../../composables/useTheme.js');
    initializeTheme();

    matchMedia.emitChange(true);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

