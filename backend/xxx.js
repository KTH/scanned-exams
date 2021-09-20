/* eslint-disable  */
require("dotenv").config({});

const {
  publishCourse,
  createSpecialAssignment,
  publishSpecialAssignment,
} = require("./api/setupCourse");
const {
  listAllExams,
  listStudentsWithExamsInCanvas,
} = require("./api/listAllExams");
const canvas = require("./api/canvasApiClient");

async function start() {
  const courseId = "30457";
  const ladokId = await canvas.getAktivitetstillfalleUIDs(courseId);
  console.log(ladokId);
  const validAssignment = await canvas.getValidAssignment(courseId, ladokId[0]);
  console.log(validAssignment);
  const submissions = await canvas.getAssignmentSubmissions(
    courseId,
    validAssignment.id
  );
  console.log(submissions);
  // const ladokId = "7c992c35-ae4d-11eb-af8f-dc33ae304c8f";
  console.log(await listStudentsWithExamsInCanvas(courseId, ladokId));
  // console.log(await listAllExams(courseId));
}

start();
