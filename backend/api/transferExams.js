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
