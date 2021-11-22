/** Endpoints to setup a Canvas course */

const canvas = require("../externalApis/canvasApiClient");
const { EndpointError } = require("../error");

/**
 * Get the "ladokId" of a given course. It throws in case the course
 * has no valid ladok IDs
 */
async function getLadokId(courseId) {
  const ladokIds = await canvas.getAktivitetstillfalleUIDs(courseId);

  if (ladokIds.length === 0) {
    throw new EndpointError({
      type: "invalid_course",
      statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      message:
        "This course can't be used for importing exams. It must be an examroom",
      details: {
        courseId,
      },
    });
  }

  if (ladokIds.lengh > 1) {
    throw new EndpointError({
      statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
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
async function getSetupStatus(req, res, next) {
  try {
    const courseId = req.params.id;
    const ladokId = await getLadokId(courseId);

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
    const ladokId = await getLadokId(courseId);
    const existingAssignment = await canvas.getValidAssignment(
      courseId,
      ladokId
    );

    if (existingAssignment) {
      throw new EndpointError({
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
    const ladokId = await getLadokId(courseId);
    const assignment = await canvas.getValidAssignment(courseId, ladokId);

    if (!assignment) {
      throw new EndpointError({
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
  getSetupStatus,
  createSpecialHomepage,
  publishCourse,
  createSpecialAssignment,
  publishSpecialAssignment,
};
