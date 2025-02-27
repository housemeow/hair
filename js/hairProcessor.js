import {
  ImageSegmenter,
  ObjectDetector,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";
import CanvasRenderer from "./canvasRenderer.js";
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
    this.canvasRenderer = new CanvasRenderer(canvas);
    this.setImg(img);
    this.setOriginalImg(originalImg);
    this.setBlur(blur || 0);
    this.imageSegmenter = null;
    this.objectDetector = null;
    this.labels = null;
    this.runningMode = "IMAGE";
  }

  setBlur(blur) {
    this.blur = blur;
  }

  async setOriginalImg(img) {
    this.originalImg = img;
    this.width = img.naturalWidth;
    this.height = img.naturalHeight;

    return new Promise((resolve) => {
      this.img.onload = () => {
        this.segment = null;
        this.canvasRenderer.setSize(this.width, this.height);
        resolve();
      };
      this.canvasRenderer.clear();
      this.img.setAttribute("src", img.getAttribute("src"));
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

  _renderToCanvas(imageData) {
    // 創建暫存 Canvas
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    // 把圖像畫到暫存 Canvas
    tempCtx.putImageData(imageData, 0, 0);

    // 將模糊後的影像畫回主 Canvas
    this.canvasRenderer.renderBlurImage(tempCanvas, this.blur);

    tempCanvas.remove();
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
      imageData.data[i * 4] = this.hairColor[0];
      imageData.data[i * 4 + 1] = this.hairColor[1];
      imageData.data[i * 4 + 2] = this.hairColor[2];
      imageData.data[i * 4 + 3] = this.hairColor[3];
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
      imageData.data[i * 4] = this.hairColor[0];
      imageData.data[i * 4 + 1] = this.hairColor[1];
      imageData.data[i * 4 + 2] = this.hairColor[2];
      imageData.data[i * 4 + 3] = this.hairColor[3] * ratio;
    }
  }

  async crop() {
    this.canvasRenderer.clear();
    this.canvasRenderer.setSize(this.unionRect.width, this.unionRect.height);
    this.canvasRenderer.drawImage(this.originalImg, this.unionRect);
    const croppedImage = this.canvasRenderer.getImage();
    await this.setImgSrc(croppedImage);
    this.canvasRenderer.clear();
  }

  async _createMask(crop) {
    if (crop) {
      await this._createSegment(crop);
      await this.crop();
      this.canvasRenderer.setSize(this.unionRect.width, this.unionRect.height);
      await this._createSegment(crop);
    } else if (!this.segment) {
      await this._createSegment(crop);
    }
  }

  async render(crop) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await this._createMask(crop);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const imageData = this.canvasRenderer.getImageData();

    if (this.renderMode === "category") {
      this._renderHairCategory(imageData);
    } else {
      this._renderHairConfidence(imageData);
    }

    this.canvasRenderer.clear();
    this._renderToCanvas(imageData);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

export default HairProcessor;
