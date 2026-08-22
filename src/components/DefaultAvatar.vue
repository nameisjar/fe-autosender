<template>
  <span
    class="default-avatar"
    :class="`default-avatar--${normalizedKind}`"
    aria-hidden="true"
  >
    <svg v-if="normalizedKind === 'group'" viewBox="0 0 48 48" fill="currentColor">
      <circle cx="17" cy="17" r="7" />
      <circle cx="33" cy="19" r="5.5" opacity="0.82" />
      <path d="M4.5 39.5c.7-8.1 5.5-12.2 12.5-12.2s11.8 4.1 12.5 12.2a2 2 0 0 1-2 2.2h-21a2 2 0 0 1-2-2.2Z" />
      <path d="M28.2 29.5c1.5-.9 3.2-1.3 5.1-1.3 5.7 0 9.5 3.6 10.2 10.5a2 2 0 0 1-2 2.2H32c.1-.5.1-1 .1-1.5-.3-3.9-1.6-7.2-3.9-9.9Z" opacity="0.82" />
    </svg>
    <svg v-else viewBox="0 0 48 48" fill="currentColor">
      <circle cx="24" cy="16" r="9" />
      <path d="M7.5 40c.8-10.4 7.2-15.8 16.5-15.8S39.7 29.6 40.5 40a2.4 2.4 0 0 1-2.4 2.6H9.9A2.4 2.4 0 0 1 7.5 40Z" />
    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  kind: { type: String, default: 'personal' },
});

const normalizedKind = computed(() => props.kind === 'group' ? 'group' : 'personal');
</script>

<style scoped>
.default-avatar {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  overflow: hidden;
  border-radius: inherit;
  background: #dbe3e6;
  color: #829197;
}

.default-avatar svg {
  width: 68%;
  height: 68%;
}

.default-avatar--group svg {
  width: 72%;
  height: 72%;
}

:global(html.dark) .default-avatar {
  background: #334155;
  color: #94a3b8;
}
</style>
