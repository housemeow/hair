import {
  ImageSegmenter,
  ObjectDetector,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";

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
    this.imageSegmenter = null;
    this.objectDetector = null;
    this.labels = null;
    this.runningMode = "IMAGE";
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  setOriginalImg(img) {
    this.originalImg = img;
    this.width = img.naturalWidth;
    this.height = img.naturalHeight;

    this.img.setAttribute("src", img.getAttribute("src"));
    this.segment = null;
    console.log({ width: this.width, height: this.height });
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
      outputConfidenceMasks: true,
    });
    this.labels = this.imageSegmenter.getLabels();
  }

  async loadObjectDetector() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
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
    this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  async _createSegment() {
    this.segment = await new Promise((resolve) => {
      this.imageSegmenter.segment(this.img, (result) => resolve(result));
    });

    let left = -1;
    let top = -1;
    let right = -1;
    let bottom = -1;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const index = x + y * this.width;
        const mask = this.segment.categoryMask.getAsUint8Array();
        const value = mask[index];
        if (value === 1) {
          if (left === -1) {
            left = x;
          } else {
            left = Math.min(left, x);
          }
          if (top === -1) {
            top = y;
          } else {
            top = Math.min(top, y);
          }
          if (right === -1) {
            right = x;
          } else {
            right = Math.max(right, x);
          }
          if (bottom === -1) {
            bottom = y;
          } else {
            bottom = Math.max(bottom, y);
          }
          break;
        }
      }
    }
    this.hairRect = {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    };
    const detections = this.objectDetector.detect(this.img);
    this.personRects = detections.detections
      .filter((detection) =>
        detection.categories.some(
          (category) => category.categoryName === "person"
        )
      )
      .map((detection) => detection.boundingBox)
      .map((detection) => {
        return {
          left: detection.originX,
          top: detection.originY,
          right: detection.originX + detection.width,
          bottom: detection.originY + detection.height,
          width: detection.width,
          height: detection.height,
        };
      });
    this.unionRect = [this.hairRect, ...this.personRects].reduce(
      (acc, rect) => {
        acc.left = Math.min(acc.left, rect.left);
        acc.top = Math.min(acc.top, rect.top);
        acc.right = Math.max(acc.right, rect.right);
        acc.bottom = Math.max(acc.bottom, rect.bottom);
        return acc;
      },
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
    );
    this.unionRect.width = this.unionRect.right - this.unionRect.left;
    this.unionRect.height = this.unionRect.bottom - this.unionRect.top;
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
    const confidence = this.segment.confidenceMasks[1].getAsFloat32Array();
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

  _renderToCanvas(imageData, width, height) {
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const newImageData = new ImageData(uint8Array, width, height);
    this.ctx.putImageData(newImageData, 0, 0);
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

  async render(crop) {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this._clearCanvas();

    if (false && crop) {
      await this._createSegment();
      await this.crop();
      this.canvas.width = this.unionRect.width;
      this.canvas.height = this.unionRect.height;
      await this._createSegment();
    } else {
      if (!this.segment) {
        await this._createSegment();
      }
    }

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
