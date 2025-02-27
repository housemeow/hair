<script setup lang="ts">
import PrepareView from '@/components/PrepareView/PrepareView.vue';
import MainView from '@/components/MainView/MainView.vue';
import { useMainStore } from '@/stores';

const store = useMainStore();
</script>

<template>
  <div class="background">
    <select class="fixed top-[0em] left-0 z-50" name="" id="" v-model="store.viewState">
      <option value="prepare">Prepare</option>
      <option value="main">Main</option>
    </select>
    <PrepareView v-if="store.viewState==='prepare'" class="main" />
    <MainView v-else-if="store.viewState==='main'" class="main" />
    <footer>Copyright © 2025 AND SHADOW. All rights reserved.</footer>
  </div>
</template>

<style scoped lang="scss">
.background {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center top;
  background-image: url("@/assets/background.webp");

  .main {
    flex: 1;
  }

  footer {
    height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 12px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: center;
    color: #707070;
  }
}

/* 高解析度圖片 (Retina 屏幕 2x) */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .background {
    background-image: url("@/assets/background@2x.webp");
  }
}

/* 超高解析度圖片 (Retina 屏幕 3x) */
@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi) {
  .background {
    background-image: url("@/assets/background@3x.webp");
  }
}

@media screen and (min-width: 601px) {
  .background {
    .main {
    }

    footer {
      margin-bottom: 51px;
      height: auto;
    }
  }
}
</style>
