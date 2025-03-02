<script setup lang="ts">
import { useMainStore } from '@/stores';
import ProductDialog from './ProductDialog.vue';

const store = useMainStore()
</script>

<template>
  <Transition
    name="animate"
    :duration="550"
  >
    <ProductDialog v-if="store.productDialog" />
  </Transition>
</template>

<style scoped lang="scss">
.product-dialog {
  &.animate-enter-active ,
  &.animate-leave-active {
    transition: all 0.3s ease-in-out;
  }

  &.animate-enter-from,
  &.animate-leave-to {
    opacity: 0;
  }

  &.animate-enter-active :deep(dialog) ,
  &.animate-leave-active :deep(dialog) {
    transition: all 0.3s ease-in-out;
  }
  .animate-enter-active :deep(dialog) {
    transition-delay: 0.25s;
  }

  &.animate-enter-from :deep(dialog),
  &.animate-leave-to :deep(dialog) {
    transform: translateY(calc(100 * var(--vh)));
  }
}
</style>
