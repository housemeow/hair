import CanvasRenderer from '@/canvasRenderer';
import Database from '@/database';
import HairProcessor from '@/hairProcessor';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

type ViewState = 'prepare' | 'main';

export const useMainStore = defineStore('main', () => {
  const COLOR_DATABASE =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFFONBmJrC2GaZpGYI_gjXPWnOizakJK6l5AkXyZ7NxzBhkTaejfLEQTnjpUFrR3ZR_MD3UdNJhSEj/pub?gid=0&single=true&output=tsv";
  const CONFIG_DATABASE =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFFONBmJrC2GaZpGYI_gjXPWnOizakJK6l5AkXyZ7NxzBhkTaejfLEQTnjpUFrR3ZR_MD3UdNJhSEj/pub?gid=237858754&single=true&output=tsv";

  const database = ref(new Database(COLOR_DATABASE, CONFIG_DATABASE))
  const hairProcessor = ref<HairProcessor>();

  // global state
  const viewState = ref<ViewState>('prepare');

  // loading state
  const LOADING_DISPLAY_FLOATING = 0
  const LOADING_FPS = 20
  const LOADING_SWITCH_TIMEOUT = 1000
  const loadingVisible = ref(true);
  const loadingCount = ref(0)
  const loadingTotal = ref(0)
  const displayRatioStart = ref(0);
  const displayRatioEnd = ref(0);
  const displayRatio = ref(0);

  const loading = computed(() => loadingTotal.value === 0 || loadingCount.value < loadingTotal.value);
  const loadingRatio = computed(() => {
    if (loadingTotal.value === 0) {
      return 1
    }
    return loadingCount.value / loadingTotal.value
  })
  const displayPercent = computed(() => Math.round(displayRatio.value * 100 * 10 ** LOADING_DISPLAY_FLOATING) / 10 ** LOADING_DISPLAY_FLOATING);
  const loadingProgressWidth = computed(() => `${displayPercent.value}%`);

  watch(() => loadingRatio.value, (ratio) => {
    displayRatioEnd.value = ratio;
  })

  watch(() => displayRatio.value, (ratio) => {
    if (ratio === 1) {
      setTimeout(() => loadingVisible.value = false, LOADING_SWITCH_TIMEOUT)
    }
  })

  const displayInterval = setInterval(() => {
    const incremental = (displayRatioEnd.value - displayRatioStart.value) * (1 / LOADING_FPS)
    displayRatio.value = Math.min(displayRatio.value + incremental, displayRatioEnd.value);

    if (Math.abs(displayRatioEnd.value - displayRatio.value) < 0.01) {
      displayRatioStart.value = displayRatioEnd.value;
      displayRatio.value = displayRatioEnd.value;
    }

    if (displayRatio.value === 1) {
      clearInterval(displayInterval);
    }
  }, 1000 / LOADING_FPS)

  async function load() {
    loadingTotal.value = 3

    await database.value.load().then(() => loadingCount.value++)
    hairProcessor.value = new HairProcessor({
      blur: 0,
      confidenceThreshold1: 0.5,
      confidenceThreshold2: 0.5,
      src: '',
      renderMode: 'category',
      hairColor: [0, 0, 0, 0],

    })
    hairProcessor.value.loadWasm()
      .then(() => loadingCount.value++)
      .then(() => hairProcessor.value?.loadModel())
      .then(() => loadingCount.value++)
  }

  // file selection state
  const fileError = ref(false);
  const isMobileDialogShow = ref(false);
  const selectedImage = ref('');

  function setFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const resizedDataURL = await CanvasRenderer.getCroppedImage(
        e.target!.result as string,
        500
      );
      selectedImage.value = resizedDataURL;
      viewState.value = 'main'
      console.log(resizedDataURL)
    };

    reader.readAsDataURL(file);
  }

  return {
    loading,
    loadingVisible,
    fileError,
    isMobileDialogShow,
    viewState,
    selectedImage,
    loadingCount,
    loadingTotal,
    loadingRatio,
    displayRatio,
    loadingProgressWidth,
    displayPercent,
    load,
    setFile,
  };
});
