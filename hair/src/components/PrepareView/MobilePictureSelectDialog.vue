<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits();

const selfieFile = ref<HTMLInputElement>();
const selectFile = ref<HTMLInputElement>();

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    console.log(file);
  } else {
    console.log('no file');
  }
  target.value = '';
  emit('select', file);
}

const close = () => {
  emit('close');
}
</script>

<template>
  <div class="mobile-picture-select-dialog" @click.self="close">
    <dialog>
      <button>
        <img src="@/assets/take-picture-icon.svg" alt="">
        <span>重新拍攝</span>
        <input ref="selfieFile" type="file" capture="user" accept="image/*" @change="handleFileChange" style="display: none">
      </button>
      <button>
        <img src="@/assets/choice-file-icon.svg" alt="">
        <span>選擇現成檔案</span>
        <input ref="selectFile" type="file" accept="image/*" @change="handleFileChange" style="display: none">
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
