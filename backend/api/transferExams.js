const log = require("skog");
const tentaApi = require("./tentaApiClient");
const canvas = require("./canvasApiClient");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const maskFile = require("./maskFile");

module.exports = async function transferExams(session) {
  if (session.state !== "idle") {
    return;
  }

  try {
    session.state = "predownloading";
    log.info("predownloading...");
    const list = await tentaApi.examList(session.examination);

    session.state = "downloading";
    const dirName = await fs.mkdtemp(os.tmpdir());
    const unmaskedDir = path.resolve(dirName, "unmasked");
    const maskedDir = path.resolve(dirName, "masked");

    log.info(`Created directory ${dirName}`);
    fs.mkdir(unmaskedDir, { recursive: true });
    fs.mkdir(maskedDir, { recursive: true });

    for (const { userId, fileId } of list) {
      await tentaApi.downloadExam(
        fileId,
        path.resolve(unmaskedDir, `${userId}.pdf`)
      );
    }
    log.info("Finished downloading exams");

    session.state = "postdownloading";
    log.info("Starting pnr-masking");

    for (const { userId } of list) {
      await maskFile(
        path.resolve(unmaskedDir, `${userId}.pdf`),
        path.resolve(maskedDir, `${userId}.pdf`)
      );
    }
    session.state = "preuploading";
    log.info("Checking if assignment is published");
    const assignment = await canvas.getValidAssignment(session.courseId);

    if (assignment) {
      // TODO: check that assignment.integration_data == session.examination
      const alreadyPublished = assignment.published;

      if (!alreadyPublished) {
        log.info("Assignment was not published. Publishing now");
        await canvas.publishAssignment(session.courseId, assignment.id);
      }

      session.state = "uploading";

      // TODO: upload exams to the published assignment
      for (const { userId } of list) {
        log.info(`Uploading exam for ${userId}`);
        await canvas.uploadExam(
          path.resolve(maskedDir, `${userId}.pdf`),
          session.courseId,
          assignment.id,
          userId
        );
      }
    }

    session.state = "success";
  } catch (err) {
    log.error({ err });
    session.error = {
      message: err.message,
      code: err.code,
      name: err.name,
    };
    session.state = "error";
  }
};
