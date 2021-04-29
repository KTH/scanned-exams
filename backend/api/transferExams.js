const log = require("skog");
const tentaApi = require("./tentaApiClient");
const canvas = require("./canvasApiClient");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
// const maskFile = require("./maskFile");

module.exports = async function transferExams(session) {
  if (session.state !== "idle") {
    return;
  }

  function saveSession() {
    return new Promise((resolve, reject) => {
      session.save((err) => {
        if (err) {
          reject({
            name: "SessionError",
            message: err.message,
          });
        }

        resolve();
      });
    });
  }

  try {
    session.state = "predownloading";
    await saveSession();
    log.info("predownloading...");
    const { activities, examDate } = await tentaApi.getExamination(
      session.ladokId
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

    session.state = "downloading";
    await saveSession();
    const dirName = await fs.mkdtemp(path.join(os.tmpdir(), "scanned-exams"));
    const unmaskedDir = path.resolve(dirName, "unmasked");
    // const maskedDir = path.resolve(dirName, "masked");

    log.info(`Created directory ${dirName}`);
    fs.mkdir(unmaskedDir, { recursive: true });
    // fs.mkdir(maskedDir, { recursive: true });

    for (const { userId, fileId } of examList) {
      await tentaApi.downloadExam(
        fileId,
        path.resolve(unmaskedDir, `${userId}.pdf`)
      );
    }
    log.info("Finished downloading exams");

    session.state = "postdownloading";
    await saveSession();
    log.info("Starting pnr-masking");

    // for (const { userId } of list) {
    //   await maskFile(
    //     path.resolve(unmaskedDir, `${userId}.pdf`),
    //     path.resolve(maskedDir, `${userId}.pdf`)
    //   );
    // }
    session.state = "preuploading";
    await saveSession();
    log.info("Checking if assignment is published");
    const assignment = await canvas.getValidAssignment(session.courseId);

    if (assignment) {
      // TODO: check that assignment.integration_data == session.examination
      // TODO: publish the exam room if is unpublished
      const alreadyPublished = assignment.published;

      if (!alreadyPublished) {
        log.info("Assignment was not published. Publishing now");
        await canvas.publishAssignment(session.courseId, assignment.id);
      }

      session.state = "uploading";
      await saveSession();

      // TODO: upload exams to the published assignment
      for (const { userId } of examList) {
        log.info(`Uploading exam for ${userId}`);
        await canvas.uploadExam(
          path.resolve(unmaskedDir, `${userId}.pdf`),
          // path.resolve(maskedDir, `${userId}.pdf`),
          session.courseId,
          assignment.id,
          userId
        );
      }
    }

    session.state = "success";
    await saveSession();
  } catch (err) {
    log.error({ err });

    if (err.name !== "SessionError") {
      session.error = {
        message: err.message,
        code: err.code,
        name: err.name,
      };
      session.state = "error";
      await saveSession();
    }
  }
};
