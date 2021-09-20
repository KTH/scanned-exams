const log = require("skog");
const canvas = require("./canvasApiClient");
const tentaApi = require("./tentaApiClient");
const {
  getFirstPendingFromQueue,
  updateStatusOfEntryInQueue,
} = require("./importQueue");

const { DEV_FORCE_RANDOM_ERRORS, NODE_ENV } = process.env;
const FORCE_RANDOM_ERRORS = DEV_FORCE_RANDOM_ERRORS === "TRUE";
const IS_DEV = NODE_ENV !== "production";

async function uploadOneExam({ fileId, courseId }) {
  log.info(`Course ${courseId} / File ${fileId}. Downloading`);
  const { content, studentKthId, examDate } = await tentaApi.downloadExam(
    fileId
  );

  log.info(
    `Course ${courseId} / File ${fileId} / User ${studentKthId}. Uploading`
  );
  const uploadExamStart = Date.now();
  await canvas.uploadExam(content, {
    courseId,
    studentKthId,
    examDate,
  });
  log.info("Time to upload exam: " + (Date.now() - uploadExamStart) + "ms");

  log.info(
    `Course ${courseId} / File ${fileId} / User ${studentKthId}. Uploaded!`
  );
}

module.exports = async function processQueueEntry() {
  const examToBeImported = await getFirstPendingFromQueue();

  if (examToBeImported) {
    try {
      // Force errors during development
      if (IS_DEV && FORCE_RANDOM_ERRORS) {
        if (Math.random() > 0.8)
          throw Error("Forced error for testing during development");
      }

      // Normal
      await uploadOneExam({
        fileId: examToBeImported.fileId,
        courseId: examToBeImported.courseId,
      });
      await updateStatusOfEntryInQueue(examToBeImported, "imported");
      if (IS_DEV) log.info("Imported file " + examToBeImported.fileId);
    } catch (err) {
      await updateStatusOfEntryInQueue(examToBeImported, "error", {
        type: "import_error",
        message: err.message,
      });
      if (IS_DEV)
        log.info(
          "Error importing file " +
            examToBeImported.fileId +
            ` (${err.message})`
        );
    }
  }
};
