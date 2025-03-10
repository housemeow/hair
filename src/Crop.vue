<script setup lang="ts">
import { onMounted, ref } from 'vue';
// import sample from '@/assets/測試用圖_改色.jpg';
import sample from '@/assets/730f4b50ac85c7f8ba37e5b7847caf8d_0.jpg';
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
import { useRwd } from './composables/rwd';

const pictureCanvasRef = ref<HTMLCanvasElement>();
const hairCanvasRef = ref<HTMLCanvasElement>();
const shadowCanvasRef = ref<HTMLCanvasElement>();
const { isMobile } = useRwd();

onMounted(async () => {
  const pictureCanvas = pictureCanvasRef.value!;
  const hairCanvas = hairCanvasRef.value!;
  const shadowCanvas = shadowCanvasRef.value!;
  pictureCanvas.width = pictureCanvas.clientWidth;
  pictureCanvas.height = pictureCanvas.clientHeight;
  hairCanvas.width = hairCanvas.clientWidth;
  hairCanvas.height = hairCanvas.clientHeight;
  shadowCanvas.width = shadowCanvas.clientWidth;
  shadowCanvas.height = shadowCanvas.clientHeight;
  const pictureCtx = pictureCanvas.getContext('2d')!;
  const hairCtx = hairCanvas.getContext('2d')!;
  const shadowCtx = shadowCanvas.getContext('2d')!;

  pictureCtx.clearRect(0, 0, pictureCanvas.width, pictureCanvas.height);
  hairCtx.clearRect(0, 0, hairCanvas.width, hairCanvas.height);
  shadowCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);

  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      resolve(img)
    }
  })

  drawBackground(pictureCtx);
  await drawPicture(pictureCtx, sample);
  await drawMask(pictureCtx);

  await drawMask(hairCtx);

  await drawShadow(shadowCtx);
  await drawMask(shadowCtx);

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

  async function drawMask(ctx: CanvasRenderingContext2D) {
    ctx.globalCompositeOperation = 'destination-out';
    const topLeftImage = await loadImage(maskTopLeft)
    ctx.drawImage(topLeftImage, 0, 0);
    const topRightImage = await loadImage(maskTopRight)
    ctx.drawImage(topRightImage, ctx.canvas.width - topRightImage.width, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
})
/**
 * Layer
 * 1. background
 * 2. canvas
 * 2.1. image
 * 2.2. crop mask
 * 3. shadow
 */
</script>

<template>
  <div class="picture">
    <canvas ref="pictureCanvasRef">BG Color / Picture in Contain / Mask</canvas>
    <canvas ref="hairCanvasRef">Hair / Mask (CSS: blur & blend-model: multiply)</canvas>
    <canvas ref="shadowCanvasRef">Shadow Mask</canvas>
  </div>
</template>

<style scoped lang="scss">
.picture {
  width: 100%;
  height: 475px;
  position: relative;

  canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
}

@media screen and (min-width: 600px) {
  .picture {
    max-width: 375px;
  }
}
</style>
