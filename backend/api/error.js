const log = require("skog").default;

/* eslint max-classes-per-file: */

/**
 * AuthError should be handled by the frontend
 * api client.
 */
class AuthError extends Error {
  constructor({ type, message, details }) {
    super(message);
    this.name = "AuthError";
    this.type = type;
    this.statusCode = 401;
    this.details = details;
  }
}

/**
 * All errors of type EndpointError must be
 * handled by the frontend code that calls the
 * actual endpoint.
 */
class EndpointError extends Error {
  // Errors that must be handled by frontend
  constructor({ type, statusCode, message, details }) {
    super(message);
    this.name = "EndpointError";
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * All errors of type "ImportError" are known problems that happened when
 * importing an exam to Canvas
 */
class ImportError extends Error {
  constructor({ type, message, details }) {
    super(message);
    this.name = "ImportError";
    this.type = type;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  if (err?.name === "EndpointError") {
    log.info(err);
  } else if (err?.name === "AuthError") {
    log.warn(err);
  } else {
    log.error(err);
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
  AuthError,
  EndpointError,
  ImportError,
};
