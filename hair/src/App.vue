<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import Database from "@/database";
import defaultImg from "@/assets/測試用圖_改色.jpg";
import HairProcessor from "@/hairProcessor";
import COLORS from '@/colors.json'

const COLOR_DATABASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFFONBmJrC2GaZpGYI_gjXPWnOizakJK6l5AkXyZ7NxzBhkTaejfLEQTnjpUFrR3ZR_MD3UdNJhSEj/pub?gid=0&single=true&output=tsv";
const CONFIG_DATABASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFFONBmJrC2GaZpGYI_gjXPWnOizakJK6l5AkXyZ7NxzBhkTaejfLEQTnjpUFrR3ZR_MD3UdNJhSEj/pub?gid=237858754&single=true&output=tsv";

const database = new Database(COLOR_DATABASE, CONFIG_DATABASE);
let hairProcessor: HairProcessor

const isHairProcessorLoading = ref(false);
const isDatabaseLoading = ref(false);
const isLoading = computed(() => isHairProcessorLoading.value || isDatabaseLoading.value);
const colors = ref<{
    name: string;
    category: string;
    color: number[];
}[]> (COLORS)
const canvasRef = ref<HTMLCanvasElement>();
const imgRef = ref<HTMLImageElement>();
const originalImgRef = ref<HTMLImageElement>();
const hairVisible = ref(true);
const modelVisible = ref(true);
const selectedColor = ref<number[]>([]);
const imgSrc = ref(defaultImg);

const load = async () => {
  isDatabaseLoading.value = true
  // const data = await database.load()
  // colors.value = data.colors
  selectedColor.value = colors.value[0].color
  isDatabaseLoading.value = false
}

watch(() => selectedColor.value, async () => {
  console.log(selectedColor.value)
  if (hairProcessor) {
    hairProcessor.hairColor = selectedColor.value
    await hairProcessor.render(true)
  }
})

// $fileInput.on("change", function (e) {
//   const file = e.target.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       $sampleImg.one("load", async () => {
//         hairProcessor.setOriginalImg($sampleImg.get(0));
//         await hairProcessor.render(true);
//       });
//       $sampleImg.attr("src", e.target.result);
//     };
//     reader.readAsDataURL(file);
//   }
// });

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imgSrc.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

onMounted(async () => {
  isHairProcessorLoading.value = true;
  hairProcessor = new HairProcessor({
    canvas: canvasRef.value as HTMLCanvasElement,
    confidenceThreshold1: 0.5,
    confidenceThreshold2: 0.7,
    hairColor: selectedColor.value,
    img: imgRef.value as HTMLImageElement,
    originalImg: originalImgRef.value as HTMLImageElement,
    renderMode: "category",
  })
  console.log(
    canvasRef.value,
    imgRef.value,
    originalImgRef.value
  )
  await hairProcessor.loadModel();
  await hairProcessor.render(true);
  isHairProcessorLoading.value = false;
})

load()
</script>

<template>
  <section id="demos" :class="{ invisible: isLoading }">
    <!-- checkbox for hide canvas / show canvas -->
    <div class="flex flex-wrap">
      <label for="hair_visible">
        <input type="checkbox" id="hair_visible" v-model="hairVisible" />
        Hair Visible
      </label>
      <label for="model_visible">
        <input type="checkbox" id="model_visible" v-model="modelVisible" />
        Model Visible
      </label>
      <!-- <select name="renderMode" id="renderMode" v-model="renderMode">
          <option value="category">Category</option>
          <option value="confidence">Confidence</option>
        </select> -->
      <select name="color" id="color" v-model="selectedColor">
        <option v-for="color in colors" :value="color.color">{{color.name}}</option>
      </select>
      <input type="file" accept="image/*" @change="onFileChange" />
    </div>
    <div class="flex items-start flex-col" style="width: 100%; max-width: 375px; margin: 0 auto">
      <div class="segment w-full" style="border: 1px solid black">
        <canvas ref="canvasRef" class="w-full" :class="{ removed: !hairVisible }"></canvas>
        <img ref="imgRef" crossorigin="anonymous" src="" class="w-full" title="Click to get segmentation!" :class="{ removed: !modelVisible}" />
      </div>
      <img
        ref="originalImgRef"
        class="sample w-full"
        crossorigin="anonymous"
        :src="imgSrc"
        alt=""
        style="border: 1px solid black"
      />
    </div>
  </section>
</template>

<style scoped>
canvas {
  clear: both;
  display: block;
  mix-blend-mode: multiply;
}

section {
  opacity: 1;
  transition: opacity 500ms ease-in-out;
}

.removed {
  display: none;
}

.invisible {
  opacity: 0.2;
}

.segment {
  position: relative;
  display: flex;
  z-index: 0;
}

.segment canvas {
  position: absolute;
  top: 0px;
  bottom: 0px;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-col {
  flex-direction: column;
}

.flex.items-start {
  align-items: flex-start;
}

.w-full {
  width: 100%;
}
</style>
