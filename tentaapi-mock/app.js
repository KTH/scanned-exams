const log = require("skog");
const express = require("express");
const server = express();
log.init.pino();

server.listen(4001, (req, res) => {
  log.info("Started tentaapi-mock in port 4001.");
  log.fatal("YOU SHOULD ALWAYS RUN THIS APP LOCALLY");
});
