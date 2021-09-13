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
  // updateStatusOfEntryInQueue,
  // getStatusFromQueue,
} = require("../api/importQueue");

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

  it("should add one entry to queue", async () => {
    const entry = {
      fileId: "123",
      courseId: "123",
      userKthId: "u23z456",
    };

    const typedEntry = await addEntryToQueue(entry);

    expect(typedEntry).toBeInstanceOf(QueueEntry);
    expect(typedEntry.status).toBe("new");
  });

  it("should list only entries with correct courseId", async () => {
    const entry = {
      fileId: "f123",
      courseId: "listTest123",
      userKthId: "u23z456",
    };

    await addEntryToQueue(entry);
    const entries = await getEntriesFromQueue(entry.courseId);

    expect(entries.length).toBe(1);
  });

  it("should provide status summary of queue ('idle')", async () => {
    const statusSummary = await getStatusFromQueue("123");

    expect(statusSummary).toBeInstanceOf(QueueStatus);
    expect(statusSummary.status).toBe("idle");
  });

  it("should allow updating status of entry in queue to 'pending'", async () => {
    const entry = {
      fileId: "pend123",
      courseId: "123",
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
      fileId: "imp123",
      courseId: "123",
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
      fileId: "err123",
      courseId: "123",
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
      fileId: "err2123",
      courseId: "123",
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
    const statusSummary = await getStatusFromQueue("123");

    expect(statusSummary).toBeInstanceOf(QueueStatus);
    expect(statusSummary.status).toBe("working");
  });

  it("should allow return 'idle' when all 'pending' imports change state to 'imported'", async () => {
    let statusSummary;
    const entry = {
      fileId: "status1",
      courseId: "321",
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
