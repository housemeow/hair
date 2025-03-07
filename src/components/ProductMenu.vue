<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DyedHair from '@/components/DyedHair.vue'
import { useMainStore } from '@/stores'
import { useRwd } from '@/composables/rwd'

type MainScroller = 'empty' | 'category' | 'hair'
type TouchState = 'start' | 'move' | 'end'

const DEBUG = false
const store = useMainStore()
const rwd = useRwd()
const categoryRef = ref<HTMLUListElement>()
const hairRef = ref<HTMLUListElement>()
const scrolledCategory = ref(0)
const scrolledHairColor = ref(0)
const scrolledHairColorValue = ref(0)
const categoryScrollTimer = ref(0)
const hairScrollTimer = ref(0)
const mainScroller = ref<MainScroller>('empty')
const categoryTouchState = ref<TouchState>('end')
const hairTouchState = ref<TouchState>('end')
const categoryScrolling = ref(false)
const hairScrolling = ref(false)
const scrolling = computed(() => categoryScrolling.value || hairScrolling.value)
const alignScrollerCount = ref(0)

const alignScroller = () => {
  alignScrollerCount.value++
  const currentCategoryIndex = getScrollerCurrentIndex(categoryRef.value!)!
  const currentHairIndex = getScrollerCurrentIndex(hairRef.value!)!
  const categoryScrollLeft = categoryRef.value!.scrollLeft
  const hairScrollLeft = hairRef.value!.scrollLeft
  const categoryScrollToIndex = getCategoryScrollToIndex()
  const hairScrollToIndex = getHairScrollToIndex()

  if (DEBUG) {
    console.log('alignScroller', {
      curCategoryMiddle: currentCategoryIndex.middle,
      categoryScrollLeft,
      curHairMiddle: currentHairIndex.middle,
      hairScrollLeft,
      categoryScrollToIndex,
      hairScrollToIndex,
    })
  }

  if (mainScroller.value === 'category') {
    const categoryChanged = Math.abs(currentCategoryIndex.middle - categoryScrollLeft) > 3
    if (categoryChanged) {
      scrollToItem(categoryRef.value!.children[currentCategoryIndex.i] as HTMLElement)
      return
    }

    const hairChanged = hairScrollToIndex !== undefined && currentHairIndex.i !== hairScrollToIndex
    if (hairChanged) {
      scrollToItem(hairRef.value!.children[hairScrollToIndex] as HTMLElement)
    } else {
      mainScroller.value = 'empty'
      store.selectedColor = store.colors[scrolledHairColor.value]
    }
  } else if (mainScroller.value === 'hair') {
    const hairChanged = Math.abs(currentHairIndex.middle - hairScrollLeft) > 3
    if (hairChanged) {
      scrollToItem(hairRef.value!.children[currentHairIndex.i] as HTMLElement)
      return
    }

    const categoryChanged = categoryScrollToIndex != undefined && currentCategoryIndex.i !== categoryScrollToIndex
    if (categoryChanged) {
      scrollToItem(categoryRef.value!.children[categoryScrollToIndex] as HTMLElement)
    } else {
      mainScroller.value = 'empty'
      store.selectedColor = store.colors[scrolledHairColor.value]
    }
  }
}

const desktopStill = computed(() => !scrolling.value)
const mobileStill = computed(() => !scrolling.value && categoryTouchState.value === 'end' && hairTouchState.value === 'end')

// for desktop
watch(() => scrolling.value, () => {
  const isDesktop = rwd.isDesktop.value
  if (isDesktop && desktopStill.value) {
    alignScroller()
  }
})

// for touch device
watch([scrolling, categoryTouchState, hairTouchState], () => {
  const isTouchDevice = rwd.isMobile.value || rwd.isTablet.value
  if (isTouchDevice && mobileStill.value) {
    alignScroller()
  }
})

