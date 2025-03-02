<script setup lang="ts">
import { useImageInput } from '@/composables/useImageInput';
import { useMainStore } from '@/stores';
import MobilePictureSelectDialog from '@/components/PrepareView/MobilePictureSelectDialog.vue';
import ImageInput from '@/components/ImageInput.vue';

const { fileRef, triggerFileSelection } = useImageInput();

const store = useMainStore()
</script>

<template>
  <div class="picture-select-button">
    <button>
      <img class="cursor-pointer" src="@/assets/select-photo-button.webp"
        srcset="@/assets/select-photo-button@2x.webp 2x,
                @/assets/select-photo-button@3x.webp 3x"
                @click="triggerFileSelection">
      <ImageInput ref="fileRef" />
    </button>
    <p>建議使用沒有帽子或髮飾遮擋頭髮的照片為佳</p>
  </div>
</template>

<style scoped lang="scss">
.picture-select-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  button {
    img {
      width: 287px;
    }
  }

  p {
    font-size: 13px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.92;
    letter-spacing: normal;
    text-align: center;
    color: #707070;
    position: absolute;
    top: calc(100% - 5px);
  }
}
</style>
