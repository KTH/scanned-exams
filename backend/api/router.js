const express = require("express");
const log = require("skog");
const { handleUnexpectedError, checkAuthorization } = require("./utils");
const canvas = require("./canvasApiClient");

const router = express.Router();

/**
 * Returns data from the logged in user.
 * - Returns a 404 if the user is not logged in
 */
router.get("/me", (req, res) => {
  const { userId } = req.session;

  if (!userId) {
    log.info("Getting user information. User is logged out");
    return res.status(404).send("You are logged out");
  }

  log.info("Getting user information. User is logged in");
  return res.status(200).send({ userId });
});

router.get("/courses/:id/setup", checkAuthorization, async (req, res, next) => {
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
  checkAuthorization,
  async (req, res) => {
    setTimeout(() => {
      res.send({ message: "done!" });
    }, 2000);
  }
);

router.use(handleUnexpectedError);
module.exports = router;
