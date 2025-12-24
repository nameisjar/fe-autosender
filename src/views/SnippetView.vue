<template>
  <div class="snippet-viewer">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Memuat snippet...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <h2>{{ error }}</h2>
      <p>Snippet tidak ditemukan atau tidak tersedia untuk publik.</p>
      <a href="/" class="btn-home">Kembali ke Beranda</a>
    </div>

    <!-- Snippet Content -->
    <div v-else class="snippet-content">
      <header class="snippet-header">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Code Snippet</span>
        </div>
      </header>

      <main class="snippet-main">
        <div class="snippet-info">
          <h1>{{ snippet.title }}</h1>
          <div class="meta-row">
            <span class="language-badge">{{ snippet.language }}</span>
            <span class="author">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {{ snippet.user?.firstName }} {{ snippet.user?.lastName }}
            </span>
            <span class="view-count">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {{ snippet.viewCount }} views
            </span>
            <span class="created-date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {{ formatDate(snippet.createdAt) }}
            </span>
          </div>
          <p v-if="snippet.description" class="description">{{ snippet.description }}</p>
        </div>

        <div class="code-container">
          <div class="code-header">
            <span class="filename">{{ snippet.language }}</span>
            <button class="btn-copy" @click="copyCode" :class="{ copied }">
              <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ copied ? 'Copied!' : 'Copy Code' }}
            </button>
          </div>
          <div class="code-body">
            <div class="line-numbers">
              <span v-for="n in lineCount" :key="n">{{ n }}</span>
            </div>
            <pre class="code-pre"><code :class="`language-${snippet.language?.toLowerCase()}`" v-html="highlightedCode"></code></pre>
          </div>
        </div>
      </main>

      <footer class="snippet-footer">
        <p>
          Shared via 
          <a href="/" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Code Snippet
          </a>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

// Highlight.js for syntax highlighting
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/atom-one-dark.css';

// Import only needed languages
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';

// Register languages
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);

const route = useRoute();

// State
const snippet = ref({});
const loading = ref(true);
const error = ref(null);
const copied = ref(false);

// API Base URL - support both dev and prod
const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (import.meta.env && import.meta.env.DEV ? '' : window.location.origin);

// Computed
const lineCount = computed(() => {
  if (!snippet.value.code) return 0;
  return snippet.value.code.split('\n').length;
});

const highlightedCode = computed(() => {
  if (!snippet.value.code) return '';
  
  const code = snippet.value.code;
  const lang = snippet.value.language?.toLowerCase() || 'plaintext';
  
  try {
    // Try to highlight with specified language
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    // Fallback to auto-detection
    return hljs.highlightAuto(code).value;
  } catch (e) {
    console.error('Highlight error:', e);
    return escapeHtml(code);
  }
});

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Methods
const loadSnippet = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const token = route.params.token;
    const res = await axios.get(`${API_BASE}/snippets/share/${token}`);
    snippet.value = res.data;
  } catch (err) {
    console.error(err);
    if (err.response?.status === 404) {
      error.value = 'Snippet Tidak Ditemukan';
    } else if (err.response?.status === 403) {
      error.value = 'Snippet Tidak Tersedia';
    } else {
      error.value = 'Terjadi Kesalahan';
    }
  } finally {
    loading.value = false;
  }
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(snippet.value.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

onMounted(() => {
  loadSnippet();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.snippet-viewer {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  color: #e2e8f0;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(99, 102, 241, 0.3);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 24px;
}

.error-container svg {
  width: 80px;
  height: 80px;
  color: #ef4444;
  margin-bottom: 16px;
}

.error-container h2 {
  margin: 0 0 8px;
  font-size: 1.5rem;
}

.error-container p {
  margin: 0 0 24px;
  color: #94a3b8;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #6366f1;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-home:hover {
  background: #4f46e5;
}

/* Content */
.snippet-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

/* Header */
.snippet-header {
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #a5b4fc;
}

.logo svg {
  width: 28px;
  height: 28px;
}

/* Main */
.snippet-main {
  background: #1e293b;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.snippet-info {
  padding: 24px;
  border-bottom: 1px solid #334155;
}

.snippet-info h1 {
  margin: 0 0 12px;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}

.language-badge {
  padding: 4px 12px;
  background: #4f46e5;
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.author,
.view-count,
.created-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.875rem;
}

.author svg,
.view-count svg,
.created-date svg {
  width: 16px;
  height: 16px;
}

.description {
  margin: 0;
  color: #94a3b8;
  line-height: 1.6;
}

/* Code Container */
.code-container {
  background: #0f172a;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.filename {
  color: #64748b;
  font-size: 0.875rem;
  font-family: 'Fira Code', monospace;
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #334155;
  border: none;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #475569;
}

.btn-copy.copied {
  background: #10b981;
}

.btn-copy svg {
  width: 16px;
  height: 16px;
}

.code-body {
  display: flex;
  overflow-x: auto;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  min-width: 50px;
  background: rgba(0, 0, 0, 0.2);
  text-align: right;
  user-select: none;
}

.line-numbers span {
  padding: 0 12px;
  color: #475569;
  font-family: 'Fira Code', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

.code-body pre {
  margin: 0;
  padding: 16px;
  flex: 1;
  overflow-x: auto;
}

.code-body code {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #e2e8f0;
  white-space: pre;
}

/* Footer */
.snippet-footer {
  margin-top: 32px;
  text-align: center;
}

.snippet-footer p {
  color: #64748b;
  font-size: 0.875rem;
}

.snippet-footer a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #a5b4fc;
  text-decoration: none;
}

.snippet-footer a:hover {
  color: #c7d2fe;
}

.snippet-footer a svg {
  width: 16px;
  height: 16px;
}

/* Responsive */
@media (max-width: 640px) {
  .snippet-content {
    padding: 16px;
  }

  .snippet-info {
    padding: 16px;
  }

  .snippet-info h1 {
    font-size: 1.25rem;
  }

  .meta-row {
    gap: 12px;
  }

  .code-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .btn-copy {
    width: 100%;
    justify-content: center;
  }

  .line-numbers {
    display: none;
  }

  .code-body pre {
    padding: 12px;
  }
}
</style>

<!-- Highlight.js styles are imported via CSS file, this is just for ensuring code block styling -->
<style>
/* Ensure hljs styles apply to our code blocks */
.snippet-viewer .code-pre code.hljs {
  background: transparent !important;
  padding: 0 !important;
}
</style>
