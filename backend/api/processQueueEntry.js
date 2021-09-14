const log = require("skog");
const canvas = require("./canvasApiClient");
const tentaApi = require("./tentaApiClient");
const {
  getFirstPendingFromQueue,
  updateStatusOfEntryInQueue,
} = require("./importQueue");

async function uploadOneExam({ fileId, courseId }) {
  log.info(`Course ${courseId} / File ${fileId}. Downloading`);
  const { content, studentKthId, examDate } = await tentaApi.downloadExam(
    fileId
  );

  log.info(
    `Course ${courseId} / File ${fileId} / User ${studentKthId}. Uploading`
  );
  await canvas.uploadExam(content, {
    courseId,
    studentKthId,
    examDate,
  });

  log.info(
    `Course ${courseId} / File ${fileId} / User ${studentKthId}. Uploaded!`
  );
}

module.exports = async function processQueueEntry() {
  const examToBeImported = await getFirstPendingFromQueue();

  if (examToBeImported) {
    try {
      await uploadOneExam({
        fileId: examToBeImported.fileId,
        courseId: examToBeImported.courseId,
      });
      await updateStatusOfEntryInQueue(examToBeImported, "success");
    } catch (err) {
      await updateStatusOfEntryInQueue(examToBeImported, "error", {
        type: "import_error",
        message: "Something wrong happened",
      });
    }
  }
};
