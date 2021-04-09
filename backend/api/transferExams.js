const log = require("skog");
const tentaApi = require("./tentaApiClient");
const canvas = require("./canvasApiClient");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

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
    log.info(`Created directory ${dirName}`);

    for (const { userId, fileId } of list) {
      await tentaApi.downloadExam(
        fileId,
        path.resolve(dirName, `${userId}.pdf`)
      );
    }

    // TODO: mask personnummer

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
