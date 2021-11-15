/** Functions that handle the "import exams" part of the app */
const log = require("skog");
const canvas = require("../../externalApis/canvasApiClient");
const tentaApi = require("../../externalApis/tentaApiClient");
const { getEntriesFromQueue } = require("../../importQueue");

const { CanvasApiError, tentaApiGenericErrorHandler } = require("../../error");

/**
 * Get the "ladokId" that is associated with a given course. It throws in case
 * the course is not a valid "exam room"
 *
 * Note: this function does not check if the returned ladok ID exists in Ladok.
 */
async function getLadokId(courseId) {
  const ladokIds = await canvas.getAktivitetstillfalleUIDs(courseId);

  if (ladokIds.length === 0) {
    throw new CanvasApiError({
      type: "invalid_course",
      statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      message:
        "This course can't be used for importing exams. It must be an examroom",
      details: {
        courseId,
      },
    });
  }

  if (ladokIds.lengh > 1) {
    throw new CanvasApiError({
      type: "invalid_course",
      statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      message: "Examrooms with more than one examination are not supported",
      details: {
        courseId,
        ladokIds,
      },
    });
  }

  return ladokIds[0];
}

/** Returns a list of scanned exams (i.e. in Windream) given its ladokId */
async function listScannedExams(courseId, ladokId) {
  const allScannedExams = await tentaApi
    .examListByLadokId(ladokId)
    .catch(tentaApiGenericErrorHandler);

  log.info(
    `Obtained exams for course [${courseId}] ladokId [${ladokId}]: ${allScannedExams.length}`
  );

  return allScannedExams;
}

/**
 * Returns a list of students (KTH IDs) that has an exam in Canvas
 */
async function listStudentsWithExamsInCanvas(courseId, ladokId) {
  const assignment = await canvas
    .getValidAssignment(courseId, ladokId)
    .then((result) => {
      if (!result) {
        throw new CanvasApiError({
          type: "not_setup_course",
          statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
          message: `The course [${courseId}] has no valid assignment for scanned exams. Probably is not setup correctly`,
          details: {
            courseId,
            ladokId,
          },
        });
      } else {
        return result;
      }
    });

  const submissions = await canvas.getAssignmentSubmissions(
    courseId,
    assignment.id
  );

  // Filter-out submissions without exams or without KTH ID
  return submissions
    .filter((s) => s.workflow_state !== "unsubmitted" || !s.user?.sis_user_id)
    .map((submission) => submission.user?.sis_user_id);
}

function calcNewSummary({ ...summaryProps }, status, error) {
  const summary = { ...summaryProps };
  // eslint-disable-next-line no-param-reassign
  summary.total++;

  // eslint-disable-next-line no-param-reassign
  if (summary[status] === undefined) summary[status] = 0;
  // eslint-disable-next-line no-param-reassign
  summary[status]++;

  if (error !== undefined) {
    const errorType = error.type;
    if (summary.errorsByType[errorType] === undefined) {
      // eslint-disable-next-line no-param-reassign
      summary.errorsByType[errorType] = 1;
    } else {
      // eslint-disable-next-line no-param-reassign
      summary.errorsByType[errorType]++;
    }
  }
  return summary;
}

async function listAllExams(courseId) {
  // - Canvas is source of truth regarding if a submitted exam is truly imported
  // - the internal import queue keeps state of pending and last performed import
  const ladokId = await getLadokId(courseId);
  let [allScannedExams, studentsWithExamsInCanvas, examsInImportQueue] =
    await Promise.all([
      listScannedExams(courseId, ladokId),
      listStudentsWithExamsInCanvas(courseId, ladokId),
      getEntriesFromQueue(courseId),
    ]);

  // Make sure these are arrays
  allScannedExams = allScannedExams || [];
  studentsWithExamsInCanvas = studentsWithExamsInCanvas || [];
  examsInImportQueue = examsInImportQueue || [];

  let summary = {
    total: 0,
    new: 0,
    pending: 0,
    imported: 0,
    error: 0,
    errorsByType: {},
  };

  const listOfExamsToHandle = allScannedExams.map((exam) => {
    const foundInCanvas = studentsWithExamsInCanvas.find(
      (s) => s === exam.student?.id
    );

    const foundInQueue = examsInImportQueue.find(
      (examInQueue) => examInQueue.fileId === exam.fileId
    );

    let status = "new";
    let errorDetails;
    if (foundInCanvas) {
      status = "imported";
    } else if (foundInQueue) {
      switch (foundInQueue.status) {
        case "pending":
          status = "pending";
          break;
        case "error":
          status = "error";
          errorDetails = foundInQueue.error;
          break;
        case "imported":
          // It was marked imported but not found in Canvas
          // Allow user to retry import
          status = "new";
          break;
        default:
          status = foundInQueue.status;
          errorDetails = foundInQueue.error;
      }
    }

    summary = calcNewSummary(summary, status, errorDetails);

    return {
      id: exam.fileId,
      student: exam.student,
      status,
      error: errorDetails,
    };
  });

  return {
    result: listOfExamsToHandle,
    summary,
  };
}

module.exports = {
  listScannedExams,
  listAllExams,
};
