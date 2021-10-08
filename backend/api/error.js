const log = require("skog");

/* eslint max-classes-per-file: */

/**
 * Common ancestor of all operational errors allowing
 * for more catch all checks.
 */
class OperationalError extends Error {
  constructor(name, statusCode, type, message, details, err) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.err = err;
  }
}

/**
 * Error for recoverable programmer errors.
 * These are errors that don't require us to crash the app.
 */
class RecoverableError extends Error {
  constructor({ message = "We encountered an error in our code.", err }) {
    super(message);
    this.name = "RecoverableError";
    this.err = err;
  }
}

/**
 * AuthError should be handled by the frontend
 * api client.
 */
class AuthError extends OperationalError {
  constructor({ type, message, details, err }) {
    super("AuthError", 401, type, message, details, err);
  }
}

/**
 * All errors of type EndpointError must be
 * handled by the frontend code that calls the
 * actual endpoint.
 */
class EndpointError extends OperationalError {
  // Errors that must be handled by frontend
  constructor({ type, statusCode, message, details, err }) {
    super("EndpointError", statusCode, type, message, details, err);
  }
}

/**
 * AuthError should be handled by the frontend
 * api client.
 */
class LadokApiError extends OperationalError {
  constructor({ type, message, details, err }) {
    super("LadokApiError", 503, type, message, details, err);
  }
}

/**
 * All errors of type "ImportError" are known problems that happened when
 * importing an exam to Canvas
 */
class ImportError extends OperationalError {
  constructor({ type, message, details, err }) {
    super("ImportError", 503, type, message, details, err);
  }
}

function errorHandler(err, req, res, next) {
  if (err?.name === "EndpointError") {
    log.info(err);
  } else if (err?.name === "AuthError") {
    log.warn(err);
  } else if (err.err) {
    // If we have included an .err object it should always be logged
    // because it is a serious error that needs to be fixed.
    log.error(
      err.err,
      `(${err.name}${err.type ? "/" + err.type : ""}) ${err.message}`
    );
  } else {
    log.error(err);
  }

  // Add error details if provided for debugging
  if (err.details) {
    log.debug(err.details);
  }

  if (res.headersSent) {
    return next(err);
  }

  const error = {
    type: err.type || "error",
    message:
      err.message || "An unknown error occured. Please contact IT-support.",
    statusCode: err.statusCode,
  };

  return res.status(err.statusCode !== undefined ? err.statusCode : 500).send({
    error,
  });
}

module.exports = {
  errorHandler,
  OperationalError,
  RecoverableError,
  AuthError,
  EndpointError,
  ImportError,
  LadokApiError,
};
