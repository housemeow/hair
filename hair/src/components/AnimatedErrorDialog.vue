<script setup lang="ts">
import { useMainStore } from '@/stores';
import ErrorDialog from '@/components/ErrorDialog.vue';

const store = useMainStore();
</script>

<template>
  <Transition
    enter-active-class="animate__animated animate__fadeIn"
    leave-active-class="animate__animated animate__fadeOut"
    class="animate__faster"
  >
    <ErrorDialog v-if="store.fileError" />
  </Transition>
</template>
