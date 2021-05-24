const express = require("express");
const canvas = require("./canvasApiClient");
const transferExams = require("./transferExams.js");
const log = require("skog");
const { internalServerError, unauthorized } = require("../utils");

const router = express.Router();

router.use(async function checkAuthorization(req, res, next) {
  try {
    const courseId = req.query.courseId || req.body.courseId;
    const roles = await canvas.getRoles(courseId, req.session.userId);

    if (roles.includes(4) || roles.includes(10)) {
      log.info(
        `Authorized. User ${req.session.userId} in Course ${req.session.courseId} has roles: [${roles}].`
      );

      return next();
    }

    log.warn(
      `Not authorized. User ${req.session.userId} in Course ${req.session.courseId} has roles: [${roles}].`
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
    transferExams(req.session);

    res.json({
      message: "Exam uploading started",
    });
  } catch (err) {
    internalServerError(err, res);
  }
});

router.get("/exams", (req, res) => {
  try {
    const session = req.session;

    // TODO: return a different code depending on the error
    res.status(session.error ? 400 : 200).json({
      state: session.state,
      error: session.error,
    });
  } catch (err) {
    internalServerError(err, res);
  }
});

module.exports = router;
