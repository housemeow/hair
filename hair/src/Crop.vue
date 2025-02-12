<script setup lang="ts">
import { onMounted, ref } from 'vue';
// import sample from '@/assets/測試用圖_改色.jpg';
import sample from '@/assets/730f4b50ac85c7f8ba37e5b7847caf8d_0.jpg';
import shadowMobileTopLeft from '@/assets/shadow_tl_1.png';
import shadow2TopLeft from '@/assets/shadow_tl_2.png';
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

const canvasRef = ref<HTMLCanvasElement>();
const { isMobile } = useRwd();

onMounted(async () => {
  const canvas = canvasRef.value!;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      resolve(img)
    }
  })

  const topLeftWidth = 25;
  const topLeftHeight = 65;
  const topHeight = 27;
  const topRightWidth = 81;
  const topRightHeight = 65;
  const leftWidth = 25;
  const rightWidth = 27;
  const bottomLeftWidth = 25;
  const bottomLeftHeight = 23;
  const bottomHeight = 23;
  const bottomRightWidth = 80;
  const bottomRightHeight = 23;

  await drawPicture();
  await drawShadow();
  await drawMask();

  function drawBackground() {
    ctx.fillStyle = '#cbcbcb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  async function drawPicture() {
    const image = await loadImage(sample);
    const imageWidth = image.width;
    const imageHeight = image.height;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imageRatio = imageWidth / imageHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    let width = canvasWidth;
    let height = canvasHeight;
    let x = 0;
    let y = 0;
    let imageSize = 'contain'; // contain, cover
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

  async function drawShadow() {
    ctx.drawImage(await loadImage(shadowMobileTopLeft), 0, 0, topLeftWidth, topLeftHeight);
    ctx.drawImage(await loadImage(shadowTop), topLeftWidth, 0, canvas.width - topLeftWidth - topRightWidth, topHeight);
    ctx.drawImage(await loadImage(shadowTopRight), canvas.width - topRightWidth, 0, topRightWidth, topRightHeight);
    ctx.drawImage(await loadImage(shadowLeft), 0, topLeftHeight, leftWidth, canvas.height - topLeftHeight - bottomLeftHeight);
    ctx.drawImage(await loadImage(shadowRight), canvas.width - rightWidth, topRightHeight, rightWidth, canvas.height - topRightHeight - bottomRightHeight);
    ctx.drawImage(await loadImage(shadowBottomLeft), 0, canvas.height - bottomLeftHeight, bottomLeftWidth, bottomLeftHeight);
    ctx.drawImage(await loadImage(shadowBottom), bottomLeftWidth, canvas.height - bottomHeight, canvas.width - bottomLeftWidth - bottomRightWidth, bottomHeight);
    ctx.drawImage(await loadImage(shadowBottomRight), canvas.width - bottomRightWidth, canvas.height - bottomRightHeight, bottomRightWidth, bottomRightHeight);
  }

  async function drawMask() {
    ctx.globalCompositeOperation = 'destination-out';
    // ctx.drawImage(await loadImage(maskTopLeft), 0, 0, topLeftWidth, topLeftHeight);
    ctx.drawImage(await loadImage(maskTopRight), canvas.width - topRightWidth, 0, topRightWidth, topRightHeight);
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
  <canvas ref="canvasRef"></canvas>
</template>

<style scoped lang="scss">
canvas {
  width: 600px;
  height: 500px;
  border: 1px solid black;
  resize: both;
}
</style>
