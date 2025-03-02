<script setup lang="ts">
import { useMainStore } from '@/stores';
import { ref } from 'vue';

export interface ImageInputExpose {
  input: HTMLInputElement | undefined;
}

const store = useMainStore()
const root = ref<HTMLInputElement>();

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  store.selectedFile = file;
  root.value!.value = '';
}

defineExpose({
  input: root
})
</script>

<template>
  <input ref="root" class="image-input" type="file" accept="image/*" @change="handleFileChange" v-bind="$attrs" />
</template>

<style scoped>
.image-input {
  display: none
}
</style>
