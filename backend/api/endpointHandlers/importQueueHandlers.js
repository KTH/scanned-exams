const {
  addEntryToQueue,
  getStatusFromQueue,
  updateStatusOfEntryInQueue,
  getEntriesFromQueue,
  getEntryFromQueue,
  resetQueueForImport,
} = require("../importQueue");
const { EndpointError } = require("../error");
const { enrollStudent } = require("../externalApis/canvasApiClient");

async function addEntriesToQueue(courseId, fileIds) {
  const { status } = await getStatusFromQueue(courseId);

  if (!Array.isArray(fileIds)) {
    throw new EndpointError({
      type: "missing_body",
      message: "This endpoint expects to get a list of fileIds to import",
      statusCode: 400, // Bad Request
    });
  }

  if (status !== "idle") {
    throw new EndpointError({
      type: "queue_not_idle",
      message: "Can't start new import if the queue for this course is working",
      statusCode: 409, // Conflict - Indicates that the request could not be processed because of conflict in the current state of the resource
    });
  }

  for (const fileId of fileIds) {
    // eslint-disable-next-line no-await-in-loop
    await addEntryToQueue({
      courseId,
      fileId,
      status: "pending",
    }).catch((err) => {
      if (err?.type === "entry_exists") {
        return updateStatusOfEntryInQueue(
          {
            fileId,
          },
          "pending"
        );
      }

      // TODO: what to do if we get another type of error?
      throw err;
    });
  }

  return {
    status: fileIds.length > 0 ? "working" : "idle",
  };
}

async function getErrorsInQueue(courseId) {
  const exams = await getEntriesFromQueue(courseId);

  return exams.filter((exam) => exam.status === "error");
}

async function fixErrorsInQueue(courseId, fileIds) {
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
      await enrollStudent(courseId, entry.userKthId);
      // Add entry to the queue (since its already there, we update the status to "working")
    }

    // eslint-disable-next-line no-await-in-loop
    await updateStatusOfEntryInQueue(entry, "working");
  }

  return {
    message: "done",
  };
}

async function ignoreErrorsInQueue(courseId, fileIds) {
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

  return {
    message: "done",
  };
}

async function resetQueue(courseId) {
  await resetQueueForImport(courseId);

  return {
    message: "done",
  };
}

module.exports = {
  addEntriesToQueue,
  getErrorsInQueue,
  fixErrorsInQueue,
  ignoreErrorsInQueue,
  resetQueue,
};
