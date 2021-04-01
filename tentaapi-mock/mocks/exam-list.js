/**
 * Get a list of exams (students kthId and examId) given search criteria
 * @param {object} param0 Exam search criteria
 */
module.exports = function getExamList({ courseCode, examCode, examDate }) {
  if (
    courseCode !== "KD2310" ||
    examCode !== "TEN2" ||
    examDate !== "2021-03-03"
  )
    return;

  return {
    documentSearchResults: [
      {
        id: 0,
        documentIndiceses: [
          {
            index: "s_uid",
            value: "u1sdsss",
          },
        ],
      },
    ],
  };
};
