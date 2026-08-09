import { computed, ref } from 'vue';

const STORAGE_KEY = 'algosender_theme';
const VALID_THEMES = new Set(['light', 'dark', 'system']);

const theme = ref('system');
const systemIsDark = ref(false);
let mediaQuery = null;
let initialized = false;

const resolvedTheme = computed(() => {
    if (theme.value === 'system') return systemIsDark.value ? 'dark' : 'light';
    return theme.value;
});

const applyTheme = () => {
    if (typeof document === 'undefined') return;

    const isDark = resolvedTheme.value === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = resolvedTheme.value;
    document.documentElement.dataset.themePreference = theme.value;
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

export const setTheme = (value) => {
    const nextTheme = VALID_THEMES.has(value) ? value : 'system';
    theme.value = nextTheme;

    try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (_) {}

    applyTheme();
};

export const initializeTheme = () => {
    if (initialized || typeof window === 'undefined') return;
    initialized = true;

    try {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        theme.value = VALID_THEMES.has(savedTheme) ? savedTheme : 'system';
    } catch (_) {
        theme.value = 'system';
    }

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemIsDark.value = mediaQuery.matches;
    mediaQuery.addEventListener?.('change', (event) => {
        systemIsDark.value = event.matches;
        if (theme.value === 'system') applyTheme();
    });

    applyTheme();
};

export function useTheme() {
    initializeTheme();

    return {
        theme,
        resolvedTheme,
        setTheme,
    };
}

