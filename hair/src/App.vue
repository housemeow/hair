<script setup lang="ts">
import MobileLandscapeDialog from '@/components/MobileLandscapeDialog.vue';
import MainPage from '@/pages/MainPage.vue';
import Crop from './Crop.vue';
import { onMounted, ref } from 'vue';

const style = ref('')

onMounted(() => {
  const vh = window.innerHeight * 0.01
  style.value = `--vh: ${vh}px`
})
</script>

<template>
  <div class="app" :style="style">
    <MainPage />
     <!-- <Crop /> -->
    <MobileLandscapeDialog />
  </div>
</template>

<style scoped lang="scss">
.app {
  --vh: 1vh;
}
</style>
