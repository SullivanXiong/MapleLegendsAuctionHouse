require("dotenv").config();
const tesseract = require("node-tesseract-ocr");
const { captureScreenStream } = require("./image-stream");

const FPS = process.env.FPS || 15;
const MILLISECONDS_PER_SECOND = 1000;
const RATE_IN_MILLI = MILLISECONDS_PER_SECOND / FPS;

setInterval(() => {
  // Capture screen stream and run OCR
  captureScreenStream()
    .then((image) => {
      if (!image) {
        return;
      }
      console.log("Captured frame for OCR");

      const config = {
        lang: "eng",
        oem: 1,
        psm: 6,
      };

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
