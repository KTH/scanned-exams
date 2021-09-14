const log = require("skog");
const processQueueEntry = require("./api/processQueueEntry");

async function startBackgroundImport() {
  // eslint-disable-next-line no-constant-condition
  log.info("Start background import");
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    await processQueueEntry();
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

module.exports = {
  startBackgroundImport,
};
