const express = require("express");
const log = require("skog");
const { handleUnexpectedError, checkAuthorization } = require("./utils");
const {
  getSetupStatus,
  createAssignment,
  createHomepage,
  publishAssignment,
  publishCourse,
} = require("./setupCourse");

const router = express.Router();

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

router.get("/courses/:id/setup", checkAuthorization, (req, res, next) => {
  getSetupStatus(req.params.id)
    .then((setupStatus) => {
      res.send(setupStatus);
    })
    .catch(next);
});

router.post(
  "/courses/:id/setup/create-homepage",
  checkAuthorization,
  (req, res, next) => {
    createHomepage(req.params.id)
      .then(() => {
        res.send({
          message: "done!",
        });
      })
      .catch(next);
  }
);

router.post(
  "/courses/:id/setup/publish-course",
  checkAuthorization,
  (req, res, next) => {
    publishCourse(req.params.id)
      .then(() => res.send({ message: "done!" }))
      .catch(next);
  }
);

router.post(
  "/courses/:id/setup/create-assignment",
  checkAuthorization,
  async (req, res, next) => {
    createAssignment(req.params.id)
      .then(() => {
        res.send({
          message: "done!",
        });
      })
      .catch(next);
  }
);

router.post(
  "/courses/:id/setup/publish-assignment",
  checkAuthorization,
  async (req, res, next) => {
    publishAssignment(req.params.id)
      .then(() => {
        res.send({
          message: "done!",
        });
      })
      .catch(next);
  }
);

router.use(handleUnexpectedError);
module.exports = router;
