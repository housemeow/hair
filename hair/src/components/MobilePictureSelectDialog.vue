<script setup lang="ts">
import { useMainStore } from '@/stores';
import ImageInput from '@/components/ImageInput.vue';

const store = useMainStore()

const handleClickFile = (e: Event) => {
  (e.currentTarget as HTMLElement).querySelector('input')!.click();
}

const close = () => {
  store.isMobileDialogShow = false;
}
</script>

<template>
  <div class="mobile-picture-select-dialog" @click.self="close">
    <dialog>
      <button @click="handleClickFile">
        <img src="@/assets/take-picture-icon.svg" alt="">
        <span>重新拍攝</span>
        <ImageInput ref="selfieFile" capture="user" />
      </button>
      <button @click="handleClickFile">
        <img src="@/assets/choice-file-icon.svg" alt="">
        <span>選擇現成檔案</span>
        <ImageInput ref="selectFile" />
      </button>
    </dialog>
  </div>
</template>

<style scoped lang="scss">
.mobile-picture-select-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff 34%, #fff 65%, rgba(255, 255, 255, 0));

  dialog {
    display: flex;
    align-items: center;
    width: 307px;
    height: 144px;
    padding: 20px 10px;
    border-radius: 22px;
    background-color: #919191;

    button {
      flex: 1 0 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;

      img {
        height: 42px;
      }

      span {
        margin-top: 12px;
        font-size: 15px;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.67;
        letter-spacing: normal;
        text-align: center;
        color: #fff;
      }

      + button {
        border-left: 1px solid #fff;
      }
    }
  }
}
</style>
