const { expect } = require("@jest/globals");
const canvas = require("../api/externalApis/canvasApiClient");
const { _getLadokId } = require("../api/endpointHandlers/listAllExams");
const { CanvasApiError } = require("../api/error");

jest.mock("../api/externalApis/canvasApiClient");

describe("listAllExams", () => {
  describe("getLadokId", () => {
    it("should throw CanvasApiError when list of ladokIds is empty", async () => {
      canvas.getAktivitetstillfalleUIDs.mockResolvedValue([]);
      let err;
      await _getLadokId(12345).catch((e) => {
        err = e;
      });

      expect(err instanceof CanvasApiError).toBe(true);
    });

    it("should throw CanvasApiError when list of ladokIds is longer than 1", async () => {
      canvas.getAktivitetstillfalleUIDs.mockResolvedValue([1, 2]);
      let err;
      await _getLadokId(12345).catch((e) => {
        err = e;
      });

      expect(err instanceof CanvasApiError).toBe(true);
    });

    it("should return a single  value", async () => {
      canvas.getAktivitetstillfalleUIDs.mockResolvedValue([1]);

      const outp = await _getLadokId(12345);

      expect(outp).toBe(1);
    });
  });
});
