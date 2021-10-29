const express = require("express");
const log = require("skog");
const { errorHandler, EndpointError } = require("./error");
const { checkPermissionsMiddleware } = require("./permission");
const {
  getSetupStatus,
  createSpecialHomepage,
  publishCourse,
  createSpecialAssignment,
  publishSpecialAssignment,
} = require("./endpointHandlers/setupCourse");
const { getStatusFromQueue } = require("./importQueue");
const {
  addEntriesToQueue,
  getErrorsInQueue,
  fixErrorsInQueue,
  resetQueue,
  ignoreErrorsInQueue,
} = require("./endpointHandlers/importQueueHandlers");
const { listAllExams } = require("./endpointHandlers/listAllExams");

const router = express.Router();

router.use("/courses/:id", checkPermissionsMiddleware);

/**
 * Returns data from the logged in user.
 * - Returns a 404 if the user is not logged in
 */
router.get("/me", (req, res, next) => {
  const { userId } = req.session;

  if (!userId) {
    log.debug("Getting user information. User is logged out");
    return next(
      new EndpointError({
        type: "logged_out",
        statusCode: 404,
        message: "You are logged out",
      })
    );
  }

  log.debug("Getting user information. User is logged in");
  return res.status(200).send({ userId });
});

router.get("/courses/:id/setup", getSetupStatus);
router.get("/courses/:id/setup/create-homepage", createSpecialHomepage);
router.post("/courses/:id/setup/publish-course", publishCourse);
router.post("/courses/:id/setup/create-assignment", createSpecialAssignment);
router.post("/courses/:id/setup/publish-assignment", publishSpecialAssignment);

// Get list of exams for given course
router.get("/courses/:id/exams", (req, res, next) => {
  listAllExams(req.params.id)
    .then((response) => res.send(response))
    .catch(next);
});

// Get status of import queue
router.get("/courses/:courseId/import-queue", (req, res, next) => {
  getStatusFromQueue(req.params.courseId)
    .then((status) => res.send(status))
    .catch(next);
});

// Add items to the import queue
router.post("/courses/:courseId/import-queue", (req, res, next) => {
  addEntriesToQueue(req.params.courseId, req.body)
    .then((response) => res.send(response))
    .catch(next);
});

// Get errors in the import queue
router.get("/courses/:courseId/import-queue/errors", (req, res, next) => {
  getErrorsInQueue(req.params.courseId)
    .then((entries) => res.send(entries))
    .catch(next);
});

// Solve errors in the import queue
router.post("/courses/:courseId/import-queue/errors/fix", (req, res, next) => {
  fixErrorsInQueue(req.params.courseId, req.body)
    .then((status) => res.send(status))
    .catch(next);
});

// Ignore errors in the import queue (delete from the queue)
router.post(
  "/courses/:courseId/import-queue/errors/ignore",
  (req, res, next) => {
    ignoreErrorsInQueue(req.params.courseId, req.body)
      .then((status) => res.send(status))
      .catch(next);
  }
);

// Empty import queue
router.delete("/courses/:courseId/import-queue", (req, res, next) => {
  resetQueue(req.params.courseId)
    .then((status) => res.send(status))
    .catch(next);
});

router.use(errorHandler);
module.exports = router;
