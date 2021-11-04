const {
  isOperationalOrRecoverableError,
  EndpointError,
  OperationalError,
  LadokApiError,
  TentaApiError,
  ImportError,
  RecoverableError,
} = require("../error");
const { listAllExams } = require("./utils/listAllExams");

/**
 * All EndpointErrors in this file ARE REQUIRED to be handled by
 * the calling frontend component.
 */

function listExamErrorHandler(err) {
  if (err instanceof RecoverableError) {
    throw new EndpointError({
      type: "unhandled_programmer_error",
      message:
        "We encountered a known error when trying to get the import queue status. Contact support if the problem persists.",
      statusCode: 500,
      err,
    });
  }

  if (err instanceof OperationalError) {
    const { type, message, statusCode } = err;
    if (err instanceof LadokApiError) {
      /* LadokApiError */
      switch (type) {
        case "invalid_activity":
          throw new EndpointError({
            type: "invalid_activity",
            message,
            statusCode,
            err,
          });
        default:
          throw new EndpointError({
            type: "ladok_api_error",
            message,
            statusCode,
            err,
          });
      }
    } else if (err instanceof TentaApiError) {
      /* TentaApiError */
      throw new EndpointError({
        type: "tenta_api_error",
        message,
        statusCode,
        err,
      });
    } else if (err instanceof ImportError) {
      /* ImportError */
      throw new EndpointError({
        type: "import_error",
        message,
        statusCode,
        err,
      });
    }

    throw new EndpointError({
      type: "unhandled_api_error",
      message,
      statusCode: 503,
      err,
    });
  }

  // Unhandled errors (this should be an anomally)
  Error.captureStackTrace(err, listExamErrorHandler);
  throw new EndpointError({
    type: "unhandled_error",
    message:
      "We encountered an unknown error when trying to get the import queue status. This will be investigated.",
    statusCode: 500,
    err,
  });
}

module.exports = async function getCourseImportStatus(req, res, next) {
  const { courseId } = req.params;
  try {
    const { summary } = await listAllExams(courseId).catch(
      listExamErrorHandler
    );
    const { pending } = summary;

    return res.send({
      status: pending > 0 ? "working" : "idle",
      stats: {
        ...summary,
      },
    });
  } catch (err) {
    if (isOperationalOrRecoverableError(err)) return next(err);

    // Convert other errors to EndpointError
    /* ... */

    // The errors we are left with are wrapped in RecoverableError
    // to show error middleware that it is considered to be handled
    // and allowing us to pass useful error messages to the user
    return next(new RecoverableError({ err }));
  }
};
