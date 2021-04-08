const express = require("express");
const Canvas = require("@kth/canvas-api");
const log = require("skog");

const router = express.Router();
const canvas = new Canvas(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_ADMIN_TOKEN
);

// A Map to store session information
// Keys for this Map are Canvas API tokens
const sessions = new Map();

if (process.env.NODE_ENV === "development") {
  sessions.set(process.env.CANVAS_API_ADMIN_TOKEN, {
    courseId: 30247,
    examination: {
      courseCode: "AA0000",
      examCode: "TEN1",
      examDate: "2100-01-01",
    },
  });
}

function getAccessToken(req) {
  const auth = req.get("authorization");
  if (auth && auth.startsWith("Bearer")) {
    return auth.slice(6).trim();
  }

  return null;
}

async function getValidAssignment(accessToken) {
  const session = sessions.get(accessToken);

  if (!session) {
    // TODO: Send a "401" (not authorized) error
    log.info("Wrong access token");
    return null;
  }
  log.info(`Getting info for course ${session.courseId}`);

  const assignments = await canvas
    .list(`courses/${session.courseId}/assignments`)
    .toArray();

  // TODO: Filter more strictly?
  return assignments.find((a) => a.integration_data.courseCode) ?? null;
}

router.get("/assignment", async (req, res) => {
  const accessToken = getAccessToken(req);
  const assignment = await getValidAssignment(accessToken);

  res.send({
    assignment,
  });
});

async function createAssignment(accessToken) {
  const session = sessions.get(accessToken);

  if (!session) {
    // TODO: send a 401
    return null;
  }

  return canvas
    .requestUrl(`courses/${session.courseId}/assignments`, "POST", {
      assignment: {
        name: "Scanned exams",
        description:
          "This canvas assignment is meant to be used for scanned exams",
        submission_types: ["online_upload"],
        allowed_extensions: ["pdf"],
        // TODO: add more data to be able to filter out better?
        integration_data: session.examination,
        published: false,
        grading_type: "letter_grade",
        // TODO: grading_standard_id: 1,
      },
    })
    .then((r) => r.body);
}

router.post("/assignment", async (req, res) => {
  const accessToken = getAccessToken(req);
  let assignment = await getValidAssignment(accessToken);

  if (!assignment) {
    assignment = await createAssignment(accessToken);
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
