import { ObjectDetector } from "@mediapipe/tasks-vision";
import Rect from "@/rect";
import type { RunningMode, WasmFileset } from "./type";

class PersonDetector {
  runningMode: RunningMode;
  objectDetector!: ObjectDetector
  loaded: boolean;
  rect: Rect

  constructor() {
    this.runningMode = 'IMAGE';
    this.rect = new Rect()
    this.loaded = false
  }

  async load(wasm: WasmFileset) {
    this.objectDetector = await ObjectDetector.createFromOptions(wasm, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite`,
      },
      scoreThreshold: 0.5,
      runningMode: this.runningMode,
    });
    this.loaded = true
  }

  detect(image: HTMLImageElement) {
    const detections = this.objectDetector.detect(image);
    const personRects = detections.detections
      .filter((detection) =>
        detection.categories.some(
          (category) => category.categoryName === "person"
        )
      )
      .map((detection) => {
        return {
          left: detection.boundingBox!.originX,
          top: detection.boundingBox!.originY,
          right: detection.boundingBox!.originX + detection.boundingBox!.width,
          bottom:
            detection.boundingBox!.originY + detection.boundingBox!.height,
          width: detection.boundingBox!.width,
          height: detection.boundingBox!.height,
        };
      })
    this.rect = Rect.union(personRects);
    console.log('PersonDetector', this.rect);
  }
}

export default PersonDetector
