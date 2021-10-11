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
  const { id } = req.params;
  try {
    const { summary } = await listAllExams(id).catch(listExamErrorHandler);

    return res.send({
      ...summary,
    });
  } catch (err) {
    if (isOperationalOrRecoverableError(err)) return next(err);

    // Convert other errors to EndpointError

    // Unhandled errors should crash application in accordance with Node.js best practice:
    // https://www.joyent.com/node-js/production/design/errors
    const bestPractice = true;
    if (bestPractice) {
      throw err;
    } else {
      return next(new RecoverableError({ err }));
    }
  }
};