const getScrollerCurrentIndex = (list: HTMLUListElement) => {
  const scrollLeft = list.scrollLeft
  const marginLeft = list.clientWidth * 0.5
  const childCount = list.children.length
  /**
     1. scroll-snap-align: start scroll to child(1))
        |1. scrollLeft: scroll container left.
        |2. marginLeft: a space for the first child to align center.
        |3. child.offsetLeft:
        |4. child.clientWidth: child width
        |5.
        |
        |------------------------------------------------------------------|
       >|<scrollLeft (0)                                                   |
        |<-        ::before(50%)        -><-             50%             ->|
        |           (marginLeft)                                           |
        |                                 |-------||-------||-------||-----|
        |                                 |   1   ||   2   ||   3   ||   4 |
        |<--     child1.offsetLeft     -->|-------||-------||-------||-----|
        |<--          child2.offsetLeft         -->|        |        |     |
        |<--               child3.offsetLeft             -->|        |     |
        |<--                    child4.offsetLeft                 -->|     |
        |                                                                  |
        |------------------------------------------------------------------|

      2. scroll-snap-align: center (scroll to child(1))
        |------------------------------------------------------------------|
  <-  ->|scrollLeft (child(1) halfWidth)                                   |
  <-         ::before(50%)       ->                                        |
        |                                 |<- scrollMiddle
        |formula:
        | childSnapOffsetLeft  = child.offsetLeft - marginLeft - childWidth / 2|
        | childSnapOffsetRight = child.offsetLeft - marginLeft + childWidth / 2|
        |                             |-------||-------||-------||-------|||
        |                             |   1   ||   2   ||   3   ||   4   |||
        |                             |-------||-------||-------||-------|||
        |                             <-     ->                            |
        |                            child width                           |
        |------------------------------------------------------------------|
    */
  for (let i = 0; i < childCount; i++) {
    const child = list.children[i] as HTMLElement
    const childWidth = child.clientWidth
    const childSnapOffsetLeft = child.offsetLeft - marginLeft
    const childSnapOffsetRight = childSnapOffsetLeft + childWidth

    const matchedFistChild = i === 0 && scrollLeft < childSnapOffsetRight
    const matchedChild = childSnapOffsetLeft <= scrollLeft && scrollLeft < childSnapOffsetRight
    const matchedLastChild = i === childCount - 1 && childSnapOffsetLeft <= scrollLeft

    if (matchedFistChild || matchedLastChild || matchedChild) {
      const child = list.children[i] as HTMLElement
      const childWidth = child.clientWidth
      const left = child.offsetLeft - marginLeft
      const right = left + childWidth
      const ratio = i + (scrollLeft - left) / (right - left) - 0.5
      const middle = left + childWidth / 2

      if (DEBUG) {
        console.log({ i , ratio, middle })
      }

      return { i, ratio, middle }
    }
  }
}

const handleScroll = (list: HTMLUListElement, indexCallback: (i: number, ratio: number) => void) => {
  const { i, ratio } = getScrollerCurrentIndex(list)!
  indexCallback(i, ratio)
}

const updateCategoryScrollTimer = () => {
  categoryScrolling.value = true
  clearTimeout(categoryScrollTimer.value)
  categoryScrollTimer.value = setTimeout(() => {
    categoryScrolling.value = false
  }, 100)
}

const updateHairScrollTimer = () => {
  hairScrolling.value = true
  clearTimeout(hairScrollTimer.value)
  hairScrollTimer.value = setTimeout(() => {
    hairScrolling.value = false
  }, 100)
}

const getHairScrollToIndex = () => {
  // find the nearest hair color in the new category
  const { i: currentHairIndex } = getScrollerCurrentIndex(hairRef.value!)!
  const categoryHairs = store.colors.map((color, index) => ({
    index,
    category: color.category
  })).filter(color => color.category === store.categories[scrolledCategory.value])
  const categoryHairLeftIndex = categoryHairs[0].index
  const categoryHairRightIndex = categoryHairs[categoryHairs.length - 1].index

  if (currentHairIndex < categoryHairLeftIndex) {
    return categoryHairLeftIndex
  } else if (currentHairIndex > categoryHairRightIndex) {
    return categoryHairRightIndex
  }
}

const moveHairToCategory = () => {
  const scrollToIndex = getHairScrollToIndex()
  if (scrollToIndex === undefined) {
    return
  }

  const hairList = hairRef.value!
  const child = hairList.children[scrollToIndex] as HTMLLIElement
  scrollToItem(child)
}

const getCategoryScrollToIndex = () => {
  const { i: currentCategoryIndex } = getScrollerCurrentIndex(categoryRef.value!)!

  const newCategoryIndex = store.categories.findIndex(category => category === store.colors[scrolledHairColor.value].category)
  if (currentCategoryIndex === newCategoryIndex) {
    return
  }

  return newCategoryIndex
}

const moveCategoryToHair = () => {
  const scrollToIndex = getCategoryScrollToIndex()
  if (scrollToIndex === undefined) {
    return
  }
  const categoryList = categoryRef.value!
  const child = categoryList.children[scrollToIndex] as HTMLLIElement
  scrollToItem(child)
}

const handleCategoryScroll = (e: Event) => {
  if (DEBUG) {
    console.log('scroll category')
  }
  updateCategoryScrollTimer()
  handleScroll(e.target as HTMLUListElement, (newCategoryIndex) => {
    const changed = scrolledCategory.value != newCategoryIndex
    scrolledCategory.value = newCategoryIndex
    if (changed && (mainScroller.value === 'empty' || mainScroller.value === 'category')) {
      mainScroller.value = 'category'
      moveHairToCategory()
    }
  })
}

