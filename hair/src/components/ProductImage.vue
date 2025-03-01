<script setup lang="ts">
import type { HairProduct } from '@/database';
import long11 from '@/assets/products/long11.png'
import long12 from '@/assets/products/long12.png'
import short21 from '@/assets/products/short21.png'
import short22 from '@/assets/products/short22.png'
import short23 from '@/assets/products/short23.png'
import short24 from '@/assets/products/short24.png'

import { computed } from 'vue';

const props = defineProps<{
  product: HairProduct;
}>();

const hairImage = computed(() => {
  const productMapping = {
    'long11.png': long11,
    'long12.png': long12,
    'short21.png': short21,
    'short22.png': short22,
    'short23.png': short23,
    'short24.png': short24,
  } as Record<string, string>;
  return productMapping[props.product.image];
})
</script>

<template>
  <img class="product-image" :src="hairImage" alt="">
</template>

<style scoped lang="scss">
.product-image {
}
</style>
