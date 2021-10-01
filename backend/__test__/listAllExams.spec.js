const { expect } = require("@jest/globals");
const rewire = require("rewire");
const listAllExams = rewire("../api/listAllExams");

describe("list scanned exams", () => {
  const tentaApi = listAllExams.__get__("tentaApi");
  it("should... ", async () => {
    expect(typedEntry.status).toBe("new");
  });
});
