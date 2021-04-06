const gm = require("gm");

function getInfo(file) {
  gm(file).identify((err, data) => {
    console.log(data);
  });
}

getInfo("./test/input1.pdf");
