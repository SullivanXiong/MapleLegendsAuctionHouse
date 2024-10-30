const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { captureScreenStream, readImageFromBuffer } = require("./image-stream");
const fs = require("fs");
const { Jimp, JimpMime } = require("jimp");
const Tesseract = require("tesseract.js");
const cv = require("opencv4nodejs");

const FPS = process.env.FPS || 5;
const MILLISECONDS_PER_SECOND = 1000;
const RATE_IN_MILLI = MILLISECONDS_PER_SECOND / FPS;
const TEMPLATE_MATCH_RATE = 0.9;

async function readImageWithOpenCV(mainImage, templateImages) {
  // Convert the mainImage to an image using canvas
  //   const img = await loadImage(mainImage);
  //   const canvas = createCanvas(img.width, img.height);
  //   const ctx = canvas.getContext("2d");
  //   ctx.drawImage(img, 0, 0, img.width, img.height);
  const mainMat = cv.matFromImageData(mainImage.bitmap); // This should work without needing `document`
  cv.Canny(mainMat, mainMat, 50, 150);
  let matchedTemplates = {};

  for (const [templateName, templateImage] of Object.entries(templateImages)) {
    const templateMat = cv.matFromImageData(templateImage.bitmap); // This should work without needing `document`
    cv.Canny(templateMat, templateMat, 50, 150);

    const result = new cv.Mat();
    cv.matchTemplate(mainMat, templateMat, result, cv.TM_CCOEFF_NORMED);
    // Find the best match score
    const minMax = cv.minMaxLoc(result);
    const maxVal = minMax.maxVal; // For TM_CCOEFF_NORMED, higher values mean better matches

    // Set a threshold, e.g., 0.8 for an 80% match
    const isMatched = maxVal >= TEMPLATE_MATCH_RATE;
    if (isMatched) {
      matchedTemplates[templateName] = templateImage;
    }
  }

  return matchedTemplates;
}

async function runMain() {
  // Get all of the template images from the path of path.join(__dirname, "./templates")
  const templates = fs.readdirSync(path.join(__dirname, "./templates"));

  let templateImages = {};
  templates.forEach(async (template) => {
    const image = await Jimp.read(path.join(__dirname, "./templates", template));
    templateImages[template] = await image.greyscale();
  });

  //   console.log("templates", templates);

  //   // Convert both images to grayscale for better matching
  //   const grayMain = new cv.Mat();
  //   const grayTemplate = new cv.Mat();
  //   cv.cvtColor(mainImage, grayMain, cv.COLOR_RGBA2GRAY);
  //   cv.cvtColor(template, grayTemplate, cv.COLOR_RGBA2GRAY);

  //   // Create the result matrix
  //   const result = new cv.Mat();
  //   const matchMethod = cv.TM_CCOEFF_NORMED;

  //   // Apply template matching
  //   cv.matchTemplate(grayMain, grayTemplate, result, matchMethod);

  //   // Get the best match position
  //   const minMax = cv.minMaxLoc(result);
  //   const maxVal = minMax.maxVal;
  //   const maxLoc = minMax.maxLoc;

  //   // Set a similarity threshold
  //   const threshold = 0.8;
  //   if (maxVal >= threshold) {
  //     console.log(`Template found at location: ${maxLoc.x}, ${maxLoc.y} with similarity: ${maxVal}`);

  //     // Optional: Draw a rectangle around the matched area
  //     const matchRect = new cv.Rect(maxLoc.x, maxLoc.y, template.cols, template.rows);
  //     cv.rectangle(mainImage, matchRect, [0, 255, 0, 255], 2); // Green rectangle
  //     cv.imshow("Canvas", mainImage);
  //   } else {
  //     console.log("Template not found on the screen.");
  //   }

  //   setInterval(() => {
  //     // Capture screen stream and run OCR
  //     captureScreenStream()
  //       .then(async (image) => {
  //         let mainImage = cv.imread(await readImageFromBuffer(image));
  //         const grayMain = new cv.Mat();
  //         cv.cvtColor(mainImage, grayMain, cv.COLOR_RGBA2GRAY);

  //         const result = new cv.Mat();
  //         cv.matchTemplate(grayMain, grayTemplate, result, cv.TM_CCOEFF_NORMED);

  //         // Create a canvas with the image dimensions
  //         const canvas = createCanvas(img.width, img.height);
  //         const ctx = canvas.getContext("2d");

  //         // Draw the image onto the canvas
  //         ctx.drawImage(img, 0, 0);

  //         //   Tesseract.recognize(path.resolve(__dirname, "../../maplelegends_item_sold.jpeg"), "eng", {}).then(
  //         //     ({ data: { text } }) => {
  //         //       console.log(text);
  //         //     }
  //         //   );
  //       })
  //       .catch((error) => {
  //         console.error(error.message);
  //       });
  //   }, RATE_IN_MILLI);

  captureScreenStream()
    .then(async (image) => {
      readImageWithOpenCV(image, templateImages).then((matchedTemplates) => {
        console.log("len of matchTemplate:", Object.entries(matchedTemplates).length);
        //   delete all the images in the path ./matched_templates and then write the matched templates to the path
        fs.readdirSync(path.join(__dirname, "./matched_templates")).forEach((file) => {
          fs.unlinkSync(path.join(__dirname, "./matched_templates", file));
        });

        for (const [templateName, templateImage] of Object.entries(matchedTemplates)) {
          templateImage.write(path.join(__dirname, "./matched_templates", `${templateName}`));
        }
        image.write(path.join(__dirname, "./matched_templates/main.png"));
      });

      //   Tesseract.recognize(path.resolve(__dirname, "../../maplelegends_item_sold.jpeg"), "eng", {}).then(
      //     ({ data: { text } }) => {
      //       console.log(text);
      //     }
      //   );
    })
    .catch((error) => {
      console.error(error.message);
    });

  //   // Clean up
  //   grayMain.delete();
  //   grayTemplate.delete();
  //   result.delete();
  //   mainImage.delete();
  //   template.delete();

  //   templateImages.forEach((templateImage) => {
  //     templateImage.delete();
  //   });
}

runMain();
