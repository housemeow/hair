import { computed, onMounted, onUnmounted, ref } from "vue"

export const useRwd = () => {
  const width = ref(window.innerWidth)

  const isMobile = computed(() => width.value <= 600)
  const isTablet = computed(() => 600 < width.value && width.value <= 991)
  const isDesktop = computed(() => 992 <= width.value)

  const updateWidth = () => {
    width.value = window.innerWidth
  }

  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  return { isMobile, isTablet, isDesktop }
}
