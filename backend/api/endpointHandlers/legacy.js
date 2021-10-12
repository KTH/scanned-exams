const log = require("skog");
const { EndpointError } = require("../error");
const {
  getStatusFromQueue,
  addEntryToQueue,
  resetQueueForImport,
  updateStatusOfEntryInQueue,
} = require("../importQueue");
const { listAllExams } = require("./utils/listAllExams");
const { enrollStudent } = require("../externalApis/canvasApiClient");

async function getExamsEndpoint(req, res, next) {
  // - Canvas is source of truth regarding if a submitted exam is truly imported
  // - the internal import queue keeps state of pending and last performed import
  try {
    const { result, summary } = await listAllExams(req.params.id);

    return res.send({
      result,
      summary,
    });
  } catch (err) {
    return next(err);
  }
}

async function getStatusEndpoint(req, res, next) {
  try {
    const courseId = req.params.id;
    const status = await getStatusFromQueue(courseId);

    return res.send(status);
  } catch (err) {
    return next(err);
  }
}

async function startExportEndpoint(req, res, next) {
  const courseId = req.params.id;
  const { status } = await getStatusFromQueue(courseId);

  if (!Array.isArray(req.body)) {
    return next(
      new EndpointError({
        type: "missing_body",
        message: "This endpoint expects to get a list of fileIds to import",
        statusCode: 400, // Bad Request
      })
    );
  }

  if (status !== "idle") {
    return next(
      new EndpointError({
        type: "queue_not_idle",
        message:
          "Can't start new import if the queue for this course is working",
        statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      })
    );
  }

  try {
    await resetQueueForImport(courseId);

    for (const fileId of req.body) {
      // eslint-disable-next-line no-await-in-loop
      await addEntryToQueue({
        fileId,
        courseId,
        status: "pending",
      })
        // eslint-disable-next-line no-await-in-loop
        .catch(async (err) => {
          if (
            err.message.startsWith(
              "Add to queue failed becuase entry exist for this fileId"
            )
          ) {
            // We get an error if it already exists so setting it to pending
            await updateStatusOfEntryInQueue(
              {
                fileId,
              },
              "pending"
            );
          }
        });
    }

    // Let client know if we are working or idle
    return res.status(200).send({
      status: req.body.length > 0 ? "working" : "idle",
    });
  } catch (err) {
    return next(err);
  }
}

async function addUserToCourseEndpoint(req, res, next) {
  const students = req.body;

  try {
    for (const kthId of students) {
      // eslint-disable-next-line no-await-in-loop
      await enrollStudent(req.params.id, kthId).catch((err) => {
        // We are catching this error so it doesn't stop adding
        // remaining students in list.
        log.error(
          { err },
          "An error occured when trying to add a student to Canvas"
        );
      });
    }

    return res.status(200).send({
      message: "done!",
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getExamsEndpoint,
  getStatusEndpoint,
  startExportEndpoint,
  addUserToCourseEndpoint,
};
