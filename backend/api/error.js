const log = require("skog");

/* eslint max-classes-per-file: */

/**
 * All errors of type EndpointSpecificError must be
 * handled by the frontend code that calls the
 * actual endpoint.
 */
class EndpointSpecificError extends Error {
  // Errors that must be handled by frontend
  constructor({ type, statusCode, message, details }) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  log.error(err);

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
  EndpointSpecificError,
};
