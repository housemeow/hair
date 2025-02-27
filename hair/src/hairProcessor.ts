import {
  ImageSegmenter,
  ObjectDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

import CanvasRenderer from "@/canvasRenderer";
import Rect from "@/rect";
import type { RenderMode, WasmFileset } from "@/type";
import HairSegmenter from "@/hairSegment";
import PersonDetector from "@/personDetector";

interface HairProcessorOptions {
  src: string
  hairColor: number[]
  renderMode: RenderMode
  confidenceThreshold1: number
  confidenceThreshold2: number
  // img: HTMLImageElement
  blur: number
}

class HairProcessor {
  src: string
  width!: number;
  height!: number;
  hairSegmenter: HairSegmenter;
  personDetector: PersonDetector;
  imageSegmenter!: ImageSegmenter;
  objectDetector!: ObjectDetector;
  canvasRenderer!: CanvasRenderer;
  renderMode!: RenderMode;
  hairColor: any;
  unionRect!: Rect;
  croppedImage: HTMLImageElement;
  croppedBase64: string;
  blur: number;
  wasm!: WasmFileset;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(options: HairProcessorOptions) {
    const {
      src,
      hairColor,
      renderMode,
    } = options;
    this.src = src;
    this.hairSegmenter = new HairSegmenter()
    this.personDetector = new PersonDetector()
    this.hairColor = hairColor;
    this.renderMode = renderMode;
    this.croppedBase64 = ''
    this.croppedImage = new Image()
    this.blur = 0;
  }

  async loadWasm() {
    this.wasm = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
    );
  }

  async loadHairSegmenter() {
    await this.hairSegmenter.load(this.wasm);
  }

  async loadPersonalDetector() {
    await this.personDetector.load(this.wasm);
  }

  async updateSrc(src: string) {
    const img = new Image()
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.src = src;
    })
    console.log('srcImage', img.naturalWidth, img.naturalHeight)
    await Promise.all([
      this.hairSegmenter.createSegment(img),
      this.personDetector.detect(img),
    ])
    console.log('img', img.width, img.height)

    if (this.hairSegmenter.rect.width === 0 || this.hairSegmenter.rect.height === 0) {
      throw new Error('No hair detected')
    }

    this.unionRect = Rect.union([this.hairSegmenter.rect, this.personDetector.rect])

    console.log('rect', this.unionRect, this.hairSegmenter.rect, this.personDetector.rect)
    const canvas = document.createElement('canvas')
    canvas.width = this.unionRect.width
    canvas.height = this.unionRect.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, this.unionRect.left, this.unionRect.top, this.unionRect.width, this.unionRect.height, 0, 0, this.unionRect.width, this.unionRect.height)
    this.croppedBase64 = canvas.toDataURL("image/png");

    await new Promise<void>(resolve => {
      this.croppedImage.onload = () => resolve()
      this.croppedImage.src = this.croppedBase64
    })
    this.hairSegmenter.createSegment(this.croppedImage)
    console.log('this.croppedImage', this.croppedImage.naturalWidth, this.croppedImage.naturalHeight)
  }

  async render() {
    // this.canvasRenderer.setSize(this.croppedImage.width, this.croppedImage.height)
    const canvas = document.createElement('canvas')
    canvas.width = this.unionRect.width
    canvas.height = this.unionRect.height
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.hairSegmenter.render(imageData, this.hairColor);

    // 應用模糊
    // if (this.blur) {
    //   // const blurredImageData = CanvasRenderer.applyGaussianBlur(imageData, canvas.width, canvas.height, this.blur * 3);
    //   ctx.putImageData(blurredImageData, 0, 0);
    // } else {
    //   ctx.putImageData(imageData, 0, 0);
    // }
    ctx.putImageData(imageData, 0, 0);
    this.canvasRenderer.clear();
    // this.canvasRenderer.drawImage(this.picture)
    // this.canvasRenderer.ctx.globalCompositeOperation = 'multiply'
    // this.canvasRenderer.ctx.filter = `blur(${this.blur}px)`; // iPhone不支援
    this.canvasRenderer.drawImage(canvas)
    // this.canvasRenderer.ctx.filter = "none"; // 避免影響後續繪製
    // this.canvasRenderer.ctx.globalCompositeOperation = 'source-over'
  }
}

export default HairProcessor;
