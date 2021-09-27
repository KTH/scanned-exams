/** Endpoints to setup a Canvas course */

const canvas = require("./canvasApiClient");
const { EndpointError } = require("./error");

/**
 * Get the "ladokId" of a given course. It throws in case the course
 * has no valid ladok IDs
 */
async function getLadokId(courseId) {
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

  return ladokIds[0];
}

/** Get setup status of a Canvas course given its ID */
async function getSetupStatus(courseId) {
  const ladokId = await getLadokId(courseId);
  const course = await canvas.getCourse(courseId);
  const assignment = await canvas.getValidAssignment(courseId, ladokId);

  return {
    coursePublished: course.workflow_state === "available",
    assignmentCreated: assignment != null,
    assignmentPublished: assignment?.published || false,
  };
}

/** Create a homepage in Canvas */
async function createSpecialHomepage(courseId) {
  return canvas.createHomepage(courseId);
}

/** Publish a Canvas course given its ID */
async function publishCourse(courseId) {
  return canvas.publishCourse(courseId);
}

/** Creates a special assignment in a given course */
async function createSpecialAssignment(courseId) {
  const ladokId = await getLadokId(courseId);
  const existingAssignment = await canvas.getValidAssignment(courseId, ladokId);

  if (existingAssignment) {
    throw new EndpointError({
      type: "assignment_exists",
      statusCode: 409,
      message: "The assignment already exists",
    });
  }

  await canvas.createAssignment(courseId, ladokId);
}

/** Publish the special assignment in Canvas */
async function publishSpecialAssignment(courseId) {
  const ladokId = await getLadokId(courseId);
  const assignment = await canvas.getValidAssignment(courseId, ladokId);

  if (!assignment) {
    throw new EndpointError({
      type: "assignment_not_found",
      statusCode: 400,
      message: "There is no valid assignment that can be published",
    });
  }

  await canvas.publishAssignment(courseId, assignment.id);
}

module.exports = {
  getSetupStatus,
  createSpecialHomepage,
  publishCourse,
  createSpecialAssignment,
  publishSpecialAssignment,
};
