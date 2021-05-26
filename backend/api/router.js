const express = require("express");
const canvas = require("./canvasApiClient");
const { transferExams, getStatus } = require("./transferExams.js");
const log = require("skog");
const { internalServerError, unauthorized } = require("../utils");

const router = express.Router();

router.use(async function checkAuthorization(req, res, next) {
  try {
    const courseId = req.query.courseId || req.body.courseId;
    const userId = req.session.userId;
    const { roles, authorized } = await canvas.getAuthorizationData(
      courseId,
      userId
    );

    if (authorized) {
      log.info(`Authorized. User ${userId} in Course ${courseId}.`);

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
    internalServerError(err, res);
  }
});

router.get("/assignment", async (req, res) => {
  try {
    const courseId = req.query.courseId;
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

router.post("/assignment", async (req, res) => {
  try {
    const courseId = req.body.courseId;
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

router.post("/exams", (req, res) => {
  try {
    transferExams(req.body.courseId);

    res.json({
      message: "Exam uploading started",
    });
  } catch (err) {
    internalServerError(err, res);
  }
});

router.get("/exams", (req, res) => {
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
