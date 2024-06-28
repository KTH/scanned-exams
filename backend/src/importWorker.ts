/* eslint-disable no-await-in-loop */
import log from "skog";
import { processQueueEntry } from "./api/importQueue/processQueueEntry";
import { listAllQueues, purgeEmptyQueues } from "./api/importQueue/";
export async function startBackgroundImport() {
  log.info("Start background import");
  purgeEmptyQueues();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let didProcess;

    try {
      const collections = await listAllQueues();

      await Promise.all(
        collections.map((c) => {
          const courseNumber = parseInt(c.name.split(":")[1]);
          processQueueEntry(courseNumber);
        })
      );
    } catch (err) {
      log.error({ err }, "Unexpected error when processing a Queue Entry");
    }
    await new Promise((resolve) => setTimeout(resolve, didProcess ? 10 : 1000));
  }
}
