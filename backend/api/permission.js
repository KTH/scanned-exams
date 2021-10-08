const log = require("skog");
const canvas = require("./externalApis/canvasApiClient");
const { AuthError } = require("./error");

async function checkPermissions(courseId, userId) {
  const roles = await canvas.getRoles(courseId, userId).catch((err) => {
    throw new AuthError({
      type: "permission_denied",
      message: err.message,
    });
  });

  const TEACHER_ROLE = 4;
  const EXAMINER_ROLE = 10;

  if (!roles.includes(TEACHER_ROLE) && !roles.includes(EXAMINER_ROLE)) {
    throw new AuthError({
      type: "permission_denied",
      message: "You must be a teacher or examiner to use this app",
      details: {
        roles,
      },
    });
  }
}

async function checkPermissionsMiddleware(req, res, next) {
  const { id: courseId } = req.params;
  const { userId } = req.session;

  if (!courseId || courseId === "undefined") {
    const err = new AuthError({
      type: "permission_denied",
      message:
        "Missing course ID is required to determine permissions (not found in params)",
    });
    return next(err);
  }

  if (!userId) {
    const err = new AuthError({
      type: "permission_denied",
      message:
        "Missing user ID is required to determine permissions (not found in session)",
    });
    return next(err);
  }

  await checkPermissions(courseId, userId).catch(next);

  log.debug(`Authorized. User ${userId} in course ${courseId}`);

  return next();
}

module.exports = {
  checkPermissions,
  checkPermissionsMiddleware,
};
