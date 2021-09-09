/** Worker that import exams that are pending in the queue */
const log = require("skog");
const importOneExam = require("./api/importOneExam");
const importQueue = require("./api/importQueue");

async function processOneExam() {
  const examToImport = await importQueue.getFirstPending();

  if (examToImport?.fileId) {
    log.info(`Starting import for file ${examToImport.fileId}`);
    try {
      await importOneExam({
        fileId: examToImport.fileId,
        courseId: examToImport.courseId,
      });
      log.info(`Finishing import for file ${examToImport.fileId}`);

      await importQueue.markAsImported(examToImport.fileId);
    } catch (err) {
      log.error(err, `Error when importing ${examToImport.fileId}`);
      // TODO: What to do if "markAsImported" has failed?
      await importQueue.markAsError(examToImport.fileId, {
        type: "TODO",
        message: err.message,
      });
    }
  }
}

async function start() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    await processOneExam();
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

module.exports = {
  start,
  processOneExam,
};
