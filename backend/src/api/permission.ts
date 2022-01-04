import log from "skog";
import * as canvasApi from "./externalApis/canvasApiClient";
import { AuthError, CanvasApiError } from "./error";

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

  const roles = await canvasApi.getRoles(courseId, userId).catch((err) => {
    throw new CanvasApiError({
      type: "unhandled_error",
      statusCode: 503,
      message: "Could not get roles from Canvas API",
      err,
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

function checkPermissionsMiddleware(req, res, next) {
  checkPermissions(req.params.id, req.session.userId)
    .then(() => {
      next();
    })
    .catch(next);
}

export {
  checkPermissions,
  checkPermissionsMiddleware,
};
