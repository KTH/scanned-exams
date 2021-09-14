/** Endpoints to setup a Canvas examroom */

const canvas = require("./canvasApiClient");
const { EndpointError } = require("./error");

async function getSetupStatus(courseId) {
  const ladokId = await canvas.getExaminationLadokId(courseId).catch((err) => {
    if (err?.response?.statusCode === 404) {
      throw new EndpointError({
        type: "course_not_found",
        message: `Course [${courseId}] not found`,
        statusCode: 404,
      });
    }

    throw err;
  });
  const course = await canvas.getCourse(courseId);
  const assignment = await canvas.getValidAssignment(courseId, ladokId);

  return {
    coursePublished: course.workflow_state === "available",
    assignmentCreated: assignment != null,
    assignmentPublished: assignment?.published || false,
  };
}

module.exports = {
  getSetupStatus,
};
