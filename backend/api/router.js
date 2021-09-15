const express = require("express");
const log = require("skog");
const { errorHandler } = require("./error");

const { checkAuthorizationMiddleware } = require("./permission");
const {
  getStatusFromQueue,
  addEntryToQueue,
  removeFinishedEntries,
} = require("./importQueue");
const {
  getSetupStatus,
  createSpecialHomepage,
  publishCourse,
  createSpecialAssignment,
  publishSpecialAssignment,
} = require("./setupCourse");
const { listAllExams } = require("./importExams");

const router = express.Router();

router.use("/courses/:id", checkAuthorizationMiddleware);

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
 * return the list of exams
 * - Canvas is source of truth regarding if a submitted exam is truly imported
 * - the internal import queue keeps state of pending and last performed import
 */
router.get("/courses/:id/exams", async (req, res, next) => {
  try {
    const { result, summary } = await listAllExams(req.params.id);

    return res.send({
      result,
      summary,
    });
  } catch (err) {
    return next(err);
  }
});

// Get the import process status
router.get("/courses/:id/import/status", async (req, res) => {
  const courseId = req.params.id;
  const status = await getStatusFromQueue(courseId);

  res.send(status);
});

// Start the import process
router.post("/courses/:id/import/start", async (req, res) => {
  const courseId = req.params.id;
  const { status } = await getStatusFromQueue(courseId);

  if (status !== "idle") {
    // TODO: move it to the error handler
    return res.status(400).send({
      message: "Can't start import if there are pending jobs",
      code: "queue_not_idle",
    });
  }

  await removeFinishedEntries(courseId);

  for (const fileId of req.body) {
    // eslint-disable-next-line no-await-in-loop
    await addEntryToQueue({
      fileId,
      courseId,
      status: "pending",
    });
  }

  return res.status(200).send({
    message: "done",
  });
});

router.use(errorHandler);
module.exports = router;
