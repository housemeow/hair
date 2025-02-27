interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}
class Rect {
  constructor(top: number = 0, left: number = 0, right: number = 0, bottom: number = 0) {
    this.top = top;
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.width = right - left;
    this.height = bottom - top;
  }

  static union(rects: Rect[]) {
    const union: Rect = rects.reduce(
      (acc, rect) => {
        acc.left = Math.min(acc.left, rect.left);
        acc.top = Math.min(acc.top, rect.top);
        acc.right = Math.max(acc.right, rect.right);
        acc.bottom = Math.max(acc.bottom, rect.bottom);
        acc.width = acc.right - acc.left;
        acc.height = acc.bottom - acc.top;
        return acc;
      },
      {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: Number.MIN_VALUE,
        bottom: Number.MIN_VALUE,
        width: 0,
        height: 0,
      }
    );
    return union;
  }

  static bufferToRect(array: Uint8Array, width: number, height: number, condition: (value: number) => boolean) {
    let left = Number.MAX_SAFE_INTEGER;
    let top = Number.MAX_SAFE_INTEGER;
    let right = Number.MIN_SAFE_INTEGER;
    let bottom = Number.MIN_SAFE_INTEGER;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const index = x + y * width;
        const value = array[index];
        if (condition(value)) {
          // console.log({ x, y, value });
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
          break;
        }
      }
    }
    return {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }
}

export default Rect;
