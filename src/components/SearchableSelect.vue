<template>
  <div class="searchable-select" :class="{ 'is-open': isOpen, 'is-disabled': disabled, 'is-drop-up': dropUp }">
    <!-- Selected chips (multi-select mode) -->
    <div class="select-container" ref="containerRef">
      <div class="select-input-wrapper" @click="handleContainerClick">
        <!-- Multi-select chips (show max 2 chips, then +N more) -->
        <div v-if="multiple && selectedItems.length > 0" class="selected-chips">
          <span
            v-for="item in visibleChips"
            :key="item.value"
            class="select-chip"
          >
            <span class="chip-text">{{ truncateLabel(item.label) }}</span>
            <button
              type="button"
              class="chip-remove"
              @click.stop="removeItem(item)"
              :disabled="disabled"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
          <span v-if="hiddenChipsCount > 0" class="chips-more">
            +{{ hiddenChipsCount }}
          </span>
        </div>

        <!-- Search input -->
        <input
          ref="inputRef"
          type="text"
          class="select-input"
          :class="{ 'has-chips': multiple && selectedItems.length > 0 }"
          :placeholder="selectedItems.length > 0 ? '' : placeholder"
          :value="searchQuery"
          :disabled="disabled"
          @input="handleInput"
          @focus="handleFocus"
          @keydown="handleKeydown"
        />

        <!-- Icons -->
        <div class="select-icons">
          <svg
            v-if="loading"
            class="icon-spinner"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          <svg
            v-else
            class="icon-chevron"
            :class="{ 'is-flipped': isOpen }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <!-- Dropdown -->
      <Transition name="dropdown">
        <div v-if="isOpen" class="select-dropdown">
          <!-- Options list -->
          <div class="dropdown-options" ref="optionsRef">
            <template v-if="filteredOptions.length > 0">
              <div
                v-for="(option, index) in filteredOptions"
                :key="option.value"
                class="dropdown-option"
                :class="{
                  'is-highlighted': highlightedIndex === index,
                  'is-selected': isSelected(option)
                }"
                @click="selectOption(option)"
                @mouseenter="highlightedIndex = index"
              >
                <div class="option-content">
                  <span class="option-label">{{ option.label }}</span>
                  <span v-if="option.sublabel" class="option-sublabel">{{ option.sublabel }}</span>
                </div>
                <svg
                  v-if="isSelected(option)"
                  class="option-check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </template>

            <!-- No results -->
            <div v-else class="dropdown-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>{{ noResultsText || 'Tidak ditemukan' }}</span>
              <span v-if="searchQuery" class="empty-query">"{{ searchQuery }}"</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Array, String, Number, null],
    default: () => []
  },
  options: {
    type: Array,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Pilih...'
  },
  noResultsText: {
    type: String,
    default: 'Tidak ditemukan'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  searchable: {
    type: Boolean,
    default: true
  },
  dropUp: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'search', 'select', 'remove']);

// Refs
const containerRef = ref(null);
const inputRef = ref(null);
const optionsRef = ref(null);

// State
const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(0);

// Computed
const normalizedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return {
      value: opt[props.valueKey] ?? opt.value ?? opt.id,
      label: opt[props.labelKey] ?? opt.label ?? opt.name ?? String(opt.value),
      sublabel: opt.sublabel ?? opt.phone ?? null,
      raw: opt.raw ?? opt  // 🔧 Gunakan opt.raw jika ada, atau opt sendiri
    };
  });
});

const filteredOptions = computed(() => {
  // Filtering is handled externally, just return normalized options
  return normalizedOptions.value;
});

const selectedItems = computed(() => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : [];
    return values.map(val => {
      const found = normalizedOptions.value.find(opt => opt.value === val);
      return found || { value: val, label: String(val) };
    });
  } else {
    if (props.modelValue == null || props.modelValue === '') return [];
    const found = normalizedOptions.value.find(opt => opt.value === props.modelValue);
    return found ? [found] : [{ value: props.modelValue, label: String(props.modelValue) }];
  }
});

// Visible chips (max 2 shown, rest as +N)
const maxVisibleChips = 2;

const visibleChips = computed(() => {
  return selectedItems.value.slice(0, maxVisibleChips);
});

const hiddenChipsCount = computed(() => {
  return Math.max(0, selectedItems.value.length - maxVisibleChips);
});

const truncateLabel = (label, maxLength = 25) => {
  if (!label) return '';
  return label.length > maxLength ? label.slice(0, maxLength) + '...' : label;
};

