/* eslint-disable no-await-in-loop */
import log from "skog";
import { processQueueEntry } from "./api/importQueue/processQueueEntry";
import { listAllCollections } from "./api/importQueue/
export async function startBackgroundImport() {
  log.info("Start background import");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let didProcess;

    try {
      // TODO: how should this be handled? This should handle all courses in parallell...
      // one way would be to list all collections with a name standand, and process them all in parallell. But this would grow each time the app is used, and the collections are not removed. Can they be removed without input to the user is lost?
      // I could perhaps just use ttl on the documents, to a month?
     const collections = await listAllCollections();
     Promise.all(collections.map((c)=> processQueueEntry(c.name)));

    } catch (err) {
      log.error({ err }, "Unexpected error when processing a Queue Entry");
    }
    await new Promise((resolve) => setTimeout(resolve, didProcess ? 10 : 1000));
  }
}
