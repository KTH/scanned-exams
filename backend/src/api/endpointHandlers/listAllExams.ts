/** Functions that handle the "import exams" part of the app */
import log from "skog";
import * as canvasApi from "../externalApis/canvasApiClient";
import * as tentaApi from "../externalApis/tentaApiClient";
import { getEntriesFromQueue } from "../importQueue";
import { CanvasApiError, EndpointError } from "../error";
import { totalmem } from "os";

/**
 * Get the "ladokId" that is associated with a given course. It throws in case
 * the course is not a valid "exam room"
 *
 * Note: this function does not check if the returned ladok ID exists in Ladok.
 */
function throwIfNotExactlyOneLadokId(ladokIds, courseId) {
  if (!Array.isArray(ladokIds) || ladokIds.length !== 1) {
    throw new EndpointError({
      type: "invalid_course",
      statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      message: "Only examrooms with exactly one (1) examination is supported",
      details: {
        courseId,
        ladokIds,
      },
    });
  }
}

/** Returns a list of scanned exams (i.e. in Windream) given its ladokId */
async function listScannedExams(courseId, ladokId) {
  const allScannedExams = await tentaApi.examListByLadokId(ladokId);

  log.info(
    `Obtained exams for course [${courseId}] ladokId [${ladokId}]: ${allScannedExams.length}`
  );

  return allScannedExams;
}

/**
 * Returns a list of students (KTH IDs) that has an exam in Canvas
 */
async function listStudentsWithExamsInCanvas(
  courseId,
  ladokId
): Promise<String[]> {
  const assignment = await canvasApi
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

  const submissions = await canvasApi.getAssignmentSubmissions(
    courseId,
    assignment.id
  );

  // Filter-out submissions without exams
  return (
    submissions
      .filter(_isSubmittedAndHasAttachments)
      // Remove submissions with only deleted files
      .filter(_hasRealFilesAsAttachment)
      // Remove submissions witout KTH ID
      .filter(_hasSisUserId)
      .map((s) => s.user.sis_user_id)
  );
}

function _isSubmittedAndHasAttachments(s): boolean {
  if (s.user.sis_user_id === "u1cnl6w6") return false;
  return (
    s.workflow_state !== "unsubmitted" &&
    Array.isArray(s.attachments) &&
    s.attachments.length > 0
  );
}

function _hasRealFilesAsAttachment(s): boolean {
  if (!Array.isArray(s.attachments)) {
    return false;
  }
  // Deleted files are marked with { filename: 'file_removed.pdf' } by SpeedGrader/Canvas
  const nrofActiveFiles = s.attachments.reduce(
    (val, next) => (next.filename !== "file_removed.pdf" ? val + 1 : val),
    0
  );
  return nrofActiveFiles > 0;
}

function _hasSisUserId(s): boolean {
  return s.user?.sis_user_id ? true : false;
}

function calcNewSummary(
  { ...summaryProps }: TErrorSummary,
  status: string,
  error: any
): TErrorSummary {
  const summary = { ...summaryProps };
  // eslint-disable-next-line no-param-reassign
  summary.total++;

  // eslint-disable-next-line no-param-reassign
  if (summary[status] === undefined) summary[status] = 0;
  // eslint-disable-next-line no-param-reassign
  summary[status]++;

  if (error) {
    const errorType = error.type as string;
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

type TErrorSummary = {
  total: number;
  new: number;
  pending: number;
  imported: number;
  error: number;
  errorsByType: { [key: string]: number }; // Typedef https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
};

async function listAllExams(req, res, next) {
  try {
    const courseId = req.params.id;
    // - Canvas is source of truth regarding if a submitted exam is truly imported
    // - the internal import queue keeps state of pending and last performed import
    const ladokIds = await canvasApi.getAktivitetstillfalleUIDs(courseId);
    throwIfNotExactlyOneLadokId(ladokIds, courseId);
    const ladokId = ladokIds[0];

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

    let summary: TErrorSummary = {
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

    res.send({
      result: listOfExamsToHandle,
      summary,
    });
  } catch (err) {
    next(err);
  }
}

export {
  listScannedExams,
  listAllExams,
  throwIfNotExactlyOneLadokId as _throwIfNotExactlyOneLadokId,
};
