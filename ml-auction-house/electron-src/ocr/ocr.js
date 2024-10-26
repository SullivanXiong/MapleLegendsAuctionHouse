path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const tesseract = require("node-tesseract-ocr");
const { captureScreenStream } = require("./image-stream");

const FPS = process.env.FPS || 5;
const MILLISECONDS_PER_SECOND = 1000;
const RATE_IN_MILLI = MILLISECONDS_PER_SECOND / FPS;
let DPI = 40;

setInterval(() => {
  // Capture screen stream and run OCR
  captureScreenStream()
    .then(async (image) => {
      const config = {
        lang: "eng",
        oem: 1,
        psm: 3,
        dpi: DPI,
      };
      //   console.log("Running OCR on DPI: ", DPI);
      DPI += 1;

      tesseract
        .recognize(image, config)
        .then((text) => {
          console.log("Recognized text:", text);
        })
        .catch((error) => {
          console.error(error.message);
        });
    })
    .catch((error) => {
      console.error(error.message);
    });
}, RATE_IN_MILLI);
