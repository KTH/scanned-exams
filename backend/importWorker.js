const log = require("skog");
const processQueueEntry = require("./api/processQueueEntry");

async function startBackgroundImport() {
  log.info("Start background import");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const didProcess = await processQueueEntry();
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, didProcess ? 10 : 1000));
  }
}

module.exports = {
  startBackgroundImport,
};
