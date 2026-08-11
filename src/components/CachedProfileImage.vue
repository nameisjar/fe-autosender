<template>
  <img
    v-if="visible && resolvedSource"
    :key="`${resolvedSource}:${retryVersion}`"
    :src="versionedSource"
    :alt="alt"
    loading="lazy"
    referrerpolicy="no-referrer"
    @load="handleLoad"
    @error="handleError"
  />
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
import { mediaUrl } from "../utils/mediaUrl.js";

const props = defineProps({
  src: { type: String, default: "" },
  status: { type: String, default: "" },
  alt: { type: String, default: "Foto profil" },
});

const retryVersion = ref(0);
const visible = ref(Boolean(props.src));
const retryDelays = [2000, 4000, 8000, 12000];
let retryTimer = null;

const resolvedSource = computed(() => mediaUrl(props.src));
const versionedSource = computed(() => {
  if (!resolvedSource.value) return "";
  const separator = resolvedSource.value.includes("?") ? "&" : "?";
  return `${resolvedSource.value}${separator}profileRetry=${retryVersion.value}`;
});

const clearRetry = () => {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
};

const handleLoad = () => clearRetry();

const handleError = () => {
  visible.value = false;
  if (props.status === "unavailable" || retryVersion.value >= retryDelays.length) return;

  clearRetry();
  retryTimer = setTimeout(() => {
    retryTimer = null;
    retryVersion.value += 1;
    visible.value = true;
  }, retryDelays[retryVersion.value]);
};

watch(
  () => props.src,
  source => {
    clearRetry();
    retryVersion.value = 0;
    visible.value = Boolean(source);
  },
);

onUnmounted(clearRetry);
</script>

<style scoped>
img {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
