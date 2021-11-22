/* eslint-disable no-await-in-loop */
const log = require("skog");
const processQueueEntry = require("./api/importQueue/processQueueEntry");

async function startBackgroundImport() {
  log.info("Start background import");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let didProcess;

    try {
      didProcess = await processQueueEntry();
    } catch (err) {
      log.error({ err }, "Unexpected error when processing a Queue Entry");
    }
    await new Promise((resolve) => setTimeout(resolve, didProcess ? 10 : 1000));
  }
}

module.exports = {
  startBackgroundImport,
};
