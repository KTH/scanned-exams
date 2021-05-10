const gm = require("gm");

const path = require("path");
const fs = require("fs");
// TODO: remove rimraf, use fsPromises.rmdir instead
const rimraf = require("rimraf");
const os = require("os");
const PDFDocument = require("pdfkit");

// TODO: this has to be load tested. In the test course, my pretty beefy computer used around 5% cpu when masking the exams.
// What if a user in a big course with 1000:s of exams, each around 100 MB, clicks multiple times in a row? Will our docker servers be able to manage that?
//

// TODO: we should test if this blocks the process. If you click the 'upload' button, is the app still responsive? Or will other users not be able to reach the app while it masks the exams?

function getPages(file) {
  // TODO: comment or refactor to make this code more understandable
  // TODO: crash with an obvious error if ImageMagick or GraphicsMagick insn't installed
  return new Promise((resolve) => {
    // TODO: what does this line do? Add a comment.
    gm(file).identify("%p ", (err, data) => {
      //TODO: what are these 10 and 1 magic numbers? Name them.
      // And why split by whitespace? I don't understand what this line is supposed to do.
      resolve(data.split(" ").map((d) => parseInt(d, 10) - 1));
    });
  });
}

/**
 * Convert a list of images (inputs) into a single PDF file (output)
 */
// TODO: why is this function async? It doesn't await anything.
async function convertToPdf(inputs, output) {
  const doc = new PDFDocument({ autoFirstPage: false });
  doc.pipe(fs.createWriteStream(output));

  for (const input of inputs) {
    // TODO: what are these 595,842 magic numbers? Name them.
    doc.addPage({ size: [595, 842], margin: 0 });
    doc.image(input, { fit: [595, 842], align: "center", valign: "center" });
  }

  // How do we know that the document has finished writing, since we don't await anything within this function? Is the code within this function synchronous and blocks the process? Or could we end it before it's finished writing?
  doc.end();
}

function maskImage(input, output) {
  return new Promise((resolve, reject) => {
    gm(input)
      .density(150, 150)
      .compress("jpeg")
      .fill("#fff")
      .stroke("#9dc2ea", 1)
      // These numbers should be named to make it easier to understand
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
  // TODO: can't have sync calls, it will block the app from all other requests. Should be change to await fsPromises.mkdtemp without sync.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "masked-images"));

  const pages = await getPages(input);
  const maskedImages = [];

  // Why do we slice? Add a comment.
  for (const page of pages.slice(1)) {
    const maskedImage = path.resolve(tmp, `${page}.png`);

    await maskImage(`${input}[${page}]`, maskedImage);
    maskedImages.push(maskedImage);
  }
  await convertToPdf(maskedImages, output);
  // TODO: remove console.log and use skog logging instead
  console.log("DONE", output);
  // TODO: remove rimraf, use fsPromises.rmdir instead
  rimraf.sync(tmp);
};
