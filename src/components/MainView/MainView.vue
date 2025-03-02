<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import PictureFrame from '@/components/MainView/PictureFrame.vue';
import { useMainStore } from '@/stores';
import ProductImage from '@/components/ProductImage.vue';
import ProductMenu from '@/components/ProductMenu.vue';

const store = useMainStore()

const infoRef = ref<HTMLSpanElement>()

const showProduct = () => {
  store.productDialog = true
}

const handleClickOutside = (e: MouseEvent) => {
  store.infoVisible = false

  console.log('info hide')
  if (infoRef.value && !infoRef.value.contains(e.target as Node)) {
    document.removeEventListener('click', handleClickOutside)
  }
}

const handleClickInfo = (e: MouseEvent) => {
  store.infoVisible = !store.infoVisible

  if (store.infoVisible) {
    e.stopPropagation()
    document.addEventListener('click', handleClickOutside)
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="main-view">
    <header>
      <img src="@/assets/logo-header.webp"
          srcset="@/assets/logo-header@2x.webp 2x,
                  @/assets/logo-header@3x.webp 3x"
          class="app">
    </header>
    <PictureFrame />
    <button @click="showProduct"><img src="@/assets/book-icon.svg" alt="">
      產品使用說明
      <figure>
        <img src="@/assets/products/product-2-shadow.webp"
          srcset="@/assets/products/product-2-shadow@2x.webp 2x,
                  @/assets/products/product-2-shadow@3x.webp 3x"
          class="long-product-shadow">
        <ProductImage class="long-product" :product="store.selectedColor.product1" />
        <Transition
          enter-active-class="animate__animated animate__fadeIn"
          leave-active-class="animate__animated animate__fadeOut"
        >
          <img v-if="store.selectedColor.product2" src="@/assets/products/product-1-shadow.webp"
            srcset="@/assets/products/product-1-shadow@2x.webp 2x,
                    @/assets/products/product-1-shadow@3x.webp 3x"
            class="short-product-shadow">
        </Transition>
        <Transition
          enter-active-class="animate__animated animate__fadeIn"
          leave-active-class="animate__animated animate__fadeOut"
        >
        <ProductImage v-if="store.selectedColor.product2" class="short-product" :product="store.selectedColor.product2" />
      </Transition>
      </figure>
    </button>

    <h1>點選心儀的髮色清單</h1>
    <p>
      即可為您模擬使用安夏朵矯/補色洗髮精的效果
      <span ref="infoRef">
        <img src="@/assets/alert-info-icon.svg" alt="" @click="handleClickInfo">
        <span v-if="store.infoVisible">此效果模擬圖為漂至歐系7度以上的頭髮效果<br />
          比7度更深的髮色不建議參考此效果</span>
      </span>
    </p>
    <ProductMenu />
  </div>
</template>

<style scoped lang="scss">
.main-view {
  display: flex;
  flex-direction: column;
  flex: 1;

  header {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 120px;
      margin-left: 25px;
    }
  }

  .picture-frame {
    margin-top: 17px;
    flex: 1;
  }

  button {
    margin-top: -25px;
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.67;
    letter-spacing: normal;
    text-align: center;
    color: #fff;
    border-image-slice: 50 42 0 42;
    border-image-width: 50px 42px 0px 42px;
    border-image-outset: 0px 0px 0px 0px;
    border-image-repeat: stretch round;
    border-image-source: url("@/assets/black_btn_bg_all.png");
    border-style: solid;
    border-radius: 25px;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
    position: relative;
    cursor: pointer;

    > img {
      width: 15px;
      margin-right: 8px;
    }

    figure {
      pointer-events: none;
      position: absolute;
      right: 0;
      bottom: 0;
      background: black;

      .long-product, .short-product, .long-product-shadow, .short-product-shadow {
        max-width: none;
        position: absolute;
      }

      .long-product-shadow {
        width: 76px;
        right: 3px;
        bottom: -35px;
      }

      .long-product {
        width: 57px;
        right: 11px;
        bottom: -22px;
      }

      .short-product-shadow {
        width: 60px;
        right: 51px;
        bottom: -39px;
      }

      .short-product {
        width: 57px;
        right: 52px;
        bottom: -30px;
      }
    }
  }

  h1 {
    margin: 11px 8px 0;
    font-size: 13px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    text-align: left;
    color: #707070;
  }

  p {
    margin-left: 8px;
    font-size: 10px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    text-align: left;
    color: #707070;

    > span {
      position: relative;
      cursor: pointer;

      img {
        display: inline;
        margin-left: 4px;
        margin-top: -2px;
      }

      span {
        position: absolute;
        right: -80.5px;
        bottom: calc(100% + 4px);
        width: 246px;
        height: 56px;
        padding: 6px 7px 4px 16px;
        border-radius: 10px;
        filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.16));
        background-color: #707070;
        font-size: 11px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.82;
        letter-spacing: normal;
        text-align: left;
        color: #fff;

        &::after {
          content: '';
          display: block;
          position: absolute;
          top: 100%;
          right: 80px;
          width: 0px;
          height: 0px;
          border-style: solid;
          border-width: 16px 8px 0 8px;
          border-color: #707070 transparent transparent transparent;
        }
      }
    }
  }

  .product-menu {
    margin-top: 14px;
  }
}

@media screen and (min-width: 601px) {
  .main-view {
    align-items: center;

    header {
      margin-top: 34px;

      img {
        width: 152px;
        margin-left: 33px;
      }
    }

    .picture-frame {
      margin-top: 56px;
      width: 375px;
      max-height: 500px;
    }

    button {
      width: 375px;

      figure {
        .long-product-shadow {
          width: 99px;
          right: -67px;
          bottom: -41px;
        }

        .long-product {
          width: 73px;
          right: -57px;
          bottom: -24px;
        }

        .short-product-shadow {
          width: 78px;
          right: -4px;
          bottom: -47px;
        }

        .short-product {
          width: 74px;
          right: -3px;
          bottom: -34px;
        }
      }
    }

    h1 {
      margin-top: 46px;
    }

    .product-menu {
      margin-top: 69px;
    }
  }
}

@media screen and (min-width: 992px) {
  .main-view {
    header {
      img {
        width: 230px;
      }
    }

    .picture-frame {
      margin-top: 38px;
    }

    button {
      figure {
        .long-product-shadow {
          width: 99px;
          right: -54px;
          bottom: -38px;
        }

        .long-product {
          width: 73px;
          right: -54px;
          bottom: -38px;
        }

        .short-product-shadow {
          width: 78px;
          right: -9px;
          bottom: -44px;
        }

        .short-product {
          width: 74px;
          right: 10px;
          bottom: -31px;
        }
      }
    }

    h1 {
      margin-top: 64px;
    }

    .product-menu {
      margin-top: 34px;
    }
  }
}
</style>
