import { ref } from 'vue';
import { useMainStore } from '@/stores';
import { useRwd } from '@/composables/rwd';
import type { ImageInputExpose } from '@/components/ImageInput.vue';

export function useImageInput() {
  const store = useMainStore();
  const rwd = useRwd();
  const fileRef = ref<ImageInputExpose>();

  const triggerFileSelection = () => {
    if (rwd.isMobile.value || rwd.isTablet.value) {
      store.isMobileDialogShow = true;
    } else {
      fileRef.value?.input?.click();
    }
  };

  return {
    fileRef,
    triggerFileSelection,
  };
}
