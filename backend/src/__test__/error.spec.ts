/* eslint-disable no-console */
import { expect, describe, it, afterAll, beforeAll } from "@jest/globals";
import {
  errorHandler,
  getMostSignificantError,
  getOrigProgrammerError,
  isOperationalOrRecoverableError,
  OperationalError,
  RecoverableError,
  AuthError,
  EndpointError,
  ImportError,
  CanvasApiError,
  LadokApiError,
  TentaApiError,
} from "../api/error";

const tmpConsole = {
  error: console.error,
  info: console.error,
  log: console.error,
  warn: console.error,
};

const silentConsole = {
  error: () => {},
  info: () => {},
  log: () => {},
  warn: () => {},
};

function muteConsole() {
  const { error, info, log, warn } = silentConsole;
  console.error = error;
  console.info = info;
  console.log = log;
  console.warn = warn;
}

function unmuteConsole() {
  const { error, info, log, warn } = tmpConsole;
  console.error = error;
  console.info = info;
  console.log = log;
  console.warn = warn;
}

describe("utils", () => {
  beforeAll(muteConsole);
  afterAll(unmuteConsole);

  it("getOrigProgrammerError, one level", () => {
    const progErr = new Error("test");
    const err = getOrigProgrammerError(
      new EndpointError({
        type: "type",
        statusCode: 0,
        message: "error",
        err: progErr,
      })
    );
    expect(err === progErr).toBe(true);
  });
  it("getOrigProgrammerError, two levels", () => {
    const progErr = new Error("test");
    const err = getOrigProgrammerError(
      new EndpointError({
        type: "type",
        statusCode: 0,
        message: "error",
        err: new OperationalError(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          progErr
        ),
      })
    );
    expect(err === progErr).toBe(true);
  });
  it("getMostSignificantError, one level", () => {
    const err = new EndpointError({
      type: "type",
      statusCode: 0,
      message: "error",
    });
    const errToLog = getMostSignificantError(err);
    expect(errToLog === err).toBe(true);
  });
  it("getMostSignificantError, two levels", () => {
    const progErr = new Error("test");
    const err = new OperationalError(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      progErr
    );
    const errToLog = getMostSignificantError(
      new EndpointError({
        type: "type",
        statusCode: 0,
        message: "error",
        err,
      })
    );
    expect(errToLog === err).toBe(true);
  });
  it("isOperationalOrRecoverableError, check Error", () => {
    const err = new Error();
    expect(isOperationalOrRecoverableError(err)).toBe(false);
  });
  it("isOperationalOrRecoverableError, check OperationalError", () => {
    const err = new OperationalError(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(isOperationalOrRecoverableError(err)).toBe(true);
  });
  it("isOperationalOrRecoverableError, check RecoverableError", () => {
    const err = new RecoverableError({ err: undefined });
    expect(isOperationalOrRecoverableError(err)).toBe(true);
  });
  it("isOperationalOrRecoverableError, check EndpointError", () => {
    const err = new EndpointError({
      type: "type",
      statusCode: 0,
      message: "error",
    });
    expect(isOperationalOrRecoverableError(err)).toBe(true);
  });
});

describe("Errors", () => {
  beforeAll(muteConsole);
  afterAll(unmuteConsole);

  it("RecoverableError", () => {
    try {
      throw new RecoverableError({
        message: "message",
        err: new Error("test"),
      });
    } catch (err) {
      expect(err instanceof RecoverableError).toBe(true);
      expect(err.name).toBe("RecoverableError");
    }
  });
  it("AuthError", () => {
    try {
      throw new AuthError({
        type: "test_error",
        message: "message",
        details: { foo: "bar" },
        err: new Error("test"),
      });
    } catch (err) {
      expect(err instanceof OperationalError).toBe(true);
      expect(err.name).toBe("AuthError");
      expect(err.statusCode).toBe(401);
    }
  });
  it("EndpointError", () => {
    try {
      throw new EndpointError({
        type: "test_error",
        statusCode: 500,
        message: "message",
        details: { foo: "bar" },
        err: new Error("test"),
      });
    } catch (err) {
      expect(err instanceof OperationalError).toBe(true);
      expect(err.name).toBe("EndpointError");
      expect(err.statusCode).toBe(500);
    }
  });
  it("CanvasApiError", () => {
    try {
      throw new CanvasApiError({
        type: "test_error",
        message: "message",
        details: { foo: "bar" },
        err: new Error("test"),
      });
    } catch (err) {
      expect(err instanceof OperationalError).toBe(true);
      expect(err.name).toBe("CanvasApiError");
      expect(err.statusCode).toBe(503);
    }
  });
  it("LadokApiError", () => {
    try {
      throw new LadokApiError({
        type: "test_error",
        message: "message",
        details: { foo: "bar" },
        err: new Error("test"),
      });
    } catch (err) {
      expect(err instanceof OperationalError).toBe(true);
      expect(err.name).toBe("LadokApiError");
      expect(err.statusCode).toBe(503);
    }
  });
  it("TentaApiError", () => {
    try {
      throw new TentaApiError({
        type: "test_error",
        message: "message",
        details: { foo: "bar" },
        err: new Error("test"),
      });
    } catch (err) {
      expect(err instanceof OperationalError).toBe(true);
      expect(err.name).toBe("TentaApiError");
      expect(err.statusCode).toBe(503);
    }
  });
  it("ImportError", () => {
    try {
      throw new ImportError({
        type: "test_error",
        message: "message",
        details: { foo: "bar" },
        err: new Error("test"),
      });
    } catch (err) {
      expect(err instanceof OperationalError).toBe(true);
      expect(err.name).toBe("ImportError");
      expect(err.statusCode).toBe(503);
    }
  });
});

function dummyNext() {
  // do nothing
}

class DummyResponse {
  headerSent = false;
  statusCode: number;
  body: any;

  status(code) {
    this.statusCode = code;
    return this;
  }

  send(body) {
    this.body = body;
  }
}

describe("errorHandler can handle", () => {
  beforeAll(muteConsole);
  afterAll(unmuteConsole);

  const res = new DummyResponse();
  it("Error", () => {
    errorHandler(new Error("error message"), undefined, res, dummyNext);

    const { error } = res.body;
    expect(typeof error).toBe("object");
    expect(error.type).toBe("error");
    expect(error.message).toBe("error message");
    expect(res.statusCode).toBe(500);
  });

  it("EndpointError", () => {
    errorHandler(
      new EndpointError({
        statusCode: 503,
        type: "test_error",
        message: "test endpoint error",
      }),
      undefined,
      res,
      dummyNext
    );

    const { error } = res.body;
    expect(typeof error).toBe("object");
    expect(error.type).toBe("test_error");
    expect(error.message).toBe("test endpoint error");
    expect(error.statusCode).toBe(503);
    expect(res.statusCode).toBe(503);
  });

  it("EndpointError with error", () => {
    errorHandler(
      new EndpointError({
        statusCode: 503,
        type: "test_error",
        message: "test endpoint error",
        err: new Error("original error should be shown in logs"),
      }),
      undefined,
      res,
      dummyNext
    );

    const { error } = res.body;
    expect(typeof error).toBe("object");
    expect(error.type).toBe("test_error");
    expect(error.message).toBe("test endpoint error");
    expect(error.statusCode).toBe(503);
    expect(res.statusCode).toBe(503);
  });

  it("EndpointError with OperationalError", () => {
    errorHandler(
      new EndpointError({
        statusCode: 503,
        type: "test_error",
        message: "test endpoint error",
        err: new OperationalError(
          "DummyError",
          500,
          "inner_error",
          "original error should be shown in logs",
          undefined,
          undefined
        ),
      }),
      undefined,
      res,
      dummyNext
    );

    const { error } = res.body;
    expect(typeof error).toBe("object");
    expect(error.type).toBe("test_error");
    expect(error.message).toBe("test endpoint error");
    expect(error.statusCode).toBe(503);
    expect(res.statusCode).toBe(503);
  });

  it("EndpointError with OperationalError with inner error", () => {
    errorHandler(
      new EndpointError({
        statusCode: 503,
        type: "test_error",
        message: "test endpoint error",
        err: new OperationalError(
          "DummyError",
          500,
          "inner_error",
          "inner error",
          undefined,
          new Error("original error should be shown in logs")
        ),
      }),
      undefined,
      res,
      dummyNext
    );

    const { error } = res.body;
    expect(typeof error).toBe("object");
    expect(error.type).toBe("test_error");
    expect(error.message).toBe("test endpoint error");
    expect(error.statusCode).toBe(503);
    expect(res.statusCode).toBe(503);
  });

  it("OperationalError", () => {
    errorHandler(
      new OperationalError(
        "DummyError",
        503,
        "test_error",
        "test operational error",
        undefined,
        undefined
      ),
      undefined,
      res,
      dummyNext
    );

    const { error } = res.body;
    expect(typeof error).toBe("object");
    expect(error.type).toBe("test_error");
    expect(error.message).toBe("test operational error");
    expect(error.statusCode).toBe(503);
    expect(res.statusCode).toBe(503);
  });

  it("OperationalError with error", () => {
    errorHandler(
      new OperationalError(
        "DummyError",
        503,
        "test_error",
        "test operational error",
        undefined,
        new Error("original error should be shown in logs")
      ),
      undefined,
      res,
      dummyNext
    );

    const { error } = res.body;
    expect(typeof error).toBe("object");
    expect(error.type).toBe("test_error");
    expect(error.message).toBe("test operational error");
    expect(error.statusCode).toBe(503);
    expect(res.statusCode).toBe(503);
  });
});
