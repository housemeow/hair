export interface HairProduct {
  name: string
  usage: string
  image: string
}

export interface HairColor {
  name: string
  category: string
  product1: HairProduct
  product2: HairProduct | null
  link: string
  color: number[]
}

export interface AppConfig {
  confidenceThreshold1: number
  confidenceThreshold2: number
  blur: number
}

class Database {
  colorUrl: string;
  configUrl: string;
  colors: HairColor[];
  config: { confidenceThreshold1: number; confidenceThreshold2: number; };
  constructor(colorUrl: string, configUrl: string) {
    this.colorUrl = colorUrl;
    this.configUrl = configUrl;
    this.colors = [];
    this.config = { confidenceThreshold1: 0.5, confidenceThreshold2: 0.5 };
  }

  async load() {
    const colors = await fetch(this.colorUrl)
      .then((response) => response.text())
      .then((data) => {
        const [header, ...rows] = data.split("\r\n");

        const headerMap: Record<string, number> = {};
        // 產品名稱	色系	R	G	B	色彩增值alpha
        headerMap.nameIndex = header.split("\t").findIndex((col) => col === "產品名稱");
        headerMap.categoryIndex = header.split("\t").findIndex((col) => col === "色系");
        headerMap.product1Name = header.split("\t").findIndex((col) => col === "商品1名稱");
        headerMap.product1Usage = header.split("\t").findIndex((col) => col === "商品1操作");
        headerMap.product1Image = header.split("\t").findIndex((col) => col === "商品1圖片");
        headerMap.product2Name = header.split("\t").findIndex((col) => col === "商品2名稱");
        headerMap.product2Usage = header.split("\t").findIndex((col) => col === "商品2操作");
        headerMap.product2Image = header.split("\t").findIndex((col) => col === "商品2圖片");
        headerMap.link = header.split("\t").findIndex((col) => col === "購物連結");
        headerMap.rIndex = header.split("\t").findIndex((col) => col === "R");
        headerMap.gIndex = header.split("\t").findIndex((col) => col === "G");
        headerMap.bIndex = header.split("\t").findIndex((col) => col === "B");
        headerMap.aIndex = header
          .split("\t")
          .findIndex((col) => col === "色彩增值alpha");

        if (
          headerMap.nameIndex === -1 ||
          headerMap.colorIndex === -1 ||
          headerMap.categoryIndex === -1
        ) {
          alert("資料庫欄位錯誤");
        }

        return rows.map((row) => {
          const cells = row.split("\t");

          const r = parseInt(cells[headerMap.rIndex]);
          const g = parseInt(cells[headerMap.gIndex]);
          const b = parseInt(cells[headerMap.bIndex]);
          const a = Math.floor(
            255 * (parseFloat(cells[headerMap.aIndex].replace("%", "")) / 100)
          );
          return {
            name: cells[headerMap.nameIndex],
            category: cells[headerMap.categoryIndex],
            product1: {
              name: cells[headerMap.product1Name],
              usage: cells[headerMap.product1Usage],
              image: cells[headerMap.product1Image],
            },
            product2: cells[headerMap.product2Name] !== '-' ? {
              name: cells[headerMap.product2Name],
              usage: cells[headerMap.product2Usage],
              image: cells[headerMap.product2Image],
            } : null,
            link: cells[headerMap.link],
            color: [r, g, b, a],
          } as HairColor;
        });
      });

    const config = await fetch(this.configUrl)
      .then((response) => response.text())
      .then((data) => {
        const [header, ...rows] = data.split("\r\n");

        const headerMap: Record<string, number> = {};
        // 參數	數值
        headerMap.argumentIndex = header
          .split("\t")
          .findIndex((col) => col === "參數");
        headerMap.valueIndex = header
          .split("\t")
          .findIndex((col) => col === "數值");

        if (headerMap.confidenceThreshold1Index === -1) {
          alert("資料庫欄位錯誤");
        }

        const config = {
          confidenceThreshold1: 0.5,
          confidenceThreshold2: 0.5,
          blur: 0,
        };

        rows
          .map((row) => row.split("\t"))
          .forEach(([argument, value]) => {
            if (argument === "confidenceThreshold1") {
              config.confidenceThreshold1 = parseFloat(value);
            }
            if (argument === "confidenceThreshold2") {
              config.confidenceThreshold2 = parseFloat(value);
            }
            if (argument === "blur") {
              config.blur = parseInt(value);
            }
          });

        return config;
      });

    this.colors = colors;
    this.config = config;

    return {
      colors,
      config,
    };
  }
}

export default Database;
