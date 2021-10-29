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

router.post("/courses/:id/import-queue", addEntriesToQueue);
router.get("/courses/:id/import-queue/errors", getErrorsInQueue);
router.post("/courses/:id/import-queue/errors/fix", fixErrorsInQueue);
router.post("/courses/:id/import-queue/errors/ignore", ignoreErrorsInQueue);
router.delete("/courses/:id/import-queue", resetQueue);

router.use(errorHandler);
module.exports = router;
