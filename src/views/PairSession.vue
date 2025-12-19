<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // Pairing UI sudah dipusatkan di AddDevice.vue
  router.replace({ name: 'add-device' });
});
</script>

<template>
  <div style="padding: 16px;">
    <p>Pairing sudah dipindahkan ke menu <strong>Device</strong>. Mengarahkan...</p>
  </div>
</template>
