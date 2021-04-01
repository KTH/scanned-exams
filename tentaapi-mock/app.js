const log = require("skog");
const express = require("express");
const server = express();
const getActivity = require("./mocks/activity");
const getExamList = require("./mocks/exam-list");
const getFile = require("./mocks/file");
log.init.pino();
server.use(express.json());

server.get("/Ladok/activity/:ladokId", (req, res) => {
  res.send(getActivity(req.params.ladokId));
});

server.post("/windream/search/documents/false", (req, res) => {
  const body = req.body;
  const courseCode = body.sarchIndiceses.find((i) => i.index === "c_code");
  const examCode = body.sarchIndiceses.find((i) => i.index === "e_code");
  const examDate = body.sarchIndiceses.find((i) => i.index === "e_date");

  if (courseCode && examCode && examDate) {
    res.send(
      getExamList({
        examCode: examCode.value,
        courseCode: courseCode.value,
        examDate: examDate.value,
      })
    );
  }
  res.send({});
});

server.get("/windream/file/:fileId/true", (req, res) => {
  res.send(getFile(req.params.fileId));
});

server.listen(4001, (req, res) => {
  log.info("Started tentaapi-mock in port 4001.");
  log.fatal("YOU SHOULD ALWAYS RUN THIS APP LOCALLY");
});
