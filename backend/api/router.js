const express = require("express");
const log = require("skog");
const { errorHandler, EndpointError } = require("./error");
const canvas = require("./canvasApiClient");
const { checkAuthorizationMiddleware } = require("./permission");

const router = express.Router();

router.use("/courses/:id", checkAuthorizationMiddleware);

/**
 * Returns data from the logged in user.
 * - Returns a 404 if the user is not logged in
 */
router.get("/me", (req, res) => {
  const { userId } = req.session;

  if (!userId) {
    log.info("Getting user information. User is logged out");
    return res.status(404).send({ message: "You are logged out" });
  }

  log.info("Getting user information. User is logged in");
  return res.status(200).send({ userId });
});

router.get("/courses/:id/setup", async (req, res, next) => {
  const courseId = req.params.id;

  try {
    const ladokId = await canvas.getExaminationLadokId(courseId);
    const course = await canvas.getCourse(courseId);
    const assignment = await canvas.getValidAssignment(courseId, ladokId);

    res.send({
      coursePublished: course.workflow_state === "available",
      assignmentCreated: assignment != null,
      assignmentPublished: assignment?.published || false,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/courses/:id/setup/create-homepage",
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      await canvas.createHomepage(courseId);

      return next(
        new EndpointError({
          type: "dev_test_error",
          statusCode: 400,
          message: "Testing forced errors for dev.",
        })
      );
    } catch (err) {
      next(err);
    }
    return res.send({
      message: "done!",
    });
  }
);

router.post(
  "/courses/:id/setup/publish-course",
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      await canvas.publishCourse(courseId);

      res.send({
        message: "done!",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/courses/:id/setup/create-assignment",
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const ladokId = await canvas.getExaminationLadokId(courseId);
      const existingAssignment = await canvas.getValidAssignment(
        courseId,
        ladokId
      );

      if (existingAssignment) {
        return next(
          new EndpointError({
            type: "assignment_exists",
            statusCode: 409,
            message: "The assignment already exists",
          })
        );
      }

      await canvas.createAssignment(courseId, ladokId);

      return res.send({
        message: "done!",
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/courses/:id/setup/publish-assignment",
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const ladokId = await canvas.getExaminationLadokId(courseId);
      const assignment = await canvas.getValidAssignment(courseId, ladokId);

      if (!assignment) {
        return next(
          new EndpointError({
            type: "assignment_not_found",
            statusCode: 404,
            message: "There is no valid assignment that can be published",
          })
        );
      }

      await canvas.publishAssignment(courseId, assignment.id);

      return res.send({
        message: "done!",
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.use(errorHandler);
module.exports = router;
