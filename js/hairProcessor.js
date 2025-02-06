import {
  ImageSegmenter,
  ObjectDetector,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";

import Rect from "./rect.js";

const CATEGORY_HAIR = 1;

class HairProcessor {
  /**
   * 1. load model
   * 2. segment
   * 3. render original or cropped to img
   * 4. render hair to canvas
   */
  constructor(options = {}) {
    const {
      hairColor,
      renderMode,
      confidenceThreshold1,
      confidenceThreshold2,
      originalImg,
      img,
      blur,
      canvas,
    } = options;

    this.confidenceThreshold1 = confidenceThreshold1 || 0.5;
    this.confidenceThreshold2 = confidenceThreshold2 || 0.7;
    this.isCrop = false;
    this.setColor(hairColor);
    this.setRenderMode(renderMode || "category");
    this.setImg(img);
    this.setOriginalImg(originalImg);
    this.setCanvas(canvas);
    this.setBlur(blur || 0);
    this.imageSegmenter = null;
    this.objectDetector = null;
    this.labels = null;
    this.runningMode = "IMAGE";
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  setBlur(blur) {
    this.blur = blur;
  }

  async setOriginalImg(img) {
    this.originalImg = img;
    this.width = img.naturalWidth;
    this.height = img.naturalHeight;

    return new Promise((resolve) => {
      this.img.setAttribute("src", img.getAttribute("src"));
      console.log({ width: this.width, height: this.height });
      this.img.onload = () => {
        this.segment = null;
        resolve();
      };
    });
  }

  setImg(img) {
    this.img = img;
  }

  async setImgSrc(src) {
    this.img.src = src;

    return new Promise((resolve) => {
      this.img.onload = () => {
        this.width = this.img.naturalWidth;
        this.height = this.img.naturalHeight;
        resolve();
      };
    });
  }

  setRenderMode(mode) {
    this.renderMode = mode;
  }

  setColor(color) {
    this.hairColor = color;
  }

  async loadModel() {
    this.audio = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
    );
    await this.loadSegmenter();
    await this.loadObjectDetector();
  }

  async loadSegmenter() {
    this.imageSegmenter = await ImageSegmenter.createFromOptions(this.audio, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",
        delegate: "GPU",
      },
      runningMode: this.runningMode,
      outputCategoryMask: true,
      outputConfidenceMasks: true,
    });
    this.labels = this.imageSegmenter.getLabels();
  }

  async loadObjectDetector() {
    this.objectDetector = await ObjectDetector.createFromOptions(this.audio, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite`,
      },
      scoreThreshold: 0.5,
      runningMode: this.runningMode,
    });
  }

  _clearCanvas() {
    this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _renderToCanvas(imageData, width, height) {
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const newImageData = new ImageData(uint8Array, width, height);
    // this.ctx.shadowBlur = 10;
    // 在畫布上應用模糊
    // this.ctx.filter = "blur(50px)"; // 設定模糊程度

    // 創建暫存 Canvas
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = width;
    tempCanvas.height = height;

    // 把圖像畫到暫存 Canvas
    tempCtx.putImageData(newImageData, 0, 0);

    // 將模糊後的影像畫回主 Canvas
    this.ctx.filter = `blur(${this.blur}px)`; // 設定模糊程度
    this.ctx.drawImage(tempCanvas, 0, 0);
    this.ctx.filter = "none"; // 清除 filter 避免影響後續繪圖

    // this.ctx.putImageData(newImageData, 0, 0);
    // this.ctx.filter = "none"; // 重置模糊
  }

  _createRegion(crop) {
    const { width, height } = this.segment.categoryMask;
    this.hairRect = Rect.bufferToRect(
      this.segment.categoryMask.getAsUint8Array(),
      width,
      height,
      (value) => value === CATEGORY_HAIR
    );
    if (crop) {
      const detections = this.objectDetector.detect(this.img);
      console.log({ detections });
      this.personRects = detections.detections
        .filter((detection) =>
          detection.categories.some(
            (category) => category.categoryName === "person"
          )
        )
        .map((detection) => {
          return {
            left: detection.boundingBox.originX,
            top: detection.boundingBox.originY,
            right: detection.boundingBox.originX + detection.boundingBox.width,
            bottom:
              detection.boundingBox.originY + detection.boundingBox.height,
          };
        });
      console.log({ hairRect: this.hairRect, personRects: this.personRects });
      this.unionRect = Rect.union([this.hairRect, ...this.personRects]);
    } else {
      this.unionRect = this.hairRect;
    }
  }

  async _createSegment(crop) {
    this.segment = await new Promise((resolve) => {
      this.imageSegmenter.segment(this.img, (result) => resolve(result));
    });
    this._createRegion(crop);
  }

  _renderHairCategory(imageData) {
    const mask = this.segment.categoryMask.getAsUint8Array();
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 0) continue;
      imageData[i * 4] = this.hairColor[0];
      imageData[i * 4 + 1] = this.hairColor[1];
      imageData[i * 4 + 2] = this.hairColor[2];
      imageData[i * 4 + 3] = this.hairColor[3];
    }
  }

  _renderHairConfidence(imageData) {
    const confidence =
      this.segment.confidenceMasks[CATEGORY_HAIR].getAsFloat32Array();
    for (let i = 0; i < confidence.length; i++) {
      const value = confidence[i];
      if (value < this.confidenceThreshold1) continue;

      function getRatio(value, threshold1, threshold2) {
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

  async crop() {
    this._clearCanvas();
    this.canvas.width = this.unionRect.width;
    this.canvas.height = this.unionRect.height;
    this.ctx.drawImage(
      this.originalImg, // 原圖
      this.unionRect.left,
      this.unionRect.top,
      this.unionRect.width,
      this.unionRect.height, // 裁切區域
      0,
      0,
      this.unionRect.width,
      this.unionRect.height // 畫布區域
    );
    const croppedImage = this.canvas.toDataURL("image/png");
    await this.setImgSrc(croppedImage);
    this._clearCanvas();
  }

  async _createMask(crop) {
    if (crop) {
      await this._createSegment(crop);
      await this.crop();
      this.canvas.width = this.unionRect.width;
      this.canvas.height = this.unionRect.height;
      await this._createSegment(crop);
    } else if (!this.segment) {
      await this._createSegment(crop);
    }
  }

  async render(crop) {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this._clearCanvas();

    await this._createMask(crop);

    const { width, height } = this.segment.categoryMask;
    const imageData = this.ctx.getImageData(0, 0, width, height).data;

    if (this.renderMode === "category") {
      this._renderHairCategory(imageData);
    } else {
      this._renderHairConfidence(imageData);
    }

    this._renderToCanvas(imageData, width, height);
  }
}

export default HairProcessor;