const handleHairColorScroll = (e: Event) => {
  if (DEBUG) {
    console.log('scroll hair')
  }
  updateHairScrollTimer()
  handleScroll(e.target as HTMLUListElement, (newColorIndex, ratio) => {
    const changed = scrolledHairColor.value != newColorIndex
    scrolledHairColor.value = newColorIndex
    scrolledHairColorValue.value = ratio
    if (changed && (mainScroller.value === 'empty' || mainScroller.value === 'hair')) {
      mainScroller.value = 'hair'
      moveCategoryToHair()
    }
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

const handleWheel = (e: WheelEvent) => {
  wheelHairCount.value++
  return e.deltaX === 0 && Math.abs(e.deltaY) > 1
}

const wheelCategory = (e: WheelEvent) => {
  if (DEBUG) {
    console.log('wheel category', e.deltaX, e.deltaY)
  }
  updateCategoryScrollTimer()
  wheelCategoryCount.value++;
  if (categoryRef.value && handleWheel(e)) {
    categoryRef.value.scrollTo({ left: categoryRef.value.scrollLeft + e.deltaY * store.config.categoryWheelScale, behavior: 'smooth' })
  }
  mainScroller.value = 'category'
}

const wheelHair = (e: WheelEvent) => {
  if (DEBUG) {
    console.log('wheel hair', e.deltaX, e.deltaY)
  }
  updateHairScrollTimer()
  wheelHairCount.value++
  if (hairRef.value && handleWheel(e)) {
    hairRef.value.scrollTo({ left: hairRef.value.scrollLeft + e.deltaY * store.config.colorWheelScale, behavior: 'smooth' })
  }
  mainScroller.value = 'hair'
}

const touchStartCategory = () => {
  if (DEBUG) {
    console.log('touchstart category')
  }
  mainScroller.value = 'category'
  categoryTouchState.value = 'start'
}

const touchStartHair = () => {
  if (DEBUG) {
    console.log('touchstart hair')
  }
  mainScroller.value = 'hair'
  hairTouchState.value = 'start'
}

const touchMoveCategory = () => {
  if (DEBUG) {
    console.log('touchmove category')
  }
  touchMoveCategoryCount.value++
  mainScroller.value = 'category'
  categoryTouchState.value = 'move'
}

const touchMoveHair = () => {
  if (DEBUG) {
    console.log('touchmove hair')
  }
  touchMoveHairCount.value++
  mainScroller.value = 'hair'
  hairTouchState.value = 'move'
}

const touchEndCategory = () => {
  if (DEBUG) {
    console.log('touchend category')
  }
  categoryTouchState.value = 'end'
}

const touchEndHair = () => {
  if (DEBUG) {
    console.log('touchend hair')
  }
  hairTouchState.value = 'end'
}

const scrollToItem = (item: HTMLElement) => {
  const list = item.offsetParent as HTMLUListElement
  const marginLeft = list.clientWidth / 2
  const scrollLeft = item.offsetLeft - marginLeft + item.clientWidth / 2
  if (DEBUG) {
    console.log('scrollToItem', scrollLeft)
  }

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
    <pre v-if="DEBUG" style="font-size: 8px; position: fixed; left: 0; top: 0">{{ {
      mainScroller,
      categoryTouchState,
      hairTouchState,
      categoryScrolling,
      hairScrolling,
      mobileStill,
      desktopStill,
      categoryScrollLeft: categoryRef && categoryRef.scrollLeft,
      hairScrollLeft: hairRef && hairRef.scrollLeft,
      currentCategoryIndex: categoryRef && getScrollerCurrentIndex(categoryRef),
      currentHairIndex: hairRef && getScrollerCurrentIndex(hairRef),
      alignScrollerCount,
    } }}</pre>
    <ul ref="categoryRef" class="category no-scrollbar" @scroll="handleCategoryScroll" @touchstart="touchStartCategory" @touchmove="touchMoveCategory" @touchend="touchEndCategory" @wheel="wheelCategory">
      <li v-for="category in store.categories" :key="category" :class="getCategoryClass(category)" @click="handleClickItem($event, 'category')">{{ category }}</li>
    </ul>
    <div v-if="DEBUG" class="center"></div>
    <div class="hair">
      <img src="@/assets/left-arrow-button.svg" alt="" @click="handleMoveHair($event, -1)" :class="{ invisible: scrolledHairColor === 0 }">
      <ul ref="hairRef" class="no-scrollbar" @scroll="handleHairColorScroll" @wheel="wheelHair" @touchstart="touchStartHair" @touchmove="touchMoveHair" @touchend="touchEndHair">
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
  display: flex;
  flex-direction: column;

  .center {
    align-self: center;
    width: 1px;
    height: 1em;
    background: black;
  }
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
    position: relative;

    &::before, &::after {
      content: '';
      flex: 0 0 100%;
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
      position: relative;

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
    align-items: center;

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
