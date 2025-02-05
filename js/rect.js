class Rect {
  static union(rects) {
    const union = rects.reduce(
      (acc, rect) => {
        acc.left = Math.min(acc.left, rect.left);
        acc.top = Math.min(acc.top, rect.top);
        acc.right = Math.max(acc.right, rect.right);
        acc.bottom = Math.max(acc.bottom, rect.bottom);
        return acc;
      },
      {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: Number.MIN_VALUE,
        bottom: Number.MIN_VALUE,
      }
    );
    union.width = union.right - union.left;
    union.height = union.bottom - union.top;
    return union;
  }

  static bufferToRect(array, width, height, condition) {
    let left = Number.MAX_VALUE;
    let top = Number.MAX_VALUE;
    let right = Number.MIN_VALUE;
    let bottom = Number.MIN_VALUE;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const index = x + y * width;
        const value = array[index];
        if (condition(value)) {
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
