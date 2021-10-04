const { expect } = require("@jest/globals");
const rewire = require("rewire");
const listAllExams = rewire("../api/listAllExams");

describe("list scanned exams", () => {
  const tentaApi = listAllExams.__get__("tentaApi");
  const ladok = listAllExams.__get__('ladok')

  // TODO: should reset the mocked functions, otherwise they might mess with other tests

  it("should... ", async () => {
    const fileId = '1'
    const fileId2 = '2'
    // Setup mock
    // TODO: would prefer if we had a listScannedExamsWithNewFormat, that would allow me to design the test without knowing the internal logic
    tentaApi.examListByLadokId = function(){
      console.log('::::::::: Mocked tentaApi function ::::::::::::::')
      return [{fileId},{fileId: fileId2}]
    }

    listAllExams.__set__('listScannedExamsWithOldFormat',function(){
      console.log('::::::::::::::: Mocked listScannedExamsWithOldFormat function :::::::::::::')

      return [{fileId}]
    })

    const courseId = 'SF1624'
    const ladokID = '123123123123'
    const result = await listAllExams.listScannedExams(courseId, ladokID)
    expect(result).toEqual([{fileId},{fileId:fileId2}]);
  });
});
