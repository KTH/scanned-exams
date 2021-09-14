// eslint-disable-next-line
const nock = require("nock");

nock("https://kth.test.instructure.com")
  // Get submissions
  .get("/api/v1/courses/30872/assignments/166297/submissions?include=user")
  .reply(200, require("./nockFixtures/submissions.json"));

// Upload Exam
// CANVAS GET `users/sis_user_id:${studentKthId}`
//
