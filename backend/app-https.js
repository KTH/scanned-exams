const fs = require("fs");
const https = require("https");
const log = require("skog").default;
const server = require("./server");

const { startBackgroundImport } = require("./importWorker");

const privateKey = fs.readFileSync("certs/key.pem");
const certificate = fs.readFileSync("certs/cert.pem");

startBackgroundImport();
server.listen(4000, () => {
  log.info(`Started HTTP server in http://localhost:4000`);
});

const httpsServer = https.createServer(
  {
    key: privateKey,
    cert: certificate,
  },
  server
);

httpsServer.listen(process.env.PORT || 4443, () => {
  log.info(
    `Started HTTPS server in https://localhost:${process.env.PORT || 4443}`
  );
});
