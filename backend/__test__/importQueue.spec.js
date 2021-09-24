const { expect } = require("@jest/globals");
const {
  QueueEntry,
  QueueStatus,
  getEntryFromQueue,
  getEntriesFromQueue,
  addEntryToQueue,
  updateStatusOfEntryInQueue,
  getStatusFromQueue,
  getFirstPendingFromQueue,
  resetQueueForImport,
  startDatabaseConnection,
  // updateStatusOfEntryInQueue,
  // getStatusFromQueue,
} = require("../api/importQueue");

/**
 *
 * NOTE: These test are quick and dirty
 * TODO: Make sure tests don't rely on running in order
 *
 */

// TODO: Consider using env-var (sync with importQueue.js)
const DB_QUEUE_NAME = "import_queue";

describe("Import queue", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await startDatabaseConnection();
    db = connection.db();
  });

  afterAll(async () => {
    // const DBG_DB = await db.collection(DB_QUEUE_NAME).find({}).toArray();
    // Perform tear down here
    await db.collection(DB_QUEUE_NAME).deleteMany({});
    connection.close();
  });

  it("should add one entry to queue", async () => {
    const entry = {
      fileId: "file1",
      courseId: "mainTestCourse",
      userKthId: "u23z456",
    };

    const typedEntry = await addEntryToQueue(entry);

    expect(typedEntry).toBeInstanceOf(QueueEntry);
    expect(typedEntry.status).toBe("new");
  });

  it("should not add entry with same fileId twice", async () => {
    const entry1 = {
      fileId: "twice1",
      courseId: "mainTestCourse",
      userKthId: "u23z456",
    };
    const entry2 = {
      fileId: "twice1",
      courseId: "mainTestCourse",
      userKthId: "u23z456",
    };

    await addEntryToQueue(entry1);

    let err;
    try {
      await addEntryToQueue(entry2);
    } catch (e) {
      err = e;
    }

    expect(err).toBeInstanceOf(Error);
  });

  it("should list only entries with correct courseId", async () => {
    const entry1 = {
      fileId: "filter1",
      courseId: "mainTestCourse",
      userKthId: "u23z456",
    };
    await addEntryToQueue(entry1);

    const entry2 = {
      fileId: "filter2",
      courseId: "mainTestCourse",
      userKthId: "u23z456",
    };
    await addEntryToQueue(entry2);

    const entry = {
      fileId: "filter3",
      courseId: "listTest123",
      userKthId: "u23z456",
    };
    await addEntryToQueue(entry);
    const entries = await getEntriesFromQueue(entry.courseId);

    expect(entries.length).toBe(1);
  });

  it("should provide status summary of queue ('idle')", async () => {
    const statusSummary = await getStatusFromQueue("mainTestCourse");

    expect(statusSummary).toBeInstanceOf(QueueStatus);
    expect(statusSummary.status).toBe("idle");
  });

  it("should allow updating status of entry in queue to 'pending'", async () => {
    const entry = {
      fileId: "pendingFile1",
      courseId: "mainTestCourse",
      userKthId: "u233z456",
    };

    const typedEntry = await addEntryToQueue(entry);

    await updateStatusOfEntryInQueue(typedEntry, "pending");

    const updatedEntry = await getEntryFromQueue(entry.fileId);

    expect(updatedEntry).toBeInstanceOf(QueueEntry);
    expect(updatedEntry.importStartedAt).toBeInstanceOf(Date);
    expect(updatedEntry.status).toBe("pending");
    expect(updatedEntry.error).toBe(null);
  });

  it("should allow updating status of entry in queue to 'imported'", async () => {
    const entry = {
      fileId: "importedFile1",
      courseId: "mainTestCourse",
      userKthId: "u133z456",
    };

    const typedEntry = await addEntryToQueue(entry);

    await updateStatusOfEntryInQueue(typedEntry, "imported");
    const updatedEntry = await getEntryFromQueue(entry.fileId);

    expect(updatedEntry).toBeInstanceOf(QueueEntry);
    expect(updatedEntry.importSuccessAt).toBeInstanceOf(Date);
    expect(updatedEntry.status).toBe("imported");
    expect(updatedEntry.error).toBe(null);
  });

  it("should allow updating status of entry in queue to 'error' w/o details", async () => {
    const entry = {
      fileId: "errorFile1",
      courseId: "mainTestCourse",
      userKthId: "u333z456",
    };

    const typedEntry = await addEntryToQueue(entry);

    await updateStatusOfEntryInQueue(typedEntry, "error");
    const updatedEntry = await getEntryFromQueue(entry.fileId);

    expect(updatedEntry).toBeInstanceOf(QueueEntry);
    expect(updatedEntry.lastErrorAt).toBeInstanceOf(Date);
    expect(updatedEntry.status).toBe("error");
    expect(updatedEntry.error).toBeInstanceOf(Object);
    expect(updatedEntry.error.type).toBe("error");
  });

  it("should allow updating status of entry in queue to 'error' with details", async () => {
    const entry = {
      fileId: "errorFile2",
      courseId: "mainTestCourse",
      userKthId: "u3433z456",
    };

    const typedEntry = await addEntryToQueue(entry);

    await updateStatusOfEntryInQueue(typedEntry, "error", {
      type: "import_error",
      meassage: "There was an import error",
    });
    const updatedEntry = await getEntryFromQueue(entry.fileId);

    expect(updatedEntry).toBeInstanceOf(QueueEntry);
    expect(updatedEntry.lastErrorAt).toBeInstanceOf(Date);
    expect(updatedEntry.status).toBe("error");
    expect(updatedEntry.error).toBeInstanceOf(Object);
    expect(updatedEntry.error.type).toBe("import_error");
  });

  it("should provide status summary of queue ('working')", async () => {
    const statusSummary = await getStatusFromQueue("mainTestCourse");

    expect(statusSummary).toBeInstanceOf(QueueStatus);
    expect(statusSummary.status).toBe("working");
  });

  it("should allow return 'idle' when all 'pending' imports change state to 'imported'", async () => {
    let statusSummary;
    const entry = {
      fileId: "statusFile1",
      courseId: "statusTestCourse",
      userKthId: "u3433z456",
    };

    await addEntryToQueue(entry);

    statusSummary = await getStatusFromQueue(entry.courseId);
    expect(statusSummary.status).toBe("idle");

    await updateStatusOfEntryInQueue(entry, "pending");

    statusSummary = await getStatusFromQueue(entry.courseId);
    expect(statusSummary.status).toBe("working");

    await updateStatusOfEntryInQueue(entry, "imported");

    statusSummary = await getStatusFromQueue(entry.courseId);
    expect(statusSummary.status).toBe("idle");
  });
});

