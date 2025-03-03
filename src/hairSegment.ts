import { ImageSegmenter } from "@mediapipe/tasks-vision";
import type { ImageSegmenterResult } from "@mediapipe/tasks-vision";
import Rect from "./rect";
import type { RunningMode, RenderMode, WasmFileset } from "./type";
import { CATEGORY_HAIR } from "./type";

class HairSegmenter {
  runningMode: RunningMode;
  imageSegmenter!: ImageSegmenter;
  loaded: boolean;
  rect: Rect;
  segmentResult?: ImageSegmenterResult;
  confidenceThreshold1: number;
  confidenceThreshold2: number;
  renderMode: RenderMode;

  constructor() {
    this.runningMode = 'IMAGE';
    this.confidenceThreshold1 = 0.5;
    this.confidenceThreshold2 = 0.5;
    this.renderMode = "category";
    this.rect = new Rect()
    this.loaded = false
  }

  async load(wasm: WasmFileset) {
    this.imageSegmenter = await ImageSegmenter.createFromOptions(wasm, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",
        delegate: "CPU",
      },
      runningMode: this.runningMode,
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });
    this.loaded = true
  }

  async createSegment(img: HTMLImageElement) {
    this.segmentResult = await new Promise((resolve) => {
      this.imageSegmenter.segment(img, (result) => resolve(result));
    });

    this.rect = Rect.bufferToRect(
      this.segmentResult.categoryMask!.getAsUint8Array(),
      img.width,
      img.height,
      (value) => value === CATEGORY_HAIR
    );
  }
  render(imageData: ImageData, hairColor: number[]) {
    if (this.renderMode === "category") {
      this.renderByCategory(imageData, hairColor);
    } else {
      this.renderByConfidence(imageData, hairColor);
    }
  }

  renderByCategory(imageData: ImageData, rgba: number[]) {
    const mask = this.segmentResult!.categoryMask!.getAsUint8Array();
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 0) continue;
      imageData.data[i * 4] = rgba[0];
      imageData.data[i * 4 + 1] = rgba[1];
      imageData.data[i * 4 + 2] = rgba[2];
      imageData.data[i * 4 + 3] = rgba[3];
    }
  }

  renderByConfidence(imageData: ImageData, rgba: number[]) {
    const confidence =
      this.segmentResult!.confidenceMasks![CATEGORY_HAIR].getAsFloat32Array();
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
      imageData.data[i * 4] = rgba[0];
      imageData.data[i * 4 + 1] = rgba[1];
      imageData.data[i * 4 + 2] = rgba[2];
      imageData.data[i * 4 + 3] = rgba[3] * ratio;
    }
  }
}

export default HairSegmenter
