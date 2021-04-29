const path = require("path");
const maskFile = require("../../backend/api/maskFile");

maskFile(
  path.resolve(__dirname, "test/input1.pdf"),
  path.resolve(__dirname, "test/output1.pdf")
);
