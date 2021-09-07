const express = require("express");
const log = require("skog");
const { handleUnexpectedError, checkAuthorization } = require("./utils");
const canvas = require("./canvasApiClient");
const ladok = require("./ladokApiClient");
const tentaApi = require("./tentaApiClient");

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

router.get("/courses/:id/setup", checkAuthorization, async (req, res, next) => {
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

router.post(
  "/courses/:id/setup/create-homepage",
  checkAuthorization,
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      await canvas.createHomepage(courseId);

      res.send({
        message: "done!",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/courses/:id/setup/publish-course",
  checkAuthorization,
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      await canvas.publishCourse(courseId);

      res.send({
        message: "done!",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/courses/:id/setup/create-assignment",
  checkAuthorization,
  async (req, res, next) => {
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
  }
);

router.post(
  "/courses/:id/setup/publish-assignment",
  checkAuthorization,
  async (req, res, next) => {
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
  }
);

// return the list of exams
router.get("/courses/:id/exams", checkAuthorization, async (req, res) => {
  const courseId = req.params.id;
  const ladokId = await canvas.getExaminationLadokId(courseId);
  const { activities, examDate } = await ladok.getAktivitetstillfalle(ladokId);

  const allExams = [];
  for (const { courseCode, examCode } of activities) {
    allExams.push(
      // eslint-disable-next-line no-await-in-loop
      ...(await tentaApi.examList({ courseCode, examCode, examDate }))
    );
  }

  res.send(
    allExams.map((exam) => ({
      id: exam.fileId,
      student: exam.student,
      // TODO: Check Canvas and the queue
      // new = exist in Windream but not in Canvas
      // pending = is being imported to Canvas
      // imported = exists in Canvas yay
      // error = something happened when trying to import it to Canvas
      status: "new",

      // error: {
      //       type: "___",
      //       message: "_____",
      //     },
    }))
  );
});

// Get the import process status
router.get("/courses/:id/import/status", (req, res) => {
  res.send({
    status: "idle",
    // working: {
    // total: 100,
    // progress: 10,
    // },
  });
});

// Start the import process
router.post("/courses/:id/import/start", (req, res) => {
  // body = [id, id, id]
  res.status(418).send({});
});
router.use(handleUnexpectedError);
module.exports = router;
