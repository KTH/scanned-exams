import log from "skog";
import { AuthError, CanvasApiError } from "./error";
import CanvasUserApiClient from "./externalApis/canvasUserApiClient";

async function checkPermissions(courseId, { accessToken, userId }) {
  if (!courseId || courseId === "undefined") {
    throw new AuthError({
      type: "permission_denied",
      message:
        "Missing course ID is required to determine permissions (not found in params)",
    });
  }

  if (!accessToken) {
    throw new AuthError({
      type: "permission_denied",
      message:
        "Missing access token, it is required to determine permissions (not found in session)",
    });
  }
  const canvasApi = new CanvasUserApiClient(accessToken);
  const roles = await canvasApi.getRoles(courseId).catch((err) => {
    throw new CanvasApiError({
      type: "unhandled_error",
      statusCode: 503,
      message: "Could not get roles from Canvas API",
      err,
    });
  });

  const TEACHER_ROLE = 4;
  const EXAMINER_ROLE = 10;
  const COURSE_RESPONSIBLE_ROLE = 9;

  if (!roles.includes(TEACHER_ROLE) && !roles.includes(EXAMINER_ROLE) && !roles.includes(COURSE_RESPONSIBLE_ROLE)) {
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

function checkPermissionsMiddleware(req, res, next) {
  checkPermissions(req.params.id, {
    accessToken: req.session.accessToken,
    userId: req.session.userId,
  })
    .then(() => {
      next();
    })
    .catch(next);
}

export { checkPermissions, checkPermissionsMiddleware };
