<script setup lang="ts">
import MobileLandscapeDialog from '@/components/MobileLandscapeDialog.vue';
import MainPage from '@/pages/MainPage.vue';
import Crop from './Crop.vue';
import { useCustomScrollbar } from '@/composables/customScrollbar';

useCustomScrollbar();
</script>

<template>
  <div>
    <MainPage />
     <!-- <Crop /> -->
    <!-- <router-view /> -->
    <MobileLandscapeDialog />
  </div>
</template>
