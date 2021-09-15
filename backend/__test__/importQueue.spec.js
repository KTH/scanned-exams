// We need some env-vars for canvasApiClient.js to import
// require("dotenv").config();

const { expect } = require("@jest/globals");
const { MongoClient } = require("mongodb");
const {
  QueueEntry,
  QueueStatus,
  getEntryFromQueue,
  getEntriesFromQueue,
  addEntryToQueue,
  updateStatusOfEntryInQueue,
  getStatusFromQueue,
  getFirstPendingFromQueue,
  // updateStatusOfEntryInQueue,
  // getStatusFromQueue,
} = require("../api/importQueue");

/**
 *
 * NOTE: These test are quick and dirty
 * TODO: Make sure tests don't rely on running in order
 *
 */

const { MONGODB_CONNECTION_STRING } = process.env;
// TODO: Consider using env-var (sync with importQueue.js)
const DB_QUEUE_NAME = "import_queue";

const dbClient = new MongoClient(MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

describe("Import queue", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await dbClient.connect();
    db = await connection.db();
    // TODO: Populate db
  });

  afterAll(async () => {
    // const DBG_DB = await db.collection(DB_QUEUE_NAME).find({}).toArray();
    // Perform tear down here
    await db.collection(DB_QUEUE_NAME).deleteMany({});
    dbClient.close();
  });

  it("should return null when not found in queue", async () => {
    const entry = await getEntryFromQueue("noop");
    expect(entry).toBe(null);
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
    const entry = {
      fileId: "file1",
      courseId: "mainTestCourse",
      userKthId: "u23z456",
    };

    let err;
    try {
      await addEntryToQueue(entry);
    } catch (e) {
      err = e;
    }

    expect(err).toBeInstanceOf(Error);
  });

  it("should list only entries with correct courseId", async () => {
    const entry = {
      fileId: "file2",
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
      fileId: "pendinfFile1",
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
    connection = await dbClient.connect();
    db = await connection.db();
  });

  afterEach(async () => {
    // Perform tear down here
    await db.collection(DB_QUEUE_NAME).deleteMany({});
    dbClient.close();
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
