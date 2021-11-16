const fs = require("fs");
const https = require("https");
const log = require("skog");
const server = require("./server");

const { startBackgroundImport } = require("./importWorker");

const serverUrl = new URL(process.env.SERVER_HOST_URL);
const hostname = serverUrl.host.split(":")[0];

function startApiServer(sslCerts) {
  startBackgroundImport();

  https.createServer(sslCerts, server)
    .listen(process.env.PORT || 4443, () => {
      log.info(
        `Started HTTPS server in https://localhost:${process.env.PORT || 4443}`
      );
    });
}

try {
  const sslCerts = {
    key: fs.readFileSync("certs/key.pem"),
    cert: fs.readFileSync("certs/cert.pem"),
  };
  startApiServer(sslCerts);
} catch (err) {
  if (process.env.NODE_ENV === "production") throw err;

  // DEVELOPMENT SERVER
  const devcert = require("devcert");
  devcert
    .certificateFor(hostname, {
      skipHostsFile: true, // Don't modify /etc/hosts
      skipCertutil: true, // This option will tell devcert to avoid installing certutil tooling.
    })
    .then((sslCert) => {
      startApiServer(sslCert);
    });
}
