const { expect } = require("@jest/globals");
const listAllExams = require("../api/listAllExams");
describe("mergeAndDeduplicate", () => {
  it("should include exams with old format, exams with new format, but no duplicates", () => {
    const examsWithNewFormat = [{ fileId: "1" }, { fileId: "2" }];
    const examsWithOldFormat = [{ fileId: "1" }, { fileId: "3" }];
    const result = listAllExams.mergeAndDeduplicate(
      examsWithNewFormat,
      examsWithOldFormat
    );
    expect(result).toEqual([{ fileId: "1" }, { fileId: "2" }, { fileId: "3" }]);
  });
});
