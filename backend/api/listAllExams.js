/** Functions that handle the "import exams" part of the app */
const log = require("skog").default;
const canvas = require("./canvasApiClient");
const ladok = require("./ladokApiClient");
const tentaApi = require("./tentaApiClient");
const { getEntriesFromQueue } = require("./importQueue");

const { EndpointError } = require("./error");

/**
 * Get the "ladokId" that is associated with a given course. It throws in case
 * the course is not a valid "exam room"
 *
 * Note: this function does not check if the returned ladok ID exists in Ladok.
 */
async function getLadokId(courseId) {
  const ladokIds = await canvas.getAktivitetstillfalleUIDs(courseId);

  if (ladokIds.length === 0) {
    throw new EndpointError({
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
    throw new EndpointError({
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

async function listScannedExamsWithOldFormat(ladokId) {
  const aktivitetstillfalle = await ladok
    .getAktivitetstillfalle(ladokId)
    .catch(() => {
      throw new EndpointError({
        type: "invalid_activity",
        statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
        message: `Not valid Ladok activitestillfälle [${ladokId}]`,
        details: {
          ladokId,
        },
      });
    });

  const { activities, examDate } = aktivitetstillfalle;

  const examsWithOldFormat = [];
  for (const { courseCode, examCode } of activities) {
    examsWithOldFormat.push(
      // eslint-disable-next-line no-await-in-loop
      ...(await tentaApi.examListByDate({ courseCode, examCode, examDate }))
    );
  }

  return examsWithOldFormat;
}

function mergeAndDeduplicate(array1, array2) {
  const exams = [...array1, ...array2];
  const allIds = exams.map((e) => e.fileId);
  const uniqueIds = Array.from(new Set(allIds));

  return uniqueIds.map((id) => exams.find((e) => e.fileId === id));
}

/** Returns a list of scanned exams (i.e. in Windream) given its ladokId */
async function listScannedExams(courseId, ladokId) {
  const examsWithNewFormat = await tentaApi.examListByLadokId(ladokId);
  const examsWithOldFormat = await listScannedExamsWithOldFormat(ladokId);

  // Note: Since we are fetching exams based on {courseCode, examCode, examDate}
  // (old format) and ladok ID (new format), we can find exams in Windream that
  // have both formats. Hence, we need to deduplicate
  const allScannedExams = mergeAndDeduplicate(
    examsWithNewFormat,
    examsWithOldFormat
  );

  log.info(
    `Obtained exams for course [${courseId}] ladokId [${ladokId}] with new format ${examsWithNewFormat.length} / old format: ${examsWithOldFormat.length} / total (without duplicates) ${allScannedExams.length}`
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
        throw new EndpointError({
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

async function listAllExams(courseId) {
  const ladokId = await getLadokId(courseId);
  const allScannedExams = await listScannedExams(courseId, ladokId);
  const studentsWithExamsInCanvas =
    (await listStudentsWithExamsInCanvas(courseId, ladokId)) || [];
  const examsInImportQueue = (await getEntriesFromQueue(courseId)) || [];

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

    return {
      id: exam.fileId,
      student: exam.student,
      status,
      error: errorDetails,
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
  listScannedExams,
  listAllExams,
  mergeAndDeduplicate,
};
