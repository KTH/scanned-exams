/** Endpoints to setup a Canvas examroom */

const canvas = require("./canvasApiClient");
const { EndpointError } = require("./error");

/** Get setup status of a Canvas course given its ID */
async function getSetupStatus(courseId) {
  const ladokIds = await canvas.getAktivitetstillfalleUIDs(courseId);

  if (ladokIds.length === 0) {
    throw new EndpointError({
      type: "invalid_course",
      message:
        "This course can't be used for importing exams. It must be an examroom",
      details: {
        courseId,
      },
    });
  }

  if (ladokIds.lengh > 1) {
    throw new EndpointError({
      type: "invalid_course",
      message: "Examrooms with more than one examination are not supported",
      details: {
        courseId,
        ladokIds,
      },
    });
  }

  const course = await canvas.getCourse(courseId);
  const assignment = await canvas.getValidAssignment(courseId, ladokIds[0]);

  return {
    coursePublished: course.workflow_state === "available",
    assignmentCreated: assignment != null,
    assignmentPublished: assignment?.published || false,
  };
}

module.exports = {
  getSetupStatus,
};
