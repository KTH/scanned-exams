const server = require("./server");
const fs = require("fs");
require('dotenv').config()
const https = require("https");
const log = require("skog");

const privateKey = fs.readFileSync("certs/key.pem");
const certificate = fs.readFileSync("certs/cert.pem");

const httpsServer = https.createServer(
  {
    key: privateKey,
    cert: certificate,
  },
  server
);

httpsServer.listen(process.env.PORT ?? 443, () => {
  log.info(`Started HTTPS server in https://localhost:${process.env.PORT}`);
});
