/**
 * Get a list of exams (students kthId and examId) given search criteria
 * @param {object} param0 Exam search criteria
 */
module.exports = function getExamList({ courseCode, examCode, examDate }) {
  if (
    courseCode !== "XY0101" ||
    examCode !== "ZZZ1" ||
    examDate !== "2100-01-01"
  )
    return;

  return {
    documentSearchResults: [
      {
        id: 006,
        documentIndiceses: [
          {
            index: "s_uid",
            value: "u1b7rfvx",
          },
        ],
      },
      {
        id: 023,
        documentIndiceses: [
          {
            index: "s_uid",
            value: "u1famwov",
          },
        ],
      },
      {
        id: 056,
        documentIndiceses: [
          {
            index: "s_uid",
            value: "u1znmoik",
          },
        ],
      },
      {
        id: 126,
        documentIndiceses: [
          {
            index: "s_uid",
            value: "u101u10w",
          },
        ],
      },
      {
        id: 721,
        documentIndiceses: [
          {
            index: "s_uid",
            value: "u1wgwz0g",
          },
        ],
      },
      {
        id: 892,
        documentIndiceses: [
          {
            index: "s_uid",
            value: "u1e2hvkx",
          },
        ],
      },
    ],
  };
};
