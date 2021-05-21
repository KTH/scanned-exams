let currentBatch = 0;
const batch1 = [
  {
    fileId: 6,
    documentIndiceses: [
      {
        index: "s_uid",
        value: "uxxxFAKE",
      },
    ],
  },
  {
    fileId: 6,
    documentIndiceses: [
      {
        index: "s_uid",
        value: "u1b7rfvx",
      },
    ],
  },
  {
    fileId: 23,
    documentIndiceses: [
      {
        index: "s_uid",
        value: "u1famwov",
      },
    ],
  },
];

const batch2 = [
  {
    fileId: 56,
    documentIndiceses: [
      {
        index: "s_uid",
        value: "u1znmoik",
      },
    ],
  },
];

const batch3 = [
  {
    fileId: 126,
    documentIndiceses: [
      {
        index: "s_uid",
        value: "u101u10w",
      },
    ],
  },
  {
    fileId: 721,
    documentIndiceses: [
      {
        index: "s_uid",
        value: "u1wgwz0g",
      },
    ],
  },
  {
    fileId: 892,
    documentIndiceses: [
      {
        index: "s_uid",
        value: "u1e2hvkx",
      },
    ],
  },
];

/**
 * Get a list of exams (students kthId and examId) given search criteria
 * @param {object} param0 Exam search criteria
 */
module.exports = function getExamList({ courseCode, examCode, examDate }) {
  if (
    courseCode !== "XY0101" ||
    examCode !== "ZZZ1" ||
    examDate !== "2021-01-01"
  )
    return;

  currentBatch++;
  const documentSearchResults = [
    ...batch1,
    ...(currentBatch >= 2 ? batch2 : []),
    ...(currentBatch >= 3 ? batch3 : []),
  ];

  return {
    documentSearchResults,
  };
};
