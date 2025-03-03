<template>
  <dialog class="mobile-landscape-dialog">
    wefew
    <img src="@/assets/landscape-icon.svg" alt="">
    <p>請用垂直方向進行操作, 謝謝。</p>
    <footer>Copyright © 2025 AND SHADOW. All rights reserved.</footer>
  </dialog>
</template>

<style scoped lang="scss">
dialog {
  display: none;
}

@media only screen and (max-device-height: 600px)
                   and (orientation: landscape) {
  dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-color: #919191;
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      margin-top: 107px;
      width: 93.3px;
    }

    p {
      margin-top: 22px;
      font-size: 15px;
      font-weight: bold;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.67;
      letter-spacing: normal;
      text-align: center;
      color: #fff;
    }

    footer {
      margin-top: auto;
      margin-bottom: 25px;
      font-size: 12px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: normal;
      letter-spacing: normal;
      text-align: center;
      color: #fff;
    }
  }
}
</style>
