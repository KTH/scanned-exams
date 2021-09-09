const log = require("skog");
const canvas = require("./canvasApiClient");
const tentaApi = require("./tentaApiClient");

module.exports = async function importOneExam({ fileId, courseId }) {
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
};
