/** Functions that handle the "import exams" part of the app */
const canvas = require("./canvasApiClient");
const ladok = require("./ladokApiClient");
const tentaApi = require("./tentaApiClient");
const { getEntriesFromQueue } = require("./importQueue");

const { EndpointError } = require("./error");

/**
 * Get the "ladokId" of a given course. It throws in case the course
 * has no valid ladok IDs
 */
async function getLadokId(courseId) {
  const ladokIds = await canvas.getAktivitetstillfalleUIDs(courseId);

  if (ladokIds.length === 0) {
    throw new EndpointError({
      type: "invalid_course",
      message:
        "This course can't be used for importing exams. It must be an examroom",
      details: {
        courseId,
      },
    });
  }

  if (ladokIds.lengh > 1) {
    throw new EndpointError({
      type: "invalid_course",
      message: "Examrooms with more than one examination are not supported",
      details: {
        courseId,
        ladokIds,
      },
    });
  }

  return ladokIds[0];
}

async function listAllExams(courseId) {
  const ladokId = await getLadokId(courseId);
  const aktivitetstillfalle = await ladok
    .getAktivitetstillfalle(ladokId)
    .catch(() => {
      throw new EndpointError({
        type: "invalid_activity",
        message: `The course [${courseId}] is associated with a not valid Ladok activitestillfälle [${ladokId}]`,
        details: {
          courseId,
          ladokId,
        },
      });
    });

  const { activities, examDate } = aktivitetstillfalle;

  const allScannedExams = [];
  for (const { courseCode, examCode } of activities) {
    allScannedExams.push(
      // eslint-disable-next-line no-await-in-loop
      ...(await tentaApi.examList({ courseCode, examCode, examDate }))
    );
  }

  const allExamsInCanvas = await canvas
    .getAssignmentSubmissions(courseId, ladokId)
    .catch(() => {
      throw new EndpointError({
        type: "failed_fetching_submissions",
        message: `Cannot fetch submissions for course id [${courseId}]`,
        details: {
          courseId,
          ladokId,
        },
      });
    });

  const examsInImportQueue = await getEntriesFromQueue(courseId);

  const listOfExamsToHandle = allScannedExams.map((exam) => {
    // 1. Check if student assignment is found in Canvas
    const foundInCanvas = allExamsInCanvas.find(
      (examInCanvas) =>
        examInCanvas.workflow_state !== "unsubmitted" &&
        examInCanvas.user?.sis_user_id !== exam.student?.id
    );

    const foundInQueue = examsInImportQueue.find(
      (examInQueue) => examInQueue.fileId === exam.fileId
    );

    // Figure out status and optional error details for each exam
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

    return {
      id: exam.fileId,
      student: exam.student,
      // new = exist in Windream but not in Canvas or our import queue
      // pending = exists in our import queue but  has not been marked imported
      // imported = marked successfully imported to Canvas by the import functions
      // error = something happened when trying to import it to Canvas according to the import function
      status,
      error: errorDetails,
      // error: {
      //       type: "___",
      //       message: "_____",
      //     },
    };
  });

  // TODO: Fix this stub when we know want frontend wants, needs a method in import  queue
  // const summary = {
  //   new: 0,
  //   pending: 0,
  //   errors: 0,
  //   total: 0,
  // };

  return {
    result: listOfExamsToHandle,
    // summary
  };
}

module.exports = {
  listAllExams,
};
