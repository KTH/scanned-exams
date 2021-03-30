const express = require("express");
const path = require("path");

const PORT = 4000;

const app = express();

app.use(
  "/static",
  express.static(path.join(__dirname, "..", "frontend", "build"))
);

app.get("/", (req, res) => {
  res.status(200).send("Yay");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
