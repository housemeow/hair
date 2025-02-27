class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImage(image, rect) {
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

  setSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  static async getCroppedImage(src, maxSize) {
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
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為 DataURL
        const resizedDataURL = canvas.toDataURL("image/png");

        // 釋放 canvas 資源
        ctx.clearRect(0, 0, width, height);
        ctx = null;
        // **釋放 canvas 變數**
        canvas.remove();
        canvas = null;

        img.src = "";
        img.remove();
        img = null;

        resolve(resizedDataURL);
      };

      // 設定圖片來源
      img.src = src;
    });
  }

  getImage() {
    return this.canvas.toDataURL("image/png");
  }

  getImageData() {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  renderBlurImage(canvas, blur) {
    this.ctx.filter = `blur(${blur}px)`;
    this.drawImage(canvas);
    this.ctx.filter = "none";
  }
}

export default CanvasRenderer;
