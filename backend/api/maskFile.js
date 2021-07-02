const gm = require("gm");
const log = require("skog");
const path = require("path");
const fs = require("fs");
const os = require("os");
const PDFDocument = require("pdfkit");

// TODO: this has to be load tested. In the test course, my pretty beefy computer used around 5% cpu when masking the exams.
// What if, in a big course with 1000:s of exams each around 100 MB, multiple teachers click before the last run has completed? Will our docker servers be able to manage that?
//

// TODO: we should test if this blocks the process. If you click the 'upload' button, is the app still responsive? Or will other users not be able to reach the app while it masks the exams?

/** Returns how many pages have the "file" */
function numberOfPages(file) {
  return new Promise((resolve, reject) => {
    // The following line executes ImageMagick/GraphicsMagic command that
    // returns all page numbers separated by spaces
    // (e.g. for a 7 pages document, it returns "1 2 3 4 5 6 7")
    gm(file).identify("%p ", (err, data) => {
      if (err) {
        reject(err);
      } else {
        // from the "1 2 3 4 5 6 7" string, take the "last word" and
        // convert it to a number
        const lastWord = data.split(" ").pop();
        resolve(parseInt(lastWord, 10));
      }
    });
  });
}

/**
 * Convert a list of images (inputs) into a single PDF file (output)
 */
function convertToPdf(inputs, output) {
  // Note: these numbers are measurements in "points", not pixels
  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const doc = new PDFDocument({ autoFirstPage: false });
  const writer = fs.createWriteStream(output);
  doc.pipe(writer);

  for (const input of inputs) {
    doc.addPage({ size: [PAGE_WIDTH, PAGE_HEIGHT], margin: 0 });
    doc.image(input, {
      fit: [PAGE_WIDTH, PAGE_HEIGHT],
      align: "center",
      valign: "center",
    });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve());
    writer.on("error", (error) => reject(error));
  });
}

function maskImage(input, output) {
  // Note: these numbers are measurements in "pixels" after converting each
  // PDF page into a JPEG image
  const MASK_COORDINATES = [
    // Top-left corner:
    560, // x coordinate
    170, // y coordinate
    // Botttom-right corner
    800, // x coordinate
    310, // y coordinate
  ];
  return new Promise((resolve, reject) => {
    gm(input)
      .density(150, 150)
      .compress("jpeg")
      .fill("#fff")
      .stroke("#9dc2ea", 1)
      .drawRectangle(...MASK_COORDINATES)
      .write(output, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

module.exports = async function maskFile(input, output) {
  const startDate = new Date();
  const tmp = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "masked-images")
  );

  const pages = await numberOfPages(input);
  const maskedImages = [];

  // Note: we start from "1" to remove the "försättsblad" (examination cover)
  for (let page = 1; page < pages; page++) {
    const maskedImage = path.resolve(tmp, `${page}.png`);

    // eslint-disable-next-line no-await-in-loop
    await maskImage(`${input}[${page}]`, maskedImage);
    maskedImages.push(maskedImage);
  }
  await convertToPdf(maskedImages, output);
  const endDate = new Date();
  await fs.promises.rmdir(tmp, { force: true, recursive: true });
  log.info(
    `Finished masking of ${input}. It took ${Math.abs(
      (startDate.getTime() - endDate.getTime()) / 1000
    )} seconds`
  );
};
