const fs = require("fs");
const https = require("https");
const log = require("skog");
const server = require("./server");
const worker = require("./importWorker");

const privateKey = fs.readFileSync("certs/key.pem");
const certificate = fs.readFileSync("certs/cert.pem");

const httpsServer = https.createServer(
  {
    key: privateKey,
    cert: certificate,
  },
  server
);

worker.start();

server.listen(4000, () => {
  log.info(`Started HTTP server in http://localhost:4000`);
});
httpsServer.listen(process.env.PORT || 4443, () => {
  log.info(
    `Started HTTPS server in https://localhost:${process.env.PORT || 4443}`
  );
});
