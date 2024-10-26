const screenshot = require("screenshot-desktop");
const activeWindow = require("active-win");
const { Jimp } = require("jimp");
const exifParser = require("exif-parser");

function imageCoordinatesCorrection(x, y, width, height) {
  return { x: x + 50, y: y + 35, width: width + 340, height: height + 160 };
}

function rotateImage(image, orientation) {
  switch (orientation) {
    case 3:
      return image.rotate(180);
    case 6:
      return image.rotate(90);
    case 8:
      return image.rotate(-90);
    default:
      return image;
  }
}

async function captureScreenStream() {
  let win = await activeWindow();

  if (win.owner.name.includes("MapleLegends")) {
    imageCoords = win.bounds;
    // console.log("MapleLegends window found at:", imageCoords.x, imageCoords.y, imageCoords.width, imageCoords.height);
    const { x, y, width, height } = imageCoordinatesCorrection(
      imageCoords.x,
      imageCoords.y,
      imageCoords.width,
      imageCoords.height
    );
    // console.log("MapleLegends window found at:", x, y, width, height);

    const imageBuffer = await screenshot();

    // Parse EXIF data
    const parser = exifParser.create(imageBuffer);
    const exif = parser.parse();
    const orientation = exif.tags.Orientation || 1;
    // console.log("Image exif:", JSON.stringify(exif));

    const image = rotateImage(await Jimp.read(imageBuffer), orientation);
    const croppedImage = image.crop({ w: width, h: height, x: x, y: y });
    await croppedImage.write("maplelegends.jpeg");
    return await croppedImage.getBuffer(Jimp.MIME_JPEG);
  }

  //   throw new Error("MapleLegends window not found");
}

module.exports = { captureScreenStream };
