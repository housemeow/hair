export const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    resolve(img)
  }
})
