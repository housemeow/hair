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

// Change image
$fileInput.on("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      $sampleImg.one("load", async () => {
        hairProcessor.setOriginalImg($sampleImg.get(0));
        await hairProcessor.render(true);
      });
      $sampleImg.attr("src", e.target.result);
    };
    reader.readAsDataURL(file);
  }
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
