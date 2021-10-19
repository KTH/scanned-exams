const log = require("skog");
const canvas = require("./externalApis/canvasApiClient");
const { AuthError } = require("./error");

async function checkPermissions(courseId, userId) {
  if (!courseId || courseId === "undefined") {
    throw new AuthError({
      type: "permission_denied",
      message:
        "Missing course ID is required to determine permissions (not found in params)",
    });
  }

  if (!userId) {
    throw new AuthError({
      type: "permission_denied",
      message:
        "Missing user ID is required to determine permissions (not found in session)",
    });
  }

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

  log.debug(`Authorized. User ${userId} in course ${courseId}`);
}

module.exports = {
  checkPermissions,
};