// Methods
const handleContainerClick = () => {
  if (props.disabled) return;
  isOpen.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const handleFocus = () => {
  if (props.disabled) return;
  isOpen.value = true;
};

const handleInput = (e) => {
  searchQuery.value = e.target.value;
  emit('search', searchQuery.value);
  highlightedIndex.value = 0;
  if (!isOpen.value) {
    isOpen.value = true;
  }
};

const handleKeydown = (e) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (!isOpen.value) {
        isOpen.value = true;
      } else {
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          filteredOptions.value.length - 1
        );
        scrollToHighlighted();
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      scrollToHighlighted();
      break;
    case 'Enter':
      e.preventDefault();
      if (isOpen.value && filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      }
      break;
    case 'Escape':
      e.preventDefault();
      closeDropdown();
      break;
    case 'Backspace':
      if (!searchQuery.value && props.multiple && selectedItems.value.length > 0) {
        removeItem(selectedItems.value[selectedItems.value.length - 1]);
      }
      break;
  }
};

const scrollToHighlighted = () => {
  nextTick(() => {
    const container = optionsRef.value;
    const highlighted = container?.children[highlightedIndex.value];
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' });
    }
  });
};

const selectOption = (option) => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = values.indexOf(option.value);
    if (index === -1) {
      // Adding new item
      values.push(option.value);
      emit('select', option);
    } else {
      // 🔧 FIX: Removing existing item - emit remove event!
      values.splice(index, 1);
      emit('remove', option);
    }
    emit('update:modelValue', values);
    // Don't clear search query in multi-select mode, so user can continue selecting
  } else {
    emit('update:modelValue', option.value);
    emit('select', option);
    closeDropdown();
    searchQuery.value = '';
    emit('search', '');
  }
};

const removeItem = (item) => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = values.indexOf(item.value);
    if (index !== -1) {
      values.splice(index, 1);
      emit('update:modelValue', values);
      emit('remove', item);
    }
  } else {
    emit('update:modelValue', null);
    emit('remove', item);
  }
};

const isSelected = (option) => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(option.value);
  }
  return props.modelValue === option.value;
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = '';
  highlightedIndex.value = 0;
};

// Click outside handler
const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Reset highlighted when options change
watch(() => props.options, () => {
  highlightedIndex.value = 0;
});
</script>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
}

.searchable-select.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.select-container {
  position: relative;
  overflow: visible;
}

.select-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 46px;
  padding: 6px 40px 6px 10px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: text;
  transition: all 0.2s;
  gap: 6px;
}

.searchable-select.is-open .select-input-wrapper,
.select-input-wrapper:focus-within {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.select-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  transition: all 0.2s;
}

.select-chip:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.chip-text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chips-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.chip-remove:hover {
  color: #ef4444;
}

.chip-remove svg {
  width: 14px;
  height: 14px;
}

.select-input {
  flex: 1;
  min-width: 100px;
  padding: 6px 4px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  color: #1e293b;
  outline: none;
}

.select-input::placeholder {
  color: #94a3b8;
}

.select-input.has-chips {
  min-width: 80px;
}

.select-icons {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.icon-spinner {
  width: 18px;
  height: 18px;
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

.icon-chevron {
  width: 18px;
  height: 18px;
  color: #64748b;
  transition: transform 0.2s;
}

.icon-chevron.is-flipped {
  transform: rotate(180deg);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Dropdown */
.select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* Drop Up - dropdown appears above input */
.is-drop-up .select-dropdown {
  top: auto;
  bottom: calc(100% + 6px);
}

.dropdown-options {
  max-height: 400px;
  overflow-y: auto;
  padding: 6px;
}

.dropdown-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.dropdown-option:hover,
.dropdown-option.is-highlighted {
  background: #f8fafc;
}

.dropdown-option.is-selected {
  background: #eff6ff;
}

.dropdown-option.is-selected .option-label {
  color: #3b82f6;
  font-weight: 600;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.option-label {
  font-size: 14px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-sublabel {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-check {
  width: 18px;
  height: 18px;
  color: #3b82f6;
  flex-shrink: 0;
  margin-left: 8px;
}

/* Empty state */
.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  color: #64748b;
  text-align: center;
}

.dropdown-empty svg {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.dropdown-empty span {
  font-size: 14px;
}

.empty-query {
  color: #94a3b8;
  font-style: italic;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Drop Up transition */
.is-drop-up .dropdown-enter-from,
.is-drop-up .dropdown-leave-to {
  transform: translateY(8px);
}

/* Scrollbar styling */
.dropdown-options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dropdown-options::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
