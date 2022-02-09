/** Endpoints to setup a Canvas course */
import * as canvasApi from "../externalApis/canvasApiClient";
import {
  Assignment,
  getAssignments,
  getCourse as getCanvasCourse,
  getSections as getCanvasSections,
  Section as CanvasSection,
} from "../externalApis/canvasAdminApiClient";
import { CanvasApiError, EndpointError } from "../error";

/**
 * Given a list of canvas sections, return the "aktivitetstillfälle" associated
 * to them.
 *
 * This function will throw if there is no valid
 */
function getLadokId(sections: CanvasSection[]): string {
  const REGEX = /^AKT\.([\w-]+)/;
  const sisIds = sections
    .map((section) => section.sis_section_id?.match(REGEX)?.[1])
    .filter((sisId) => sisId /* Filter out null and undefined */);

  const uniqueIds = Array.from(new Set(sisIds));

  if (uniqueIds.length > 1) {
    throw new EndpointError({
      type: "invalid_course",
      statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      message: "Examrooms with more than one section are not supported",
      details: {
        ladokIds: uniqueIds,
      },
    });
  }

  if (uniqueIds.length === 0) {
    throw new EndpointError({
      type: "invalid_course",
      statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      message:
        "Examrooms must contain at least one section with a valid SIS ID",
      details: {
        ladokIds: uniqueIds,
      },
    });
  }

  return uniqueIds[0];
}

/**
 * Find the assignment created specifically to submit scanned exams
 */
function getValidAssignment(assignments: Assignment[], ladokId: string) {
  return assignments.find(
    (assignment) => assignment.integration_data?.ladokId === ladokId
  );
}

/** Get setup status of a Canvas course given its ID */
async function getSetupStatus(req, res, next) {
  try {
    const courseId = req.params.id;
    const ladokId = await getCanvasSections(courseId).then((sections) =>
      getLadokId(sections)
    );

    const [course, assignment] = await Promise.all([
      getCanvasCourse(courseId),
      getAssignments(courseId).then((assignments) =>
        getValidAssignment(assignments, ladokId)
      ),
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
    await canvasApi.createHomepage(req.params.id);

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
    await canvasApi.publishCourse(courseId);

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
    const ladokId = await getCanvasSections(courseId).then((sections) =>
      getLadokId(sections)
    );

    const existingAssignment = await getAssignments(courseId).then(
      (assignments) => getValidAssignment(assignments, ladokId)
    );

    if (existingAssignment) {
      throw new CanvasApiError({
        type: "assignment_exists",
        statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
        message: "The assignment already exists",
      });
    }

    await canvasApi.createAssignment(courseId, ladokId);
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
    const ladokId = await getCanvasSections(courseId).then((sections) =>
      getLadokId(sections)
    );

    const assignment = await getAssignments(courseId).then((assignments) =>
      getValidAssignment(assignments, ladokId)
    );

    if (!assignment) {
      throw new CanvasApiError({
        type: "assignment_not_found",
        statusCode: 404,
        message: "There is no valid assignment that can be published",
      });
    }

    await canvasApi.publishAssignment(courseId, assignment.id);

    res.send({
      message: "done",
    });
  } catch (err) {
    next(err);
  }
}

export {
  getSetupStatus,
  createSpecialHomepage,
  publishCourse,
  createSpecialAssignment,
  publishSpecialAssignment,
};
