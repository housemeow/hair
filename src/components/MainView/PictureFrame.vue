<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
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

const { fileRef, triggerFileSelection } = useImageInput();
const store = useMainStore();
const pictureCanvasRef = ref<HTMLCanvasElement>();
const hairCanvasRef = ref<HTMLCanvasElement>();
const shadowCanvasRef = ref<HTMLCanvasElement>();
const pictureCtx = ref<CanvasRenderingContext2D>();
const hairCtx = ref<CanvasRenderingContext2D>();
const shadowCtx = ref<CanvasRenderingContext2D>();
const { isMobile } = useRwd();
const timer = ref<number>()

watch(() => store.selectedColor, () => {
  renderHair()
})

watch(() => store.croppedBase64, () => {
  renderPicture()
  renderHair()
})

onMounted(() => {
  pictureCtx.value = pictureCanvasRef.value!.getContext('2d')!
  hairCtx.value = hairCanvasRef.value!.getContext('2d')!
  shadowCtx.value = shadowCanvasRef.value!.getContext('2d')!

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

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    resolve(img)
  }
})

async function drawMask(ctx: CanvasRenderingContext2D) {
  ctx.globalCompositeOperation = 'destination-out';
  const topLeftImage = await loadImage(maskTopLeft)
  ctx.drawImage(topLeftImage, 0, 0);
  const topRightImage = await loadImage(maskTopRight)
  ctx.drawImage(topRightImage, ctx.canvas.width - topRightImage.width, 0);
  ctx.globalCompositeOperation = 'source-over';
}

const renderPicture = async () => {
  const pictureCanvas = pictureCanvasRef.value!;
  console.log('pictureCanvas', pictureCanvas.clientWidth, pictureCanvas.clientHeight, pictureCanvas.width, pictureCanvas.height)
  pictureCanvas.width = pictureCanvas.clientWidth;
  pictureCanvas.height = pictureCanvas.clientHeight;
  pictureCtx.value!.clearRect(0, 0, pictureCanvas.width, pictureCanvas.height);
  drawBackground(pictureCtx.value!);
  await drawPicture(pictureCtx.value!, store.croppedBase64);
  await drawMask(pictureCtx.value!);

  function drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#cbcbcb';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  async function drawPicture(ctx: CanvasRenderingContext2D, src: string) {
    const image = await loadImage(src);
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
  const ctx = hairCtx.value!;
  const hairCanvas = hairCanvasRef.value!;
  hairCanvas.width = hairCanvas.clientWidth;
  hairCanvas.height = hairCanvas.clientHeight;
  ctx.clearRect(0, 0, hairCanvas.width, hairCanvas.height);

  const hairProcessor = store.hairProcessor!;
  hairProcessor.render();

  const imageWidth = hairProcessor.canvas.width;
  const imageHeight = hairProcessor.canvas.height;
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
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
  ctx.drawImage(hairProcessor.canvas, x, y, width, height);

  await drawMask(ctx);
}

const renderFrame = async () => {
  const shadowCanvas = shadowCanvasRef.value!;
  shadowCanvas.width = shadowCanvas.clientWidth;
  shadowCanvas.height = shadowCanvas.clientHeight;
  shadowCtx.value!.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);

  await drawShadow(shadowCtx.value!);
  await drawMask(shadowCtx.value!);

  async function drawShadow(ctx: CanvasRenderingContext2D) {
    const topLeftImage = await loadImage(isMobile.value ? shadowMobileTopLeft : shadowTopLeft)
    const topImage = await loadImage(shadowTop)
    const topRightImage = await loadImage(shadowTopRight)
    const leftImage = await loadImage(shadowLeft)
    const rightImage = await loadImage(shadowRight)
    const bottomLeftImage = await loadImage(shadowBottomLeft)
    const bottomImage = await loadImage(shadowBottom)
    const bottomRightImage = await loadImage(shadowBottomRight)

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
  renderPicture()
  renderHair()
  renderFrame()
}
</script>

<template>
  <div class="picture-frame">
    <canvas ref="pictureCanvasRef"></canvas>
    <canvas ref="hairCanvasRef" class="blur"></canvas>
    <canvas ref="shadowCanvasRef"></canvas>
    <img src="@/assets/photo-edit-button.svg" alt="" @click="triggerFileSelection">
    <ImageInput ref="fileRef" />
  </div>
</template>

<style scoped lang="scss">
.picture-frame {
  width: 100%;
  position: relative;

  canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    &.blur {
      filter: blur(2px);
      mix-blend-mode: multiply;
    }
  }

  img {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 27px;
    cursor: pointer;
  }
}
</style>
