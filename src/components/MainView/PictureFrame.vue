<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
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
import { useRwd } from '@/composables/rwd';
import { useMainStore } from '@/stores';
import { useImageInput } from '@/composables/useImageInput';
import ImageInput from '@/components/ImageInput.vue';
import * as util from '@/util';
import CanvasRenderer from '@/canvasRenderer';
import Rect from '@/rect';

const { fileRef, triggerFileSelection } = useImageInput();
const store = useMainStore();
const pictureCanvasRef = ref<HTMLCanvasElement>();
const hairCanvasRef = ref<HTMLCanvasElement>();
const maskCanvasRef = ref<HTMLCanvasElement>();
const shadowCanvasRef = ref<HTMLCanvasElement>();
const pictureCtxRef = ref<CanvasRenderingContext2D>();
const hairCtx = ref<CanvasRenderingContext2D>();
const maskCtxRef = ref<CanvasRenderingContext2D>();
const shadowCtxRef = ref<CanvasRenderingContext2D>();
const maskUrl = ref('')
const { isMobile } = useRwd();
const timer = ref<number>()

const style = computed(() => ({
  '--blur': store.config.blur,
}))

const canvasStyle = computed(() => ({
  'mask-image': `url(${maskUrl.value})`,
}))

watch(() => store.selectedColor, () => {
  renderHair()
})

watch(() => store.croppedBase64, () => {
  renderPicture()
  renderHair()
})

onMounted(() => {
  pictureCtxRef.value = pictureCanvasRef.value!.getContext('2d')!
  hairCtx.value = hairCanvasRef.value!.getContext('2d')!
  maskCtxRef.value = maskCanvasRef.value!.getContext('2d')!
  shadowCtxRef.value = shadowCanvasRef.value!.getContext('2d')!

  setTimeout(() => {
    render()
    window.addEventListener('resize', handleResize)
  }, 0)
})

const handleResize = () => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
  timer.value = setTimeout(() => {
    render()
  }, 100)
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const renderMask = async () => {
  const ctx = maskCtxRef.value!;
  const maskCanvas = maskCanvasRef.value!;
  maskCanvas.width = maskCanvas.clientWidth;
  maskCanvas.height = maskCanvas.clientHeight;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  ctx.globalCompositeOperation = 'destination-out';
  const topLeftImage = await util.loadImage(maskTopLeft)
  ctx.drawImage(topLeftImage, 0, 0);
  const topRightImage = await util.loadImage(maskTopRight)
  ctx.drawImage(topRightImage, ctx.canvas.width - topRightImage.width, 0);
  ctx.globalCompositeOperation = 'source-over';
  maskUrl.value = maskCanvas.toDataURL('image/png')
}

const renderPicture = async () => {
  const pictureCanvas = pictureCanvasRef.value!;
  console.log('pictureCanvas', pictureCanvas.clientWidth, pictureCanvas.clientHeight, pictureCanvas.width, pictureCanvas.height)
  pictureCanvas.width = pictureCanvas.clientWidth * 4;
  pictureCanvas.height = pictureCanvas.clientHeight * 4;
  pictureCtxRef.value!.clearRect(0, 0, pictureCanvas.width, pictureCanvas.height);
  drawBackground(pictureCtxRef.value!);

  const hairProcessor = store.hairProcessor!
  const maxWidth = window.innerWidth * 4
  console.log('maxWidth', maxWidth)
  const resizedImageUrl = await CanvasRenderer.getResizedImage(store.originalImageBase64, maxWidth)
  const originalImage = await util.loadImage(resizedImageUrl)
  const topRatio = hairProcessor.unionRect.top / hairProcessor.height
  const leftRatio = hairProcessor.unionRect.left / hairProcessor.width
  const rightRatio = hairProcessor.unionRect.right / hairProcessor.width
  const bottomRatio = hairProcessor.unionRect.bottom / hairProcessor.height
  console.log(originalImage.naturalWidth)

  const unionRect = new Rect(
    topRatio * originalImage.height,
    leftRatio * originalImage.width,
    rightRatio * originalImage.width,
    bottomRatio * originalImage.height
  )
  await drawPicture(pictureCtxRef.value!, CanvasRenderer.getCroppedBase64(originalImage, unionRect));

  function drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#cbcbcb';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  async function drawPicture(ctx: CanvasRenderingContext2D, src: string) {
    const image = await util.loadImage(src);
    const imageWidth = image.width;
    const imageHeight = image.height;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const imageRatio = imageWidth / imageHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    let width = canvasWidth;
    let height = canvasHeight;
    let x = 0;
    let y = 0;
    const imageSize = 'contain'; // contain, cover
    if (imageSize === 'contain') {
      if (imageRatio > canvasRatio) {
        width = canvasWidth;
        height = width / imageRatio;
        y = (canvasHeight - height) / 2;
      } else {
        height = canvasHeight;
        width = height * imageRatio;
        x = (canvasWidth - width) / 2;
      }
    } else {
      if (imageRatio > canvasRatio) {
        height = canvasHeight;
        width = height * imageRatio;
        x = (canvasWidth - width) / 2;
      } else {
        width = canvasWidth;
        height = width / imageRatio;
        y = (canvasHeight - height) / 2;
      }
    }
    ctx.drawImage(image, x, y, width, height);
  }
}

