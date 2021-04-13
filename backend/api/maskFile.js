const gm = require("gm");
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const os = require("os");
const PDFDocument = require("pdfkit");

function getPages(file) {
  return new Promise((resolve) => {
    gm(file).identify("%p ", (err, data) => {
      resolve(data.split(" ").map((d) => parseInt(d, 10) - 1));
    });
  });
}

/**
 * Convert a list of images (inputs) into a single PDF file (output)
 */
async function convertToPdf(inputs, output) {
  const doc = new PDFDocument({ autoFirstPage: false });
  doc.pipe(fs.createWriteStream(output));

  for (const input of inputs) {
    doc.addPage({ size: [595, 842], margin: 0 });
    doc.image(input, { fit: [595, 842], align: "center", valign: "center" });
  }

  doc.end();
}

function maskImage(input, output) {
  return new Promise((resolve, reject) => {
    gm(input)
      .density(150, 150)
      .compress("jpeg")
      .fill("#fff")
      .stroke("#9dc2ea", 1)
      .drawRectangle(560, 240 - 70, 560 + 240, 240 + 70)
      .write(output, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

module.exports = async function maskFile(input, output) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "masked-images"));

  const pages = await getPages(input);
  const maskedImages = [];

  for (const page of pages.slice(1)) {
    const maskedImage = path.resolve(tmp, `${page}.png`);

    await maskImage(`${input}[${page}]`, maskedImage);
    maskedImages.push(maskedImage);
  }
  await convertToPdf(maskedImages, output);
  console.log("DONE", output);
  rimraf.sync(tmp);
};
