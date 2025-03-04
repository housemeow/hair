<script setup lang="ts">
import { ref } from 'vue'
import DyedHair from '@/components/DyedHair.vue'
import { useMainStore } from '@/stores'

const store = useMainStore()
const categoryRef = ref<HTMLUListElement>()
const hairRef = ref<HTMLUListElement>()
const scrolledCategory = ref(0)
const scrolledHairColor = ref(0)
const scrolledHairColorValue = ref(0)
const scrollTimer = ref(0)
const mainScroller = ref<'empty'|'category'|'hair'>('empty')

const getScrollerCurrentIndex = (list: HTMLUListElement) => {
  const listBoundingClientRect = list.getBoundingClientRect()
  const scrollLeft = list.scrollLeft
  const MARGIN_LEFT = list.clientWidth * 0.5
  const childCount = list.children.length

  for (let i = 0; i < childCount; i++) {
    const child = list.children[i] as HTMLElement
    const childWidth = child.clientWidth
    const childOffsetInScroller = child.offsetLeft - listBoundingClientRect.left

    if (scrollLeft - childWidth <= childOffsetInScroller - MARGIN_LEFT && childOffsetInScroller - MARGIN_LEFT <= scrollLeft + childWidth || i === childCount - 1) {
      const start = (scrollLeft - childWidth / 2)
      const move = childOffsetInScroller - MARGIN_LEFT
      const diff = move - start
      const ratio = i - diff / childWidth
      return { i, ratio }
    }
  }

  return { i: 0, ratio: 0 }
}

const handleScroll = (list: HTMLUListElement, setIndex: (i: number, ratio: number) => void) => {
  const { i, ratio } = getScrollerCurrentIndex(list)
  setIndex(i, ratio)
}

const updateScrollTimer = () => {
  clearTimeout(scrollTimer.value)
  scrollTimer.value = setTimeout(() => {
    if (mainScroller.value === 'category') {
      moveHairToCategory(scrolledCategory.value)
    } else if (mainScroller.value === 'hair') {
      moveCategoryToHair(scrolledHairColor.value)
    }
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

const wheelCategoryCount = ref(0)
const wheelHairCount = ref(0)
const touchMoveCategoryCount = ref(0)
const touchMoveHairCount = ref(0)

const wheelCategory = (e: WheelEvent) => {
  wheelCategoryCount.value++;
  if (categoryRef.value && e.deltaX === 0) {
    categoryRef.value.scrollTo({ left: categoryRef.value.scrollLeft + e.deltaY, behavior: 'smooth' })
  }
  // if (mainScroller.value === 'hair')  {
  //   moveHairToCategory(scrolledHairColor.value, true)
  // }
  mainScroller.value = 'category'
}

const touchStartCategory = () => {
  // if (mainScroller.value === 'hair')  {
  //   moveHairToCategory(scrolledHairColor.value, true)
  // }
  mainScroller.value = 'category'
}

const touchMoveCategory = () => {
  touchMoveCategoryCount.value++
  mainScroller.value = 'category'
}

const touchEndCategory = () => {
  // moveHairToCategory(scrolledCategory.value, true)
}

const wheelHair = (e: WheelEvent) => {
  wheelHairCount.value++
  if (hairRef.value && e.deltaX === 0) {
    hairRef.value.scrollTo({ left: hairRef.value.scrollLeft + e.deltaY, behavior: 'smooth' })
  }
  // if (mainScroller.value === 'category') {
  //   moveCategoryToHair(scrolledHairColor.value, true)
  // }
  mainScroller.value = 'hair'
}

const touchStartHair = () => {
  // if (mainScroller.value === 'category') {
  //   moveCategoryToHair(scrolledHairColor.value, true)
  // }
  mainScroller.value = 'hair'
}

const touchMoveHair = () => {
  touchMoveHairCount.value++
  mainScroller.value = 'hair'
}

const touchEndHair = () => {
  // moveCategoryToHair(scrolledHairColor.value, true)
}

const getChildRelativeScrollLeft = (child: HTMLElement) => {
  const list = child.parentElement as HTMLUListElement
  const MARGIN_LEFT = list.clientWidth * 0.5
  const listBoundingClientRect = list.getBoundingClientRect()
  const itemOffsetInScroller = (child.offsetLeft - listBoundingClientRect.left - MARGIN_LEFT)
  return child.clientWidth / 2 + itemOffsetInScroller
}

const scrollToItem = (item: HTMLElement) => {
  const scrollLeft = getChildRelativeScrollLeft(item)
  const list = item.parentElement as HTMLUListElement

  list.scrollTo({ left: scrollLeft, behavior: 'smooth' })
}

const handleClickItem = (e: MouseEvent, scroller: typeof mainScroller.value) => {
  mainScroller.value = scroller
  const target = e.currentTarget as HTMLElement as HTMLLIElement
  scrollToItem(target)
}

const handleMoveHair = (event: Event, direction: number) => {
  mainScroller.value = 'hair'
  const list = (event.currentTarget as HTMLElement).parentElement!.querySelector('ul') as HTMLUListElement
  const targetIndex = Math.min(store.colors.length - 1, Math.max(0, scrolledHairColor.value + direction))
  const child = list.children[targetIndex] as HTMLLIElement
  scrollToItem(child)
}
</script>

<template>
  <div class="product-menu">
    <ul ref="categoryRef" class="category no-scrollbar" @scroll="handleCategoryScroll" @touchstart="touchStartCategory" @touchmove="touchMoveCategory" @touchend="touchEndCategory" @wheel="wheelCategory">
      <li v-for="category in store.categories" :key="category" :class="getCategoryClass(category)" @click="handleClickItem($event, 'category')">{{ category }}</li>
    </ul>
    <div class="hair">
      <img src="@/assets/left-arrow-button.svg" alt="" @click="handleMoveHair($event, -1)" :class="{ invisible: scrolledHairColor === 0 }">
      <ul ref="hairRef" class="no-scrollbar" @scroll="handleHairColorScroll" @touchstart="touchStartHair" @touchmove="touchMoveHair" @touchend="touchEndHair" @wheel="wheelHair">
        <li v-for="color in store.colors" :key="color.name" :class="getHairColorClass(color.name)" :style="getHairColorStyle(color.name)" @click="handleClickItem($event, 'hair')">
          <DyedHair :color="color"/>
        </li>
      </ul>
      <img src="@/assets/left-arrow-button.svg" alt="" @click="handleMoveHair($event, 1)" :class="{ invisible: scrolledHairColor === store.colors.length - 1 }">
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-menu {
  .category {
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

        .dyed-hair {
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
          .dyed-hair {
            &:after {
              content: '';
              position: absolute;
              inset: 2px;
              border-radius: 50%;
              border: 2px solid white;
            }
          }
        }
      }
    }
  }
}

@media screen and (min-width: 601px) {
  .product-menu {
    .category {
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
</style>
