import {
  ImageSegmenter,
  ObjectDetector,
  FilesetResolver,
  ImageSegmenterResult,
} from "@mediapipe/tasks-vision";

type RunningMode = "IMAGE" | "VIDEO";
type RenderMode = "category" | "confidence";

interface HairProcessorOptions {
  hairColor: number[];
  renderMode: RenderMode;
  confidenceThreshold1: number;
  confidenceThreshold2: number;
  originalImg: HTMLImageElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
}

class HairProcessor {
  confidenceThreshold1: number;
  confidenceThreshold2: number;
  isCrop: boolean;
  imageSegmenter?: ImageSegmenter;
  objectDetector?: ObjectDetector;
  labels: string[];
  runningMode: RunningMode;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  originalImg?: HTMLImageElement;
  width: any;
  height: any;
  img?: HTMLImageElement;
  segment?: ImageSegmenterResult;
  renderMode: any;
  hairColor: any;
  hairRect: { left: number; top: number; right: number; bottom: number; width: number; height: number; };
  unionRect: any;
  /**
   * 1. load model
   * 2. segment
   * 3. render original or cropped to img
   * 4. render hair to canvas
   */
  constructor(options: HairProcessorOptions) {
    const {
      hairColor,
      renderMode,
      confidenceThreshold1,
      confidenceThreshold2,
      originalImg,
      img,
      canvas,
    } = options;

    this.confidenceThreshold1 = confidenceThreshold1 || 0.5;
    this.confidenceThreshold2 = confidenceThreshold2 || 0.7;
    this.isCrop = false;
    this.setColor(hairColor);
    this.setRenderMode(renderMode);
    this.setImg(img);
    this.setOriginalImg(originalImg);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.labels = [];
    this.runningMode = "IMAGE";
  }

  setOriginalImg(img: HTMLImageElement) {
    this.originalImg = img;
    this.width = img.naturalWidth;
    this.height = img.naturalHeight;

    this.img.setAttribute("src", img.getAttribute("src"));
    console.log({ width: this.width, height: this.height });
  }

  setImg(img: HTMLImageElement) {
    this.img = img;
  }

  async setImgSrc(src: string) {
    this.img.src = src;

    return new Promise<void>((resolve) => {
      this.img.onload = () => {
        this.width = this.img.naturalWidth;
        this.height = this.img.naturalHeight;
        resolve();
      };
    });
  }

  setRenderMode(mode: RenderMode) {
    this.renderMode = mode;
  }

  setColor(color: number[]) {
    this.hairColor = color;
  }

  async loadModel() {
    await this.loadSegmenter();
    await this.loadObjectDetector();
  }

  async loadSegmenter() {
    const audio = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
    );
    this.imageSegmenter = await ImageSegmenter.createFromOptions(audio, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",
        delegate: "GPU",
      },
      runningMode: this.runningMode,
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });
    this.labels = this.imageSegmenter.getLabels();
  }

  async loadObjectDetector() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    this.objectDetector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite`,
      },
      scoreThreshold: 0.5,
      runningMode: this.runningMode,
    });
  }

  _clearCanvas() {
    this.ctx?.drawImage(this.img!, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  async _createSegment(): Promise<ImageSegmenterResult> {
    return await new Promise((resolve) => {
      const load = () => {
        if (!this.originalImg) return
        this.imageSegmenter?.segment(this.originalImg, (result) => resolve(result));
        this.originalImg?.removeEventListener('load', load)
      }
      this.originalImg?.addEventListener('load', load)
      this.originalImg?.setAttribute('src', this.originalImg?.getAttribute('src') || '')
      console.log(this.originalImg?.getAttribute('src'))
    });
  }

  _renderHairCategory(imageData: Uint8ClampedArray<ArrayBufferLike>) {
    console.log('render category')
    const mask = this.segment.categoryMask.getAsUint8Array();
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 0) continue;
      imageData[i * 4] = this.hairColor[0];
      imageData[i * 4 + 1] = this.hairColor[1];
      imageData[i * 4 + 2] = this.hairColor[2];
      imageData[i * 4 + 3] = this.hairColor[3];
    }
  }

  _renderHairConfidence(imageData: Uint8ClampedArray<ArrayBufferLike>) {
    const confidence = this.segment.confidenceMasks[1].getAsFloat32Array();
    for (let i = 0; i < confidence.length; i++) {
      const value = confidence[i];
      if (value < this.confidenceThreshold1) continue;

      function getRatio(value: number, threshold1: number, threshold2: number) {
        if (value < threshold1) {
          return 0;
        } else if (value < threshold2) {
          return (value - threshold1) / (threshold2 - threshold1);
        } else {
          return 1;
        }
      }
      const ratio = getRatio(
        value,
        this.confidenceThreshold1,
        this.confidenceThreshold2
      );
      imageData[i * 4] = this.hairColor[0];
      imageData[i * 4 + 1] = this.hairColor[1];
      imageData[i * 4 + 2] = this.hairColor[2];
      imageData[i * 4 + 3] = this.hairColor[3] * ratio;
    }
  }

  _renderToCanvas(imageData: Uint8ClampedArray<ArrayBufferLike>, width: number, height: number) {
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const newImageData = new ImageData(uint8Array, width, height);
    console.log({ width, height, newImageData })
    this.ctx?.putImageData(newImageData, 0, 0);
  }

  async render(crop: boolean) {
    this.ctx?.fillRect(25, 25, 100, 100);
    this.ctx?.clearRect(45, 45, 60, 60);
    this.ctx?.strokeRect(50, 50, 50, 50);

    const segment = await this._createSegment()
    console.log(segment)

    if (!segment.categoryMask) {
      return
    }
    if (!this.ctx) {
      return
    }

    const { width, height } = segment.categoryMask;
    this.canvas.width = width
    this.canvas.height = height
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let imageData = this.ctx.getImageData(0, 0, width, height).data;
    const mask = segment.categoryMask.getAsUint8Array();

    let counter = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 0) continue;

      counter++;

      // imageData[i * 4] = this.hairColor[0];
      // imageData[i * 4 + 1] = this.hairColor[1];
      // imageData[i * 4 + 2] = this.hairColor[2];
      // imageData[i * 4 + 3] = this.hairColor[3];
      imageData[i * 4] = 255;
      imageData[i * 4 + 1] = 0;
      imageData[i * 4 + 2] = 0;
      imageData[i * 4 + 3] = 255;
    }
    console.log({ counter })
    // this._renderToCanvas(imageData, width, height)
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const dataNew = new ImageData(uint8Array, width, height);
    this.ctx.putImageData(dataNew, 0, 0);

  }
}
export default HairProcessor;
