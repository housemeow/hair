<script setup lang="ts">
import PrepareView from '@/components/PrepareView/PrepareView.vue';
import MainView from '@/components/MainView/MainView.vue';
import { useMainStore } from '@/stores';

const store = useMainStore();
</script>

<template>
  <div class="background">
    <div class="main">
      <Transition name="fade" mode="out-in">
        <PrepareView v-if="store.viewState==='prepare'" />
        <MainView v-else-if="store.viewState==='main'" />
      </Transition>
    </div>
    <footer>Copyright © 2025 AND SHADOW. All rights reserved.</footer>
  </div>
</template>

<style scoped lang="scss">
.background {
  height: calc(100 * var(--vh));
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center top;
  background-image: url("@/assets/background.webp");
  position: relative;
  overflow: hidden;

  .main {
    flex: 1;
    position: relative;
  }

  .prepare-view, .main-view {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }

  footer {
    flex-shrink: 0;
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
