const express = require("express");
const Canvas = require("@kth/canvas-api");
const sessions = require("./sessions");

const router = express.Router();
const canvas = new Canvas(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_ADMIN_TOKEN
);

async function getValidAssignment({ courseId }) {
  const assignments = await canvas
    .list(`courses/${courseId}/assignments`)
    .toArray();

  // TODO: Filter more strictly?
  return assignments.find((a) => a.integration_data.courseCode) ?? null;
}

router.get("/assignment", async (req, res) => {
  const session = sessions.getSession(req, res);

  if (!session) {
    return;
  }

  const assignment = await getValidAssignment(session.courseId);

  res.send({
    assignment,
  });
});

async function createAssignment({ courseId, examination }) {
  return canvas
    .requestUrl(`courses/${courseId}/assignments`, "POST", {
      assignment: {
        name: "Scanned exams",
        description:
          "This canvas assignment is meant to be used for scanned exams",
        submission_types: ["online_upload"],
        allowed_extensions: ["pdf"],
        // TODO: add more data to be able to filter out better?
        integration_data: examination,
        published: false,
        grading_type: "letter_grade",
        // TODO: grading_standard_id: 1,
      },
    })
    .then((r) => r.body);
}

router.post("/assignment", async (req, res) => {
  const session = sessions.getSession(req, res);

  if (!session) {
    return;
  }

  let assignment = await getValidAssignment(session);

  if (!assignment) {
    assignment = await createAssignment(session);
  }

  res.send({
    message: "Assignment created successfully",
    assignment,
  });
});

router.post("/upload", (req, res) => {
  res.send({
    message: "Exam uploading started",
  });
});

module.exports = router;
