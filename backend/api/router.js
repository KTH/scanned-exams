const express = require("express");
const canvas = require("./canvasApiClient");
const transferExams = require("./transferExams.js");

const router = express.Router();

router.use(function checkAuthorization(req, res, next) {
  if (!req.session.courseId || !req.session.userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  next();
});

router.get("/assignment", async (req, res) => {
  const assignment = await canvas.getValidAssignment(req.session.courseId);

  res.json({
    assignment,
  });
});

router.post("/assignment", async (req, res) => {
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
});

router.post("/exams", (req, res) => {
  transferExams(req.session);

  res.json({
    message: "Exam uploading started",
  });
});

router.get("/exams", (req, res) => {
  const session = req.session;

  // TODO: return a different code depending on the error
  res.status(session.error ? 400 : 200).json({
    state: session.state,
    error: session.error,
  });
});

module.exports = router;
