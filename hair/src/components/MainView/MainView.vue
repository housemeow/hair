<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import ProductDialog from '@/components/MainView/ProductDialog.vue';
import PictureFrame from '@/components/MainView/PictureFrame.vue';
import HairImage from '@/components/HairImage.vue';
import { useMainStore } from '@/stores';
import ProductImage from '../ProductImage.vue';

const store = useMainStore()

const categoryRef = ref<HTMLUListElement>()
const hairRef = ref<HTMLUListElement>()
const scrolledCategory = ref(0)
const scrolledHairColor = ref(0)
const scrolledHairColorValue = ref(0)
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

const handleScroll = (list: HTMLUListElement, setIndex: (i: number, ratio: number) => void) => {
  const listBoundingClientRect = list.getBoundingClientRect()
  const scrollLeft = list.scrollLeft
  const MARGIN_LEFT = list.clientWidth * 0.5
  const childCount = list.children.length

  for (let i = 0; i < childCount; i++) {
    const child = list.children[i] as HTMLElement
    const childWidth = child.clientWidth
    const childOffsetInScroller = child.offsetLeft - listBoundingClientRect.left

    if (scrollLeft - childWidth <= childOffsetInScroller - MARGIN_LEFT && childOffsetInScroller - MARGIN_LEFT <= scrollLeft + childWidth) {
      const start = (scrollLeft - childWidth / 2)
      const move = childOffsetInScroller - MARGIN_LEFT
      const diff = move - start
      const ratio = i - diff / childWidth
      setIndex(i, ratio)
      break
    }
  }
}

const scrollTimer = ref(0)
const mainScroller = ref<'empty'|'category'|'hair'>('empty')

const updateScrollTimer = () => {
  clearTimeout(scrollTimer.value)
  scrollTimer.value = setTimeout(() => {
    mainScroller.value = 'empty'
    store.selectedColor = store.colors[scrolledHairColor.value]
  }, 30)
}

const moveHairToCategory = (newCategoryIndex: number, force?: boolean) => {
  let scrollToIndex = null
  // new position is on the left, move to the most right color
  if (newCategoryIndex < scrolledCategory.value) {
    for (let i = store.colors.length - 1; i >= 0; i--) {
      if (store.colors[i].category === store.categories[newCategoryIndex]) {
        scrollToIndex = i
        break
      }
    }
  // new position is on the right, move to the most left color
  } else if (force || newCategoryIndex > scrolledCategory.value) {
    for (let i = 0; i < store.colors.length; i++) {
      if (store.colors[i].category === store.categories[newCategoryIndex]) {
        scrollToIndex = i
        break
      }
    }
  }
  if (scrollToIndex === null) {
    return;
  }
  const hairList = hairRef.value!
  const child = hairList.children[scrollToIndex] as HTMLLIElement
  scrollToItem(child)
}

const handleCategoryScroll = (e: Event) => {
  updateScrollTimer()
  handleScroll(e.target as HTMLUListElement, (newCategoryIndex) => {
    if (mainScroller.value === 'empty' || mainScroller.value === 'category') {
      mainScroller.value = 'category'
      moveHairToCategory(newCategoryIndex)
    }

    scrolledCategory.value = newCategoryIndex
  })
}

const moveCategoryToHair = (newColorIndex: number, force?: boolean) => {
  const originalCategoryIndex = store.categories.findIndex(category => category === store.colors[scrolledHairColor.value].category)
  const newCategoryIndex = store.categories.findIndex(category => category === store.colors[newColorIndex].category)
  if (!(force || originalCategoryIndex !== newCategoryIndex)) {
    return;
  }
  const categoryList = categoryRef.value!
  const child = categoryList.children[newCategoryIndex] as HTMLLIElement
  scrollToItem(child)
}

const handleHairColorScroll = (e: Event) => {
  updateScrollTimer()
  handleScroll(e.target as HTMLUListElement, (newColorIndex, ratio) => {
    if (mainScroller.value === 'empty' || mainScroller.value === 'hair') {
      mainScroller.value = 'hair'
      moveCategoryToHair(newColorIndex)
    }

    scrolledHairColor.value = newColorIndex
    scrolledHairColorValue.value = ratio
  })
}
const getCategoryClass = (category: string) => {
  return store.categories.findIndex(value => value === category) === scrolledCategory.value ? 'active' : ''
}

const getHairColorClass = (color: string) => {
  const index = store.colors.findIndex(value => value.name === color)
  if (index === scrolledHairColor.value) {
    return 'active'
  } else if (index === scrolledHairColor.value - 1 || index === scrolledHairColor.value + 1) {
    return 'middle'
  }
  return ''
}

const getHairColorStyle = (color: string) => {
  const index = store.colors.findIndex(value => value.name === color)
  let ratio = 0;
  ratio = Math.abs((index - scrolledHairColorValue.value)) / 2
  ratio = Math.min(1, Math.max(0, ratio))

  return {
    "--padding-top": `${ratio * 10}px`,
    "--img-width": `${40 + (1 - ratio) * 20}px`,
    "--img-height": `${40 + (1 - ratio) * 20}px`,
    "--shadow-color": `rgba(0, 0, 0, ${0.1 + (1 - ratio) * 0.2})`,
    "--shadow-percent": `${62 + (1 - ratio) * 8}%`,
  }
}

