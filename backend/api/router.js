const express = require("express");
const canvas = require("./canvasApiClient");
const transferExams = require("./transferExams.js");
const log = require("skog");
const { internalServerError, unauthorized } = require("../utils");

const router = express.Router();

router.use(function checkAuthorization(req, res, next) {
  if (!req.session.courseId || !req.session.userId) {
    return unauthorized(`Missing userId (unauthorized): ${userId}`, res);
  }

  next();
});

router.get("/assignment", async (req, res) => {
  try {
    const assignment = await canvas.getValidAssignment(
      req.session.courseId,
      req.session.ladokId
    );

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
    let assignment = await canvas.getValidAssignment(
      req.session.courseId,
      req.session.ladokId
    );

    if (!assignment) {
      assignment = await canvas.createAssignment(
        req.session.courseId,
        req.session.ladokId
      );
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
