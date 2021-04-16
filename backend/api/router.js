const express = require("express");
const sessions = require("./sessions");
const canvas = require("./canvasApiClient");
const transferExams = require("./transferExams.js");

const router = express.Router();

function checkCourseId(req, res, next) {
  if (!req.session.courseId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  next();
}

router.get("/assignment", checkCourseId, async (req, res) => {
  const assignment = await canvas.getValidAssignment(req.session.courseId);

  res.json({
    assignment,
  });
});

router.post("/assignment", checkCourseId, async (req, res) => {
  let assignment = await canvas.getValidAssignment(req.session.courseId);

  if (!assignment) {
    assignment = await canvas.createAssignment(
      req.session.courseId,
      req.session.examination
    );
  }

  res.json({
    message: "Assignment created successfully",
    assignment,
  });
});

router.post("/exams", (req, res) => {
  const session = sessions.getSession(req, res);

  if (session) {
    transferExams(session);

    res.json({
      message: "Exam uploading started",
    });
  }
});

router.get("/exams", (req, res) => {
  const session = sessions.getSession(req, res);

  if (session) {
    res.json({
      state: session.state,
      error: session.error,
    });
  }
});

module.exports = router;
