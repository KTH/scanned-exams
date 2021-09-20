/** Functions that handle the "import exams" part of the app */
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

/** Returns a list of scanned exams (i.e. in Windream) given its ladokId */
async function listScannedExams(courseId, ladokId) {
  // Try getting exams using the Ladok ID. (new format)
  const allScannedExams = await tentaApi.examListByLadokId(ladokId);

  if (allScannedExams.length > 0) {
    return allScannedExams;
  }

  // If there are no exams with the new format
  // try finding them using { courseCode, examCode, examDate }
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

  for (const { courseCode, examCode } of activities) {
    allScannedExams.push(
      // eslint-disable-next-line no-await-in-loop
      ...(await tentaApi.examList({ courseCode, examCode, examDate }))
    );
  }

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
  const studentsWithExamsInCanvas = await listStudentsWithExamsInCanvas(
    courseId,
    ladokId
  );
  const examsInImportQueue = await getEntriesFromQueue(courseId);

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
  listAllExams,
};
