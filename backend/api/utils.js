const log = require("skog");
const canvas = require("./canvasApiClient");

async function checkAuthorization(req, res, next) {
  const { id: courseId } = req.params;
  const { userId } = req.session;

  if (courseId && userId) {
    const { roles, authorized } = await canvas.getAuthorizationData(
      courseId,
      userId
    );

    if (authorized) {
      log.debug(`Authorized. User ${userId} in Course ${courseId}.`);

      return next();
    }

    log.warn(
      `Not authorized. User ${userId} in Course ${courseId} has roles: [${roles}].`
    );

    return res.status(401).send({
      message: "Unauthorized: you must be teacher or examiner to use this app",
    });
  }

  return res.status(400).send({
    message: "No courseId provided or no session available",
  });
}

function handleUnexpectedError(err, req, res, next) {
  log.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).send({
    message: "Unexpected error. Please contact IT support",
  });
}

module.exports = {
  checkAuthorization,
  handleUnexpectedError,
};
