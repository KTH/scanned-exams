const fs = require("fs");
const path = require("path");

module.exports = function getFile(fileId) {
  const buffer = fs.readFileSync(
    path.resolve(__dirname, `./files/${fileId}.pdf`)
  );
  const fileAsBase64 = buffer.toString("base64");

  return {
    wdFile: {
      fileAsBase64,
    },
  };
};
