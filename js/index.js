import Database from "./database.js";
import HairProcessor from "./hairProcessor.js";

const COLOR_DATABASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFFONBmJrC2GaZpGYI_gjXPWnOizakJK6l5AkXyZ7NxzBhkTaejfLEQTnjpUFrR3ZR_MD3UdNJhSEj/pub?gid=0&single=true&output=tsv";
const CONFIG_DATABASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFFONBmJrC2GaZpGYI_gjXPWnOizakJK6l5AkXyZ7NxzBhkTaejfLEQTnjpUFrR3ZR_MD3UdNJhSEj/pub?gid=237858754&single=true&output=tsv";

// Get DOM elements
const $demosSection = $("#demos");
const $hairVisible = $("#hair_visible");
const $modelVisible = $("#model_visible");
const $color = $("#color");
const $renderMode = $("#renderMode");
const $fileInput = $('input[type="file"]');
const $sampleImg = $(".sample");
const $segmentImg = $(".segment img");

const database = new Database(COLOR_DATABASE, CONFIG_DATABASE);

const { colors, config } = await database.load();
console.log({ colors, config });
let selectedColorIndex = 0;

// use jquery to replace select items, value = index, text = name
$color.empty();
colors.forEach((color, index) => {
  $color.append(
    $("<option>", {
      value: index,
      text: `${color.name} (${color.color.join(", ")})`,
    })
  );
});

const hairProcessor = new HairProcessor({
  hairColor: colors[selectedColorIndex].color,
  renderMode: "confidence",
  confidenceThreshold1: config.confidenceThreshold1,
  confidenceThreshold2: config.confidenceThreshold2,
  originalImg: $sampleImg.get(0),
  img: $(".segment img").get(0),
  canvas: $(".segment canvas").get(0),
});
$renderMode.val(hairProcessor.renderMode);

// // Change image
$fileInput.on("change", function (e) {
  const file = e.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // 設定最大尺寸
      const maxSize = 1000;
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
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // 轉換為 DataURL
      const resizedDataURL = canvas.toDataURL("image/png");

      // 釋放 canvas 資源
      ctx.clearRect(0, 0, width, height);
      canvas.width = 0;
      canvas.height = 0;

      // 設定圖片 src，並確保載入後才處理
      $sampleImg.one("load", async () => {
        await hairProcessor.setOriginalImg($sampleImg.get(0));
        await hairProcessor.render(true);

        // **釋放 img 物件**
        img.src = "";
      });

      // 設定新圖片
      $sampleImg.attr("src", resizedDataURL);

      // **釋放 canvas 變數**
      canvas.remove();
    };

    // 設定圖片來源
    img.src = e.target.result;

    // **確保讀取器釋放資源**
    reader.onload = null;
  };

  reader.readAsDataURL(file);
});

$color.on("change", async function () {
  selectedColorIndex = parseInt(this.value);
  hairProcessor.setColor(colors[selectedColorIndex].color);
  $(".segment canvas").addClass("removed");
  await hairProcessor.render();
  $(".segment canvas").removeClass("removed");
});

$renderMode.on("change", function () {
  hairProcessor.setRenderMode(this.value);
  $(".segment canvas").addClass("removed");
  hairProcessor.render();
  $(".segment canvas").removeClass("removed");
});

$hairVisible.on("change", function () {
  if (this.checked) {
    $(".segment canvas").removeClass("removed");
  } else {
    $(".segment canvas").addClass("removed");
  }
});

$modelVisible.on("change", function () {
  if (this.checked) {
    $(".segment img").css("opacity", 1);
  } else {
    $(".segment img").css("opacity", 0);
  }
});

// 設定 .segment img 的 src 與 .sample 的 src 一樣
$segmentImg.attr("src", $sampleImg.attr("src"));
await hairProcessor.loadModel();
await hairProcessor.render(true);

$demosSection.removeClass("invisible");
$(".segment canvas").removeClass("removed");
