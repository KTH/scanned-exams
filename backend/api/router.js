const express = require("express");

const router = express.Router();

// This variable holds an ID if the assignment is created
let assignment = null;

router.get("/", (req, res) => {
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
