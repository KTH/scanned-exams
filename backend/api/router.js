const express = require("express");
const log = require("skog");
const canvas = require("./canvasApiClient");
const ladok = require("./ladokApiClient");

const { transferExams, getStatus } = require("./transferExams.js");
const { internalServerError, unauthorized } = require("../utils");

const router = express.Router();

/**
 * Check if the requester has teacher roles.
 * - If it does, continues the request
 * - Otherwise responds with an "Unauthorized"
 */
async function checkAuthorization(req, res, next) {
  try {
    const courseId = req.query.courseId || req.body.courseId;
    const { userId } = req.session;
    const { roles, authorized } = await canvas.getAuthorizationData(
      courseId,
      userId
    );

    if (authorized) {
      log.debug(`Authorized. User ${userId} in Course ${courseId}.`);

      return next();
    }

    log.warn(
      `Not authorized. User ${userId} in Course ${courseId} has roles: [${roles}].`
    );

    return unauthorized(
      `Unauthorized: you must be teacher or examiner to use this app`,
      res
    );
  } catch (err) {
    log.error(err);

    return internalServerError(err, res);
  }
}

/**
 * Returns data from the logged in user.
 * - Returns a 404 if the user is not logged in
 */
router.get("/me", async (req, res) => {
  const { userId } = req.session;

  if (!userId) {
    return res.status(404).send("You are logged out");
  }

  return res.status(200).send({ userId });
});

router.get("/courses/:id", async (req, res) => {
  try {
    log.info(`Getting information for course ID ${req.params.id}`);

    const { activities, examDate } = await canvas
      .getExaminationLadokId(req.params.id)
      .then((aktivitetstillfalleId) =>
        ladok.getAktivitetstillfalle(aktivitetstillfalleId)
      );

    return res.send({
      valid: activities.length === 1,
      courseCode: activities.map((a) => a.courseCode).join(", "),
      examCode: activities.map((a) => a.examCode).join(", "),
      examDate,
    });
  } catch (err) {
    log.error(
      err,
      `Error when fetching information for course ID ${req.params.id}`
    );

    return res.status(500).send("Unknown error");
  }
});

router.get("/assignment", checkAuthorization, async (req, res) => {
  try {
    const { courseId } = req.query;
    const ladokId = await canvas.getExaminationLadokId(courseId);
    const assignment = await canvas.getValidAssignment(courseId, ladokId);

    res.json({
      assignment,
    });
  } catch (err) {
    log.error(err);
    internalServerError(err, res);
  }
});

router.post("/assignment", checkAuthorization, async (req, res) => {
  try {
    const { courseId } = req.body;
    const ladokId = await canvas.getExaminationLadokId(courseId);
    let assignment = await canvas.getValidAssignment(courseId, ladokId);

    if (!assignment) {
      assignment = await canvas.createAssignment(courseId, ladokId);
    }

    res.json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (err) {
    internalServerError(err, res);
  }
});

router.post("/exams", checkAuthorization, (req, res) => {
  try {
    transferExams(req.body.courseId);

    res.json({
      message: "Exam uploading started",
    });
  } catch (err) {
    internalServerError(err, res);
  }
});

router.get("/exams", checkAuthorization, (req, res) => {
  try {
    const status = getStatus(req.query.courseId);

    // TODO: return a different code depending on the error
    res.status(status.error ? 400 : 200).json({
      state: status.state,
      error: status.error,
    });
  } catch (err) {
    internalServerError(err, res);
  }
});

module.exports = router;
