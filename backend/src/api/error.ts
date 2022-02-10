import log from "skog";

/* eslint max-classes-per-file: */

interface IOperationalError {
  name: string;
  statusCode: number;
  type: string;
  details?: object;
  err?: object;
}

interface IRecoverableError {
  name: string;
  err: object;
}

class OperationalError extends Error implements IOperationalError {
  name: string;
  statusCode: number;
  type: string;
  details: object;
  err: object;

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

class RecoverableError extends Error implements IRecoverableError {
  name: string;
  err: object;

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
   * @param {object=} param0.details Additional error details for used by programmer
   * @param {Error=} param0.err The original error that caused this error
   */
  constructor({ type, message, details = undefined, err = undefined }) {
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
   * @param {object=} param0.details Additional error details for used by programmer
   * @param {Error=} param0.err The original error that caused this error
   */
  constructor({
    type,
    statusCode,
    message,
    details = undefined,
    err = undefined,
  }) {
    super("EndpointError", statusCode, type, message, details, err);
  }
}

class CanvasApiError extends OperationalError {
  /**
   * CanvasApiError – all errors that can occur when accessing the external system. This should be
   * thrown at the integration layer.
   * @param {object} param0 Error params
   * @param {String} param0.type Subtype of error
   * @param {Number=} param0.statusCode HTTP status code of response
   * @param {String} param0.message Error message for programmer
   * @param {object=} param0.details Additional error details for used by programmer
   * @param {Error=} param0.err The original error that caused this error
   */
  constructor({
    type = "unhandled_error",
    statusCode = 503,
    message = "There was an error when accessing Canvas",
    details = undefined,
    err = undefined,
  }) {
    super("CanvasApiError", statusCode, type, message, details, err);
  }
}

class LadokApiError extends OperationalError {
  /**
   * LadokApiError – all errors that can occur when accessing the external system. This should be
   * thrown at the integration layer.
   * @param {object} param0 Error params
   * @param {String} param0.type Subtype of error
   * @param {Number=} param0.statusCode HTTP status code of response
   * @param {String} param0.message Error message for programmer
   * @param {object=} param0.details Additional error details for used by programmer
   * @param {Error=} param0.err The original error that caused this error
   */
  constructor({
    type,
    statusCode = 503,
    message,
    details = undefined,
    err = undefined,
  }) {
    super("LadokApiError", statusCode, type, message, details, err);
  }
}

class TentaApiError extends OperationalError {
  /**
   * TentaApiError – all errors that can occur when accessing the external system. This should be
   * thrown at the integration layer.
   * @param {object} param0 Error params
   * @param {String} param0.type Subtype of error
   * @param {Number=} param0.statusCode HTTP status code of response
   * @param {String} param0.message Error message for programmer
   * @param {object=} param0.details Additional error details for used by programmer
   * @param {Error=} param0.err The original error that caused this error
   */
  constructor({
    type = "unhandled_error",
    statusCode = 503,
    message = "There was an error when accessing Windream",
    details = undefined,
    err = undefined,
  }) {
    super("TentaApiError", statusCode, type, message, details, err);
  }
}

class ImportError extends OperationalError {
  /**
   * ImportError – all errors that can occur when performing operations on the import queue.
   * This should be thrown at the integration layer.
   * @param {object} param0 Error params
   * @param {String=} param0.type Subtype of error
   * @param {Number=} param0.statusCode HTTP status code of response
   * @param {String=} param0.message Error message for programmer
   * @param {object=} param0.details Additional error details for used by programmer
   * @param {Error=} param0.err The original error that caused this error
   */
  constructor({
    type = "unhandled_error",
    statusCode = 503,
    message = "There was an error when accessing the import queue",
    details = undefined,
    err = undefined,
  }) {
    super("ImportError", statusCode, type, message, details, err);
  }
}

class FileUploadError extends OperationalError {
  /**
   * FileUploadError – all errors that can occur when trying to upload files to storage.
   * This should be thrown at the integration layer.
   * @param {object} param0 Error params
   * @param {String} param0.type Subtype of error
   * @param {Number=} param0.statusCode HTTP status code of response
   * @param {String} param0.message Error message for programmer
   * @param {object=} param0.details Additional error details for used by programmer
   * @param {Error=} param0.err The original error that caused this error
   */
  constructor({
    type,
    statusCode = 503,
    message,
    details = undefined,
    err = undefined,
  }) {
    super("FileUploadError", statusCode, type, message, details, err);
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

// Find a wrapped programmer error
function getOrigProgrammerError(error) {
  const { err } = error;
  let result;
  if (isOperationalOrRecoverableError(err)) {
    // .err is an OperationalError so need to check if
    // that in turn constains a wrapped error
    result = getOrigProgrammerError(err);
  } else if (err instanceof Error) {
    result = err;
  }
  return result;
}

// Find the innermost wrapped operational or recoverable error
function getMostSignificantError(error) {
  const { err } = error;
  if (isOperationalOrRecoverableError(err)) {
    // If we have wrapped an Operational or Recoverable error
    // that is the cause and what should be logged
    return getMostSignificantError(err);
  }

  return error;
}

function _formatErrorMsg(name, type, message) {
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
    switch (err.type) {
      case "permission_denied":
        // This is common and only used for debugging
        log.debug(err);
        break;
      default:
        // All other auth errors
        log.error(err);
    }
    // Add error details if provided for debugging
    if (err.details) log.debug(err.details);
  } else if (err instanceof EndpointError) {
    /**
     * An EndpointError can be caused in four ways:
     * 1. Thrown by endpoint handler but there was no error in the code
     * 2. Thrown by endpoint handler due to an error in the code
     * 3. An [Name]ApiError was caught which wasn't caused by an error in the code
     * 4. An [Name]ApiError was caught which in turn was caused by an error in the code
     *
     * Alternative 2 & 4 will have a wrapped programmer error.
     */
    // Since EndpointErrors can wrap other errors we want to make sure we log the most significant error
    // and the underlying programmer error if one exists
    const logErr = getMostSignificantError(err);
    const progErr = getOrigProgrammerError(err);

    if (progErr === undefined) {
      // If the EndpointError wasn't caused by a programmer error we only need to inform about it.
      log.info(logErr);
    } else {
      // If it was a programmer error it needs to be logged and fixed.
      log.error(
        progErr, // this provides a stack trace for the original error that needs to be fixed
        _formatErrorMsg(logErr.name, logErr.type, logErr.message)
      );
    }
    // Add error details if provided for debugging.
    if (logErr.details) log.debug(logErr.details);
  } else if (isOperationalOrRecoverableError(err)) {
    // These errors should always be wrapped in EndpointError so we log the
    // outer most error to know what we have missed in our endpoint code
    log.warn(
      "This error should be wrapped in an EndpointError for consistency"
    );

    log.error(
      getOrigProgrammerError(err), // this provides a stack trace for the original error that needs to be fixed
      _formatErrorMsg(err.name, err.type, err.message)
    );
    // Add error details if provided for debugging
    if (err.details) log.debug(err.details);
  } else {
    // All other passed errors should always be logged as error
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

function canvasApiGenericErrorHandler(err): never {
  Error.captureStackTrace(err, canvasApiGenericErrorHandler);

  if (err.name === "CanvasApiError" || err.name === "HTTPError") {
    // Errors from @kth/canvas-api are called CanvasApiError too
    const error = new CanvasApiError({
      type: "http_error",
      message:
        "Looks like a temporary problem accessing Canvas. You can retry now or a bit later",
    });
    throw error;
  }

  const error = new CanvasApiError({
    err, // Pass the original error
  });
  throw error;
}

function tentaApiGenericErrorHandler(err): never {
  Error.captureStackTrace(err, tentaApiGenericErrorHandler);
  const error = new TentaApiError({
    err, // Pass the original error
  });
  throw error;
}

export {
  errorHandler,
  canvasApiGenericErrorHandler,
  tentaApiGenericErrorHandler,
  getMostSignificantError,
  getOrigProgrammerError,
  isOperationalOrRecoverableError,
  OperationalError,
  RecoverableError,
  AuthError,
  EndpointError,
  ImportError,
  FileUploadError,
  CanvasApiError,
  LadokApiError,
  TentaApiError,
};
