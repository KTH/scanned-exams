const express = require("express");
const log = require("skog");
const { handleUnexpectedError, checkAuthorization } = require("./utils");
const canvas = require("./canvasApiClient");
const ladok = require("./ladokApiClient");
const tentaApi = require("./tentaApiClient");
const importQueue = require("./importQueue");

const router = express.Router();

/**
 * Returns data from the logged in user.
 * - Returns a 404 if the user is not logged in
 */
router.get("/me", (req, res) => {
  const { userId } = req.session;

  if (!userId) {
    log.info("Getting user information. User is logged out");
    return res.status(404).send({ message: "You are logged out" });
  }

  log.info("Getting user information. User is logged in");
  return res.status(200).send({ userId });
});

router.use("/courses/:id", checkAuthorization);

router.get("/courses/:id/setup", async (req, res, next) => {
  const courseId = req.params.id;

  try {
    const ladokId = await canvas.getExaminationLadokId(courseId);
    const course = await canvas.getCourse(courseId);
    const assignment = await canvas.getValidAssignment(courseId, ladokId);

    res.send({
      coursePublished: course.workflow_state === "available",
      assignmentCreated: assignment != null,
      assignmentPublished: assignment?.published || false,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/courses/:id/setup/create-homepage", async (req, res, next) => {
  try {
    const courseId = req.params.id;
    await canvas.createHomepage(courseId);

    res.send({
      message: "done!",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/courses/:id/setup/publish-course", async (req, res, next) => {
  try {
    const courseId = req.params.id;
    await canvas.publishCourse(courseId);

    res.send({
      message: "done!",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/courses/:id/setup/create-assignment", async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const ladokId = await canvas.getExaminationLadokId(courseId);
    const existingAssignment = await canvas.getValidAssignment(
      courseId,
      ladokId
    );

    if (existingAssignment) {
      return res.send({
        message: "The assignment already exists",
      });
    }

    await canvas.createAssignment(courseId, ladokId);

    return res.send({
      message: "done!",
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/courses/:id/setup/publish-assignment", async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const ladokId = await canvas.getExaminationLadokId(courseId);
    const assignment = await canvas.getValidAssignment(courseId, ladokId);

    if (!assignment) {
      return res.status(400).send({
        message: "There is no valid assignment that can be published",
      });
    }

    await canvas.publishAssignment(courseId, assignment.id);

    return res.send({
      message: "done!",
    });
  } catch (err) {
    return next(err);
  }
});

function _generateSummaryOfImportQueue(listOfExams) {
  const summary = {
    new: 0,
    pending: 0,
    errors: 0,
    total: 0,
  };
  listOfExams.forEach((exam) => {
    summary.total++;
    if (summary[exam.status] !== undefined) {
      summary[exam.status]++;
    }
  });
  return summary;
}

/**
 * return the list of exams
 * - Canvas is source of truth regarding if a submitted exam is truly imported
 * - the internal import queue keeps state of pending and last performed import
 */
router.get("/courses/:id/exams", async (req, res) => {
  const courseId = req.params.id;

  let ladokId;
  try {
    ladokId = await canvas.getExaminationLadokId(courseId);
  } catch (e) {
    // TODO: Change to new error handling standard
    return res.status(404).send({
      error: {
        type: "course_id_not_found",
        message: `The provided course id [${courseId}] is not found.`,
      },
    });
  }

  let aktivitetstillfalle;
  try {
    aktivitetstillfalle = await ladok.getAktivitetstillfalle(ladokId);
  } catch (e) {
    // TODO: Change to new error handling standard
    return res.status(404).send({
      error: {
        type: "ladok_id_not_valid",
        message: `The provided ladok id [${ladokId}] is not valid.`,
      },
    });
  }
  const { activities, examDate } = aktivitetstillfalle;

  const allExams = [];
  for (const { courseCode, examCode } of activities) {
    allExams.push(
      // eslint-disable-next-line no-await-in-loop
      ...(await tentaApi.examList({ courseCode, examCode, examDate }))
    );
  }

  let allExamsInCanvas = [];
  try {
    // Find all exam submissions in Canvas
    allExamsInCanvas = await canvas.getAssignmentSubmissions(courseId, ladokId);
  } catch (e) {
    // TODO: Change to new error handling standard
    return res.status(400).send({
      error: {
        type: "failed_fetching_submissions",
        message: `The submissions for course id [${courseId}] could not be fetched.`,
        details: e,
      },
    });
  }

  const examsInImportQueue = importQueue.getEntries(courseId);
  const listOfExamsToHandle = allExams.map((exam) => {
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

  const summary = _generateSummaryOfImportQueue(listOfExamsToHandle);

  return res.send({
    result: listOfExamsToHandle,
    summary,
  });
});

// Get the import process status
router.get("/courses/:id/import/status", async (req, res) => {
  const { status, working } = await importQueue.getStatus(req.params.id);

  res.send({
    status,
    working,
  });
});

// Start the import process
router.post("/courses/:id/import/start", async (req, res) => {
  const courseId = req.params.id;

  await importQueue.addExams(courseId, req.body);

  res.status(200).send({
    message: "done!",
  });
});

router.use(handleUnexpectedError);
module.exports = router;
