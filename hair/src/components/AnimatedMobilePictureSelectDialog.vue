<script setup lang="ts">
import { useMainStore } from '@/stores';
import MobilePictureSelectDialog from '@/components/MobilePictureSelectDialog.vue';

const store = useMainStore();
</script>

<template>
  <Transition
    enter-active-class="animate__animated animate__fadeIn"
    leave-active-class="animate__animated animate__fadeOut"
    class="animate__faster"
  >
    <MobilePictureSelectDialog v-if="store.isMobileDialogShow" />
  </Transition>
</template>
