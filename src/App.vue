<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { initSessionTimeout, clearSessionTimeout } from '@/utils/sessionTimeout';

const store = useStore();
let refreshInterval = null;

onMounted(() => {
  if (store.getters['auth/isAuthenticated']) {
    initSessionTimeout(store);

    // Refresh every 15 mins
    refreshInterval = setInterval(() => {
      store.dispatch('auth/refreshToken');
    }, 15 * 60 * 1000);
  }
});

onUnmounted(() => {
  clearSessionTimeout();
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>
