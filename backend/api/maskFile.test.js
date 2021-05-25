const { describe, expect, test } = require("@jest/globals");
const path = require("path");
const fs = require("fs");
const os = require("os");

const maskFile = require("../api/maskFile");

test("Make sure that `maskFile` works", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "masked-image-test"));
  const input = path.resolve(__dirname, "./example.input.test.pdf");
  const output = path.resolve(tmp, "./example.output.test.pdf");

  await maskFile(input, output);

  // Check that "output" exists
  expect(fs.existsSync(output)).toBe(true);
});