describe("Get first element from queue", () => {
  let connection;
  let db;

  beforeEach(async () => {
    connection = await startDatabaseConnection();
    db = connection.db();
  });

  afterEach(async () => {
    // Perform tear down here
    await db.collection(DB_QUEUE_NAME).deleteMany({});
    connection.close();
  });

  it("should return null if nothing is enqueued", async () => {
    const typedEntry = await getFirstPendingFromQueue();
    expect(typedEntry).toBeNull();
  });

  it("should return null if there is no `pending` element", async () => {
    const entry1 = {
      fileId: "statusFile1",
      courseId: "statusTestCourse",
      userKthId: "u3433z456",
      status: "success",
    };

    await addEntryToQueue(entry1);
    const typedEntry = await getFirstPendingFromQueue();
    expect(typedEntry).toBeNull();
  });

  it("should return the first element if something is enqueued", async () => {
    const entry1 = {
      fileId: "statusFile1",
      courseId: "statusTestCourse",
      userKthId: "u3433z456",
      status: "pending",
    };

    await addEntryToQueue(entry1);
    const typedEntry = await getFirstPendingFromQueue();
    expect(typedEntry).toBeInstanceOf(QueueEntry);
    expect(typedEntry.fileId).toBe(entry1.fileId);
    expect(typedEntry.courseId).toBe(entry1.courseId);
  });

  it("should return the first `pending` element", async () => {
    const entry1 = {
      fileId: "statusFile1",
      courseId: "statusTestCourse",
      userKthId: "u3433z456",
      status: "pending",
    };

    const entry2 = {
      fileId: "statusFile2",
      courseId: "statusTestCourse",
      userKthId: "u3433z456",
      status: "pending",
    };

    await addEntryToQueue(entry1);
    await addEntryToQueue(entry2);
    await updateStatusOfEntryInQueue(entry1, "success");

    const typedEntry = await getFirstPendingFromQueue();
    expect(typedEntry).toBeInstanceOf(QueueEntry);
    expect(typedEntry.fileId).toBe(entry2.fileId);
  });
});

describe("Resetting a queue", () => {
  let connection;
  let db;

  beforeEach(async () => {
    connection = await startDatabaseConnection();
    db = connection.db();
  });

  afterEach(async () => {
    // Perform tear down here
    await db.collection(DB_QUEUE_NAME).deleteMany({});
    connection.close();
  });

  it("should delete all imported and errored entries", async () => {
    const courseId = "reset_1";
    for (let i = 1; i <= 10; i++) {
      /* eslint-disable-next-line no-await-in-loop */
      await addEntryToQueue(
        new QueueEntry({
          fileId: i,
          courseId,
          status: i < 8 ? "imported" : "error",
        })
      );
    }

    // Remove 7 imported and set 3 with error to pending
    await resetQueueForImport(courseId);

    const entries = await getEntriesFromQueue(courseId);
    expect(entries.length).toBe(0);
  });
});
