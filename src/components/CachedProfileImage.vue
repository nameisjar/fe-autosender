<template>
  <img
    v-if="resolvedSource && displaySource"
    :src="displaySource"
    :alt="alt"
    loading="lazy"
    referrerpolicy="no-referrer"
    @error="handleError"
  />
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { mediaUrl } from "../utils/mediaUrl.js";
import {
  ensureProfileImageSocketInvalidation,
  loadProfileImage,
  peekProfileImage,
  profileImageCacheRevision,
} from "../utils/profileImageCache.js";

const props = defineProps({
  src: { type: String, default: "" },
  status: { type: String, default: "" },
  alt: { type: String, default: "Foto profil" },
});

const resolvedSource = computed(() => mediaUrl(props.src));
const displaySource = ref(peekProfileImage(props.src));
let latestRequest = 0;

ensureProfileImageSocketInvalidation();

const resolveImage = async () => {
  const requestId = ++latestRequest;
  const source = props.src;
  const cached = peekProfileImage(source);
  if (cached) displaySource.value = cached;
  const loaded = await loadProfileImage(source, { status: props.status });
  if (requestId === latestRequest && source === props.src) displaySource.value = loaded;
};

const handleError = () => {
  displaySource.value = "";
};

watch(
  [() => props.src, () => props.status],
  () => {
    displaySource.value = peekProfileImage(props.src);
    void resolveImage();
  },
  { immediate: true },
);

watch(profileImageCacheRevision, () => {
  if (!props.src) return;
  void resolveImage();
});
</script>
