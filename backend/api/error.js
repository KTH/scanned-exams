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

/* ************************************************

OTHER POSSIBLE GENERAL ERROR TYPES

Using typed errors makes it easy to search for them and allows
piping and other techniques to separate code that handles them.

//  These errors should be thrown by the service api client:

class EndpointAuthError extends Error {
  // Auth issues with service
}

class EndpointNetworkError extends Error {
  // Network issues connecting to service
}

//  This could be handled by the service api client or the endpoint

class EndpointValueError extends Error {
  // Wrongs or invalid params sent
}

// This is handled globally for all endpoints

class EndpointUnhandledError extends Error {
  // Errors that aren't handled by above
}

*/
