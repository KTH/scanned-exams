import { describe, expect, it } from "@jest/globals";
import {
  _throwIfNotExactlyOneLadokId,
  isLastScanned,
} from "../src/api/endpointHandlers/listAllExams";
import { EndpointError } from "../src/api/error";

describe("listAllExams", () => {
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

describe("isLastScanned", () => {
  it("should keep only the 'latest' file for each student", () => {
    const file1 = {
      fileId: 1,
      student: {
        id: "1",
      },
    };
    const file2 = {
      fileId: 2,
      student: {
        id: "1",
      },
    };
    const file3 = {
      fileId: 3,
      student: {
        id: "2",
      },
    };
    const file4 = {
      fileId: 4,
      student: {
        id: "1",
      },
    };
    const file5 = {
      fileId: 5,
      student: {
        id: "2",
      },
    };

    const input = [file1, file2, file3, file4, file5];
    const output = input.filter(isLastScanned);

    expect(output).toEqual([file4, file5]);
  });

  it("should keep the file with the highest 'fileId' regardless of order in the array", () => {
    const file1 = {
      fileId: 1,
      student: {
        id: "1",
      },
    };
    const file2 = {
      fileId: 2,
      student: {
        id: "1",
      },
    };

    const input1 = [file1, file2];
    const output1 = input1.filter(isLastScanned);

    expect(output1).toEqual([file2]);

    const input2 = [file2, file1];
    const output2 = input2.filter(isLastScanned);
    expect(output2).toEqual([file2]);
  });

  it("should not filter out any file with non defined student ID", () => {
    const file1 = {
      fileId: 1,
      student: {},
    };
    const file2 = {
      fileId: 2,
      student: {},
    };

    const input = [file1, file2];
    const output = input.filter(isLastScanned);

    expect(output).toEqual([file1, file2]);
  });
});
