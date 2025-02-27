class Database {
  colorUrl: string;
  configUrl: string;
  constructor(colorUrl: string, configUrl: string) {
    this.colorUrl = colorUrl;
    this.configUrl = configUrl;
  }

  async load() {
    const colors = await fetch(this.colorUrl)
      .then((response) => response.text())
      .then((data) => {
        const [header, ...rows] = data.split("\r\n");

        const headerMap: Record<string, number> = {};
        // 產品名稱	色系	R	G	B	色彩增值alpha
        headerMap.nameIndex = header
          .split("\t")
          .findIndex((col) => col === "產品名稱");
        headerMap.categoryIndex = header
          .split("\t")
          .findIndex((col) => col === "色系");
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
            color: [r, g, b, a],
          };
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
          });

        return config;
      });

    return {
      colors,
      config,
    };
  }
}

export default Database;
