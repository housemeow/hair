<script setup lang="ts">
</script>

<template>
  <div class="error-dialog">
    <div>
      <img src="@/assets/error-icon.svg" alt="">
      <p>!! 無法辨識你所選擇的圖片 !!</p>
      <button>請用重新選擇其他張圖片, 謝謝。</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #919191;

  div {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      margin-top: 157px;
      width: 78px;
    }

    p {
      margin-top: 16px;
      font-size: 13px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.54;
      letter-spacing: normal;
      text-align: center;
      color: #fff;
    }

    button {
      margin-top: 82px;
      width: 300px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 25px;
      box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
      background-color: #fff;
      font-size: 15px;
      font-weight: bold;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.67;
      letter-spacing: normal;
      text-align: center;
      color: #919191;
      cursor: pointer;
    }
  }
}
</style>
