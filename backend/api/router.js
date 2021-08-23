const express = require("express");
const log = require("skog");
const { checkAuthorization, handleUnexpectedError } = require("./utils");

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

router.get("/courses/:id/setup", checkAuthorization, (req, res) => {
  res.send({
    coursePublished: true,
    assignmentCreated: true,
    assignmentPublished: true,
  });
});

router.use(handleUnexpectedError);

module.exports = router;
