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
    <main>
      <img
        src="@/assets/logo.webp"
        srcset="@/assets/logo@2x.webp 2x,
                @/assets/logo@3x.webp 3x">
      <h1>歡迎使用安夏朵智慧Ai髮色系統</h1>
      <p>最適合亞洲人的矯/補色洗髮精 <br/>隨心所欲玩轉髮色 So easy</p>
      <div class="button-animate">
        <Transition
          enter-active-class="animate__animated animate__fadeIn"
          leave-active-class="animate__animated animate__fadeOut"
        >
          <LoadingProgress v-if="store.loadingVisible"/>
          <PictureSelectButton v-else @change="handleFileSelect" />
        </Transition>
      </div>
      <ErrorView v-if="store.fileError" />
    </main>
  </div>
</template>

<style scoped lang="scss">
.prepare-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding-top: 40px;
  padding-bottom: 40px;

  main {
    flex: 1;
    margin-top: -20px;
    max-height: 492px;
    display: flex;
    flex-direction: column;
    align-items: center;

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

    .button-animate {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: auto;

      .loading-progress {
        position: absolute;
        bottom: 0;
      }

      .picture-select-button {
        margin-bottom: -13px;
      }
    }
  }
}

@media screen and (min-width: 600px) {
  .prepare-view {
    padding-top: 75px;
    padding-bottom: 75px;

    main {
      margin-top: -55px;
      max-height: 472px;

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
}

@media screen and (min-width: 992px) {
  .prepare-view {
    padding-top: 47px;
    padding-bottom: 47px;

    main {
      margin-top: -17px;
      max-height: 524px;

      h1 {
        margin-top: 60px;
      }
    }
  }
}
</style>
