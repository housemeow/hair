<script setup lang="ts">
import { useMainStore } from '@/stores';
import ProductDialog from './ProductDialog.vue';
import { useRwd } from '@/composables/rwd';
import { computed } from 'vue';

const store = useMainStore()
const rwd = useRwd()

const backgroundDuration = computed(() => rwd.isMobile.value ? 300 : 500)
const dialogReadyDuration = computed(() => rwd.isMobile.value ? 250 : 450)
const duration = computed(() => backgroundDuration.value + dialogReadyDuration.value)
const style = computed(() => ({
  '--background-duration': backgroundDuration.value / 1000,
  '--dialog-ready-duration': dialogReadyDuration.value / 1000,
}))
</script>

<template>
  <Transition
    name="animate"
    :duration="duration"
  >
    <ProductDialog v-if="store.productDialog" :style="style" />
  </Transition>
</template>

<style scoped lang="scss">
.product-dialog {
  --background-duration: 0.3;
  --dialog-ready-duration: 0.25;

  &.animate-enter-active ,
  &.animate-leave-active {
    transition: all calc(var(--background-duration) * 1s) ease-in-out;
  }

  &.animate-enter-from,
  &.animate-leave-to {
    opacity: 0;
  }

  &.animate-enter-active :deep(dialog) ,
  &.animate-leave-active :deep(dialog) {
    transition: all calc(var(--background-duration) * 1s) ease-in-out;
  }
  .animate-enter-active :deep(dialog) {
    transition-delay: calc(var(--dialog-ready-duration) * 1s);
  }

  &.animate-enter-from :deep(dialog),
  &.animate-leave-to :deep(dialog) {
    transform: translateY(calc(100 * var(--vh)));
  }
}
</style>
