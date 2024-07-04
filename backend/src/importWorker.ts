/* eslint-disable no-await-in-loop */
import log from "skog";
import {
  processQueueEntry,
  processOneEntryPerExamRoom,
} from "./api/importQueue/processQueueEntry";

export async function startBackgroundImport() {
  log.info("Start background import");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let didProcessOne, didProcessMultiple;

    try {
      // Process one entry per exam room in the queue, by the logged in user
      // TODO
      didProcessMultiple = await processOneEntryPerExamRoom();
      // Process one entry from the queue, by the admin user
      // This is needed because the access tokens for each user might expire. This first call makes sure that
      // exam rooms with many exams are processed eventually.
      didProcessOne = await processQueueEntry();
    } catch (err) {
      log.error({ err }, "Unexpected error when processing a Queue Entry");
    }
    await new Promise((resolve) =>
      setTimeout(resolve, didProcessOne ? 10 : 1000)
    );
  }
}
