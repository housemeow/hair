<script setup lang="ts">
import LoadingProgress from '@/components/PrepareView/LoadingProgress.vue';
import ErrorView from '@/components/PrepareView/ErrorDialog.vue';
import PictureSelectButton from '@/components/PrepareView/PictureSelectButton.vue';
import { useMainStore } from '@/stores';
import { onMounted } from 'vue';

const store = useMainStore();

const handleFileSelect = (event: Event) => {
  store.setFile(event);
}

onMounted(() => {
  store.load()
})
</script>

<template>
  <div class="prepare-view">
    <label class="fixed top-[2em] left-[1em] z-50" for="error"><input id="error" type="checkbox" v-model="store.fileError">Error</label>
    <img
      src="@/assets/logo.webp"
      srcset="@/assets/logo@2x.webp 2x,
              @/assets/logo@3x.webp 3x">
    <h1>歡迎使用安夏朵智慧Ai髮色系統</h1>
    <p>最適合亞洲人的矯/補色洗髮精 <br/>隨心所欲玩轉髮色 So easy</p>
    <LoadingProgress v-if="store.loadingVisible"/>
    <PictureSelectButton v-else @change="handleFileSelect" />
    <ErrorView v-if="store.fileError" />
  </div>
</template>

<style scoped lang="scss">
.prepare-view {
  flex: 1;
  display: flex;
  padding-top: 144px;
  padding-bottom: 124px;
  flex-direction: column;
  align-items: center;
  position: relative;

  img {
    width: 140px;
  }

  h1 {
    margin-top: 60px;
    font-size: 17px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.47;
    letter-spacing: normal;
    text-align: center;
    color: #707070;
  }

  p {
    margin-top: 10px;
    font-size: 13px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.54;
    letter-spacing: normal;
    text-align: center;
    color: #707070;
  }

  .loading-progress {
    margin-top: auto;
  }

  .picture-select-button {
    margin-top: auto;
    margin-bottom: -13px;
  }
}

@media screen and (min-width: 600px) {
  .prepare-view {
    padding-top: 215px;
    padding-bottom: 220px;

    img {
      width: 160px;
    }

    h1 {
      margin-top: 68px;
      font-size: 17px;
      font-weight: 500;
      line-height: 1.47;
    }

    p {
      margin-top: 10px;
      font-size: 13px;
    }
  }
}

@media screen and (min-width: 992px) {
  .prepare-view {
    padding-top: 238px;
    padding-bottom: 200px;

    h1 {
      margin-top: 60px;
    }
  }
}
</style>
