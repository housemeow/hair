<script setup lang="ts">
import MobileLandscapeDialog from '@/components/MobileLandscapeDialog.vue';
import MainPage from '@/pages/MainPage.vue';
import { onMounted, onUnmounted, ref } from 'vue';

const style = ref('')

const updateVh = () => {
  const vh = window.innerHeight * 0.01
  style.value = `--vh: ${vh}px`
}

onMounted(() => {
  updateVh()

  window.addEventListener('resize', updateVh)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateVh)
})
</script>

<template>
  <div class="app" :style="style">
    <MainPage />
    <MobileLandscapeDialog />
  </div>
</template>

<style scoped lang="scss">
.app {
  --vh: 1vh;
}
</style>
