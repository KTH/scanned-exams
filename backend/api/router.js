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

  return assignments.find((a) => a.integration_data.courseCode) ?? null;
}

router.get("/", async (req, res) => {
  const accessToken = getAccessToken(req);
  const assignment = await getValidAssignment(accessToken);

  res.send({
    assignment,
  });
});

router.post("/create-assignment", (req, res) => {
  assignment = 233;
  res.send({
    message: "Assignment created successfully",
  });
});

router.post("/upload", (req, res) => {
  res.send({
    message: "Exam uploading started",
  });
});

module.exports = router;
