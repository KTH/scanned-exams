const log = require("skog");
const tentaApi = require("./tentaApiClient");
const canvas = require("./canvasApiClient");
const fs = require("fs");
const os = require("os");
const path = require("path");
const maskFile = require("./maskFile");

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
    const { activities, examDate } = await tentaApi.getAktivitetstillfalle(
      ladokId
    );
    const examList = [];

    for (const activity of activities) {
      const list = await tentaApi.examList({
        courseCode: activity.courseCode,
        examCode: activity.examCode,
        examDate,
      });

      examList.push(...list);
    }

    currentStatus.state = "downloading";
    const dirName = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "scanned-exams")
    );
    const unmaskedDir = path.resolve(dirName, "unmasked");
    const maskedDir = path.resolve(dirName, "masked");

    log.info(`Created directory ${dirName}`);
    await fs.promises.mkdir(unmaskedDir, { recursive: true });
    await fs.promises.mkdir(maskedDir, { recursive: true });

    for (const { userId, fileId } of examList) {
      let startDate = new Date();
      log.info(`Started downloading ${fileId} at ${startDate}`);
      await tentaApi.downloadExam(
        fileId,
        path.resolve(unmaskedDir, `${userId}.pdf`)
      );
      const endDate = new Date();
      log.info(
        `Finished downloading ${fileId} ended at ${endDate} and took ${Math.abs(
          (startDate.getTime() - endDate.getTime()) / 1000
        )} seconds`
      );
    }
    log.info("Finished downloading exams");

    currentStatus.state = "postdownloading";
    log.info("Starting pnr-masking");

    for (const { userId } of examList) {
      await maskFile(
        path.resolve(unmaskedDir, `${userId}.pdf`),
        path.resolve(maskedDir, `${userId}.pdf`)
      );
    }
    currentStatus.state = "preuploading";

    log.info("Checking if assignment is published");
    const assignment = await canvas.getValidAssignment(courseId, ladokId);

    if (assignment) {
      // TODO: check that assignment.integration_data == session.examination
      await canvas.unlockAssignment(courseId, assignment.id);
      currentStatus.state = "uploading";

      for (const { userId } of examList) {
        try {
          const hasSubmission = await canvas.hasSubmission({
            courseId,
            assignmentId: assignment.id,
            userId,
          });

          if (hasSubmission) {
            log.info(`User ${userId} has already a submission. Skipping`);
          } else {
            log.info(`Uploading exam for ${userId}`);
            await canvas.uploadExam(path.resolve(maskedDir, `${userId}.pdf`), {
              courseId,
              assignmentId: assignment.id,
              userId,
              examDate,
            });
          }
        } catch (err) {
          log.error({ err }, `Cannot upload exam for student ${userId} `);
        }
      }

      await fs.promises.rmdir(dirName, { force: true, recursive: true });
      await canvas.lockAssignment(courseId, assignment.id);
    }

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
