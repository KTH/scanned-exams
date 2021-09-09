const { expect } = require("@jest/globals");
const { MongoClient } = require("mongodb");
const {
  QueueEntry,
  getEntriesFromQueue,
  addEntryToQueue,
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
});
