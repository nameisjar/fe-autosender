<template>
  <div class="wrapper">
    <div class="page-header">
      <div class="header-content">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none">
            <polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="2" />
            <polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="2" />
          </svg>
          Code Snippets
        </h2>
        <p class="subtitle">Kelola dan bagikan code snippets ke murid</p>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <div>
            <div class="stat-value">{{ snippets.length }}</div>
            <div class="stat-label">Total Snippets</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <div>
            <div class="stat-value">{{ totalViews }}</div>
            <div class="stat-label">Total Views</div>
          </div>
        </div>
        <div class="stat-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <div>
            <div class="stat-value">{{ publicSnippets }}</div>
            <div class="stat-label">Public Snippets</div>
          </div>
        </div>
      </div>
    </div>

    <section class="list-card">
      <div class="card-header-section">
        <h3 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          Daftar Snippets ({{ filteredSnippets.length }})
        </h3>
        <div class="header-actions">
          <button class="btn-reload" @click="loadSnippets" :disabled="loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
              />
            </svg>
            <span class="btn-text">{{ loading ? 'Memuat...' : 'Muat Ulang' }}</span>
          </button>
          <button class="btn-add-new" @click="openAddModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span class="btn-text">Tambah Snippet</span>
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <div class="filter-group">
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input v-model="searchQuery" placeholder="Cari snippet..." />
          </div>

          <div class="language-filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            <select v-model="selectedLanguage">
              <option value="">Semua Bahasa</option>
              <option v-for="lang in languages" :key="lang" :value="lang">
                {{ lang }}
              </option>
            </select>
          </div>

          <div class="per-page-filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <select v-model="itemsPerPage">
              <option :value="5">5 per halaman</option>
              <option :value="10">10 per halaman</option>
              <option :value="20">20 per halaman</option>
              <option :value="50">50 per halaman</option>
              <option :value="100">100 per halaman</option>
            </select>
          </div>
        </div>
      </div>

      <div class="snippets-container" v-if="paginatedSnippets.length">
        <div v-for="snippet in paginatedSnippets" :key="snippet.id" class="snippet-card">
          <div class="snippet-header">
            <div class="snippet-info">
              <h4>{{ snippet.title }}</h4>
              <span class="language-badge">{{ snippet.language }}</span>
              <span class="visibility-badge" :class="{ public: snippet.isPublic }">
                {{ snippet.isPublic ? 'Public' : 'Private' }}
              </span>
            </div>
            <div class="snippet-meta">
              <span class="view-count">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {{ snippet.viewCount }} views
              </span>
              <span class="created-date">{{ formatDate(snippet.createdAt) }}</span>
            </div>
          </div>

          <div class="snippet-description" v-if="snippet.description">
            {{ snippet.description }}
          </div>

          <div class="code-preview">
            <pre><code v-html="getHighlightedPreview(snippet)"></code></pre>
          </div>

          <div class="snippet-footer">
            <div class="share-section">
              <button class="btn-copy-link" @click="copyShareLink(snippet)" :disabled="!snippet.isPublic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span class="action-text">Copy Link</span>
              </button>
              <button class="btn-preview" @click="previewSnippet(snippet)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span class="action-text">Preview</span>
              </button>
            </div>
            <div class="action-buttons">
              <button class="btn-edit" @click="openEditModal(snippet)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span class="action-text">Edit</span>
              </button>
              <button class="btn-delete" @click="confirmDelete(snippet)" :disabled="submitting">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span class="action-text">Hapus</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1 || filteredSnippets.length > 0" class="pagination">
        <div class="pagination-info">
          Menampilkan <span class="count-highlight">{{ paginatedSnippets.length }}</span> dari <span class="count-highlight">{{ filteredSnippets.length }}</span> snippet
        </div>
        
        <div class="pagination-nav" v-if="totalPages > 1">
          <button class="btn-page btn-prev" :disabled="currentPage <= 1" @click="currentPage--">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Sebelumnya</span>
          </button>
          <div class="page-indicator">
            {{ currentPage }} / {{ totalPages }}
          </div>
          <button class="btn-page btn-next" :disabled="currentPage >= totalPages" @click="currentPage++">
            <span>Berikutnya</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div v-else-if="!paginatedSnippets.length && filteredSnippets.length === 0 && snippets.length > 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <h3>Tidak Ditemukan</h3>
        <p>Tidak ada snippet yang cocok dengan pencarian</p>
      </div>

      <div v-else-if="snippets.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <h3>Belum Ada Snippets</h3>
        <p>Mulai dengan menambahkan code snippet baru</p>
      </div>
    </section>

    <!-- Add/Edit Modal -->
    <div v-if="showFormModal" class="modal-overlay" @click="closeFormModal">
      <div class="form-modal large" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit Snippet' : 'Tambah Snippet Baru' }}</h3>
          <button class="btn-close" @click="closeFormModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                </svg>
                Judul
              </label>
              <input v-model="form.title" placeholder="Contoh: Fungsi Binary Search" />
            </div>
            <div class="form-group">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Bahasa
              </label>
              <select v-model="form.language">
                <option value="">Pilih Bahasa</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="csharp">C#</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="typescript">TypeScript</option>
                <option value="kotlin">Kotlin</option>
                <option value="swift">Swift</option>
                <option value="bash">Bash</option>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="markdown">Markdown</option>
                <option value="plaintext">Plain Text</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="17" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="17" y1="18" x2="3" y2="18" />
              </svg>
              Deskripsi (opsional)
            </label>
            <input v-model="form.description" placeholder="Penjelasan singkat tentang kode ini..." />
          </div>

          <div class="form-group code-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Kode
              <span class="code-size">{{ codeSize }}</span>
            </label>
            <div class="code-editor-container" :class="`lang-${form.language || 'plaintext'}`">
              <div class="code-editor-header">
                <span class="editor-language">{{ form.language || 'plaintext' }}</span>
                <div class="editor-dots">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
              </div>
              <div class="code-editor-body">
                <div class="line-numbers" ref="lineNumbersRef">
                  <span v-for="n in lineCount" :key="n">{{ n }}</span>
                </div>
                <div class="code-area">
                  <pre class="code-highlight" ref="codeHighlightRef" aria-hidden="true"><code v-html="highlightedCode"></code></pre>
                  <textarea
                    ref="codeTextarea"
                    v-model="form.code"
                    :placeholder="codePlaceholder"
                    class="code-input"
                    spellcheck="false"
                    @scroll="syncScroll"
                    @input="updateHighlight"
                    @keydown="handleKeydown"
                    @beforeinput="handleBeforeInput"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.isPublic" />
              <span class="checkmark"></span>
              <span class="label-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Public (dapat diakses via share link)
              </span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeFormModal">Batal</button>
          <button class="btn-submit" @click="submitForm" :disabled="submitting || !isFormValid">
            {{ submitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Snippet' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreviewModal">
      <div class="preview-modal" @click.stop>
        <div class="modal-header">
          <div class="preview-title">
            <h3>{{ previewData.title }}</h3>
            <span class="language-badge">{{ previewData.language }}</span>
          </div>
          <button class="btn-close" @click="closePreviewModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="preview-description" v-if="previewData.description">{{ previewData.description }}</p>
          <div class="code-block">
            <button class="btn-copy-code" @click="copyCode(previewData.code)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy Code
            </button>
            <pre class="preview-code"><code v-html="previewHighlightedCode"></code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="confirm-modal" @click.stop>
        <div class="modal-icon danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h3>Hapus Snippet?</h3>
        <p>Apakah Anda yakin ingin menghapus "{{ deleteTarget?.title }}"? Tindakan ini tidak dapat dibatalkan.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeDeleteModal">Batal</button>
          <button class="btn-danger" @click="deleteSnippet" :disabled="submitting">
            {{ submitting ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { userApi } from '../api/http';
import { useToast } from '../composables/useToast';

// Highlight.js - use core bundle with only needed languages for smaller bundle size
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/atom-one-dark.css';

// Import only the languages we support
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
hljs.registerLanguage('html', xml); // HTML uses XML highlighting

// Language map for dropdown - maps display value to hljs language name
const languageMap = {
  'python': 'python',
  'javascript': 'javascript', 
  'typescript': 'typescript',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'csharp': 'csharp',
  'html': 'xml',
  'css': 'css',
  'sql': 'sql',
  'php': 'php',
  'ruby': 'ruby',
  'go': 'go',
  'rust': 'rust',
  'kotlin': 'kotlin',
  'swift': 'swift',
  'bash': 'bash',
  'json': 'json',
  'yaml': 'yaml',
  'markdown': 'markdown',
  'xml': 'xml',
  'plaintext': 'plaintext'
};

// Toast
const toast = useToast();

// Refs
const codeTextarea = ref(null);
const codeHighlightRef = ref(null);
const lineNumbersRef = ref(null);

// Undo/Redo History
const undoStack = ref([]);
const redoStack = ref([]);
const MAX_HISTORY = 100;
const isUndoRedo = ref(false); // Flag to prevent recording during undo/redo

// State
const snippets = ref([]);
const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const selectedLanguage = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Modals
const showFormModal = ref(false);
const showPreviewModal = ref(false);
const showDeleteModal = ref(false);
const isEditMode = ref(false);
const editingId = ref(null);
const deleteTarget = ref(null);
const previewData = ref({});

// Form
const form = ref({
  title: '',
  description: '',
  code: '',
  language: '',
  isPublic: true,
});

// Computed
const filteredSnippets = computed(() => {
  return snippets.value.filter((s) => {
    const matchSearch =
      !searchQuery.value ||
      s.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      s.code.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchLanguage = !selectedLanguage.value || s.language === selectedLanguage.value;
    return matchSearch && matchLanguage;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredSnippets.value.length / itemsPerPage.value);
});

const paginatedSnippets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSnippets.value.slice(start, end);
});

const paginationInfo = computed(() => {
  const total = filteredSnippets.value.length;
  const start = total === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(currentPage.value * itemsPerPage.value, total);
  return { start, end, total };
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    
    if (current > 3) pages.push('...');
    
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    if (current < total - 2) pages.push('...');
    
    if (!pages.includes(total)) pages.push(total);
  }
  
  return pages;
});

// Reset page when search/filter/itemsPerPage changes
watch([searchQuery, selectedLanguage, itemsPerPage], () => {
  currentPage.value = 1;
});

const languages = computed(() => {
  const langs = [...new Set(snippets.value.map((s) => s.language))];
  return langs.sort();
});

const totalViews = computed(() => {
  return snippets.value.reduce((sum, s) => sum + (s.viewCount || 0), 0);
});

const publicSnippets = computed(() => {
  return snippets.value.filter((s) => s.isPublic).length;
});

const codeSize = computed(() => {
  const bytes = new Blob([form.value.code]).size;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
});

const isFormValid = computed(() => {
  return form.value.title && form.value.code && form.value.language;
});

const lineCount = computed(() => {
  if (!form.value.code) return 1;
  return form.value.code.split('\n').length;
});

// Dynamic placeholder based on selected language
const codePlaceholder = computed(() => {
  const placeholders = {
    python: `# Contoh kode Python
def hello_world():
    print("Hello, World!")

hello_world()`,
    javascript: `// Contoh kode JavaScript
function helloWorld() {
    console.log("Hello, World!");
}

helloWorld();`,
    typescript: `// Contoh kode TypeScript
function helloWorld(): void {
    console.log("Hello, World!");
}

helloWorld();`,
    java: `// Contoh kode Java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    cpp: `// Contoh kode C++
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
    c: `// Contoh kode C
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    csharp: `// Contoh kode C#
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
    php: `<?php
// Contoh kode PHP
function helloWorld() {
    echo "Hello, World!";
}

helloWorld();
?>`,
    ruby: `# Contoh kode Ruby
def hello_world
  puts "Hello, World!"
end

hello_world`,
    go: `// Contoh kode Go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    rust: `// Contoh kode Rust
fn main() {
    println!("Hello, World!");
}`,
    swift: `// Contoh kode Swift
func helloWorld() {
    print("Hello, World!")
}

helloWorld()`,
    kotlin: `// Contoh kode Kotlin
fun main() {
    println("Hello, World!")
}`,
    sql: `-- Contoh kode SQL
SELECT * FROM users
WHERE status = 'active'
ORDER BY created_at DESC;`,
    bash: `#!/bin/bash
# Contoh kode Bash
echo "Hello, World!"`,
    html: `<!-- Contoh kode HTML -->
<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`,
    css: `/* Contoh kode CSS */
.container {
    display: flex;
    justify-content: center;
    align-items: center;
}`,
    json: `{
  "message": "Hello, World!",
  "status": "success"
}`,
    yaml: `# Contoh kode YAML
message: Hello, World!
status: success`,
    markdown: `# Hello World

Ini adalah contoh **Markdown**.

- Item 1
- Item 2`,
  };
  
  return placeholders[form.value.language] || 'Tulis atau paste kode di sini...';
});

const highlightedCode = computed(() => {
  if (!form.value.code) return '';
  
  const code = form.value.code;
  const selectedLang = form.value.language?.toLowerCase() || '';
  
  // Map to hljs language name
  const lang = languageMap[selectedLang] || selectedLang;
  
  try {
    // If language is selected and not plaintext, use specific language
    if (lang && lang !== 'plaintext') {
      const result = hljs.highlight(code, { language: lang, ignoreIllegals: true });
      return result.value;
    }
    // If no language selected or plaintext, use auto-detection
    return hljs.highlightAuto(code).value;
  } catch (e) {
    // Fallback to auto-detection on any error
    try {
      return hljs.highlightAuto(code).value;
    } catch (e2) {
      return escapeHtml(code);
    }
  }
});

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Get highlighted preview for snippet cards
const getHighlightedPreview = (snippet) => {
  const code = truncateCode(snippet.code);
  const selectedLang = snippet.language?.toLowerCase() || '';
  const lang = languageMap[selectedLang] || selectedLang;
  
  try {
    if (lang && lang !== 'plaintext') {
      const result = hljs.highlight(code, { language: lang, ignoreIllegals: true });
      return result.value;
    }
    return hljs.highlightAuto(code).value;
  } catch (e) {
    try {
      return hljs.highlightAuto(code).value;
    } catch (e2) {
      return escapeHtml(code);
    }
  }
};

// Highlighted code for preview modal
const previewHighlightedCode = computed(() => {
  if (!previewData.value.code) return '';
  
  const code = previewData.value.code;
  const selectedLang = previewData.value.language?.toLowerCase() || '';
  const lang = languageMap[selectedLang] || selectedLang;
  
  try {
    if (lang && lang !== 'plaintext') {
      const result = hljs.highlight(code, { language: lang, ignoreIllegals: true });
      return result.value;
    }
    return hljs.highlightAuto(code).value;
  } catch (e) {
    try {
      return hljs.highlightAuto(code).value;
    } catch (e2) {
      return escapeHtml(code);
    }
  }
});

const syncScroll = (e) => {
  if (lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = e.target.scrollTop;
  }
  if (codeHighlightRef.value) {
    codeHighlightRef.value.scrollTop = e.target.scrollTop;
    codeHighlightRef.value.scrollLeft = e.target.scrollLeft;
  }
};

const updateHighlight = () => {
  // Force re-render of highlighted code
  nextTick(() => {
    if (codeTextarea.value && codeHighlightRef.value) {
      codeHighlightRef.value.scrollTop = codeTextarea.value.scrollTop;
      codeHighlightRef.value.scrollLeft = codeTextarea.value.scrollLeft;
    }
  });
};

// Track last saved time for debounced undo saving
let lastUndoSaveTime = 0;
const UNDO_DEBOUNCE_MS = 300;

// Handle before input to save undo state for normal typing
const handleBeforeInput = (e) => {
  if (isUndoRedo.value) return;
  
  const textarea = e.target;
  const now = Date.now();
  
  // Save to undo stack with debounce (group rapid typing together)
  if (now - lastUndoSaveTime > UNDO_DEBOUNCE_MS) {
    saveToUndoStack(textarea);
    lastUndoSaveTime = now;
  }
};

// Indent size based on language
const indentSize = computed(() => {
  const lang = form.value.language?.toLowerCase() || '';
  const indentMap = {
    'python': 4,
    'yaml': 2,
    'json': 2,
    'html': 2,
    'css': 2,
    'xml': 2,
    'markdown': 2,
  };
  return indentMap[lang] || 4;
});

// Auto-closing pairs
const autoClosePairs = {
  '{': '}',
  '[': ']',
  '(': ')',
  '"': '"',
  "'": "'",
  '`': '`',
};

// Characters that trigger auto-indent on Enter
const autoIndentTriggers = ['{', '[', '(', ':'];

// Save state to undo stack
const saveToUndoStack = (textarea) => {
  if (isUndoRedo.value) return;
  
  const state = {
    content: textarea.value,
    selectionStart: textarea.selectionStart,
    selectionEnd: textarea.selectionEnd,
  };
  
  // Don't save if same as last state
  if (undoStack.value.length > 0) {
    const lastState = undoStack.value[undoStack.value.length - 1];
    if (lastState.content === state.content) return;
  }
  
  undoStack.value.push(state);
  
  // Limit stack size
  if (undoStack.value.length > MAX_HISTORY) {
    undoStack.value.shift();
  }
  
  // Clear redo stack on new change
  redoStack.value = [];
};

// Perform undo
const performUndo = (textarea) => {
  if (undoStack.value.length === 0) return false;
  
  // Save current state to redo stack
  redoStack.value.push({
    content: textarea.value,
    selectionStart: textarea.selectionStart,
    selectionEnd: textarea.selectionEnd,
  });
  
  // Limit redo stack
  if (redoStack.value.length > MAX_HISTORY) {
    redoStack.value.shift();
  }
  
  // Restore previous state
  const prevState = undoStack.value.pop();
  isUndoRedo.value = true;
  textarea.value = prevState.content;
  textarea.selectionStart = prevState.selectionStart;
  textarea.selectionEnd = prevState.selectionEnd;
  form.value.code = textarea.value;
  isUndoRedo.value = false;
  
  return true;
};

// Perform redo
const performRedo = (textarea) => {
  if (redoStack.value.length === 0) return false;
  
  // Save current state to undo stack
  undoStack.value.push({
    content: textarea.value,
    selectionStart: textarea.selectionStart,
    selectionEnd: textarea.selectionEnd,
  });
  
  // Restore next state
  const nextState = redoStack.value.pop();
  isUndoRedo.value = true;
  textarea.value = nextState.content;
  textarea.selectionStart = nextState.selectionStart;
  textarea.selectionEnd = nextState.selectionEnd;
  form.value.code = textarea.value;
  isUndoRedo.value = false;
  
  return true;
};

// Apply edit with undo support
const applyEdit = (textarea, newValue, newSelectionStart, newSelectionEnd) => {
  saveToUndoStack(textarea);
  textarea.value = newValue;
  textarea.selectionStart = newSelectionStart;
  textarea.selectionEnd = newSelectionEnd !== undefined ? newSelectionEnd : newSelectionStart;
  form.value.code = textarea.value;
};

// Insert text with undo support
const insertText = (textarea, text) => {
  saveToUndoStack(textarea);
  // Use execCommand for native undo support (deprecated but widely supported)
  if (document.execCommand) {
    document.execCommand('insertText', false, text);
  } else {
    // Fallback for browsers that don't support execCommand
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    textarea.value = value.substring(0, start) + text + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    form.value.code = textarea.value;
  }
};

// Handle keyboard events for code editor
const handleKeydown = (e) => {
  const textarea = e.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const indent = ' '.repeat(indentSize.value);
  
  // Ctrl+Z - Undo
  if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
    e.preventDefault();
    if (performUndo(textarea)) {
      updateHighlight();
    }
    return;
  }
  
  // Ctrl+Y or Ctrl+Shift+Z - Redo
  if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
    e.preventDefault();
    if (performRedo(textarea)) {
      updateHighlight();
    }
    return;
  }
  
  // Tab key - insert indent
  if (e.key === 'Tab') {
    e.preventDefault();
    
    if (e.shiftKey) {
      // Shift+Tab - unindent
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineContent = value.substring(lineStart, start);
      const spacesToRemove = Math.min(indentSize.value, lineContent.search(/\S|$/));
      
      if (spacesToRemove > 0) {
        textarea.setSelectionRange(lineStart, lineStart + spacesToRemove);
        insertText(textarea, '');
      }
    } else {
      // Tab - insert indent
      insertText(textarea, indent);
    }
    updateHighlight();
    return;
  }
  
  // Enter key - auto indent (not Ctrl+Enter)
  if (e.key === 'Enter' && !e.ctrlKey) {
    e.preventDefault();
    
    // Get current line
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineContent = value.substring(lineStart, start);
    
    // Get current indentation
    const currentIndent = lineContent.match(/^\s*/)[0];
    
    // Check if we should add extra indent
    const lastChar = value.substring(start - 1, start);
    const nextChar = value.substring(start, start + 1);
    let newIndent = currentIndent;
    
    // Add extra indent after { [ ( :
    if (autoIndentTriggers.includes(lastChar)) {
      newIndent += indent;
      
      // If next char is closing bracket, add newline with less indent
      if ((lastChar === '{' && nextChar === '}') ||
          (lastChar === '[' && nextChar === ']') ||
          (lastChar === '(' && nextChar === ')')) {
        insertText(textarea, '\n' + newIndent + '\n' + currentIndent);
        // Move cursor to middle line
        textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length;
        form.value.code = textarea.value;
        updateHighlight();
        return;
      }
    }
    
    insertText(textarea, '\n' + newIndent);
    form.value.code = textarea.value;
    updateHighlight();
    return;
  }
  
  // Helper: Get line boundaries
  const getLineInfo = (pos) => {
    const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
    let lineEnd = value.indexOf('\n', pos);
    if (lineEnd === -1) lineEnd = value.length;
    return { lineStart, lineEnd, lineContent: value.substring(lineStart, lineEnd) };
  };

  // Helper: Get full lines for selection
  const getSelectedLines = () => {
    const startLine = getLineInfo(start);
    const endLine = getLineInfo(end);
    return {
      start: startLine.lineStart,
      end: endLine.lineEnd,
      content: value.substring(startLine.lineStart, endLine.lineEnd)
    };
  };

  // Alt+Shift+Down - Duplicate line(s) down
  if (e.altKey && e.shiftKey && e.key === 'ArrowDown') {
    e.preventDefault();
    const lines = getSelectedLines();
    const newText = value.substring(0, lines.end) + '\n' + lines.content + value.substring(lines.end);
    const newStart = start + lines.content.length + 1;
    const newEnd = end + lines.content.length + 1;
    applyEdit(textarea, newText, newStart, newEnd);
    updateHighlight();
    return;
  }

  // Alt+Shift+Up - Duplicate line(s) up
  if (e.altKey && e.shiftKey && e.key === 'ArrowUp') {
    e.preventDefault();
    const lines = getSelectedLines();
    const newText = value.substring(0, lines.start) + lines.content + '\n' + value.substring(lines.start);
    applyEdit(textarea, newText, start, end);
    updateHighlight();
    return;
  }

  // Alt+Down - Move line(s) down
  if (e.altKey && !e.shiftKey && e.key === 'ArrowDown') {
    const lines = getSelectedLines();
    if (lines.end >= value.length) return; // Already at bottom
    e.preventDefault();
    const nextLineEnd = value.indexOf('\n', lines.end + 1);
    const nextLine = nextLineEnd === -1 
      ? value.substring(lines.end + 1) 
      : value.substring(lines.end + 1, nextLineEnd);
    const actualNextLineEnd = nextLineEnd === -1 ? value.length : nextLineEnd;
    
    const newText = value.substring(0, lines.start) + nextLine + '\n' + lines.content + value.substring(actualNextLineEnd);
    const moveDistance = nextLine.length + 1;
    applyEdit(textarea, newText, start + moveDistance, end + moveDistance);
    updateHighlight();
    return;
  }

  // Alt+Up - Move line(s) up
  if (e.altKey && !e.shiftKey && e.key === 'ArrowUp') {
    const lines = getSelectedLines();
    if (lines.start === 0) return; // Already at top
    e.preventDefault();
    const prevLineStart = value.lastIndexOf('\n', lines.start - 2) + 1;
    const prevLine = value.substring(prevLineStart, lines.start - 1);
    
    const newText = value.substring(0, prevLineStart) + lines.content + '\n' + prevLine + value.substring(lines.end);
    const moveDistance = prevLine.length + 1;
    applyEdit(textarea, newText, start - moveDistance, end - moveDistance);
    updateHighlight();
    return;
  }

  // Ctrl+D - Select word under cursor or find next occurrence
  if (e.ctrlKey && !e.shiftKey && e.key === 'd') {
    e.preventDefault();
    
    if (start === end) {
      // No selection - select word under cursor
      const wordChars = /[a-zA-Z0-9_$]/;
      let wordStart = start;
      let wordEnd = start;
      
      // Find word start
      while (wordStart > 0 && wordChars.test(value[wordStart - 1])) {
        wordStart--;
      }
      
      // Find word end
      while (wordEnd < value.length && wordChars.test(value[wordEnd])) {
        wordEnd++;
      }
      
      if (wordStart !== wordEnd) {
        textarea.selectionStart = wordStart;
        textarea.selectionEnd = wordEnd;
      }
    } else {
      // Has selection - find and select next occurrence
      const selectedText = value.substring(start, end);
      const searchStart = end;
      let nextIndex = value.indexOf(selectedText, searchStart);
      
      // If not found after cursor, wrap around and search from beginning
      if (nextIndex === -1) {
        nextIndex = value.indexOf(selectedText, 0);
      }
      
      // If found and not the same position
      if (nextIndex !== -1 && nextIndex !== start) {
        textarea.selectionStart = nextIndex;
        textarea.selectionEnd = nextIndex + selectedText.length;
        
        // Scroll to make selection visible
        textarea.blur();
        textarea.focus();
      }
    }
    return;
  }

  // Ctrl+Shift+D - Duplicate line down
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    const lines = getSelectedLines();
    const newText = value.substring(0, lines.end) + '\n' + lines.content + value.substring(lines.end);
    const newStart = start + lines.content.length + 1;
    const newEnd = end + lines.content.length + 1;
    applyEdit(textarea, newText, newStart, newEnd);
    updateHighlight();
    return;
  }

  // Ctrl+Shift+K - Delete line
  if (e.ctrlKey && e.shiftKey && e.key === 'K') {
    e.preventDefault();
    const lines = getSelectedLines();
    const deleteEnd = lines.end < value.length ? lines.end + 1 : lines.end;
    const deleteStart = lines.start > 0 && lines.end >= value.length ? lines.start - 1 : lines.start;
    const newText = value.substring(0, deleteStart) + value.substring(deleteEnd);
    const newPos = Math.min(deleteStart, newText.length);
    applyEdit(textarea, newText, newPos, newPos);
    updateHighlight();
    return;
  }

  // Ctrl+/ - Toggle comment
  if (e.ctrlKey && e.key === '/') {
    e.preventDefault();
    const lines = getSelectedLines();
    const lineTexts = lines.content.split('\n');
    const lang = form.value.language.toLowerCase();
    
    // Determine comment style
    let commentPrefix = '// ';
    if (['python', 'ruby', 'perl', 'bash', 'shell', 'sh'].includes(lang)) {
      commentPrefix = '# ';
    } else if (['html', 'xml'].includes(lang)) {
      commentPrefix = '<!-- ';
    } else if (['css', 'scss', 'less'].includes(lang)) {
      commentPrefix = '/* ';
    } else if (['sql'].includes(lang)) {
      commentPrefix = '-- ';
    }
    
    // Check if all lines are commented
    const allCommented = lineTexts.every(line => {
      const trimmed = line.trimStart();
      return trimmed === '' || trimmed.startsWith(commentPrefix.trim());
    });
    
    const newLines = lineTexts.map(line => {
      if (allCommented) {
        // Uncomment
        const match = line.match(new RegExp(`^(\\s*)${commentPrefix.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s?`));
        if (match) {
          return match[1] + line.substring(match[0].length);
        }
        return line;
      } else {
        // Comment
        if (line.trim() === '') return line;
        const indent = line.match(/^\s*/)[0];
        return indent + commentPrefix + line.trimStart();
      }
    });
    
    const newContent = newLines.join('\n');
    const newText = value.substring(0, lines.start) + newContent + value.substring(lines.end);
    const lengthDiff = newContent.length - lines.content.length;
    applyEdit(textarea, newText, start, end + lengthDiff);
    updateHighlight();
    return;
  }

  // Ctrl+L - Select line
  if (e.ctrlKey && e.key === 'l') {
    e.preventDefault();
    const lines = getSelectedLines();
    textarea.selectionStart = lines.start;
    textarea.selectionEnd = lines.end < value.length ? lines.end + 1 : lines.end;
    return;
  }

  // Ctrl+] - Indent line(s)
  if (e.ctrlKey && e.key === ']') {
    e.preventDefault();
    const lines = getSelectedLines();
    const lineTexts = lines.content.split('\n');
    const newContent = lineTexts.map(line => indent + line).join('\n');
    const newText = value.substring(0, lines.start) + newContent + value.substring(lines.end);
    const lengthDiff = newContent.length - lines.content.length;
    applyEdit(textarea, newText, start + indentSize.value, end + lengthDiff);
    updateHighlight();
    return;
  }

  // Ctrl+[ - Outdent line(s)
  if (e.ctrlKey && e.key === '[') {
    e.preventDefault();
    const lines = getSelectedLines();
    const lineTexts = lines.content.split('\n');
    let totalRemoved = 0;
    let firstLineRemoved = 0;
    const newContent = lineTexts.map((line, idx) => {
      const spaces = line.match(/^\s*/)[0].length;
      const toRemove = Math.min(indentSize.value, spaces);
      if (idx === 0) firstLineRemoved = toRemove;
      totalRemoved += toRemove;
      return line.substring(toRemove);
    }).join('\n');
    const newText = value.substring(0, lines.start) + newContent + value.substring(lines.end);
    const newSelStart = Math.max(lines.start, start - firstLineRemoved);
    const newSelEnd = end - totalRemoved + (lineTexts.length - 1) * (indentSize.value - (totalRemoved / lineTexts.length));
    applyEdit(textarea, newText, newSelStart, newSelEnd);
    updateHighlight();
    return;
  }

  // Ctrl+Enter - Insert line below
  if (e.ctrlKey && !e.shiftKey && e.key === 'Enter') {
    e.preventDefault();
    const lineInfo = getLineInfo(start);
    const currentIndent = lineInfo.lineContent.match(/^\s*/)[0];
    const newText = value.substring(0, lineInfo.lineEnd) + '\n' + currentIndent + value.substring(lineInfo.lineEnd);
    const newPos = lineInfo.lineEnd + 1 + currentIndent.length;
    applyEdit(textarea, newText, newPos, newPos);
    updateHighlight();
    return;
  }

  // Ctrl+Shift+Enter - Insert line above
  if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
    e.preventDefault();
    const lineInfo = getLineInfo(start);
    const currentIndent = lineInfo.lineContent.match(/^\s*/)[0];
    const newText = value.substring(0, lineInfo.lineStart) + currentIndent + '\n' + value.substring(lineInfo.lineStart);
    const newPos = lineInfo.lineStart + currentIndent.length;
    applyEdit(textarea, newText, newPos, newPos);
    updateHighlight();
    return;
  }

  // Home - Go to start of line (after indentation) or start of line
  if (e.key === 'Home' && !e.ctrlKey) {
    e.preventDefault();
    const lineInfo = getLineInfo(start);
    const firstNonSpace = lineInfo.lineStart + lineInfo.lineContent.search(/\S|$/);
    const newPos = start === firstNonSpace ? lineInfo.lineStart : firstNonSpace;
    if (e.shiftKey) {
      textarea.selectionEnd = end;
      textarea.selectionStart = newPos;
    } else {
      textarea.selectionStart = textarea.selectionEnd = newPos;
    }
    return;
  }

  // Auto-closing brackets and quotes
  if (autoClosePairs[e.key]) {
    const closeChar = autoClosePairs[e.key];
    
    // For quotes, handle auto-close
    if (e.key === '"' || e.key === "'" || e.key === '`') {
      const charBefore = value.substring(start - 1, start);
      const charAfter = value.substring(start, start + 1);
      
      // If next char is the same quote, just move cursor
      if (charAfter === e.key) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        return;
      }
      
      // Don't auto-close if escaping
      if (charBefore === '\\') return;
      
      // Don't auto-close if inside a word (letter/number before)
      if (/[a-zA-Z0-9]/.test(charBefore)) return;
      
      // If text is selected, wrap it with quotes
      if (start !== end) {
        e.preventDefault();
        const selectedText = value.substring(start, end);
        insertText(textarea, e.key + selectedText + closeChar);
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
        form.value.code = textarea.value;
        updateHighlight();
        return;
      }
      
      // Auto-close quote
      e.preventDefault();
      insertText(textarea, e.key + closeChar);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      form.value.code = textarea.value;
      updateHighlight();
      return;
    }
    
    // For brackets, wrap selection or auto-close
    if (e.key === '{' || e.key === '[' || e.key === '(') {
      e.preventDefault();
      
      // If text is selected, wrap it
      if (start !== end) {
        const selectedText = value.substring(start, end);
        insertText(textarea, e.key + selectedText + closeChar);
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
        form.value.code = textarea.value;
        updateHighlight();
        return;
      }
      
      insertText(textarea, e.key + closeChar);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      form.value.code = textarea.value;
      updateHighlight();
      return;
    }
  }
  
  // Skip over closing brackets/quotes if typed
  if (['}', ']', ')', '"', "'", '`'].includes(e.key)) {
    const nextChar = value.substring(start, start + 1);
    if (nextChar === e.key) {
      e.preventDefault();
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      return;
    }
  }
  
  // Backspace - delete pair if empty
  if (e.key === 'Backspace' && start === end && start > 0) {
    const charBefore = value.substring(start - 1, start);
    const charAfter = value.substring(start, start + 1);
    
    if (autoClosePairs[charBefore] === charAfter) {
      e.preventDefault();
      textarea.setSelectionRange(start - 1, start + 1);
      insertText(textarea, '');
      form.value.code = textarea.value;
      updateHighlight();
      return;
    }
  }
};

// Methods
const loadSnippets = async () => {
  loading.value = true;
  try {
    const res = await userApi.get('/code-snippets');
    snippets.value = res.data;
  } catch (err) {
    toast.error('Gagal memuat snippets');
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEditMode.value = false;
  editingId.value = null;
  form.value = { title: '', description: '', code: '', language: '', isPublic: true };
  undoStack.value = [];
  redoStack.value = [];
  showFormModal.value = true;
};

const openEditModal = (snippet) => {
  isEditMode.value = true;
  editingId.value = snippet.id;
  form.value = {
    title: snippet.title,
    description: snippet.description || '',
    code: snippet.code,
    language: snippet.language,
    isPublic: snippet.isPublic,
  };
  undoStack.value = [];
  redoStack.value = [];
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  form.value = { title: '', description: '', code: '', language: '', isPublic: true };
  undoStack.value = [];
  redoStack.value = [];
};

const submitForm = async () => {
  if (!isFormValid.value) return;

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await userApi.put(`/code-snippets/${editingId.value}`, form.value);
      toast.success('Snippet berhasil diperbarui');
    } else {
      await userApi.post('/code-snippets', form.value);
      toast.success('Snippet berhasil ditambahkan');
    }
    closeFormModal();
    loadSnippets();
  } catch (err) {
    const msg = err.response?.data?.message || 'Gagal menyimpan snippet';
    toast.error(msg);
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (snippet) => {
  deleteTarget.value = snippet;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteTarget.value = null;
};

const deleteSnippet = async () => {
  if (!deleteTarget.value) return;

  submitting.value = true;
  try {
    await userApi.delete('/code-snippets', { data: { ids: [deleteTarget.value.id] } });
    toast.success('Snippet berhasil dihapus');
    closeDeleteModal();
    loadSnippets();
  } catch (err) {
    toast.error('Gagal menghapus snippet');
  } finally {
    submitting.value = false;
  }
};

const previewSnippet = (snippet) => {
  previewData.value = snippet;
  showPreviewModal.value = true;
};

const closePreviewModal = () => {
  showPreviewModal.value = false;
  previewData.value = {};
};

const copyShareLink = async (snippet) => {
  if (!snippet.isPublic) {
    toast.error('Snippet harus public untuk dibagikan');
    return;
  }
  const link = `${window.location.origin}/snippet/${snippet.shareToken}`;
  try {
    await navigator.clipboard.writeText(link);
    toast.success('Link berhasil disalin!');
  } catch {
    toast.error('Gagal menyalin link');
  }
};

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    toast.success('Kode berhasil disalin!');
  } catch {
    toast.error('Gagal menyalin kode');
  }
};

const truncateCode = (code, maxLines = 8) => {
  const lines = code.split('\n');
  if (lines.length <= maxLines) return code;
  return lines.slice(0, maxLines).join('\n') + '\n...';
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

onMounted(() => {
  loadSnippets();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
  overflow-x: hidden;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.header-content {
  margin-bottom: 0;
}

.header-content h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.header-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 160px;
}

.stat-card svg {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
}

.list-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  overflow: hidden;
  max-width: 100%;
}

.card-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.card-header-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-header-section .section-title svg,
.card-header-section h3 svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-reload,
.btn-add-new {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reload {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-reload:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-add-new {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-add-new:hover {
  background: #2563eb;
}

.btn-reload svg,
.btn-add-new svg {
  width: 16px;
  height: 16px;
}

.toolbar-section {
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box,
.language-filter,
.per-page-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.search-box svg,
.language-filter svg,
.per-page-filter svg {
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-box input,
.language-filter select,
.per-page-filter select {
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #334155;
  outline: none;
  min-width: 150px;
}

.language-filter select,
.per-page-filter select {
  cursor: pointer;
}

.snippets-container {
  display: grid;
  gap: 16px;
  max-width: 100%;
  overflow: hidden;
}

.snippet-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
  overflow: hidden;
  max-width: 100%;
}

.snippet-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.snippet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.snippet-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.snippet-info h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.language-badge {
  padding: 2px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.visibility-badge {
  padding: 2px 8px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.visibility-badge.public {
  background: #f0fdf4;
  color: #16a34a;
}

.snippet-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 0.8rem;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-count svg {
  width: 14px;
  height: 14px;
}

.snippet-description {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 12px;
  line-height: 1.5;
}

.code-preview {
  background: #1e293b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  max-width: 100%;
}

.code-preview pre {
  margin: 0;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  overflow-x: auto;
  max-width: 100%;
}

.code-preview code {
  color: #e2e8f0;
  white-space: pre-wrap;
  word-break: break-all;
}

.snippet-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.share-section,
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-copy-link,
.btn-preview,
.btn-edit,
.btn-delete {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy-link,
.btn-preview {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-copy-link:hover:not(:disabled),
.btn-preview:hover {
  background: #e2e8f0;
}

.btn-copy-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-edit {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
}

.btn-edit:hover {
  background: #fde68a;
}

.btn-delete {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
}

.btn-delete:hover:not(:disabled) {
  background: #fecaca;
}

.btn-copy-link svg,
.btn-preview svg,
.btn-edit svg,
.btn-delete svg {
  width: 14px;
  height: 14px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #64748b;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #334155;
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0;
}

/* Pagination - Simple style like image */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding: 16px 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 0.9rem;
  color: #64748b;
}

.pagination-info .count-highlight {
  color: #1e293b;
  font-weight: 600;
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-page {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: #f8fafc;
  color: #334155;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-page svg {
  width: 16px;
  height: 16px;
}

.page-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  min-width: 60px;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.form-modal,
.preview-modal,
.confirm-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.form-modal {
  max-width: 600px;
}

.form-modal.large {
  max-width: 800px;
}

.preview-modal {
  max-width: 900px;
}

.confirm-modal {
  max-width: 400px;
  text-align: center;
  padding: 32px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-close {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.form-group label svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.code-group .code-input {
  font-family: 'Fira Code', 'Monaco', monospace;
  min-height: 200px;
  resize: vertical;
  line-height: 1.5;
}

.code-size {
  margin-left: auto;
  font-weight: 400;
  color: #64748b;
  font-size: 0.75rem;
}

.checkbox-group {
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
}

.label-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #334155;
}

.label-text svg {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel,
.btn-submit,
.btn-danger {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-submit {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: #dc2626;
  border: none;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

/* Preview Modal */
.preview-description {
  color: #64748b;
  margin-bottom: 16px;
  line-height: 1.6;
}

.code-block {
  position: relative;
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
}

.btn-copy-code {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy-code:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-copy-code svg {
  width: 14px;
  height: 14px;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-block code {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #e2e8f0;
  white-space: pre;
}

/* Confirm Modal */
.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.modal-icon.danger {
  background: #fee2e2;
  color: #dc2626;
}

.modal-icon svg {
  width: 32px;
  height: 32px;
}

.confirm-modal h3 {
  margin: 0 0 8px;
  color: #1e293b;
}

.confirm-modal p {
  color: #64748b;
  margin: 0 0 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .wrapper {
    padding: 0 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-row {
    width: 100%;
    justify-content: flex-start;
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .wrapper {
    padding: 16px;
  }

  .page-header {
    gap: 16px;
    margin-bottom: 16px;
  }

  .header-content h2 {
    font-size: 1.25rem;
    flex-wrap: wrap;
  }

  .header-icon {
    width: 24px;
    height: 24px;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    width: 100%;
  }

  .stat-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 12px 8px;
    min-width: unset;
    gap: 8px;
  }

  .stat-card svg {
    width: 20px;
    height: 20px;
  }

  .stat-value {
    font-size: 1.1rem;
  }

  .stat-label {
    font-size: 0.65rem;
  }

  .list-card {
    padding: 16px;
    border-radius: 12px;
  }

  .card-header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .section-title {
    font-size: 0.95rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: row;
    gap: 8px;
  }

  .header-actions button {
    flex: 1;
    justify-content: center;
    padding: 10px 12px;
    font-size: 0.8rem;
  }

  .btn-reload svg,
  .btn-add-new svg {
    width: 14px;
    height: 14px;
  }

  .toolbar-section {
    margin-bottom: 16px;
  }

  .filter-group {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .search-box,
  .language-filter {
    width: 100%;
  }

  .search-box input,
  .language-filter select {
    width: 100%;
    min-width: unset;
  }

  .snippet-card {
    padding: 14px;
  }

  .snippet-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .snippet-info {
    flex-wrap: wrap;
    gap: 6px;
  }

  .snippet-info h4 {
    width: 100%;
    font-size: 0.95rem;
  }

  .snippet-meta {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .snippet-footer {
    flex-direction: column;
    gap: 12px;
  }

  .share-section,
  .action-buttons {
    width: 100%;
    flex-wrap: wrap;
  }

  .share-section button,
  .action-buttons button {
    flex: 1;
    min-width: calc(50% - 4px);
    justify-content: center;
    font-size: 0.75rem;
    padding: 8px 10px;
  }

  .code-preview {
    max-height: 120px;
  }

  .code-preview pre {
    font-size: 0.75rem;
  }

  /* Pagination Responsive */
  .pagination {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .pagination-info {
    font-size: 0.8rem;
    order: 2;
    text-align: center;
  }

  .pagination-nav {
    order: 1;
    width: 100%;
    justify-content: center;
  }

  .btn-page span {
    display: none;
  }

  /* Filter Group Responsive */
  .per-page-filter {
    flex: 1;
    min-width: 140px;
  }

  /* Modal Responsive */
  .form-modal,
  .preview-modal {
    max-width: 100%;
    max-height: 95vh;
    margin: 8px;
    border-radius: 12px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 12px 16px;
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
  }

  /* Code Editor Responsive */
  .code-editor-container {
    border-radius: 8px;
  }

  .code-editor-header {
    padding: 8px 12px;
  }

  .editor-language {
    font-size: 0.7rem;
  }

  .dot {
    width: 10px;
    height: 10px;
  }

  .code-editor-body {
    min-height: 180px;
    max-height: 300px;
  }

  .code-editor-body .line-numbers {
    padding: 12px 8px;
    font-size: 0.7rem;
    min-width: 32px;
  }

  .code-editor-body .code-input,
  .code-editor-body .code-highlight {
    padding: 12px;
    font-size: 0.8rem;
  }

  /* Confirm Modal Responsive */
  .confirm-modal {
    padding: 24px 20px;
    max-width: 90%;
  }

  .confirm-modal svg {
    width: 48px;
    height: 48px;
  }

  .confirm-modal h3 {
    font-size: 1.1rem;
  }

  .confirm-modal p {
    font-size: 0.875rem;
  }

  .confirm-actions {
    flex-direction: column;
    width: 100%;
  }

  .confirm-actions button {
    width: 100%;
  }

  /* Empty State Responsive */
  .empty-state {
    padding: 32px 16px;
  }

  .empty-state svg {
    width: 48px;
    height: 48px;
  }

  .empty-state h3 {
    font-size: 1rem;
  }

  .empty-state p {
    font-size: 0.875rem;
  }
}

/* Responsive - Small Mobile */
@media (max-width: 480px) {
  .wrapper {
    padding: 12px;
  }

  .page-header {
    gap: 12px;
    margin-bottom: 12px;
  }

  .header-content h2 {
    font-size: 1.1rem;
  }

  .header-icon {
    width: 20px;
    height: 20px;
  }

  .subtitle {
    font-size: 0.75rem;
  }

  .stats-row {
    gap: 6px;
  }

  .stat-card {
    padding: 10px 6px;
    gap: 6px;
    border-radius: 8px;
  }

  .stat-card svg {
    width: 18px;
    height: 18px;
  }

  .stat-value {
    font-size: 1rem;
  }

  .stat-label {
    font-size: 0.6rem;
  }

  .list-card {
    padding: 12px;
    border-radius: 10px;
  }

  .header-actions {
    gap: 6px;
  }

  .btn-reload,
  .btn-add-new {
    padding: 10px 12px;
    font-size: 0.75rem;
  }

  .btn-text {
    display: none;
  }

  .btn-reload svg,
  .btn-add-new svg {
    width: 16px;
    height: 16px;
  }

  .search-box,
  .language-filter {
    padding: 10px 12px;
  }

  .search-box input {
    font-size: 16px;
  }

  .language-filter select {
    font-size: 16px;
  }

  .snippet-card {
    padding: 12px;
    border-radius: 10px;
  }

  .snippet-info h4 {
    font-size: 0.9rem;
  }

  .language-badge,
  .visibility-badge {
    font-size: 0.6rem;
    padding: 2px 5px;
  }

  .snippet-meta {
    font-size: 0.65rem;
    gap: 6px;
  }

  .view-count svg {
    width: 12px;
    height: 12px;
  }

  .snippet-description {
    font-size: 0.75rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .code-preview {
    max-height: 80px;
    border-radius: 6px;
  }

  .code-preview pre {
    font-size: 0.7rem;
    padding: 10px;
  }

  .snippet-footer {
    gap: 8px;
  }

  .share-section,
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .share-section button,
  .action-buttons button {
    min-width: unset;
    padding: 10px 8px;
    font-size: 0.7rem;
  }

  .action-text {
    display: none;
  }

  .btn-copy-link svg,
  .btn-preview svg,
  .btn-edit svg,
  .btn-delete svg {
    width: 16px;
    height: 16px;
  }

  /* Pagination Small Mobile */
  .pagination {
    padding: 10px 12px;
    gap: 10px;
  }

  .pagination-info {
    font-size: 0.75rem;
  }

  .pagination-nav {
    gap: 6px;
  }

  .btn-page {
    padding: 6px 10px;
  }

  .page-indicator {
    padding: 6px 14px;
    font-size: 12px;
  }

  /* Modal Small Mobile */
  .modal-overlay {
    padding: 8px;
  }

  .form-modal,
  .preview-modal {
    margin: 0;
    border-radius: 10px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 10px 12px;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .code-editor-body {
    min-height: 150px;
    max-height: 250px;
  }

  .code-editor-body .code-input,
  .code-editor-body .code-highlight {
    font-size: 14px; /* Prevents zoom on iOS */
  }

  .checkbox-label {
    font-size: 0.85rem;
  }

  .checkbox-label input[type='checkbox'] {
    width: 20px;
    height: 20px;
  }
}

/* Code Editor Styles */
.code-editor-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.code-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #1e293b;
}

.editor-language {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

.editor-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ef4444; }
.dot.yellow { background: #eab308; }
.dot.green { background: #22c55e; }

.code-editor-body {
  display: flex;
  background: #0f172a;
  min-height: 250px;
  max-height: 400px;
}

.code-editor-body .line-numbers {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  min-width: 50px;
  background: rgba(0, 0, 0, 0.2);
  text-align: right;
  user-select: none;
  overflow: hidden;
}

.code-editor-body .line-numbers span {
  padding: 0 12px;
  color: #475569;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

/* Code area with overlay */
.code-editor-body .code-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 250px;
  max-height: 400px;
}

.code-editor-body .code-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 16px;
  background: transparent;
  border: none;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: auto;
  pointer-events: none;
  z-index: 1;
}

.code-editor-body .code-highlight code {
  display: block;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  background: transparent !important;
  padding: 0 !important;
  color: #abb2bf;
}

.code-editor-body .code-input {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  padding: 16px;
  background: transparent !important;
  border: none;
  border-radius: 0;
  color: transparent !important;
  caret-color: #fff;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  resize: none;
  min-height: 250px;
  max-height: 400px;
  overflow: auto;
  z-index: 2;
}

.code-editor-body .code-input:focus {
  outline: none;
  box-shadow: none;
}

.code-editor-body .code-input::placeholder {
  color: #475569;
}

/* Language-specific themes */
/* JavaScript / TypeScript - Yellow theme */
.code-editor-container.lang-javascript .code-editor-header,
.code-editor-container.lang-typescript .code-editor-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid #f7df1e;
}
.code-editor-container.lang-javascript .editor-language,
.code-editor-container.lang-typescript .editor-language {
  color: #f7df1e;
}
.code-editor-container.lang-javascript .code-editor-body,
.code-editor-container.lang-typescript .code-editor-body {
  background: linear-gradient(180deg, #1a1a2e 0%, #0d1117 100%);
}
.code-editor-container.lang-javascript .code-input,
.code-editor-container.lang-typescript .code-input {
  color: #f8f8f2;
}

/* Python - Blue/Green theme */
.code-editor-container.lang-python .code-editor-header {
  background: linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%);
  border-bottom: 2px solid #3776ab;
}
.code-editor-container.lang-python .editor-language {
  color: #ffde57;
}
.code-editor-container.lang-python .code-editor-body {
  background: linear-gradient(180deg, #1e3a5f 0%, #0d1117 100%);
}
.code-editor-container.lang-python .code-input {
  color: #e6e6e6;
}

/* Java - Orange theme */
.code-editor-container.lang-java .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #f89820;
}
.code-editor-container.lang-java .editor-language {
  color: #f89820;
}
.code-editor-container.lang-java .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}

/* C/C++ - Blue theme */
.code-editor-container.lang-c .code-editor-header,
.code-editor-container.lang-cpp .code-editor-header {
  background: linear-gradient(135deg, #004482 0%, #00599c 100%);
  border-bottom: 2px solid #00599c;
}
.code-editor-container.lang-c .editor-language,
.code-editor-container.lang-cpp .editor-language {
  color: #fff;
}
.code-editor-container.lang-c .code-editor-body,
.code-editor-container.lang-cpp .code-editor-body {
  background: linear-gradient(180deg, #1a2634 0%, #0d1117 100%);
}

/* HTML - Orange/Red theme */
.code-editor-container.lang-html .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #e34c26;
}
.code-editor-container.lang-html .editor-language {
  color: #e34c26;
}
.code-editor-container.lang-html .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}

/* CSS - Blue theme */
.code-editor-container.lang-css .code-editor-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #0d1117 100%);
  border-bottom: 2px solid #264de4;
}
.code-editor-container.lang-css .editor-language {
  color: #63a4ff;
}
.code-editor-container.lang-css .code-editor-body {
  background: linear-gradient(180deg, #1a1a2e 0%, #0d1117 100%);
}

/* PHP - Purple theme */
.code-editor-container.lang-php .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #777bb4;
}
.code-editor-container.lang-php .editor-language {
  color: #a8b4e8;
}
.code-editor-container.lang-php .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}

/* Ruby - Red theme */
.code-editor-container.lang-ruby .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #cc342d;
}
.code-editor-container.lang-ruby .editor-language {
  color: #ff6b6b;
}
.code-editor-container.lang-ruby .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}

/* Go - Cyan theme */
.code-editor-container.lang-go .code-editor-header {
  background: linear-gradient(135deg, #1a2634 0%, #0d1117 100%);
  border-bottom: 2px solid #00add8;
}
.code-editor-container.lang-go .editor-language {
  color: #5fd4f4;
}
.code-editor-container.lang-go .code-editor-body {
  background: linear-gradient(180deg, #1a2634 0%, #0d1117 100%);
}

/* Rust - Orange theme */
.code-editor-container.lang-rust .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #dea584;
}
.code-editor-container.lang-rust .editor-language {
  color: #dea584;
}
.code-editor-container.lang-rust .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}

/* SQL - Blue theme */
.code-editor-container.lang-sql .code-editor-header {
  background: linear-gradient(135deg, #1a2634 0%, #0d1117 100%);
  border-bottom: 2px solid #336791;
}
.code-editor-container.lang-sql .editor-language {
  color: #6ba3d6;
}
.code-editor-container.lang-sql .code-editor-body {
  background: linear-gradient(180deg, #1a2634 0%, #0d1117 100%);
}

/* Bash - Green theme */
.code-editor-container.lang-bash .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #4eaa25;
}
.code-editor-container.lang-bash .editor-language {
  color: #4eaa25;
}
.code-editor-container.lang-bash .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}
.code-editor-container.lang-bash .code-input {
  color: #4eaa25;
}

/* JSON - Yellow/Gray theme */
.code-editor-container.lang-json .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #cbcb41;
}
.code-editor-container.lang-json .editor-language {
  color: #cbcb41;
}
.code-editor-container.lang-json .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}

/* Kotlin - Purple/Orange theme */
.code-editor-container.lang-kotlin .code-editor-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #0d1117 100%);
  border-bottom: 2px solid #7f52ff;
}
.code-editor-container.lang-kotlin .editor-language {
  color: #a78bfa;
}
.code-editor-container.lang-kotlin .code-editor-body {
  background: linear-gradient(180deg, #1a1a2e 0%, #0d1117 100%);
}

/* Swift - Orange theme */
.code-editor-container.lang-swift .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #f05138;
}
.code-editor-container.lang-swift .editor-language {
  color: #ff7b5c;
}
.code-editor-container.lang-swift .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}

/* C# - Purple theme */
.code-editor-container.lang-csharp .code-editor-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #0d1117 100%);
  border-bottom: 2px solid #68217a;
}
.code-editor-container.lang-csharp .editor-language {
  color: #b48eda;
}
.code-editor-container.lang-csharp .code-editor-body {
  background: linear-gradient(180deg, #1a1a2e 0%, #0d1117 100%);
}

/* YAML - Red theme */
.code-editor-container.lang-yaml .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #cb171e;
}
.code-editor-container.lang-yaml .editor-language {
  color: #ff6b6b;
}
.code-editor-container.lang-yaml .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}

/* Markdown - Blue theme */
.code-editor-container.lang-markdown .code-editor-header {
  background: linear-gradient(135deg, #083fa1 0%, #1a1a2e 100%);
  border-bottom: 2px solid #083fa1;
}
.code-editor-container.lang-markdown .editor-language {
  color: #fff;
}
.code-editor-container.lang-markdown .code-editor-body {
  background: linear-gradient(180deg, #1a1a2e 0%, #0d1117 100%);
}

/* Default/Plaintext - Gray theme */
.code-editor-container.lang-plaintext .code-editor-header,
.code-editor-container.lang- .code-editor-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-bottom: 2px solid #64748b;
}
.code-editor-container.lang-plaintext .editor-language,
.code-editor-container.lang- .editor-language {
  color: #64748b;
}
.code-editor-container.lang-plaintext .code-editor-body,
.code-editor-container.lang- .code-editor-body {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
}
</style>

<!-- Unscoped styles for highlight.js tokens -->
<style>
/* Base code styles - must be unscoped for v-html */
.code-highlight code,
.code-preview code,
.preview-code code {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: inherit;
  line-height: inherit;
  background: transparent !important;
  padding: 0 !important;
  color: #abb2bf !important;
}

/* Syntax highlighting colors - atom-one-dark theme */
.code-highlight .hljs-keyword,
.code-preview .hljs-keyword,
.preview-code .hljs-keyword { color: #c678dd !important; }

.code-highlight .hljs-built_in,
.code-preview .hljs-built_in,
.preview-code .hljs-built_in { color: #e6c07b !important; }

.code-highlight .hljs-type,
.code-preview .hljs-type,
.preview-code .hljs-type { color: #e6c07b !important; }

.code-highlight .hljs-literal,
.code-preview .hljs-literal,
.preview-code .hljs-literal { color: #d19a66 !important; }

.code-highlight .hljs-number,
.code-preview .hljs-number,
.preview-code .hljs-number { color: #d19a66 !important; }

.code-highlight .hljs-string,
.code-preview .hljs-string,
.preview-code .hljs-string { color: #98c379 !important; }

.code-highlight .hljs-comment,
.code-preview .hljs-comment,
.preview-code .hljs-comment { color: #5c6370 !important; font-style: italic; }

.code-highlight .hljs-function,
.code-preview .hljs-function,
.preview-code .hljs-function { color: #61afef !important; }

.code-highlight .hljs-title,
.code-preview .hljs-title,
.preview-code .hljs-title { color: #61afef !important; }

.code-highlight .hljs-title.function_,
.code-preview .hljs-title.function_,
.preview-code .hljs-title.function_ { color: #61afef !important; }

.code-highlight .hljs-title.class_,
.code-preview .hljs-title.class_,
.preview-code .hljs-title.class_ { color: #e6c07b !important; }

.code-highlight .hljs-params,
.code-preview .hljs-params,
.preview-code .hljs-params { color: #abb2bf !important; }

.code-highlight .hljs-variable,
.code-preview .hljs-variable,
.preview-code .hljs-variable { color: #e06c75 !important; }

.code-highlight .hljs-attr,
.code-preview .hljs-attr,
.preview-code .hljs-attr { color: #d19a66 !important; }

.code-highlight .hljs-class,
.code-preview .hljs-class,
.preview-code .hljs-class { color: #e6c07b !important; }

.code-highlight .hljs-meta,
.code-preview .hljs-meta,
.preview-code .hljs-meta { color: #61afef !important; }

.code-highlight .hljs-operator,
.code-preview .hljs-operator,
.preview-code .hljs-operator { color: #56b6c2 !important; }

.code-highlight .hljs-punctuation,
.code-preview .hljs-punctuation,
.preview-code .hljs-punctuation { color: #abb2bf !important; }

.code-highlight .hljs-name,
.code-preview .hljs-name,
.preview-code .hljs-name { color: #e06c75 !important; }

.code-highlight .hljs-selector-class,
.code-preview .hljs-selector-class,
.preview-code .hljs-selector-class { color: #e6c07b !important; }

.code-highlight .hljs-selector-id,
.code-preview .hljs-selector-id,
.preview-code .hljs-selector-id { color: #61afef !important; }

.code-highlight .hljs-selector-tag,
.code-preview .hljs-selector-tag,
.preview-code .hljs-selector-tag { color: #e06c75 !important; }

.code-highlight .hljs-property,
.code-preview .hljs-property,
.preview-code .hljs-property { color: #e06c75 !important; }

.code-highlight .hljs-subst,
.code-preview .hljs-subst,
.preview-code .hljs-subst { color: #e06c75 !important; }

.code-highlight .hljs-regexp,
.code-preview .hljs-regexp,
.preview-code .hljs-regexp { color: #98c379 !important; }

.code-highlight .hljs-symbol,
.code-preview .hljs-symbol,
.preview-code .hljs-symbol { color: #56b6c2 !important; }

.code-highlight .hljs-doctag,
.code-preview .hljs-doctag,
.preview-code .hljs-doctag { color: #c678dd !important; }

.code-highlight .hljs-section,
.code-preview .hljs-section,
.preview-code .hljs-section { color: #e06c75 !important; }

.code-highlight .hljs-tag,
.code-preview .hljs-tag,
.preview-code .hljs-tag { color: #e06c75 !important; }

.code-highlight .hljs-deletion,
.code-preview .hljs-deletion,
.preview-code .hljs-deletion { color: #e06c75 !important; }

.code-highlight .hljs-addition,
.code-preview .hljs-addition,
.preview-code .hljs-addition { color: #98c379 !important; }
</style>