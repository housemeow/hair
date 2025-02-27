<script setup lang="ts">
import { useMainStore } from '@/stores';

const store = useMainStore();
</script>

<template>
  <div class="loading-progress flex flex-col items-center justify-center w-[270px] h-[50px]">
    <span>Loading...</span>
    <div class="bar-container mt-[2px]"><div :style="{ width: store.loadingProgressWidth}"></div></div>
    <span class="mt[4px]">{{store.displayPercent}}%</span>
  </div>
</template>

<style scoped lang="scss">
.loading-progress {
  width: 270px;
  height: 50px;
  padding: 9px 20px 7px;
  border-radius: 25px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  background-color: #fff;

  span {
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 10px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: center;
    color: #707070;
  }

  .bar-container {
    width: 100%;
    height: 6px;
    padding: 2px;
    border-radius: 3px;
    background-color: #ebebeb;

    div {
      transition: 0.1s;
      height: 2px;
      background-color: #000;
      border-radius: 1px;
    }
  }
}
</style>
