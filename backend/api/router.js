const express = require("express");
const log = require("skog");
const { errorHandler, EndpointError } = require("./error");
const { checkPermissions } = require("./permission");
const {
  getSetupStatus,
  createSpecialHomepage,
  publishCourse,
  createSpecialAssignment,
  publishSpecialAssignment,
} = require("./endpointHandlers/setupCourse");
const {
  getExamsEndpoint,
  getStatusEndpoint,
  startExportEndpoint,
  addUserToCourseEndpoint,
} = require("./endpointHandlers/legacy");
const { getStatusFromQueue } = require("./importQueue");
const {
  addEntriesToQueue,
  getErrorsInQueue,
  fixErrorsInQueue,
  resetQueue,
} = require("./endpointHandlers/importQueueHandlers");

const router = express.Router();

router.use("/courses/:id", (req, res, next) => {
  checkPermissions(req.params.id, req.session.userId)
    .then(() => {
      next();
    })
    .catch(next);
});

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

router.get("/courses/:id/setup", async (req, res, next) => {
  getSetupStatus(req.params.id)
    .then((status) => res.send(status))
    .catch(next);
});

router.post("/courses/:id/setup/create-homepage", async (req, res, next) => {
  createSpecialHomepage(req.params.id)
    .then(() => {
      res.send({
        message: "done!",
      });
    })
    .catch(next);
});

router.post("/courses/:id/setup/publish-course", async (req, res, next) => {
  publishCourse(req.params.id)
    .then(() => {
      res.send({
        message: "done!",
      });
    })
    .catch(next);
});

router.post("/courses/:id/setup/create-assignment", async (req, res, next) => {
  createSpecialAssignment(req.params.id)
    .then(() => {
      res.send({
        message: "done!",
      });
    })
    .catch(next);
});

router.post("/courses/:id/setup/publish-assignment", async (req, res, next) => {
  publishSpecialAssignment(req.params.id)
    .then(() => {
      res.send({
        message: "done!",
      });
    })
    .catch(next);
});

/**
 * Legacy endpoints
 */
// Get list of exams for given course
router.get("/courses/:id/exams", getExamsEndpoint);
// Get the import process status
router.get("/courses/:id/import/status", getStatusEndpoint);
// Start the import process
router.post("/courses/:id/import/start", startExportEndpoint);
// Add student to Canvas course
router.post("/courses/:id/students", addUserToCourseEndpoint);

/**
 * New endpoints
 */
// Get status of import queue
router.get("/courses/:courseId/import-queue", (req, res, next) => {
  getStatusFromQueue(req.params.courseId)
    .then((status) => res.send(status))
    .catch(next);
});

// Add items to the import queue
router.post("/courses/:courseId/import-queue", (req, res, next) => {
  addEntriesToQueue(req.params.courseId, req.body)
    .then((response) => res.body(response))
    .catch(next);
});

// Get errors in the import queue
router.get("/courses/:courseId/import-queue/errors", (req, res, next) => {
  getErrorsInQueue(req.params.courseId)
    .then((entries) => res.body(entries))
    .catch(next);
});

// Solve errors in the import queue
router.post("/courses/:courseId/import-queue/errors/fix", (req, res, next) => {
  fixErrorsInQueue(req.params.courseId, req.body)
    .then((status) => res.body(status))
    .catch(next);
});

// Empty import queue
router.delete("/courses/:courseId/import-queue", (req, res, next) => {
  resetQueue(req.params.courseId)
    .then((status) => res.body(status))
    .catch(next);
});

router.use(errorHandler);
module.exports = router;
