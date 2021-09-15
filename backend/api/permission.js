const log = require("skog");
const canvas = require("./canvasApiClient");
const { EndpointError } = require("./error");

async function checkPermissions(courseId, userId) {
  const roles = await canvas.getRoles(courseId, userId);
  const TEACHER_ROLE = 4;
  const EXAMINER_ROLE = 10;

  if (roles.includes(TEACHER_ROLE) || roles.includes(EXAMINER_ROLE)) {
    return;
  }

  throw new EndpointError({
    type: "permission_denied",
    statusCode: 401,
    message: "You must be a teacher or examiner to use this app",
    details: {
      userRoles: roles,
    },
  });
}

async function checkPermissionsMiddleware(req, res, next) {
  const { id: courseId } = req.params;
  const { userId } = req.session;

  await checkPermissions(courseId, userId).catch(next);

  log.debug(`Authorized. User ${userId} in course ${courseId}`);

  next();
}

module.exports = {
  checkPermissions,
  checkPermissionsMiddleware,
};
