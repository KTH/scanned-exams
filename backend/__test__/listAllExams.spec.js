const { expect } = require("@jest/globals");
const rewire = require("rewire");
const listAllExams = rewire("../api/listAllExams");

describe("list scanned exams", () => {
  // const tentaApi = listAllExams.__get__("tentaApi");
  // const ladok = listAllExams.__get__('ladok')

  it("should... ", async () => {
    // Setup mock
    // tentaApi.examListByLadokId = function(){
    //   console.log('::::::::: Mocked tentaApi function ::::::::::::::')
    // }

    // ladok.getAktivitetstillfalle = function(){
    //   console.log('::::::::::::::: Mocked ladok function :::::::::::::')
    // }

    // const courseId = 'SF1624'
    // const ladokID = '123123123123'
    // listAllExams.listScannedExams(courseId, ladokID)
    expect(1).toBe(1);
  });
});
