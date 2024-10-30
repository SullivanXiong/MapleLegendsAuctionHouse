path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const screenshot = require("screenshot-desktop");
const activeWindow = require("active-win");
const { Jimp } = require("jimp");

function bufferToDataURL(buffer) {
  const base64 = buffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

async function readImageFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Now img can be used with OpenCV's imread
      const mat = cv.imread(img);
      resolve(mat);
    };
    img.onerror = (err) => reject(err);

    // Set the image source to the Data URL
    img.src = bufferToDataURL(buffer);
  });
}

async function captureScreenStream() {
  let win = await activeWindow();

  if (win.owner.name.includes("MapleLegends")) {
    imageCoords = win.bounds;
    const { x, y, width, height } = imageCoords;

    const imageBuffer = await screenshot();

    const image = await Jimp.read(imageBuffer);
    const croppedImage = image.crop({ w: width, h: height, x: x, y: y });

    let resultImage = await croppedImage.greyscale();
    if (!resultImage || resultImage.length === 0) {
      throw new Error("Image not captured or empty");
    }

    return resultImage;
  }

  throw new Error("MapleLegends window not found");
}

module.exports = { captureScreenStream, readImageFromBuffer };
