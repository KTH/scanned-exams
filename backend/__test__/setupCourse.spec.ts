import { describe, expect, it, jest } from "@jest/globals";
import { _throwIfNotExactlyOneLadokId } from "../src/api/endpointHandlers/setupCourse";
import { EndpointError } from "../src/api/error";

// TODO: this is now a class, should probably mock adminCanvasApiClient instead
jest.mock("../src/api/externalApis/canvasApiClient");

describe("setupCourse", () => {
  describe("throwIfNotExactlyOneLadokId", () => {
    it("should throw EndpointError when list of ladokIds is empty", () => {
      let err;
      try {
        _throwIfNotExactlyOneLadokId([], null);
      } catch (e) {
        err = e;
      }

      expect(err instanceof EndpointError).toBe(true);
    });

    it("should throw EndpointError when list of ladokIds is longer than 1", () => {
      /**
       * We currently don't support multiple aktivitetstillfîllen for a given course
       */
      let err;
      try {
        _throwIfNotExactlyOneLadokId([1, 2], null);
      } catch (e) {
        err = e;
      }

      expect(err instanceof EndpointError).toBe(true);
    });

    it("should pass if only one item", () => {
      let err;
      try {
        _throwIfNotExactlyOneLadokId([1], null);
      } catch (e) {
        err = e;
      }

      expect(err).toBeUndefined();
    });
  });
});
