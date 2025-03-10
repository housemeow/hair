import type Rect from "./rect";

class CanvasRenderer {
  ctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
  static applyGaussianBlur(imageData: ImageData, width: number, height: number, sigma: number) {
    const pixels = imageData.data;
    const newPixels = new Uint8ClampedArray(pixels);

    const radius = Math.ceil(sigma * 2); // 高斯半徑調整
    const kernelSize = radius * 2 + 1;
    const kernel = new Float32Array(kernelSize);
    const sigmaSq = sigma * sigma;
    let sum = 0;

    // 計算高斯核
    for (let i = 0; i < kernelSize; i++) {
      const x = i - radius;
      kernel[i] = Math.exp(-(x * x) / (2 * sigmaSq));
      sum += kernel[i];
    }

    // 正規化
    for (let i = 0; i < kernelSize; i++) {
      kernel[i] /= sum;
    }

    // **水平方向模糊**
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let k = -radius; k <= radius; k++) {
          const px = Math.min(width - 1, Math.max(0, x + k)); // 避免超出範圍
          const idx = (y * width + px) * 4;
          r += pixels[idx] * kernel[k + radius];
          g += pixels[idx + 1] * kernel[k + radius];
          b += pixels[idx + 2] * kernel[k + radius];
          a += pixels[idx + 3] * kernel[k + radius];
        }
        const idx = (y * width + x) * 4;
        newPixels[idx] = r;
        newPixels[idx + 1] = g;
        newPixels[idx + 2] = b;
        newPixels[idx + 3] = a;
      }
    }

    // **垂直方向模糊**
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let k = -radius; k <= radius; k++) {
          const py = Math.min(height - 1, Math.max(0, y + k)); // 避免超出範圍
          const idx = (py * width + x) * 4;
          r += newPixels[idx] * kernel[k + radius];
          g += newPixels[idx + 1] * kernel[k + radius];
          b += newPixels[idx + 2] * kernel[k + radius];
          a += newPixels[idx + 3] * kernel[k + radius];
        }
        const idx = (y * width + x) * 4;
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = a;
      }
    }

    return imageData;
  }

  drawImage(image: CanvasImageSource, rect?: Rect) {
    if (rect) {
      this.ctx.drawImage(
        image, // 原圖
        rect.left,
        rect.top,
        rect.width,
        rect.height, // 裁切區域
        0,
        0,
        rect.width,
        rect.height // 畫布區域
      );
    } else {
      this.ctx.drawImage(image, 0, 0);
    }
  }

  setSize(width: number, height: number) {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  }

  static getResizedImage(src: string, maxSize: number): Promise<string> {
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = () => {
        // 設定最大尺寸
        let width = img.width;
        let height = img.height;

        // 計算縮放比例，保持原始寬高比
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height *= maxSize / width;
            width = maxSize;
          } else {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        // 建立 Canvas 縮放圖片
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為 DataURL
        const resizedDataURL = canvas.toDataURL("image/png");

        // 釋放 canvas 資源
        ctx.clearRect(0, 0, width, height);
        ctx = null!;
        // **釋放 canvas 變數**
        canvas.remove();
        canvas = null!;

        img.src = "";
        img.remove();
        img = null!

        resolve(resizedDataURL);
      };

      // 設定圖片來源
      img.src = src;
    });
  }

  static getCroppedBase64(img: HTMLImageElement, rect: Rect) {
    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);
    return canvas.toDataURL("image/png");
  }

  getImage() {
    return this.ctx.canvas.toDataURL("image/png");
  }

  getImageData() {
    return this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  putImageData(imageData: ImageData) {
    this.ctx!.putImageData(imageData, 0, 0);
  }
}

export default CanvasRenderer;
