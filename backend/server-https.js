const server = require("./server");
const fs = require("fs");
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

httpsServer.listen(4443, () => {
  log.info("Started HTTPS server in https://localhost:443");
});
