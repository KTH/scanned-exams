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
  log.debug(`Course ${courseId} / File ${fileId}. Downloading`);
  const { content, studentKthId, examDate } = await tentaApi.downloadExam(
    fileId
  );

  log.debug(
    `Course ${courseId} / File ${fileId} / User ${studentKthId}. Uploading`
  );
  const uploadExamStart = Date.now();
  await canvas.uploadExam(content, {
    courseId,
    studentKthId,
    examDate,
  });
  log.debug("Time to upload exam: " + (Date.now() - uploadExamStart) + "ms");

  log.info(
    `Course ${courseId} / File ${fileId} / User ${studentKthId}. Uploaded!`
  );
}

function handleUploadErrors(err, exam) {
  // Logging an error so we can improve handling of various
  // failure modes that occur in canvas
  log.error(
    "Unhandled Import Error - we failed uploading exam " +
      exam.fileId +
      ` (${err.type || err.name} | ${err.message})`
  );
}

/**
 * Find and process an entry from the global import queue and exit
 * @returns {bool} return true is entry was processed and false if queue was empty
 */
module.exports = async function processQueueEntry() {
  const examToBeImported = await getFirstPendingFromQueue();

  if (examToBeImported) {
    try {
      // Force errors during development
      if (IS_DEV && FORCE_RANDOM_ERRORS) {
        if (Math.random() > 0.8)
          throw Error("Forced error for testing during development");
      }

      // Upload to Canvas
      await uploadOneExam({
        fileId: examToBeImported.fileId,
        courseId: examToBeImported.courseId,
      }).catch((err) => {
        handleUploadErrors(err, examToBeImported);
        throw err;
      });

      // Update status in import queue
      await updateStatusOfEntryInQueue(examToBeImported, "imported");

      if (IS_DEV) log.debug("Imported file " + examToBeImported.fileId);
    } catch (err) {
      // TODO: Improve handling of errors, at least adding a more user
      // friendly message
      await updateStatusOfEntryInQueue(examToBeImported, "error", {
        type: err.type || err.name,
        message: err.message,
        details: err.details || {},
      });
    }
  }

  return !!examToBeImported;
};
