const log = require("skog");

/* eslint max-classes-per-file: */

class OperationalError extends Error {
  /**
   * Common ancestor of all operational errors allowing
   * for more catch all checks.
   * @param {object} param0 Error params
   * @param {String} param0.name Error name
   * @param {String} param0.type Subtype of error
   * @param {Number} param0.statusCode HTTP status code of response
   * @param {String} param0.message Human readable error message for display in frontend
   * @param {object} param0.details Additional error details for used by programmer
   * @param {Error} param0.err The original error that caused this error
   */
  constructor(name, statusCode, type, message, details, err) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.err = err;
  }
}

class RecoverableError extends Error {
  /**
   * Error for recoverable programmer errors. These are errors that don't require us to crash the app,
   * but unexpected. It can be thrown at any layer of the application. If it is caught in an
   * endpoint handler you should wrap it in an EndpointError with a user friendly message. If it is
   * thrown by an endpoint handler it is a bug that should be fixed.
   * @param {object} param0 Error params
   * @param {String} param0.message Human readable error message for display in frontend
   * @param {Error} param0.err The original error that caused this error
   */
  constructor({ message = "We encountered an error in our code.", err }) {
    super(message);
    this.name = "RecoverableError";
    this.err = err;
  }
}

class AuthError extends OperationalError {
  /**
   * Authentication error that should be handled by the frontend
   * api client.
   * @param {object} param0 Error params
   * @param {String} param0.type Subtype of error
   * @param {String} param0.message Human readable error message for display in frontend
   * @param {object} param0.details Additional error details for used by programmer
   * @param {Error} param0.err The original error that caused this error
   */
  constructor({ type, message, details, err }) {
    super("AuthError", 401, type, message, details, err);
  }
}

class EndpointError extends OperationalError {
  /**
   * All errors of type EndpointError must be
   * handled by the frontend code that calls the
   * actual endpoint.
   * @param {object} param0 Error params
   * @param {String} param0.type Subtype of error
   * @param {Number} param0.statusCode HTTP status code of response
   * @param {String} param0.message Human readable error message for display in frontend
   * @param {object} param0.details Additional error details for used by programmer
   * @param {Error} param0.err The original error that caused this error
   */
  constructor({ type, statusCode, message, details, err }) {
    super("EndpointError", statusCode, type, message, details, err);
  }
}

class LadokApiError extends OperationalError {
  /**
   * LadokApiError – all errors that can occur when accessing the external system. This should be
   * thrown at the LadokApi-integration layer.
   * @param {object} param0 Error params
   * @param {String} param0.type Subtype of error
   * @param {Number} param0.statusCode HTTP status code of response
   * @param {String} param0.message Error message for programmer
   * @param {object} param0.details Additional error details for used by programmer
   * @param {Error} param0.err The original error that caused this error
   */
  constructor({ type, statusCode = 503, message, details, err }) {
    super("LadokApiError", statusCode, type, message, details, err);
  }
}

class TentaApiError extends OperationalError {
  /**
   * TentaApiError – all errors that can occur when accessing the external system. This should be
   * thrown at the TentaApi-integration layer.
   * @param {object} param0 Error params
   * @param {String} param0.type Subtype of error
   * @param {Number} param0.statusCode HTTP status code of response
   * @param {String} param0.message Error message for programmer
   * @param {object} param0.details Additional error details for used by programmer
   * @param {Error} param0.err The original error that caused this error
   */
  constructor({
    type = "unhandled_error",
    statusCode = 503,
    message = "There was an error when accessing Windream",
    details,
    err,
  }) {
    super("TentaApiError", statusCode, type, message, details, err);
  }
}

class ImportError extends OperationalError {
  /**
   * ImportError – all errors that can occur when performing operations on the import queue.
   * This should be thrown at the import queue-integration layer.
   * @param {object} param0 Error params
   * @param {String} param0.type Subtype of error
   * @param {String} param0.message Error message for programmer
   * @param {object} param0.details Additional error details for used by programmer
   * @param {Error} param0.err The original error that caused this error
   */
  constructor({
    type = "unhandled_error",
    message = "There was an error when accessing the import queue",
    details,
    err,
  }) {
    super("ImportError", 503, type, message, details, err);
  }
}

/**
 * Helper method for catch block
 * @param {object} err Error object passed to catch block
 * @example
 * Usage in Express.js:
 *
 * catch (err) {
 *  if (isOperationalOrRecoverableError(err)) return next(err);
 *  throw err;
 * }
 * @returns {void}
 */
function isOperationalOrRecoverableError(err) {
  return err instanceof OperationalError || err instanceof RecoverableError;
}

function _renderErrorMsg(name, type, message) {
  return `(${name}${type ? "/" + type : ""}) ${message}`;
}

/**
 * Error handler middleware for Express.js using standard params.
 * @param {Error} err Instance of Error object
 * @param {Request} req Express.js Request object
 * @param {Response} res Express.js Response object
 * @param {function} next Express.js next callback
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
  if (err instanceof AuthError) {
    // Simple auth errors
    log.warn(err);
  } else if (err instanceof EndpointError) {
    // Endpoint errors
    if (
      // This is a normal EndpointError that we only need to keep stats on
      err.err === undefined ||
      (err.err instanceof OperationalError && err.err.err === undefined)
    ) {
      log.info(err);
    } else if (
      // This a serious error where the inner error needs to be logged and fixed
      err.err instanceof OperationalError ||
      err.err instanceof RecoverableError
    ) {
      const innerErr = err.err;
      log.error(
        innerErr.err, // Stack trace
        _renderErrorMsg(innerErr.name, innerErr.type, innerErr.message)
      );
      // Add error details if provided for debugging
      if (innerErr.details) log.debug(innerErr.details);
    } else {
      // This is a serious error that was thrown in the endpoint handler
      log.error(
        err.err, // Stack trace
        _renderErrorMsg(err.name, err.type, err.message)
      );
    }
  } else if (
    err.err instanceof OperationalError ||
    err.err instanceof RecoverableError
  ) {
    // This is a serious error that wasn't wrapper in an EndpointError
    log.warn(
      "This error should be wrapped in an EndpointError for consistency"
    );
    log.error(
      err.err, // Stack trace
      _renderErrorMsg(err.name, err.type, err.message)
    );
  } else {
    log.error(err);
  }

  // Add error details if provided for debugging
  if (err.details) log.debug(err.details);

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
  isOperationalOrRecoverableError,
  OperationalError,
  RecoverableError,
  AuthError,
  EndpointError,
  ImportError,
  LadokApiError,
  TentaApiError,
};
