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

const {
  getExamsEndpoint,
  getStatusEndpoint,
  startExportEndpoint,
  addUserToCourseEndpoint,
} = require("./endpointHandlers/legacy");

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

router.get("/courses/:id/setup", async (req, res, next) => {
  try {
    const status = await getSetupStatus(req.params.id);
    res.send(status);
  } catch (err) {
    next(err);
  }
});

router.post("/courses/:id/setup/create-homepage", async (req, res, next) => {
  try {
    await createSpecialHomepage(req.params.id);

    res.send({
      message: "done!",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/courses/:id/setup/publish-course", async (req, res, next) => {
  try {
    await publishCourse(req.params.id);

    res.send({
      message: "done!",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/courses/:id/setup/create-assignment", async (req, res, next) => {
  try {
    await createSpecialAssignment(req.params.id);

    return res.send({
      message: "done!",
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/courses/:id/setup/publish-assignment", async (req, res, next) => {
  try {
    await publishSpecialAssignment(req.params.id);

    return res.send({
      message: "done!",
    });
  } catch (err) {
    return next(err);
  }
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

router.use(errorHandler);
module.exports = router;
