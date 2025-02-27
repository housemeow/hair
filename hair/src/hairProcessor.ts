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
  img: HTMLImageElement;
  renderMode!: RenderMode;
  hairColor: any;
  unionRect!: Rect;
  picture: HTMLImageElement;
  croppedImage: string;
  blur: number;
  wasm!: WasmFileset;

  constructor(options: HairProcessorOptions) {
    const {
      src,
      hairColor,
      renderMode,
      // img,
    } = options;
    this.src = src;
    this.hairSegmenter = new HairSegmenter()
    this.personDetector = new PersonDetector()
    this.hairColor = hairColor;
    this.renderMode = renderMode;
    // this.img = img;
    this.img = new Image()
    this.picture = new Image()
    this.croppedImage = ''
    this.blur = 0;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    this.canvasRenderer = new CanvasRenderer(ctx!);
  }

  async updateSrc(src: string) {
    const img = new Image()
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.src = src;
    })
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
    this.croppedImage = canvas.toDataURL("image/png");

    await new Promise<void>(resolve => {
      this.picture.onload = () => resolve()
      this.picture.src = this.croppedImage
    })
    await new Promise<void>(resolve => {
      this.img.onload = () => resolve()
      this.img.src = this.croppedImage
    })
    this.hairSegmenter.createSegment(this.picture)
    console.log('this.picture', this.picture.width, this.picture.height)
    console.log('this.img', this.img.width, this.img.height)
    this.canvasRenderer.setSize(this.picture.width, this.picture.height)
  }

  async updateImgSrc(src: string) {
    this.img.src = src;

    return new Promise<void>((resolve) => {
      this.img.onload = () => {
        this.width = this.img.naturalWidth;
        this.height = this.img.naturalHeight;
        resolve();
      };
    });
  }

  async loadWasm() {
    this.wasm = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
    );
  }

  async loadModel() {
    await this.hairSegmenter.load(this.wasm);
    await this.personDetector.load(this.wasm);
  }

  async render() {
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
