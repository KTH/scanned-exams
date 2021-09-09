const log = require("skog");
const server = require("./server");
const worker = require("./importWorker");

const PORT = process.env.PORT || 4000;

worker.start();
server.listen(PORT, () => {
  log.info(`App listening on port ${PORT}`);
});
