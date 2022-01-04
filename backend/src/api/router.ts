import express from "express";
import log from "skog";
import { errorHandler, EndpointError } from "./error";
import { checkPermissionsMiddleware } from "./permission";
import {
  getSetupStatus,
  createSpecialHomepage,
  publishCourse,
  createSpecialAssignment,
  publishSpecialAssignment,
} from "./endpointHandlers/setupCourse";
import {
  addEntriesToQueue,
  getErrorsInQueue,
  fixErrorsInQueue,
  resetQueue,
  ignoreErrorsInQueue,
  getStatusFromQueueHandler,
} from "./endpointHandlers/importQueueHandlers";
import { listAllExams } from "./endpointHandlers/listAllExams";

const router = express.Router();

router.use("/courses/:id", checkPermissionsMiddleware);

/**
 * Returns data from the logged in user.
 * - Returns a 404 if the user is not logged in
 */
router.get("/me", (req, res, next) => {
  const { userId } = req.session;

  if (!userId) {
    log.debug("Getting user information. User is logged out");
    return next(
      new EndpointError({
        type: "logged_out",
        statusCode: 404,
        message: "You are logged out",
      })
    );
  }

  log.debug("Getting user information. User is logged in");
  return res.status(200).send({ userId });
});

router.get("/courses/:id/setup", getSetupStatus);
router.post("/courses/:id/setup/create-homepage", createSpecialHomepage);
router.post("/courses/:id/setup/publish-course", publishCourse);
router.post("/courses/:id/setup/create-assignment", createSpecialAssignment);
router.post("/courses/:id/setup/publish-assignment", publishSpecialAssignment);

router.get("/courses/:id/exams", listAllExams);

router.get("/courses/:id/import-queue", getStatusFromQueueHandler);
router.post("/courses/:id/import-queue", addEntriesToQueue);
router.get("/courses/:id/import-queue/errors", getErrorsInQueue);
router.post("/courses/:id/import-queue/errors/fix", fixErrorsInQueue);
router.post("/courses/:id/import-queue/errors/ignore", ignoreErrorsInQueue);
router.delete("/courses/:id/import-queue", resetQueue);

router.use(errorHandler);

export default router;
