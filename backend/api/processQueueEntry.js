const log = require("skog").default;
const canvas = require("./canvasApiClient");
const tentaApi = require("./tentaApiClient");
const {
  getFirstPendingFromQueue,
  updateStatusOfEntryInQueue,
} = require("./importQueue");
const { ImportError } = require("./error");

const { DEV_FORCE_RANDOM_ERRORS, NODE_ENV } = process.env;
const FORCE_RANDOM_ERRORS = DEV_FORCE_RANDOM_ERRORS === "TRUE";
const IS_DEV = NODE_ENV !== "production";

/**
 * Students that don't exist in UG get a fake personnummer
 * in windream and they need to be graded manually
 */
function throwIfStudentNotInUg({ fileId, studentPersNr }) {
  if (studentPersNr.replace(/-/g, "") === "121212121212") {
    throw new ImportError({
      type: "not_in_ug",
      message: `The student does not have a Canvas account. Please contact IT-support (windream fileId: ${fileId})`,
    });
  }
}

async function uploadOneExam({ fileId, courseId }) {
  log.debug(`Course ${courseId} / File ${fileId}. Downloading`);
  const { content, studentKthId, studentPersNr, examDate } =
    await tentaApi.downloadExam(fileId);

  // Some business rules
  throwIfStudentNotInUg({ fileId, studentPersNr });

  log.debug(
    `Course ${courseId} / File ${fileId} / User ${studentKthId}. Uploading`
  );
  const uploadExamStart = Date.now();
  await canvas.uploadExam(content, {
    courseId,
    studentKthId,
    examDate,
    fileId,
  });
  log.debug("Time to upload exam: " + (Date.now() - uploadExamStart) + "ms");

  log.info(
    `Course ${courseId} / File ${fileId} / User ${studentKthId}. Uploaded!`
  );
}

function handleUploadErrors(err, exam) {
  if (err instanceof ImportError) {
    if (err.type === "import_error") {
      // This is a general error which means we don't know
      // how to fix it from code.
      log.error(
        "Unhandled Canvas Error - we failed uploading exam " +
          exam.fileId +
          ` (${err.type || err.name} | ${err.message})`
      );
    }
    // ImportErrors already have a good error message
    // so we just throw them as is
    throw err;
  } else {
    // This error was probably caused by our code
    log.error(
      { err },
      "Unhandled Import Error - we failed uploading exam " +
        exam.fileId +
        ` (${err.message})`
    );

    // We need to create a user friendly error message that is stored in the
    // import queue
    throw new ImportError({
      type: "other_error",
      message: `We encountered an unhandled error when importing exam (windream fileId: ${exam.fileId})`,
      details: {
        err,
        exam,
      },
    });
  }
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
