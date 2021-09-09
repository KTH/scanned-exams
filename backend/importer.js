/** Worker that import exams that are pending in the queue */
const importOneExam = require("./api/importOneExam");
const importQueue = require("./api/importQueue");

async function processOneExam() {
  const examToImport = importQueue.takeFirst();

  if (examToImport?.fileId) {
    try {
      // TODO: get the actual values
      await importOneExam({
        fileId: examToImport.fileId,
        courseId: examToImport.courseId,
        userId: 0,
        assignmentId: 0,
        examDate: 0,
      });
      await importQueue.markAsImported(examToImport.fileId);
    } catch (err) {
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
  }
}

module.exports = {
  start,
  processOneExam,
};
