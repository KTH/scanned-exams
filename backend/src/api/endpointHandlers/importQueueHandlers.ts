import {
  addEntryToQueue,
  getStatusFromQueue,
  updateStatusOfEntryInQueue,
  getEntriesFromQueue,
  getEntryFromQueue,
  resetQueueForImport,
} from "../importQueue";
import { EndpointError } from "../error";
import canvasApi from "../externalApis/adminCanvasApiClient";
import log from "skog";

async function getStatusFromQueueHandler(req, res, next) {
  try {
    const courseId = req.params.id;
    const status = await getStatusFromQueue(courseId);

    res.send(status);
  } catch (err) {
    next(err);
  }
}

async function addEntriesToQueue(req, res, next) {
  try {
    const courseId = req.params.id;
    const files = req.body;

    const { status } = await getStatusFromQueue(courseId);

    if (!Array.isArray(files)) {
      throw new EndpointError({
        type: "missing_body",
        message: "This endpoint expects to get a list of files to import",
        statusCode: 400, // Bad Request
      });
    }

    if (status !== "idle") {
      throw new EndpointError({
        type: "queue_not_idle",
        message:
          "Can't start new import if the queue for this course is working",
        statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      });
    }

    for (const file of files) {
      const { id, createDate, batchNo, fileName } = file;
      // eslint-disable-next-line no-await-in-loop
      await addEntryToQueue({
        courseId,
        fileId: id,
        fileCreateDate: createDate,
        batchNo,
        fileName,
        importStartedByUser: req.session.userId,
        status: "pending",
      }).catch((err) => {
        if (err?.type === "entry_exists") {
          return updateStatusOfEntryInQueue(
            {
              id,
            },
            "pending"
          );
        }

        // TODO: what to do if we get another type of error?
        throw err;
      });
    }

    res.send({
      status: files.length > 0 ? "working" : "idle",
    });
  } catch (err) {
    next(err);
  }
}

async function getErrorsInQueue(req, res, next) {
  try {
    const courseId = req.params.id;
    const exams = await getEntriesFromQueue(courseId);

    res.send(
      exams.filter(
        (exam) => exam.status === "error" || exam.status === "ignored"
      )
    );
  } catch (err) {
    next(err);
  }
}

async function fixErrorsInQueue(req, res, next) {
  try {
    const courseId = req.params.id;
    const fileIds = req.body;

    const { status } = await getStatusFromQueue(courseId);

    if (!Array.isArray(fileIds)) {
      throw new EndpointError({
        type: "missing_body",
        message: "This endpoint expects to get a list of fileIds",
        statusCode: 400, // Bad Request
      });
    }

    if (status !== "idle") {
      throw new EndpointError({
        type: "queue_not_idle",
        message: "Can't fix errors for this course when the queue is working",
        statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      });
    }

    for (const fileId of fileIds) {
      // eslint-disable-next-line no-await-in-loop
      const entry = await getEntryFromQueue(fileId);

      if (entry.error?.type === "missing_student") {
        // Add student to Canvas
        // eslint-disable-next-line no-await-in-loop
        await canvasApi
          .enrollStudent(courseId, entry.student.kthId)
          .catch((err) => {
            log.error(
              { err },
              `Error trying to add student [${entry.student.kthId}] in course [${courseId}]`
            );
          });
        // Add entry to the queue (since its already there, we update the status to "working")
      }

      // eslint-disable-next-line no-await-in-loop
      await updateStatusOfEntryInQueue(entry, "pending");
    }

    res.send({
      message: "done",
    });
  } catch (err) {
    next(err);
  }
}

async function ignoreErrorsInQueue(req, res, next) {
  try {
    const courseId = req.params.id;
    const fileIds = req.body;

    const { status } = await getStatusFromQueue(courseId);

    if (!Array.isArray(fileIds)) {
      throw new EndpointError({
        type: "missing_body",
        message: "This endpoint expects to get a list of fileIds",
        statusCode: 400, // Bad Request
      });
    }

    if (status !== "idle") {
      throw new EndpointError({
        type: "queue_not_idle",
        message: "Can't fix errors for this course when the queue is working",
        statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
      });
    }

    for (const fileId of fileIds) {
      // eslint-disable-next-line no-await-in-loop
      await updateStatusOfEntryInQueue({ fileId }, "ignored");
    }

    res.send({
      message: "done",
    });
  } catch (err) {
    next(err);
  }
}

async function resetQueue(req, res, next) {
  try {
    const courseId = req.params.id;
    await resetQueueForImport(courseId);

    res.send({
      message: "done",
    });
  } catch (err) {
    next(err);
  }
}

export {
  addEntriesToQueue,
  getErrorsInQueue,
  fixErrorsInQueue,
  ignoreErrorsInQueue,
  getStatusFromQueueHandler,
  resetQueue,
};
