/** Endpoints to setup a Canvas course */

const canvas = require("../externalApis/canvasApiClient");
const { CanvasApiError, EndpointError } = require("../error");

/**
 * Get the "ladokId" of a given course. It throws in case the course
 * has no valid ladok IDs
 */
function throwIfNotExactlyOneLadokId(ladokIds, courseId) {
  if (!Array.isArray(ladokIds) || ladokIds.length !== 1) {
    throw new EndpointError({
      type: "invalid_course",
      statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      message: "Only examrooms with exactly one (1) examination is supported",
      details: {
        courseId,
        ladokIds,
      },
    });
  }
}

/** Get setup status of a Canvas course given its ID */
async function getSetupStatus(req, res, next) {
  try {
    const courseId = req.params.id;

    const ladokIds = await canvas.getAktivitetstillfalleUIDs(courseId);
    throwIfNotExactlyOneLadokId(ladokIds, courseId);
    const ladokId = ladokIds[0];

    const [course, assignment] = await Promise.all([
      canvas.getCourse(courseId),
      canvas.getValidAssignment(courseId, ladokId),
    ]);

    res.send({
      coursePublished: course.workflow_state === "available",
      assignmentCreated: assignment != null,
      assignmentPublished: assignment?.published || false,
    });
  } catch (err) {
    next(err);
  }
}

/** Create a homepage in Canvas */
async function createSpecialHomepage(req, res, next) {
  try {
    await canvas.createHomepage(req.params.id);

    res.send({
      message: "done",
    });
  } catch (err) {
    next(err);
  }
}

/** Publish a Canvas course given its ID */
async function publishCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    await canvas.publishCourse(courseId);

    res.send({
      message: "done",
    });
  } catch (err) {
    next(err);
  }
}

/** Creates a special assignment in a given course */
async function createSpecialAssignment(req, res, next) {
  try {
    const courseId = req.params.id;

    const ladokIds = await canvas.getAktivitetstillfalleUIDs(courseId);
    throwIfNotExactlyOneLadokId(ladokIds, courseId);
    const ladokId = ladokIds[0];

    const existingAssignment = await canvas.getValidAssignment(
      courseId,
      ladokId
    );

    if (existingAssignment) {
      throw new CanvasApiError({
        type: "assignment_exists",
        statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
        message: "The assignment already exists",
      });
    }

    await canvas.createAssignment(courseId, ladokId);
    res.send({
      message: "done",
    });
  } catch (err) {
    next(err);
  }
}

/** Publish the special assignment in Canvas */
async function publishSpecialAssignment(req, res, next) {
  try {
    const courseId = req.params.id;

    const ladokIds = await canvas.getAktivitetstillfalleUIDs(courseId);
    throwIfNotExactlyOneLadokId(ladokIds, courseId);
    const ladokId = ladokIds[0];

    const assignment = await canvas.getValidAssignment(courseId, ladokId);

    if (!assignment) {
      throw new CanvasApiError({
        type: "assignment_not_found",
        statusCode: 404,
        message: "There is no valid assignment that can be published",
      });
    }

    await canvas.publishAssignment(courseId, assignment.id);

    res.send({
      message: "done",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  _throwIfNotExactlyOneLadokId: throwIfNotExactlyOneLadokId,
  getSetupStatus,
  createSpecialHomepage,
  publishCourse,
  createSpecialAssignment,
  publishSpecialAssignment,
};