const renderHair = async () => {
  const blurredCtx = hairCtx.value!;
  const blurredHairCanvas = hairCanvasRef.value!;
  blurredHairCanvas.width = blurredHairCanvas.clientWidth;
  blurredHairCanvas.height = blurredHairCanvas.clientHeight;
  blurredCtx.clearRect(0, 0, blurredHairCanvas.width, blurredHairCanvas.height);

  const hairProcessor = store.hairProcessor!;
  hairProcessor.render();

  const imageWidth = hairProcessor.canvas.width;
  const imageHeight = hairProcessor.canvas.height;
  const canvasWidth = blurredCtx.canvas.width;
  const canvasHeight = blurredCtx.canvas.height;
  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  let width = hairProcessor.canvas.width!;
  let height = canvasHeight;
  let x = 0;
  let y = 0;
  const imageSize = 'contain'; // contain, cover
  if (imageSize === 'contain') {
    if (imageRatio > canvasRatio) {
      width = canvasWidth;
      height = width / imageRatio;
      y = (canvasHeight - height) / 2;
    } else {
      height = canvasHeight;
      width = height * imageRatio;
      x = (canvasWidth - width) / 2;
    }
  } else {
    if (imageRatio > canvasRatio) {
      height = canvasHeight;
      width = height * imageRatio;
      x = (canvasWidth - width) / 2;
    } else {
      width = canvasWidth;
      height = width / imageRatio;
      y = (canvasHeight - height) / 2;
    }
  }
  blurredCtx.drawImage(hairProcessor.canvas, x, y, width, height);
}

const renderFrame = async () => {
  const shadowCanvas = shadowCanvasRef.value!;
  shadowCanvas.width = shadowCanvas.clientWidth;
  shadowCanvas.height = shadowCanvas.clientHeight;
  shadowCtxRef.value!.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);

  await drawShadow(shadowCtxRef.value!);

  async function drawShadow(ctx: CanvasRenderingContext2D) {
    const topLeftImage = await util.loadImage(isMobile.value ? shadowMobileTopLeft : shadowTopLeft)
    const topImage = await util.loadImage(shadowTop)
    const topRightImage = await util.loadImage(shadowTopRight)
    const leftImage = await util.loadImage(shadowLeft)
    const rightImage = await util.loadImage(shadowRight)
    const bottomLeftImage = await util.loadImage(shadowBottomLeft)
    const bottomImage = await util.loadImage(shadowBottom)
    const bottomRightImage = await util.loadImage(shadowBottomRight)

    ctx.drawImage(topLeftImage, 0, 0, topLeftImage.width, topLeftImage.height);
    ctx.drawImage(topImage, topLeftImage.width, 0, ctx.canvas.width - topLeftImage.width - topRightImage.width, topImage.height);
    ctx.drawImage(topRightImage, ctx.canvas.width - topRightImage.width, 0, topRightImage.width, topRightImage.height);
    ctx.drawImage(leftImage, 0, topLeftImage.height, leftImage.width, ctx.canvas.height - topLeftImage.height - bottomLeftImage.height);
    ctx.drawImage(rightImage, ctx.canvas.width - rightImage.width, topRightImage.height, rightImage.width, ctx.canvas.height - topRightImage.height - bottomRightImage.height);
    ctx.drawImage(bottomLeftImage, 0, ctx.canvas.height - bottomLeftImage.height, bottomLeftImage.width, bottomLeftImage.height);
    ctx.drawImage(bottomImage, bottomLeftImage.width, ctx.canvas.height - bottomImage.height, ctx.canvas.width - bottomLeftImage.width - bottomRightImage.width, bottomImage.height);
    ctx.drawImage(bottomRightImage, ctx.canvas.width - bottomRightImage.width, ctx.canvas.height - bottomRightImage.height, bottomRightImage.width, bottomRightImage.height);
  }
}

const render = async () => {
  renderMask()
  renderPicture()
  renderHair()
  renderFrame()
}
</script>

<template>
  <div class="picture-frame" :style="style">
    <canvas ref="pictureCanvasRef" :style="canvasStyle"></canvas>
    <canvas ref="hairCanvasRef" class="hair" :style="canvasStyle"></canvas>
    <canvas ref="maskCanvasRef" class="mask"></canvas>
    <canvas ref="shadowCanvasRef" :style="canvasStyle"></canvas>
    <button>
      <img src="@/assets/photo-edit-button.svg" alt="" @click="triggerFileSelection">
    </button>
    <ImageInput ref="fileRef" />
  </div>
</template>

<style scoped lang="scss">
.picture-frame {
  --blur: 6;
  width: 100%;
  position: relative;

  canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    &.mask {
      z-index: -1;
    }

    &.hair {
      filter: blur(calc(var(--blur) * 1px));
      mix-blend-mode: multiply;
    }
  }

  button {
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;

    img {
      width: 27px;
    }
  }
}
</style>
