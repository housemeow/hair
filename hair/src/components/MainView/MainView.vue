<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import ProductDialog from '@/components/MainView/ProductDialog.vue';
import PictureFrame from '@/components/MainView/PictureFrame.vue';

const doubleProduct = ref();
const categories = ref(['11號', '12號', '粉色系', '紫色系', '灰色系', '藍色系'])
const hairs = ref(['hair1', 'hair2', 'hair3', 'hair4', 'hair5', 'hair6', 'hair7', 'hair8', 'hair9', 'hair10', 'hair11', 'hair12', 'hair13', 'hair14', 'hair15', 'hair16', 'hair17', 'hair18', 'hair19', 'hair20'])
const selectedCategory = ref(0)
const selectedHair = ref(0)
const selectedHairValue = ref(0)
const products = ['long11.png', 'long12.png', 'short21.png', 'short22.png', 'short23.png', 'short24.png']
const productDialog = ref(false)
const infoVisible = ref(false)
const infoRef = ref<HTMLSpanElement>()

const showProduct = () => {
  productDialog.value = true
}

const handleClose = () => {
  productDialog.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  infoVisible.value = false

  console.log('info hide')
  if (infoRef.value && !infoRef.value.contains(e.target as Node)) {
    document.removeEventListener('click', handleClickOutside)
  }
}

const handleClickInfo = (e: MouseEvent) => {
  infoVisible.value = !infoVisible.value

  if (infoVisible.value) {
    e.stopPropagation()
    document.addEventListener('click', handleClickOutside)
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleCategoryScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const category = target as HTMLUListElement
  const scrollLeft = category.scrollLeft
  const MARGIN_LEFT = category.clientWidth * 0.5
  const childCount = category.children.length

  for (let i = 0; i < childCount; i++) {
    const child = category.children[i] as HTMLElement
    const childWidth = child.clientWidth
    if (scrollLeft - childWidth <= child.offsetLeft - MARGIN_LEFT && child.offsetLeft - MARGIN_LEFT <= scrollLeft + childWidth) {
      selectedCategory.value = i
      break
    }
  }
}

const handleHairScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const hair = target as HTMLUListElement
  const scrollLeft = hair.scrollLeft
  const MARGIN_LEFT = hair.clientWidth * 0.5
  const childCount = hair.children.length

  for (let i = 0; i < childCount; i++) {
    const child = hair.children[i] as HTMLElement
    const childWidth = child.clientWidth
    if (scrollLeft - childWidth <= child.offsetLeft - MARGIN_LEFT && child.offsetLeft - MARGIN_LEFT <= scrollLeft) {
      selectedHair.value = i
      const start = (scrollLeft - childWidth / 2)
      const move = child.offsetLeft - MARGIN_LEFT
      const ratio = move - start
      selectedHairValue.value = i - ratio / childWidth
      break
    }
  }
}
const getCategoryClass = (category: string) => {
  return categories.value.findIndex(value => value === category) === selectedCategory.value ? 'active' : ''
}

const getHairClass = (hair: string) => {
  const index = hairs.value.findIndex(value => value === hair)
  if (index === selectedHair.value) {
    return 'active'
  } else if (index === selectedHair.value - 1 || index === selectedHair.value + 1) {
    return 'middle'
  }
  return ''
}

const getHairLiStyle = (hair: string) => {
  const index = hairs.value.findIndex(value => value === hair)
  let ratio = 0;
  ratio = Math.abs((index - selectedHairValue.value)) / 2
  ratio = Math.min(1, Math.max(0, ratio))

  return {
    "--padding-top": `${ratio * 10}px`,
    "--img-width": `${40 + (1 - ratio) * 20}px`,
    "--img-height": `${40 + (1 - ratio) * 20}px`,
    "--shadow-color": `rgba(0, 0, 0, ${0.1 + (1 - ratio) * 0.2})`,
    "--shadow-percent": `${62 + (1 - ratio) * 8}%`,
  }
}

const scrollToItem = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement as HTMLLIElement
  const list = target.parentElement as HTMLUListElement
  const MARGIN_LEFT = list.clientWidth * 0.5
  const scrollLeft = target.offsetLeft + target.clientWidth / 2 - MARGIN_LEFT

  list.scrollTo({ left: scrollLeft, behavior: 'smooth' })
}
</script>

