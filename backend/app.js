const log = require("skog");
const server = require("./server");
const { startBackgroundImport } = require("./importWorker");
const { startDatabaseConnection } = require("./api/importQueue");

const PORT = process.env.PORT || 4000;

server.listen(PORT, async () => {
  log.info(`App listening on port ${PORT}`);
  await startDatabaseConnection();
  startBackgroundImport();
});
