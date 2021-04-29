const path = require("path");
const maskFile = require("./mask-file");

maskFile(
  path.resolve(__dirname, "test/input1.pdf"),
  path.resolve(__dirname, "test/output1.pdf")
);
