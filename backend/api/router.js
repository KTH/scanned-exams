const express = require("express");
const sessions = require("./sessions");
const canvas = require("./canvasApiClient");
const transferExams = require("./transferExams.js");

const router = express.Router();

router.get("/assignment", async (req, res) => {
  const session = sessions.getSession(req, res);

  if (session) {
    const assignment = await canvas.getValidAssignment(session.courseId);

    res.send({
      assignment,
    });
  }
});

router.post("/assignment", async (req, res) => {
  const session = sessions.getSession(req, res);

  if (session) {
    let assignment = await canvas.getValidAssignment(session.courseId);

    if (!assignment) {
      assignment = await canvas.createAssignment(
        session.courseId,
        session.examination
      );
    }

    res.send({
      message: "Assignment created successfully",
      assignment,
    });
  }
});

router.post("/exams", (req, res) => {
  const session = sessions.getSession(req, res);

  if (session) {
    transferExams(session);

    res.send({
      message: "Exam uploading started",
    });
  }
});

router.get("/exams", (req, res) => {
  const session = sessions.getSession(req, res);

  if (session) {
    res.send({
      state: session.state,
      error: session.error,
    });
  }
});

module.exports = router;
