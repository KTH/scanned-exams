const maskFile = require("../../backend/api/maskFile");

const path = require("path");
const fs = require("fs");

const inputPath = path.resolve(__dirname, "all/input");
const outputPath = path.resolve(__dirname, "all/output");

// Loop through all files in "directory". Return the paths relative to all directories
function* getFiles(directory, ...otherDirectories) {
  for (const file of fs.readdirSync(directory)) {
    const filePath = path.resolve(directory, file);
    const otherPaths = otherDirectories.map((d) => path.resolve(d, file));
    yield [filePath, ...otherPaths];

    if (fs.statSync(filePath).isDirectory()) {
      yield* getFiles(filePath, ...otherPaths);
    }
  }
}

async function start() {
  for (const [p1, p2] of getFiles(inputPath, outputPath)) {
    if (fs.statSync(p1).isDirectory()) {
      // if p1 is a directory, make sure that p2 as directory exists
      fs.mkdirSync(p2, { recursive: true });
    } else if (!p1.toLowerCase().endsWith("pdf")) {
      console.log(p1, "ignored");
    } else {
      await maskFile(p1, p2);
    }
  }
}

start();
