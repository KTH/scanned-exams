/* eslint-disable no-await-in-loop */
import log from "skog";
import { processQueueEntry } from "./api/importQueue/processQueueEntry";

export async function startBackgroundImport() {
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
