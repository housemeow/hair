<script setup lang="ts">
import type { HairColor } from '@/database';
import { computed } from 'vue';

const props = defineProps<{
  color: HairColor;
}>();

const hairColor = computed(() => {
  const [r, g, b, a] = props.color.color;
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
})
</script>

<template>
  <div class="hair-image">
    <img src="@/assets/hair_sample.png" alt="">
    <div class="mask"></div>
  </div>
</template>

<style scoped lang="scss">
.hair-image {
  --hair-color: v-bind('hairColor');
  position: relative;
  border-radius: 50%;
  background-clip: padding-box;

  img {
    border-radius: 50%;
  }

  .mask {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: var(--hair-color);
    mix-blend-mode: multiply;
  }
}
</style>
