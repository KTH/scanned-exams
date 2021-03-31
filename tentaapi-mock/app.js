const log = require("skog");
const express = require("express");
const server = express();
log.init.pino();

server.get("/Ladok/activity/:ladokId", (req, res) => {
  log.info(req.params.ladokId);
  res.send("Return information from Aktivitetstillfälle from Ladok");
});

server.post("/windream/search/documents/false", (req, res) => {
  res.send("Get the list of exams given search parameters");
});

server.get("/windream/file/:fileId/true", (req, res) => {
  log.info(req.params.fileId);
  res.send("Get a scanned PDF file");
});

server.listen(4001, (req, res) => {
  log.info("Started tentaapi-mock in port 4001.");
  log.fatal("YOU SHOULD ALWAYS RUN THIS APP LOCALLY");
});
