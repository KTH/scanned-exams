// {
//   fileId,
//   courseId,
//   status: pending / imported
// }
const DUMMY_QUEUE = [];

async function getFirstPending() {
  return DUMMY_QUEUE.find((entry) => entry.status === "pending");
}

async function getEntries(courseId) {
  return DUMMY_QUEUE.filter((entry) => entry.courseId === courseId);
}

async function queueExamsForImport(courseId, fileIds) {
  // 1. Remove all "imported" exams
  // TODO: check that fileIds is actually an array
  fileIds.forEach((fileId) => {
    DUMMY_QUEUE.push({
      courseId,
      fileId,
      status: "pending",
    });
  });
}

async function getStatus(courseId) {
  const pendingExams = DUMMY_QUEUE.filter(
    (entry) => entry.courseId === courseId && entry.status === "pending"
  );

  const importedExams = DUMMY_QUEUE.filter(
    (entry) => entry.courseId === courseId && entry.status === "imported"
  );

  const status = pendingExams.length > 0 ? "working" : "idle";

  return {
    status,
    working: {
      total: pendingExams.length + importedExams.length,
      progress: importedExams.length,
    },
  };
}

async function markAsImported(fileId) {
  const entry = DUMMY_QUEUE.find((e) => e.fileId === fileId);

  if (entry) {
    entry.status = "imported";
  }
}

async function markAsError(fileId, error) {
  const entry = DUMMY_QUEUE.find((e) => e.fileId === fileId);

  if (entry) {
    entry.status = "error";
    entry.error = error;
  }
}

module.exports = {
  getFirstPending,
  getEntries,
  getStatus,
  queueExamsForImport,
  markAsImported,
  markAsError,
};
