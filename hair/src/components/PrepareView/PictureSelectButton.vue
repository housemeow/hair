<script setup lang="ts">
import { ref } from 'vue';
import MobilePictureSelectDialog from '@/components/PrepareView/MobilePictureSelectDialog.vue';
import { useRwd } from '@/composables/rwd';

const emit = defineEmits();

const isMobileDialogShow = ref(false);
const rwd = useRwd();
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    console.log(file);
  } else {
    console.log('no file');
  }
  target.value = '';
  emit('change', file);
}

const handleSelectFile = (file: File) => {
  emit('change', file);
}

const handleClick = () => {
  if (rwd.isMobile || rwd.isTablet) {
    isMobileDialogShow.value = true;
  } else {
    const fileInput = ref('file') as any;
    fileInput.value.click();
  }
}

const handleClose = () => {
  isMobileDialogShow.value = false;
}
</script>

<template>
  <div class="picture-select-button" >
    <button>
      <img class="cursor-pointer" src="@/assets/select-photo-button.webp"
        srcset="@/assets/select-photo-button@2x.webp 2x,
                @/assets/select-photo-button@3x.webp 3x"
                @click="handleClick">
      <input type="file" ref="file" accept="image/*" @change="handleFileChange" style="display: none">
    </button>
    <p>建議使用沒有帽子或髮飾遮擋頭髮的照片為佳</p>
    <MobilePictureSelectDialog v-if="isMobileDialogShow" @select="handleSelectFile" @close="handleClose" />
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
