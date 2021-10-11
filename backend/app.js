const log = require("skog").default;
const server = require("./server");
const { startBackgroundImport } = require("./importWorker");

const PORT = process.env.PORT || 4000;

startBackgroundImport();
server.listen(PORT, () => {
  log.info(`App listening on port ${PORT}`);
});
