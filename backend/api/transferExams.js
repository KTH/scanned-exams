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

    for (const { userId, examId } of list) {
      await tentaApi.downloadExam(
        examId,
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
