import CanvasRenderer from '@/canvasRenderer';
import Database from '@/database';
import type { AppConfig, HairColor } from '@/database';
import HairProcessor from '@/hairProcessor';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import * as util from '@/util'
import long11 from '@/assets/products/long11.png'
import long12 from '@/assets/products/long12.png'
import short21 from '@/assets/products/short21.png'
import short22 from '@/assets/products/short22.png'
import short23 from '@/assets/products/short23.png'
import short24 from '@/assets/products/short24.png'
import hair from '@/assets/hair_sample.png'
import logo from '@/assets/logo-header.webp'
import product2Shadow from '@/assets/products/product-2-shadow.webp'
import product1Shadow from '@/assets/products/product-1-shadow.webp'
import shadowMobileTopLeft from '@/assets/shadow_tl_1.png';
import shadowTopLeft from '@/assets/shadow_tl_2.png';
import shadowTop from '@/assets/shadow_t.png';
import shadowTopRight from '@/assets/shadow_tr.png';
import shadowLeft from '@/assets/shadow_l.png';
import shadowRight from '@/assets/shadow_r.png';
import shadowBottomLeft from '@/assets/shadow_bl.png';
import shadowBottom from '@/assets/shadow_b.png';
import shadowBottomRight from '@/assets/shadow_br.png';
import maskTopLeft from '@/assets/mask_tl.png';
import maskTopRight from '@/assets/mask_tr.png';
import background from '@/assets/background.webp';

const preloadImages = [
  long11,
  long12,
  short21,
  short22,
  short23,
  short24,
  hair,
  logo,
  product2Shadow,
  product1Shadow,
  shadowMobileTopLeft,
  shadowTopLeft,
  shadowTop,
  shadowTopRight,
  shadowLeft,
  shadowRight,
  shadowBottomLeft,
  shadowBottom,
  shadowBottomRight,
  maskTopLeft,
  maskTopRight,
  background,
]

type ViewState = 'prepare' | 'main';

export const useMainStore = defineStore('main', () => {
  const COLOR_DATABASE =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFFONBmJrC2GaZpGYI_gjXPWnOizakJK6l5AkXyZ7NxzBhkTaejfLEQTnjpUFrR3ZR_MD3UdNJhSEj/pub?gid=0&single=true&output=tsv";
  const CONFIG_DATABASE =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFFONBmJrC2GaZpGYI_gjXPWnOizakJK6l5AkXyZ7NxzBhkTaejfLEQTnjpUFrR3ZR_MD3UdNJhSEj/pub?gid=237858754&single=true&output=tsv";


  // global state
  const database = ref(new Database(COLOR_DATABASE, CONFIG_DATABASE))
  const hairProcessor = ref<HairProcessor>();
  const viewState = ref<ViewState>('prepare');
  const productDialog = ref(false)
  const infoVisible = ref(false)
  const config = ref<AppConfig>({
    mixingBottleLink: '',
    blur: 6,
    categoryWheelScale: 1,
    colorWheelScale: 1,
  })

  // product state
  const colors = ref<HairColor[]>([]);
  const categories = computed(() => colors.value
    .filter((color, index) => colors.value.findIndex(c => c.category === color.category) === index)
    .map(color => color.category)
  )
  const selectedColor = ref<HairColor>({
    category: '',
    color: [0, 0, 0, 0],
    link: '',
    name: '',
    product1: { name: '', usage: '', image: '' },
    product2: null,
  });
  const product2No = computed(() => (selectedColor.value?.product2?.name.match(/\d+/) || '').toString())

  watch(() => selectedColor.value, (color) => {
    if (color) {
      hairProcessor.value!.hairColor = color.color
    }
  })

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
    interface LoadTask {
      name: string
      task: (data: any) => Promise<any>
      children?: LoadTask[]
    }

    const tasks: LoadTask[] = [
      {
        name: 'database', task: async () => {
          const data = await database.value.load()
          colors.value = data.colors
          config.value = data.config
          return data
        }, children: [
          {
            name: 'initHairProcessor', task: async (data: Awaited<ReturnType<Database['load']>>) => {
              selectedColor.value = data.colors[0]
              hairProcessor.value = new HairProcessor({
                blur: 0,
                confidenceThreshold1: 0.5,
                confidenceThreshold2: 0.5,
                hairColor: selectedColor.value.color,
                renderMode: 'category',
                src: '',
              })
            }, children: [
              {
                name: 'wasm', task: async () => hairProcessor.value!.loadWasm(), children: [
                  { name: 'personal detector', task: async () => hairProcessor.value!.loadPersonalDetector() },
                  { name: 'hair segmenter', task: async () => hairProcessor.value!.loadHairSegmenter() },
                ]
              },
            ]
          }
        ],
      },
      ...preloadImages.map((src) => ({
        name: `preload image: ${src}`, task: async () => util.loadImage(src)
      }))
    ]

    function getNestedTaskCount(tasks: LoadTask[]): number {
      return tasks.length + tasks.reduce((acc, task) => acc + (task.children ? getNestedTaskCount(task.children) : 0), 0)
    }
    loadingTotal.value = getNestedTaskCount(tasks)

    async function runTasks(tasks: LoadTask[], args?: any) {
      return Promise.all(tasks.map(async (task) => {
        const data = await task.task(args)
        loadingCount.value++
        console.log(`loaded: ${task.name} (${loadingCount.value}/${loadingTotal.value})`)
        if (task.children) {
          await runTasks(task.children, data)
        }
      }))
    }

    return runTasks(tasks)
  }

  // file selection state
  const fileError = ref(false);
  const isMobileDialogShow = ref(false);
  const selectedFile = ref<File>();
  const selectedImage = ref('');
  const originalImageBase64 = ref('');
  const croppedBase64 = ref('');

  watch(() => selectedFile.value, (file?: File) => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      originalImageBase64.value = e.target!.result as string;
      const resizedDataURL = await CanvasRenderer.getResizedImage(
        e.target!.result as string,
        500
      );
      selectedImage.value = resizedDataURL;

      try {
        await hairProcessor.value!.updateSrc(resizedDataURL)
        isMobileDialogShow.value = false
        croppedBase64.value = hairProcessor.value!.croppedBase64
        viewState.value = 'main'
      } catch (e) {
        console.error(e)
        fileError.value = true

      }
      console.log(resizedDataURL)
    };

    reader.readAsDataURL(file);
  })

  function setFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const resizedDataURL = await CanvasRenderer.getResizedImage(
        e.target!.result as string,
        500
      );
      selectedImage.value = resizedDataURL;

      try {
        await hairProcessor.value!.updateSrc(resizedDataURL)
        croppedBase64.value = hairProcessor.value!.croppedBase64
        viewState.value = 'main'
      } catch (e) {
        console.error(e)
        fileError.value = true

      }
      console.log(resizedDataURL)
    };

    reader.readAsDataURL(file);
  }

  return {
    categories,
    colors,
    config,
    loading,
    selectedColor,
    hairProcessor,
    infoVisible,
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
    originalImageBase64,
    croppedBase64,
    selectedFile,
    productDialog,
    product2No,
    load,
    setFile,
  };
});
