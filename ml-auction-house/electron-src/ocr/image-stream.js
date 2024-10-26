path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const screenshot = require("screenshot-desktop");
const activeWindow = require("active-win");
const { Jimp, JimpMime } = require("jimp");

function imageCoordinatesCorrection(x, y, width, height) {
  return { x: x + 50, y: y + 35, width: width + 340, height: height + 160 };
}

async function captureScreenStream() {
  let win = await activeWindow();

  if (win.owner.name.includes("MapleLegends")) {
    imageCoords = win.bounds;
    // console.log("MapleLegends window found at:", imageCoords.x, imageCoords.y, imageCoords.width, imageCoords.height);
    // const { x, y, width, height } = imageCoordinatesCorrection(
    //   imageCoords.x,
    //   imageCoords.y,
    //   imageCoords.width,
    //   imageCoords.height
    // );
    const { x, y, width, height } = imageCoords;
    // console.log("MapleLegends window found at:", x, y, width, height);

    const imageBuffer = await screenshot();

    // console.log("Image exif:", JSON.stringify(exif));

    const image = await Jimp.read(imageBuffer);
    const croppedImage = image.crop({ w: width, h: height, x: x, y: y });

    if (process.env.ENV === "DEV") {
      //   await croppedImage
      //     .greyscale()
      //     .resize({ w: croppedImage.bitmap.width * 5, h: croppedImage.bitmap.height * 5 })
      //     .write("maplelegends.jpeg");
    }

    let resultImage = await croppedImage
      .greyscale()
      .resize({ w: croppedImage.bitmap.width * 1.2, h: croppedImage.bitmap.height * 1.2 })
      .getBuffer(JimpMime.jpeg);
    if (!resultImage || resultImage.length === 0) {
      throw new Error("Image not captured or empty");
    }

    return resultImage;
  }

  throw new Error("MapleLegends window not found");
}

module.exports = { captureScreenStream };
