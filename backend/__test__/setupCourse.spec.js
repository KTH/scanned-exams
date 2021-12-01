const { expect } = require("@jest/globals");
const {
  _throwIfNotExactlyOneLadokId,
} = require("../api/endpointHandlers/setupCourse");
const { EndpointError } = require("../api/error");

jest.mock("../api/externalApis/canvasApiClient");

describe("setupCourse", () => {
  describe("throwIfNotExactlyOneLadokId", () => {
    it("should throw EndpointError when list of ladokIds is empty", () => {
      let err;
      try {
        _throwIfNotExactlyOneLadokId([]);
      } catch (e) {
        err = e;
      }

      expect(err instanceof EndpointError).toBe(true);
    });

    it("should throw EndpointError when list of ladokIds is longer than 1", () => {
      /**
       * We currently don't support multiple aktivitetstillfällen for a given course
       */
      let err;
      try {
        _throwIfNotExactlyOneLadokId([1, 2]);
      } catch (e) {
        err = e;
      }

      expect(err instanceof EndpointError).toBe(true);
    });

    it("should pass if only one item", () => {
      let err;
      try {
        _throwIfNotExactlyOneLadokId([1]);
      } catch (e) {
        err = e;
      }

      expect(err).toBeUndefined();
    });
  });
});