<template>
  <div class="main-view">
    <header>
      <img src="@/assets/logo-header.webp"
          srcset="@/assets/logo-header@2x.webp 2x,
                  @/assets/logo-header@3x.webp 3x"
          class="app">
    </header>
    <label class="fixed top-[1em] left-[1em] z-50" for="doubleProduct"><input id="doubleProduct" type="checkbox" v-model="doubleProduct">Double Product</label>
    <PictureFrame />
    <button @click="showProduct"><img src="@/assets/book-icon.svg" alt="">產品使用說明</button>
    <figure>
      <img src="@/assets/products/product-2-shadow.webp"
        srcset="@/assets/products/product-2-shadow@2x.webp 2x,
                @/assets/products/product-2-shadow@3x.webp 3x"
        class="long-product-shadow">
      <img class="long-product" src="@/assets/products/long11.png" alt="">
      <template v-if="doubleProduct">
        <img src="@/assets/products/product-1-shadow.webp"
          srcset="@/assets/products/product-1-shadow@2x.webp 2x,
                  @/assets/products/product-1-shadow@3x.webp 3x"
          class="short-product-shadow">
        <img class="short-product" src="@/assets/products/short21.png" alt="">
      </template>
    </figure>

    <h1>點選心儀的髮色清單</h1>
    <p>
      即可為您模擬使用安夏朵矯/補色洗髮精的效果
      <span ref="infoRef">
        <img src="@/assets/alert-info-icon.svg" alt="" @click="handleClickInfo">
        <span v-if="infoVisible">此效果模擬圖為漂至歐系7度以上的頭髮效果<br />
          比7度更深的髮色不建議參考此效果</span>
      </span>
    </p>
    <ul class="category" @scroll="handleCategoryScroll">
      <li v-for="category in categories" :class="getCategoryClass(category)" @click="scrollToItem($event)">{{ category }}</li>
    </ul>
    <ul class="hair" @scroll="handleHairScroll">
      <li v-for="hair in hairs" :class="getHairClass(hair)" :style="getHairLiStyle(hair)" @click="scrollToItem($event)">
        <img src="@/assets/hair_sample.png" alt="">
      </li>
    </ul>
    <ProductDialog v-if="productDialog" @close="handleClose" :double-product="doubleProduct" />
  </div>
</template>

<style scoped lang="scss">
.main-view {
  display: flex;
  flex-direction: column;
  flex: 1;

  header {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;

    img {
      width: 120px;
      margin-left: 25px;
    }
  }

  .picture-frame {
    flex: 1;
  }

  button {
    margin-top: -25px;
    z-index: 1;
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

    img {
      width: 15px;
      margin-right: 8px;
    }
  }

  figure {
    position: relative;
    z-index: 1;
    width: 1px;
    height: 1px;
    background: black;
    align-self: flex-end;

    .long-product, .short-product, .long-product-shadow, .short-product-shadow {
      max-width: none;
      position: absolute;
    }

    .long-product-shadow {
      width: 76px;
      right: 2px;
      bottom: -38px;
    }

    .long-product {
      right: 11px;
      bottom: -24px;
      width: 57px;
    }

    .short-product-shadow {
      bottom: -38px;
      right: 50px;
      width: 60px;
    }

    .short-product {
      right: 52px;
      bottom: -30px;
      width: 57px;
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
        z-index: 1;

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

  .category {
    margin-top: 14px;
    margin-left: 8px;
    margin-right: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #cbcbcb;
    flex-shrink: 0;
    display: flex;
    list-style: none;
    overflow: auto;
    scroll-snap-type: x mandatory;

    &::before, &::after {
      content: '';
      flex: 0 0 50%;
    }

    li {
      scroll-snap-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      padding: 0 9px;
      height: 27px;
      border-radius: 13.5px;
      font-family: SegoeUI;
      font-size: 15px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: normal;
      letter-spacing: normal;
      text-align: center;
      color: #707070;

      &.active {
        background-color: #707070;
        color: #fff;
      }

      + li {
        margin-left: 2px;
      }
    }
  }

  .hair {
    margin-top: 8px;
    height: 85px;
    display: flex;
    overflow: auto;
    flex-shrink: 0;
    scroll-snap-type: x mandatory;

    &:before, &:after {
      content: '';
      flex: 0 0 50%;
    }

    li {
      --padding-top: 10px;
      --img-width: 40px;
      --img-height: 40px;
      --shadow-color: rgba(0, 0, 0, 0.1);
      --shadow-percent: 62%;

      flex: 0 0 20%;
      position: relative;
      scroll-snap-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--padding-top);
      transition: 0.1s;

      img {
        border: 2px solid transparent;
        padding: 2px;
        border-radius: 50%;
        transition: 0.1s;
        width: var(--img-width);
        height: var(--img-height);
      }

      &::after {
        content: '';
        display: block;
        width: 40px;
        height: 30px;
        margin: 5px 0 0;
        background-image: radial-gradient(ellipse at 50% 50%, var(--shadow-color), rgba(0, 0, 0, 0) var(--shadow-percent));
        transition: 0.1s;
      }

      &.active {
        img {
          border-color: #707070;
        }
      }
    }
  }
}
</style>
