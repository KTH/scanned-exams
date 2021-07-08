const log = require("skog");
const fs = require("fs");
const os = require("os");
const path = require("path");
const canvas = require("./canvasApiClient");
const tentaApi = require("./tentaApiClient");
const maskFile = require("./maskFile");
const { getAktivitetstillfalle } = require("./ladokApiClient");

// Key for `allStatus` is course ID
const allStatus = new Map();

// TODO: To allow "cross-listed" courses, replace this argument (courseId) with
//       Ladok AktivitetstillfalleUID
function getStatus(courseId) {
  return (
    allStatus.get(courseId) || {
      state: "idle",
    }
  );
}

async function importOneExam(
  fileId,
  { userId, courseId, assignmentId, examDate }
) {
  const tempDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "scanned-exams", fileId)
  );
  const unmaskedFile = path.resolve(tempDir, "unmasked.pdf");
  const maskedFile = path.resolve(tempDir, "masked.pdf");
  const startDate = new Date();

  log.info(`Student ${userId}. Downloading`);
  await tentaApi.downloadExam(fileId, unmaskedFile);
  const downloadEnd = new Date();

  await maskFile(unmaskedFile, maskedFile);
  const maskEnd = new Date();

  log.info(`Student ${userId}. Uploading`);
  await canvas.uploadExam(maskedFile, {
    courseId,
    assignmentId,
    userId,
    examDate,
  });
  const uploadEnd = new Date();

  log.info(`Student ${userId}. Finish importing exam`, {
    download_time: downloadEnd.getTime() - startDate.getTime(),
    masking_time: maskEnd.getTime() - downloadEnd.getTime(),
    upload_time: uploadEnd.getTime() - maskEnd.getTime(),
    total_time: uploadEnd.getTime() - startDate.getTime(),
  });
}

async function transferExams(courseId) {
  if (!allStatus.has(courseId)) {
    allStatus.set(courseId, { state: "idle" });
  }
  const currentStatus = getStatus(courseId);

  if (
    currentStatus.state !== "idle" &&
    currentStatus.state !== "success" &&
    currentStatus.state !== "error"
  ) {
    return;
  }

  try {
    currentStatus.state = "predownloading";
    log.info("predownloading...");
    const ladokId = await canvas.getExaminationLadokId(courseId);
    const { activities, examDate } = await getAktivitetstillfalle(ladokId);
    const examList = [];

    for (const activity of activities) {
      // eslint-disable-next-line no-await-in-loop
      const list = await tentaApi.examList({
        courseCode: activity.courseCode,
        examCode: activity.examCode,
        examDate,
      });

      examList.push(...list);
    }

    log.info("Checking if assignment is published");

    const assignment = await canvas.getValidAssignment(courseId, ladokId);

    if (!assignment) {
      return;
    }

    // TODO: check that assignment.integration_data == session.examination
    await canvas.unlockAssignment(courseId, assignment.id);
    currentStatus.state = "uploading";

    for (const { userId, fileId } of examList) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const hasSubmission = await canvas.hasSubmission({
          courseId,
          assignmentId: assignment.id,
          userId,
        });

        if (!hasSubmission) {
          // eslint-disable-next-line no-await-in-loop
          await importOneExam(fileId, {
            userId,
            courseId,
            assignmentId: assignment.id,
            examDate,
          });
        } else {
          log.info(`User ${userId} has already a submission. Skipping`);
        }
      } catch (err) {
        log.error({ err }, `Cannot import exam for student ${userId} `);
      }
    }

    await canvas.lockAssignment(courseId, assignment.id);
    log.info("😺 Finished uploading exams");

    currentStatus.state = "success";
  } catch (err) {
    log.error({ err });

    currentStatus.error = {
      message: err.message,
      code: err.code,
      name: err.name,
    };
    currentStatus.state = "error";
  }
}

module.exports = {
  getStatus,
  transferExams,
};