const touchStartCategory = () => {
  mainScroller.value = 'category'
}

const wheelCategory = (e: WheelEvent) => {
  mainScroller.value = 'category'
}

const touchEndCategory = () => {
  moveHairToCategory(scrolledCategory.value, true)
}

const touchStartHair = () => {
  mainScroller.value = 'hair'
}

const wheelHair = (e: WheelEvent) => {
  mainScroller.value = 'hair'
}

const touchEndHair = () => {
  moveCategoryToHair(scrolledHairColor.value, true)
}

const scrollToItem = (item: HTMLElement) => {
  const list = item.parentElement as HTMLUListElement
  const MARGIN_LEFT = list.clientWidth * 0.5
  const listBoundingClientRect = list.getBoundingClientRect()
  const itemOffsetInScroller = (item.offsetLeft - listBoundingClientRect.left - MARGIN_LEFT)
  const scrollLeft = item.clientWidth / 2 + itemOffsetInScroller

  list.scrollTo({ left: scrollLeft, behavior: 'smooth' })
}

const handleClickItem = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement as HTMLLIElement
  scrollToItem(target)
}

const handleMove = (event: Event, direction: number) => {
  const list = (event.currentTarget as HTMLElement).parentElement!.querySelector('ul') as HTMLUListElement
  const targetIndex = Math.min(store.colors.length - 1, Math.max(0, scrolledHairColor.value + direction))
  const child = list.children[targetIndex] as HTMLLIElement
  scrollToItem(child)
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
    <button @click="showProduct"><img src="@/assets/book-icon.svg" alt="">
      產品使用說明
      <figure>
        <img src="@/assets/products/product-2-shadow.webp"
          srcset="@/assets/products/product-2-shadow@2x.webp 2x,
                  @/assets/products/product-2-shadow@3x.webp 3x"
          class="long-product-shadow">
        <ProductImage class="long-product" :product="store.selectedColor.product1" />
        <template v-if="store.selectedColor.product2">
          <img src="@/assets/products/product-1-shadow.webp"
            srcset="@/assets/products/product-1-shadow@2x.webp 2x,
                    @/assets/products/product-1-shadow@3x.webp 3x"
            class="short-product-shadow">
          <ProductImage class="short-product" :product="store.selectedColor.product2" />
        </template>
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
    <ul ref="categoryRef" class="category no-scrollbar" @scroll="handleCategoryScroll" @touchstart="touchStartCategory" @touchend="touchEndCategory" @wheel="wheelCategory">
      <li v-for="category in store.categories" :class="getCategoryClass(category)" @click="handleClickItem($event)">{{ category }}</li>
    </ul>
    <div class="hair">
      <img src="@/assets/left-arrow-button.svg" alt="" @click="handleMove($event, -1)" :class="{ invisible: scrolledHairColor === 0 }">
      <ul ref="hairRef" class="no-scrollbar" @scroll="handleHairColorScroll" @touchstart="touchStartHair" @touchend="touchEndHair" @wheel="wheelHair">
        <li v-for="color in store.colors" :class="getHairColorClass(color.name)" :style="getHairColorStyle(color.name)" @click="handleClickItem($event)">
          <HairImage :color="color"/>
        </li>
      </ul>
      <img src="@/assets/left-arrow-button.svg" alt="" @click="handleMove($event, 1)" :class="{ invisible: scrolledHairColor === store.colors.length - 1 }">
    </div>
    <ProductDialog v-if="store.productDialog" />
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
    position: relative;
    cursor: pointer;

    > img {
      width: 15px;
      margin-right: 8px;
    }

    figure {
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
      cursor: pointer;

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
    flex-shrink: 0;
    display: flex;

    > img {
      display: none;
    }

    ul {
      flex: 1;
      height: 85px;
      display: flex;
      overflow: auto;
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
        cursor: pointer;

        .hair-image {
          border: 2px solid transparent;
          padding: 2px;
          transition: 0.1s;
          width: var(--img-width);
          height: var(--img-height);

          :deep(.mask) {
            inset: 2px;
          }
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
          .hair-image {
            border-color: var(--hair-color);
          }
        }
      }
    }
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

    .category {
      margin-top: 69px;
      margin-left: 0;
      margin-right: 0;
      width: 544px;
    }

    .hair {
      width: 556px;
      margin-bottom: 37px;

      > img {
        align-self: flex-start;
        margin-top: 18px;
        display: block;
        width: 12px;
        cursor: pointer;
        transition: 0.1s;
        opacity: 1;

        &.invisible {
          opacity: 0;
        }

        &:first-child {
          margin-right: 10px;
        }

        &:last-child {
          margin-left: 10px;
          transform: rotate(180deg);
        }
      }

      ul {
        li {
          --padding-top: 10px;
          --img-width: 40px;
          --img-height: 40px;
          --shadow-color: rgba(0, 0, 0, 0.1);
          --shadow-percent: 62%;
          flex: 0 0 calc(100% / 7);
        }
      }
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

    .category {
      margin-top: 34px;
    }
  }
}
</style>
